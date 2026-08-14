import { gameState, draftState, calculateFinalScores, reshuffleScoop, handlePassClick, selectScoopedItem, BURST_PENALTY_SCORE } from './gameLogic.js';
import { firebaseState, myPlayerId } from './firebase.js';
import { playSound } from './sound.js';
import { INGREDIENTS_DATABASE, createIngredientInstance, COMBOS_DATABASE, getRecommendedCombos } from './ingredients.js';

export function getIngredientIconHtml(item, extraClass = '') {
    if (!item) return '';
    if (item.iconUrl) {
        return `<img src="${item.iconUrl}" alt="${item.name || ''}" class="ingredient-img ${extraClass}" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='inline';" /><span style="display:none;">${item.icon || '🍲'}</span>`;
    }
    return item.icon || '🍲';
}


export function openOnlineModal() {
    document.getElementById('online-modal').classList.add('active');
    document.getElementById('modal-step-menu').style.display = 'block';
    document.getElementById('modal-step-lobby').style.display = 'none';

    let savedName = localStorage.getItem('yami_motsu_name') || `プレイヤー_${Math.floor(100 + Math.random() * 900)}`;
    document.getElementById('input-player-name').value = savedName;
}

export function showLobbyUI(roomId) {
    document.getElementById('modal-step-menu').style.display = 'none';
    document.getElementById('modal-step-lobby').style.display = 'block';
    document.getElementById('lobby-room-code').innerText = roomId;

    if (firebaseState.isHost) {
        document.getElementById('lobby-host-controls').style.display = 'block';
        document.getElementById('lobby-guest-notice').style.display = 'none';
    } else {
        document.getElementById('lobby-host-controls').style.display = 'none';
        document.getElementById('lobby-guest-notice').style.display = 'block';
    }
}

export function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

export function updatePhaseStepper(currentStep) {
    for (let i = 1; i <= 3; i++) {
        const el = document.getElementById(`step-${i}`);
        el.classList.remove('active', 'completed');
        if (i < currentStep) el.classList.add('completed');
        if (i === currentStep) el.classList.add('active');
    }
}

export function renderPotHintBanner(template) {
    const bannerEl = document.getElementById('pot-hint-banner');
    if (!bannerEl) return;
    if (!template) {
        bannerEl.style.display = 'none';
        return;
    }
    bannerEl.style.display = 'flex';
    bannerEl.innerHTML = `
        <div class="pot-hint-icon">${template.icon || '🍲'}</div>
        <div class="pot-hint-text-box">
            <div class="pot-hint-label">🍲 鍋の気配（ベース具材の予兆）</div>
            <div class="pot-hint-msg">${template.hint}</div>
        </div>
    `;
}

export function triggerPotRevealModal(template) {
    if (!template) return;
    const modal = document.getElementById('pot-reveal-modal');
    const iconEl = document.getElementById('pot-reveal-icon');
    const titleEl = document.getElementById('pot-reveal-title');
    const descEl = document.getElementById('pot-reveal-desc');
    
    if (iconEl) iconEl.innerText = template.icon || '🍲';
    if (titleEl) titleEl.innerText = template.name || '王道定番もつ鍋';
    if (descEl) descEl.innerText = template.desc || '美味しいもつ鍋の完成！';
    
    if (modal) {
        modal.classList.add('active');
        playSound('phase');
    }
}

