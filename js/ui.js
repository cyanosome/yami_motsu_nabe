import { gameState, draftState, calculateFinalScores, reshuffleScoop, handlePassClick, selectScoopedItem } from './gameLogic.js';
import { firebaseState, myPlayerId } from './firebase.js';
import { playSound } from './sound.js';
import { INGREDIENTS_DATABASE, createIngredientInstance } from './ingredients.js';

export function getIngredientIconHtml(item, extraClass = '') {
    if (!item) return '';
    if (item.iconUrl) {
        return `<img src="${item.iconUrl}" alt="${item.name || ''}" class="ingredient-img ${extraClass}" />`;
    }
    return item.icon || '';
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

export function renderOnlineDraftPhase(data) {
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
        if (item.category === 'vege') { badgeClass = 'badge-vege'; badgeText = '野菜'; }
        if (item.category === 'spice') { badgeClass = 'badge-spice'; badgeText = '薬味/出汁'; }
        if (item.category === 'sweets') { badgeClass = 'badge-sweets'; badgeText = 'お菓子'; }
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

    const potSoupEl = document.querySelector('.pot-soup');
    if (potSoupEl) {
        potSoupEl.style.background = calculatePotSoupGradient(gameState.potStack);
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
        card.innerHTML = `
            <div style="font-size:0.75rem; color:var(--accent-gold); font-weight:bold;">取札 #${idx+1}</div>
            <div class="silhouette-icon ${sizeClass}">${getIngredientIconHtml(item)}</div>
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

export function initPhase3Results() {
    playSound('win');
    calculateFinalScores();

    const sorted = [...gameState.players].sort((a, b) => b.finalScore - a.finalScore);
    const winner = sorted[0];

    document.getElementById('winner-name-text').innerText = `${winner.name} の勝利！ (${winner.finalScore} pt)`;

    const rankingList = document.getElementById('ranking-list');
    rankingList.innerHTML = '';

    sorted.forEach((p, rankIdx) => {
        const item = document.createElement('div');
        item.className = `ranking-item rank-${rankIdx + 1}`;

        const bowlIcons = p.bowl.map(b => getIngredientIconHtml(b)).join(' ');

        item.innerHTML = `
            <div class="rank-badge">${rankIdx + 1}</div>
            <div class="rank-info">
                <div>
                    <div class="rank-pname">${p.name} ${p.isBusted ? '<span style="color:#ff7675;">[バースト]</span>' : ''}</div>
                    <div class="score-detail-popover">${p.scoreBreakdown}</div>
                </div>
                <div class="rank-bowl-icons">${bowlIcons || '具材なし'}</div>
            </div>
            <div class="rank-score">${p.finalScore} <span style="font-size:0.9rem;">pt</span></div>
        `;

        rankingList.appendChild(item);
    });
}

// Bind to window to allow DOM onclick event handlers to resolve
window.changeCardSize = changeCardSize;
window.toggleCardSelection = toggleCardSelection;
window.openOnlineModal = openOnlineModal;
window.handlePassClick = handlePassClick;