export function closePotRevealModal() {
    const modal = document.getElementById('pot-reveal-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}
window.closePotRevealModal = closePotRevealModal;

export function renderOnlineDraftPhase(data) {
    renderPotHintBanner(data.potTemplate || gameState.potTemplate);
    const curPlayer = data.players[data.currentDraftPlayerIndex];
    if (!curPlayer) return;

    const isMyTurn = (curPlayer.uid === myPlayerId);
    document.getElementById('p1-player-title').innerText = `${curPlayer.name} の手番：具材選択 ${isMyTurn ? '(あなた)' : ''}`;

    const btn = document.getElementById('btn-add-pot');
    const grid = document.getElementById('draft-grid');

    if (isMyTurn) {
        // 自分の手番：選択カードリスト（インスタンス化済み）を取得
        const rawOptions = (data.draftOptionsPerPlayer && data.draftOptionsPerPlayer[curPlayer.uid]) || [];
        // 生のオブジェクトまたはIDからインスタンスを補完
        draftState.options = rawOptions.map(item => {
            if (typeof item === 'string') {
                const base = INGREDIENTS_DATABASE.find(x => x.id === item);
                return base ? createIngredientInstance(base) : null;
            }
            return item;
        }).filter(Boolean);
        
        // 初回または手番変更時にカードを描画
        if (!grid.querySelector('.card-item') || gameState.renderedPlayerUid !== curPlayer.uid) {
            gameState.renderedPlayerUid = curPlayer.uid;
            renderDraftGrid(draftState.options);
        }
        updateDraftButtonState();
    } else {
        // 他プレイヤーの手番
        gameState.renderedPlayerUid = null;
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align:center; padding: 40px; color: var(--accent-gold); font-size:1.2rem;">
                ⏳ <b>${curPlayer.name}</b> が具材を選択中...
            </div>
        `;
        btn.innerText = `相手の選択待ち...`;
        btn.disabled = true;
    }
}

export function renderOnlinePotPhase(data) {
    renderPotUI();

    const curPlayer = data.players[data.currentTurnPlayerIndex];
    const btnDraw = document.getElementById('btn-draw');
    const btnPass = document.getElementById('btn-pass');

    const canAct = curPlayer && curPlayer.uid === myPlayerId && !curPlayer.isPassed && !curPlayer.isBusted && (curPlayer.bowl ? curPlayer.bowl.length < 4 : true);
    if (btnDraw) btnDraw.disabled = !canAct;
    if (btnPass) btnPass.disabled = !canAct;
}

export function renderDraftGrid(options) {
    const grid = document.getElementById('draft-grid');
    grid.innerHTML = '';

    options.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card-item';
        card.id = `card-${item.id}`;

        let badgeClass = 'badge-motsu';
        let badgeText = 'もつ';
        if (item.category === 'classic' || item.category === 'vege') { badgeClass = 'badge-classic'; badgeText = '定番'; }
        if (item.category === 'spice') { badgeClass = 'badge-spice'; badgeText = '辛味'; }
        if (item.category === 'sweets') { badgeClass = 'badge-sweets'; badgeText = '甘味'; }
        if (item.category === 'yami') { badgeClass = 'badge-yami'; badgeText = '闇具材'; }

        const base = INGREDIENTS_DATABASE.find(b => b.id === (item.baseId || item.id.split('_')[0])) || item;
        const allowed = base.allowedSizes || ['mid'];

        const canSmall = allowed.includes('small');
        const canMid = allowed.includes('mid');
        const canLarge = allowed.includes('large');
        const curSize = item.size || 'mid';

        const tasteText = (item.taste > 0) ? `🔥+${item.taste}` : ((item.taste < 0) ? `🍬${item.taste}` : '');

        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div class="card-badge ${badgeClass}">${badgeText}</div>
                <div class="size-selector-group" onclick="event.stopPropagation();">
                    <button class="size-btn ${curSize === 'small' ? 'active' : ''}" ${canSmall ? '' : 'disabled'} onclick="changeCardSize(event, '${item.id}', 'small')">S</button>
                    <button class="size-btn ${curSize === 'mid' ? 'active' : ''}" ${canMid ? '' : 'disabled'} onclick="changeCardSize(event, '${item.id}', 'mid')">M</button>
                    <button class="size-btn ${curSize === 'large' ? 'active' : ''}" ${canLarge ? '' : 'disabled'} onclick="changeCardSize(event, '${item.id}', 'large')">L</button>
                </div>
            </div>
            <div class="card-icon size-${curSize}">${getIngredientIconHtml(item)}</div>
            <div class="card-name">${item.name}</div>
            <div class="card-desc">${item.desc}</div>
            <div class="card-pts ${item.score < 0 ? 'negative' : ''}">
                ${item.score >= 0 ? '+' : ''}${item.score} pt ${tasteText}
            </div>
        `;

        if (gameState.selectedDraftIds.includes(item.id)) {
            card.classList.add('selected');
        }

        card.onclick = () => toggleCardSelection(item.id);
        grid.appendChild(card);
    });
}

export function changeCardSize(e, itemId, newSize) {
    if (e) e.stopPropagation();
    playSound('select');

    const itemIdx = draftState.options.findIndex(x => x.id === itemId);
    if (itemIdx < 0) return;

    const item = draftState.options[itemIdx];
    const base = INGREDIENTS_DATABASE.find(b => b.id === (item.baseId || item.id.split('_')[0]));
    if (!base) return;

    // 許可されたサイズでなければ何もしない
    if (base.allowedSizes && !base.allowedSizes.includes(newSize)) return;

    const newInstance = createIngredientInstance(base, newSize);
    newInstance.id = item.id; // 一貫性保持
    draftState.options[itemIdx] = newInstance;

    // カード要素の再描画
    const cardEl = document.getElementById(`card-${itemId}`);
    if (cardEl) {
        const nameEl = cardEl.querySelector('.card-name');
        const ptsEl = cardEl.querySelector('.card-pts');
        const cardIconEl = cardEl.querySelector('.card-icon');

        if (nameEl) nameEl.innerText = newInstance.name;
        if (cardIconEl) cardIconEl.className = `card-icon size-${newSize}`;
        if (ptsEl) {
            const tasteText = (newInstance.taste > 0) ? `🔥+${newInstance.taste}` : ((newInstance.taste < 0) ? `🍬${newInstance.taste}` : '');
            ptsEl.className = `card-pts ${newInstance.score < 0 ? 'negative' : ''}`;
            ptsEl.innerHTML = `${newInstance.score >= 0 ? '+' : ''}${newInstance.score} pt ${tasteText}`;
        }

        const btns = cardEl.querySelectorAll('.size-btn');
        btns.forEach(btn => {
            const btnLabel = btn.innerText.toUpperCase();
            const sizeMap = { 'S': 'small', 'M': 'mid', 'L': 'large' };
            if (sizeMap[btnLabel] === newSize) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
}

export function toggleCardSelection(itemId) {
    playSound('select');
    const idx = gameState.selectedDraftIds.indexOf(itemId);
    if (idx >= 0) {
        gameState.selectedDraftIds.splice(idx, 1);
        const el = document.getElementById(`card-${itemId}`);
        if (el) el.classList.remove('selected');
    } else {
        if (gameState.selectedDraftIds.length < 3) {
            gameState.selectedDraftIds.push(itemId);
            const el = document.getElementById(`card-${itemId}`);
            if (el) el.classList.add('selected');
        } else {
            showToast('選択できる具材は3枚までです');
        }
    }
    updateDraftButtonState();
}

export function updateDraftButtonState() {
    const btn = document.getElementById('btn-add-pot');
    const count = gameState.selectedDraftIds.length;
    btn.innerText = `鍋に投入する (選んだ数: ${count}/3)`;
    btn.disabled = (count !== 3);
}

export function getPotSoupColorDetails(potStack) {
    if (!potStack || potStack.length === 0) {
        return {
            totalCount: 0,
            totalScore: 0,
            avgScore: 0,
            totalTaste: 0,
            avgTaste: 0,
            fHealth: 1.0,
            fTaste: 0.0,
            H: 0,
            S: 75,
            L: 45,
            centerColor: 'hsl(0deg, 75%, 55%)',
            midColor: 'hsl(0deg, 75%, 45%)',
            outerColor: 'hsl(0deg, 60%, 25%)',
            gradient: 'radial-gradient(circle, #d63031 20%, #a71d2a 60%, #4a090b 100%)'
        };
    }

    const totalCount = potStack.length;
    const totalScore = potStack.reduce((acc, cur) => acc + (cur.score || 0), 0);
    const totalTaste = potStack.reduce((acc, cur) => acc + (cur.taste !== undefined ? cur.taste : (cur.spice || 0)), 0);

    const avgScore = Number((totalScore / totalCount).toFixed(2));
    const avgTaste = Number((totalTaste / totalCount).toFixed(2));

    const clampScore = Math.max(-3, Math.min(4, avgScore));
    const fHealth = Number(((clampScore - (-3)) / (4 - (-3))).toFixed(2));

    const clampTaste = Math.max(-2, Math.min(2, avgTaste));
    const fTaste = Number((clampTaste / 2).toFixed(2));

    let H = 0;
    if (fTaste >= 0) {
        H = Math.round(25 * fTaste);
    } else {
        H = Math.round(360 + (30 * fTaste));
    }

    const S = Math.round(30 + (45 * fHealth));
    const L = Math.round(10 + (35 * fHealth));

    const centerColor = `hsl(${H}deg, ${S}%, ${Math.min(100, L + 10)}%)`;
    const midColor    = `hsl(${H}deg, ${S}%, ${L}%)`;
    const outerColor  = `hsl(${H}deg, ${Math.max(10, S - 15)}%, ${Math.max(5, L - 20)}%)`;
    const gradient    = `radial-gradient(circle, ${centerColor} 20%, ${midColor} 60%, ${outerColor} 100%)`;

    return {
        totalCount,
        totalScore,
        avgScore,
        totalTaste,
        avgTaste,
        fHealth,
        fTaste,
        H,
        S,
        L,
        centerColor,
        midColor,
        outerColor,
        gradient
    };
}

export function calculatePotSoupGradient(potStack) {
    return getPotSoupColorDetails(potStack).gradient;
}

export function renderPotUI() {
    document.getElementById('pot-count').innerText = (gameState.potStack ? gameState.potStack.length : 0);

    const badgeEl = document.getElementById('pot-type-badge');
    if (badgeEl && gameState.potTemplate) {
        badgeEl.innerHTML = `${gameState.potTemplate.icon || '🍲'} ${gameState.potTemplate.name || 'もつ鍋'}`;
        badgeEl.style.display = 'inline-flex';
    }

    const potSoupEl = document.querySelector('.pot-soup');
    if (potSoupEl) {
        potSoupEl.style.background = calculatePotSoupGradient(gameState.potStack);
    }

    // 3D スープ色をゲーム状態（山札＋取札）から更新
    if (typeof window.updateSoupColorFromGameState === 'function') {
        window.updateSoupColorFromGameState(gameState);
    }

    // 開発者モードインスペクターのリアルタイム更新
    if (typeof window.updateDevInspector === 'function') {
        window.updateDevInspector(gameState);
    }

    const helpScoreTextEl = document.getElementById('burst-penalty-score-text');
    if (helpScoreTextEl) {
        helpScoreTextEl.textContent = `${BURST_PENALTY_SCORE}点`;
    }

    const container = document.getElementById('bowls-container');
    container.innerHTML = '';

    gameState.players.forEach((p, idx) => {
        const isCurrentTurn = (idx === gameState.currentTurnPlayerIndex && !p.isPassed && !p.isBusted);
        const pBowl = p.bowl || [];
        const totalTaste = pBowl.reduce((acc, cur) => acc + (cur.taste !== undefined ? cur.taste : (cur.spice || 0)), 0);

        const card = document.createElement('div');
        card.className = `bowl-card ${isCurrentTurn ? 'active-turn' : ''} ${p.isPassed ? 'passed' : ''} ${p.isBusted ? 'busted' : ''}`;

        let statusTag = '<span class="bowl-status-tag status-active">引く順</span>';
        if (p.isPassed) statusTag = '<span class="bowl-status-tag status-pass">パス(確定)</span>';
        if (p.isBusted) {
            if (totalTaste >= 3) statusTag = '<span class="bowl-status-tag status-active" style="background:var(--accent-red); color:#fff;">🔥激辛バースト</span>';
            else if (totalTaste <= -3) statusTag = '<span class="bowl-status-tag status-active" style="background:#e84393; color:#fff;">🍬激甘バースト</span>';
            else statusTag = '<span class="bowl-status-tag status-bust">💥バースト</span>';
        }

        let slotsHtml = '';
        for (let s = 0; s < 4; s++) {
            const item = pBowl[s];
            if (item) {
                const szText = item.sizeBadgeText ? `[${item.sizeBadgeText}]` : '';
                slotsHtml += `
                    <div class="item-slot filled" title="${item.name}: ${item.desc}">
                        <span>${getIngredientIconHtml(item)}</span>
                        <span class="slot-score">${item.score >= 0 ? '+'+item.score : item.score} <small style="font-size:0.65rem; opacity:0.8;">${szText}</small></span>
                    </div>
                `;
            } else {
                slotsHtml += `<div class="item-slot">空</div>`;
            }
        }

        // 味覚バランスメーターの計算
        const clampedTaste = Math.max(-3, Math.min(3, totalTaste));
        const pointerPercent = 50 + (clampedTaste * 16.66);

        let tasteStatusText = '⚖️ 絶妙バランス';
        if (totalTaste > 0) tasteStatusText = `🔥+${totalTaste} (辛め)`;
        if (totalTaste < 0) tasteStatusText = `🍬${totalTaste} (甘め)`;

        let warningHtml = '';
        if (totalTaste === 2 && !p.isPassed && !p.isBusted) {
            warningHtml = '<div class="taste-warning warning-spicy">⚠️ あと辛み +1 で激辛バースト！</div>';
        } else if (totalTaste === -2 && !p.isPassed && !p.isBusted) {
            warningHtml = '<div class="taste-warning warning-sweet">⚠️ あと甘み -1 で激甘バースト！</div>';
        }

        card.innerHTML = `
            <div class="bowl-header">
                <span>${p.name} ${p.uid === myPlayerId ? '<span style="color:var(--accent-gold); font-size:0.8rem;">(あなた)</span>' : ''}</span>
                ${statusTag}
            </div>
            <div class="bowl-items-slots">
                ${slotsHtml}
            </div>
            <div class="taste-meter-container">
                <div class="taste-meter-header">
                    <span>味わい: <b>${tasteStatusText}</b></span>
                    <span>確定: ${pBowl.length}/4</span>
                </div>
                <div class="taste-meter-bar-track">
                    <div class="taste-pointer" style="left: ${pointerPercent}%;"></div>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:0.65rem; color:var(--text-sub);">
                    <span>🍬甘み-3</span>
                    <span>⚖️0</span>
                    <span>辛み+3🔥</span>
                </div>
                ${warningHtml}
            </div>
        `;
        container.appendChild(card);
    });

    const curPlayer = gameState.players[gameState.currentTurnPlayerIndex];
    if (curPlayer) {
        document.getElementById('current-turn-player-name').innerText = curPlayer.name;
    }

    renderScoopCards();
    updateRerollButtonState();
    renderRecommendedCombos();
}

export function renderScoopCards() {
    const container = document.getElementById('scoop-cards-container');
    if (!container) return;
    container.innerHTML = '';

    const curPlayer = gameState.players[gameState.currentTurnPlayerIndex];
    const isMyTurn = (gameState.mode === 'online') 
        ? (curPlayer && curPlayer.uid === myPlayerId)
        : (curPlayer && !curPlayer.isCpu);

    const options = gameState.currentScoopOptions || [];

    if (options.length === 0) {
        container.innerHTML = `<div style="color:var(--text-sub); font-size:0.9rem;">鍋に具材がありません</div>`;
        return;
    }

    options.forEach((item, idx) => {
        const card = document.createElement('div');
        card.className = 'silhouette-card';
        const sizeClass = `size-${item.size || 'mid'}`;
        const iconContent = (item && item.unique === true)
            ? getIngredientIconHtml(item)
            : `<div class="silhouette-circle"></div>`;

        card.innerHTML = `
            <div style="font-size:0.75rem; color:var(--accent-gold); font-weight:bold;">取札 #${idx+1}</div>
            <div class="silhouette-icon ${sizeClass}">${iconContent}</div>
            <div class="silhouette-label">❓ 謎の具材</div>
        `;

        if (isMyTurn && curPlayer && !curPlayer.isPassed && !curPlayer.isBusted) {
            card.onclick = () => selectScoopedItem(idx);
        } else {
            card.style.opacity = '0.6';
            card.style.cursor = 'default';
        }

        container.appendChild(card);
    });
}

export function updateRerollButtonState() {
    const btnReroll = document.getElementById('btn-reroll');
    const btnPass = document.getElementById('btn-pass');
    const curPlayer = gameState.players[gameState.currentTurnPlayerIndex];

    const isMyTurn = (gameState.mode === 'online')
        ? (curPlayer && curPlayer.uid === myPlayerId)
        : (curPlayer && !curPlayer.isCpu);

    if (btnReroll) {
        if (gameState.hasRerolledThisTurn) {
            btnReroll.innerText = '🥄 もう一回掬う (使用済)';
            btnReroll.disabled = true;
        } else {
            btnReroll.innerText = '🥄 もう一回掬う (残り1回)';
            btnReroll.disabled = !isMyTurn || (pIsUnavailable(curPlayer));
        }
    }

    if (btnPass) {
        btnPass.disabled = !isMyTurn || (pIsUnavailable(curPlayer));
    }
}

function pIsUnavailable(p) {
    return !p || p.isPassed || p.isBusted || (p.bowl && p.bowl.length >= 4);
}

export function addGameLog(msg, isHighlight = false, isBust = false) {
    const logBox = document.getElementById('game-log');
    const item = document.createElement('div');
    item.className = `log-msg ${isHighlight ? 'highlight' : ''} ${isBust ? 'bust' : ''}`;
    item.innerText = msg;
    logBox.appendChild(item);
    logBox.scrollTop = logBox.scrollHeight;
}

let isPhase3Animating = false;
let cancelPhase3Animation = false;

export function resetPhase3State() {
    isPhase3Animating = false;
    cancelPhase3Animation = true;
}

export function skipPhase3Animation() {
    if (!isPhase3Animating) return;
    cancelPhase3Animation = true;
    renderPhase3FinalInstant();
}

function renderPhase3FinalInstant() {
    isPhase3Animating = false;
    const skipBtn = document.getElementById('skip-result-btn');
    if (skipBtn) skipBtn.style.display = 'none';

    const sorted = [...gameState.players].sort((a, b) => b.finalScore - a.finalScore);
    const winner = sorted[0];

    const winnerNameEl = document.getElementById('winner-name-text');
    const winnerSubtitleEl = document.getElementById('winner-subtitle-text');
    if (winnerNameEl) winnerNameEl.innerText = `${winner.name} の勝利！ (${winner.finalScore} pt)`;
    if (winnerSubtitleEl) winnerSubtitleEl.innerText = '見事に最高のお椀を作り上げました！';

    const rankingList = document.getElementById('ranking-list');
    if (!rankingList) return;
    rankingList.innerHTML = '';

    sorted.forEach((p, rankIdx) => {
        const item = document.createElement('div');
        item.className = `ranking-item rank-${rankIdx + 1} ${p.isBusted ? 'is-busted' : ''}`;

        const bowlIcons = (p.bowl || []).map(b => getIngredientIconHtml(b)).join(' ');
        const comboChips = (p.achievedCombos || []).map(c => `
            <span class="rank-combo-chip">
                ${c.icon} ${c.name} <span class="combo-score-tag">+${c.score}</span>
            </span>
        `).join('');

        let combosHtml = comboChips;
        if (!combosHtml) {
            combosHtml = '<span style="font-size:0.75rem; color:var(--text-sub);">役なし</span>';
        }
        if (p.isBusted) {
            combosHtml += ` <span class="rank-combo-chip" style="background:rgba(255,118,117,0.2); border-color:#ff7675; color:#ff7675;">💥 バースト <span class="combo-score-tag" style="background:#d63031;">${BURST_PENALTY_SCORE}</span></span>`;
        }

        item.innerHTML = `
            <div class="rank-badge badge-pop">${rankIdx + 1}</div>
            <div class="rank-info">
                <div class="rank-header-row">
                    <div class="rank-pname">${p.name} ${p.isBusted ? '<span style="color:#ff7675; font-size:0.85rem;">[バースト]</span>' : ''}</div>
                    <div class="rank-bowl-icons">${bowlIcons || '<span style="font-size:0.85rem; color:var(--text-sub);">具材なし</span>'}</div>
                </div>
                <div class="rank-combos-container">${combosHtml}</div>
                <div class="score-detail-popover">${p.scoreBreakdown}</div>
            </div>
            <div class="rank-score-wrap">
                <div class="rank-score ${p.isBusted ? 'score-busted' : ''}">${p.finalScore} <span style="font-size:0.9rem;">pt</span></div>
            </div>
        `;

        rankingList.appendChild(item);
    });

    playSound('win');
}

export async function initPhase3Results() {
    calculateFinalScores();

    isPhase3Animating = true;
    cancelPhase3Animation = false;

    const skipBtn = document.getElementById('skip-result-btn');
    if (skipBtn) skipBtn.style.display = 'inline-block';

    const winnerNameEl = document.getElementById('winner-name-text');
    const winnerSubtitleEl = document.getElementById('winner-subtitle-text');
    if (winnerNameEl) winnerNameEl.innerText = '結果を集計中…';
    if (winnerSubtitleEl) winnerSubtitleEl.innerText = '具材の基本得点とコンボを計算しています';

    const rankingList = document.getElementById('ranking-list');
    if (!rankingList) return;
    rankingList.innerHTML = '';

    // 初期表示：各プレイヤーのカードを生成（基本点はまだ 0）
    const playerElements = new Map();

    gameState.players.forEach((p, idx) => {
        const item = document.createElement('div');
        item.className = `ranking-item ${p.isBusted ? 'is-busted' : ''}`;
        item.id = `result-player-item-${idx}`;

        const bowlIcons = (p.bowl || []).map(b => getIngredientIconHtml(b)).join(' ');

        item.innerHTML = `
            <div class="rank-badge badge-pending">?</div>
            <div class="rank-info">
                <div class="rank-header-row">
                    <div class="rank-pname">${p.name} ${p.isBusted ? '<span style="color:#ff7675; font-size:0.85rem;">[バースト]</span>' : ''}</div>
                    <div class="rank-bowl-icons">${bowlIcons || '<span style="font-size:0.85rem; color:var(--text-sub);">具材なし</span>'}</div>
                </div>
                <div class="rank-combos-container" id="combos-box-${idx}"></div>
                <div class="score-detail-popover" id="score-detail-${idx}"></div>
            </div>
            <div class="rank-score-wrap">
                <div class="rank-score" id="score-text-${idx}">
                    0 <span style="font-size:0.9rem;">pt</span>
                </div>
            </div>
        `;

        rankingList.appendChild(item);
        playerElements.set(p, {
            container: item,
            combosBox: item.querySelector(`#combos-box-${idx}`),
            scoreText: item.querySelector(`#score-text-${idx}`),
            scoreWrap: item.querySelector('.rank-score-wrap'),
            scoreDetail: item.querySelector(`#score-detail-${idx}`),
            currentScore: 0
        });
    });

    const wait = (ms) => new Promise(res => setTimeout(res, ms));

    // わずかな開始ディレイ
    await wait(350);
    if (cancelPhase3Animation) return;

    // === Step 1: 基本点のカウントアップ ===
    const maxBase = Math.max(...gameState.players.map(p => Math.abs(p.baseScore || 0)), 1);
    const steps = Math.min(12, maxBase);
    const stepDuration = Math.max(25, Math.floor(650 / (steps || 1)));

    for (let s = 1; s <= steps; s++) {
        if (cancelPhase3Animation) return;
        const progress = s / steps;

        gameState.players.forEach(p => {
            const elInfo = playerElements.get(p);
            if (!elInfo) return;
            const scoreNow = Math.round((p.baseScore || 0) * progress);
            elInfo.currentScore = scoreNow;
            elInfo.scoreText.innerHTML = `${scoreNow} <span style="font-size:0.9rem;">pt</span>`;
        });

        if (s % 2 === 1) {
            playSound('count');
        }
        await wait(stepDuration);
    }

    // 基本点確定
    gameState.players.forEach(p => {
        const elInfo = playerElements.get(p);
        if (!elInfo) return;
        elInfo.currentScore = p.baseScore || 0;
        elInfo.scoreText.innerHTML = `${elInfo.currentScore} <span style="font-size:0.9rem;">pt</span>`;
        elInfo.scoreText.classList.add('score-bump');
        setTimeout(() => elInfo.scoreText.classList.remove('score-bump'), 300);
    });

    await wait(450);
    if (cancelPhase3Animation) return;

    // === Step 2: コンボボーナスの順次めくり ＆ 加算 ===
    const maxComboCount = Math.max(...gameState.players.map(p => (p.achievedCombos || []).length), 0);

    for (let cIdx = 0; cIdx < maxComboCount; cIdx++) {
        if (cancelPhase3Animation) return;
        let anyComboAdded = false;

        for (let p of gameState.players) {
            const combos = p.achievedCombos || [];
            if (cIdx < combos.length) {
                const combo = combos[cIdx];
                const elInfo = playerElements.get(p);
                if (!elInfo) continue;

                // チップ要素作成
                const chip = document.createElement('span');
                chip.className = 'rank-combo-chip';
                chip.innerHTML = `${combo.icon} ${combo.name} <span class="combo-score-tag">+${combo.score}</span>`;
                elInfo.combosBox.appendChild(chip);

                // +X pt フロート表示
                const floatBonus = document.createElement('div');
                floatBonus.className = 'score-float-bonus';
                floatBonus.innerText = `+${combo.score}`;
                elInfo.scoreWrap.appendChild(floatBonus);
                setTimeout(() => floatBonus.remove(), 700);

                // スコア加算
                elInfo.currentScore += combo.score;
                elInfo.scoreText.innerHTML = `${elInfo.currentScore} <span style="font-size:0.9rem;">pt</span>`;
                elInfo.scoreText.classList.add('score-bump');
                setTimeout(() => elInfo.scoreText.classList.remove('score-bump'), 300);

                anyComboAdded = true;
            }
        }

        if (anyComboAdded) {
            playSound('combo');
            await wait(600);
        }
    }

    if (cancelPhase3Animation) return;

    // === Step 2.5: バーストペナルティ適用 ===
    const bustedPlayers = gameState.players.filter(p => p.isBusted);
    if (bustedPlayers.length > 0) {
        await wait(300);
        if (cancelPhase3Animation) return;

        bustedPlayers.forEach(p => {
            const elInfo = playerElements.get(p);
            if (!elInfo) return;

            // ペナルティチップ作成
            const chip = document.createElement('span');
            chip.className = 'rank-combo-chip';
            chip.style.cssText = 'background:rgba(255,118,117,0.2); border-color:#ff7675; color:#ff7675;';
            chip.innerHTML = `💥 バースト <span class="combo-score-tag" style="background:#d63031;">${BURST_PENALTY_SCORE}</span>`;
            elInfo.combosBox.appendChild(chip);

            // -5 pt フロート表示 (赤色)
            const floatPenalty = document.createElement('div');
            floatPenalty.className = 'score-float-penalty';
            floatPenalty.innerText = `${BURST_PENALTY_SCORE}`;
            elInfo.scoreWrap.appendChild(floatPenalty);
            setTimeout(() => floatPenalty.remove(), 700);

            // スコア減算
            elInfo.currentScore += BURST_PENALTY_SCORE;
            elInfo.scoreText.innerHTML = `${elInfo.currentScore} <span style="font-size:0.9rem;">pt</span>`;
            elInfo.scoreText.classList.add('score-busted', 'score-bump');
            setTimeout(() => elInfo.scoreText.classList.remove('score-bump'), 300);
        });

        playSound('bust');
        await wait(600);
    }

    if (cancelPhase3Animation) return;

    // 役なしプレイヤーの表示補完
    gameState.players.forEach(p => {
        const elInfo = playerElements.get(p);
        if (!elInfo) return;
        if (!p.achievedCombos || p.achievedCombos.length === 0) {
            if (!p.isBusted) {
                elInfo.combosBox.innerHTML = '<span style="font-size:0.75rem; color:var(--text-sub);">役なし</span>';
            }
        }
        elInfo.scoreDetail.innerText = p.scoreBreakdown || '';
    });

    await wait(500);
    if (cancelPhase3Animation) return;

    // === Step 3: 最終ランキング確定 ＆ 勝者発表 ===
    isPhase3Animating = false;
    if (skipBtn) skipBtn.style.display = 'none';

    // 最終スコア順に並び替え
    const sorted = [...gameState.players].sort((a, b) => b.finalScore - a.finalScore);
    const winner = sorted[0];

    // 勝者バナー更新
    if (winnerNameEl) winnerNameEl.innerText = `${winner.name} の勝利！ (${winner.finalScore} pt)`;
    if (winnerSubtitleEl) winnerSubtitleEl.innerText = '見事に最高のお椀を作り上げました！';

    // リストの順番をスコア順に再配置
    rankingList.innerHTML = '';
    sorted.forEach((p, rankIdx) => {
        const elInfo = playerElements.get(p);
        if (elInfo && elInfo.container) {
            const item = elInfo.container;
            item.className = `ranking-item rank-${rankIdx + 1} ${p.isBusted ? 'is-busted' : ''}`;
            const badge = item.querySelector('.rank-badge');
            if (badge) {
                badge.className = 'rank-badge badge-pop';
                badge.innerText = rankIdx + 1;
            }
            rankingList.appendChild(item);
        }
    });

    playSound('win');
}

// Bind to window to allow DOM onclick event handlers to resolve
window.changeCardSize = changeCardSize;
window.toggleCardSelection = toggleCardSelection;
window.openOnlineModal = openOnlineModal;
window.handlePassClick = handlePassClick;
window.skipPhase3Animation = skipPhase3Animation;

export let currentEncyclopediaTab = 'ingredients';
export let currentEncyclopediaCategory = 'all';

export function openEncyclopediaModal() {
    playSound('select');
    const modal = document.getElementById('encyclopedia-modal');
    if (modal) {
        modal.classList.add('active');
        renderEncyclopediaContent();
    }
}

export function closeEncyclopediaModal() {
    playSound('select');
    const modal = document.getElementById('encyclopedia-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

export function switchEncyclopediaTab(tabName) {
    playSound('select');
    currentEncyclopediaTab = tabName;

    const btnIngredients = document.getElementById('tab-btn-ingredients');
    const btnCombos = document.getElementById('tab-btn-combos');
    const filterBox = document.getElementById('encyclopedia-filters');

    if (tabName === 'ingredients') {
        if (btnIngredients) btnIngredients.classList.add('active');
        if (btnCombos) btnCombos.classList.remove('active');
        if (filterBox) filterBox.style.display = 'flex';
    } else {
        if (btnIngredients) btnIngredients.classList.remove('active');
        if (btnCombos) btnCombos.classList.add('active');
        if (filterBox) filterBox.style.display = 'none';
    }

    renderEncyclopediaContent();
}

export function filterEncyclopediaCategory(category) {
    playSound('select');
    currentEncyclopediaCategory = category;

    const filterBtns = document.querySelectorAll('.enc-filter-btn');
    filterBtns.forEach(btn => {
        const catAttr = btn.getAttribute('onclick');
        if (catAttr && catAttr.includes(`'${category}'`)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    renderEncyclopediaIngredients();
}

export function renderEncyclopediaContent() {
    if (currentEncyclopediaTab === 'ingredients') {
        renderEncyclopediaIngredients();
    } else {
        renderEncyclopediaCombos();
    }
}

export function renderEncyclopediaIngredients() {
    const container = document.getElementById('encyclopedia-body');
    if (!container) return;

    let items = INGREDIENTS_DATABASE;
    if (currentEncyclopediaCategory !== 'all') {
        items = items.filter(x => x.category === currentEncyclopediaCategory);
    }

    let html = `<div class="encyclopedia-grid">`;
    items.forEach(item => {
        let badgeClass = 'badge-motsu';
        let badgeText = 'もつ';
        if (item.category === 'classic' || item.category === 'vege') { badgeClass = 'badge-classic'; badgeText = '定番'; }
        if (item.category === 'spice') { badgeClass = 'badge-spice'; badgeText = '辛味'; }
        if (item.category === 'sweets') { badgeClass = 'badge-sweets'; badgeText = '甘味'; }
        if (item.category === 'yami') { badgeClass = 'badge-yami'; badgeText = '闇具材'; }

        const allowed = item.allowedSizes || ['mid'];
        const sizesText = allowed.map(s => s === 'small' ? 'S' : (s === 'mid' ? 'M' : 'L')).join('/');

        const tasteText = (item.taste > 0) ? `🔥+${item.taste}` : ((item.taste < 0) ? `🍬${item.taste}` : '');

        html += `
            <div class="enc-card-item">
                <div class="enc-card-header">
                    <div class="card-badge ${badgeClass}">${badgeText}</div>
                    <div class="enc-sizes-badge">サイズ: ${sizesText}</div>
                </div>
                <div class="card-icon size-mid">${getIngredientIconHtml(item)}</div>
                <div class="card-name">${item.name}</div>
                <div class="card-desc">${item.desc}</div>
                <div class="card-pts ${item.score < 0 ? 'negative' : ''}">
                    基本: ${item.score >= 0 ? '+' : ''}${item.score} pt ${tasteText}
                </div>
            </div>
        `;
    });
    html += `</div>`;
    container.innerHTML = html;
}

export function renderEncyclopediaCombos() {
    const container = document.getElementById('encyclopedia-body');
    if (!container) return;

    let html = `<div class="enc-combo-list">`;
    COMBOS_DATABASE.forEach(combo => {
        html += `
            <div class="enc-combo-card">
                <div class="enc-combo-icon">${combo.icon || '✨'}</div>
                <div class="enc-combo-info">
                    <div class="enc-combo-title">${combo.name}</div>
                    <div class="enc-combo-condition">条件: ${combo.conditionText}</div>
                    <div class="enc-combo-desc">${combo.desc}</div>
                </div>
                <div class="enc-combo-badge">+${combo.score} pt</div>
            </div>
        `;
    });
    html += `</div>`;
    container.innerHTML = html;
}

window.openEncyclopediaModal = openEncyclopediaModal;
window.closeEncyclopediaModal = closeEncyclopediaModal;
window.switchEncyclopediaTab = switchEncyclopediaTab;
window.filterEncyclopediaCategory = filterEncyclopediaCategory;

export function renderRecommendedCombos() {
    const container = document.getElementById('recommended-combos-list');
    if (!container) return;

    const curPlayer = gameState.players[gameState.currentTurnPlayerIndex];
    const bowl = curPlayer ? (curPlayer.bowl || []) : [];
    const recommendedList = getRecommendedCombos(bowl);

    container.innerHTML = '';

    recommendedList.forEach(combo => {
        const card = document.createElement('div');
        card.className = 'rec-combo-card';
        card.onclick = () => openComboDetailModal(combo.id);

        const statusClass = combo.statusType || 'default';

        card.innerHTML = `
            <div class="rec-combo-icon">${combo.icon || '✨'}</div>
            <div class="rec-combo-info">
                <div class="rec-combo-title">${combo.name}</div>
                <div class="rec-combo-status ${statusClass}">${combo.statusText || '💡 狙い目'}</div>
            </div>
            <div class="rec-combo-pts">+${combo.score}pt</div>
        `;

        container.appendChild(card);
    });
}

export function openComboDetailModal(comboId) {
    playSound('select');
    const combo = COMBOS_DATABASE.find(c => c.id === comboId);
    if (!combo) return;

    const modal = document.getElementById('combo-detail-modal');
    const container = document.getElementById('combo-detail-content');
    if (!modal || !container) return;

    const curPlayer = gameState.players[gameState.currentTurnPlayerIndex];
    const bowl = curPlayer ? (curPlayer.bowl || []) : [];
    const isAchieved = combo.check(bowl);

    container.innerHTML = `
        <div class="combo-detail-header">
            <div class="combo-detail-icon">${combo.icon || '✨'}</div>
            <div class="combo-detail-title">${combo.name}</div>
        </div>
        <div class="combo-detail-badge">+${combo.score} pt ボーナス</div>
        <div class="combo-detail-section">
            <div class="combo-detail-label">📋 発動条件</div>
            <div class="combo-detail-val">${combo.conditionText}</div>
        </div>
        <div class="combo-detail-section">
            <div class="combo-detail-label">💡 解説・特徴</div>
            <div class="combo-detail-val">${combo.desc}</div>
        </div>
        <div class="combo-detail-section" style="background: rgba(253, 203, 110, 0.08); border-color: var(--border-gold);">
            <div class="combo-detail-label">📊 ${curPlayer ? curPlayer.name : 'プレイヤー'}の達成状況</div>
            <div class="combo-detail-val" style="color: ${isAchieved ? '#55efc4' : '#fdcb6e'}; font-weight:bold;">
                ${isAchieved ? '🎉 現在条件を達成中！(+'+combo.score+'pt確定)' : '⌛ 未達成（手札の具材を増やして狙おう！）'}
            </div>
        </div>
    `;

    modal.classList.add('active');
}

export function closeComboDetailModal() {
    playSound('select');
    const modal = document.getElementById('combo-detail-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

window.renderRecommendedCombos = renderRecommendedCombos;
window.openComboDetailModal = openComboDetailModal;
window.closeComboDetailModal = closeComboDetailModal;


