import { firebaseState, myPlayerId } from './firebase.js';
import { playSound, playBGM, stopBGM } from './sound.js';
import { INGREDIENTS_DATABASE, createIngredientInstance, COMBOS_DATABASE, POT_TEMPLATES, getRandomPotTemplate, generatePotTemplateIngredients } from './ingredients.js';
import { 
    updatePhaseStepper, 
    renderOnlineDraftPhase, 
    renderOnlinePotPhase, 
    renderDraftGrid, 
    updateDraftButtonState, 
    renderPotUI, 
    renderScoopCards, 
    updateRerollButtonState, 
    addGameLog, 
    initPhase3Results, 
    showToast,
    getPotSoupColorDetails,
    resetPhase3State,
    renderPotHintBanner,
    triggerPotRevealModal,
    openTraitSelectModal,
    closeTraitSelectModal,
    getTraitChipHtml
} from './ui.js';
import { executeOnlineReroll, executeOnlineScoopSelect, executeOnlinePass } from './firebase.js';

/* --- ゲーム状態構造 --- */
export let gameState = {
    mode: 'vs-cpu', // 'vs-cpu' | 'hotseat' | 'online'
    soundEnabled: true,
    bgmEnabled: true,
    currentPhase: 1,
    potTemplate: null, // 決定された鍋テンプレート
    players: [],
    currentDraftPlayerIndex: 0,
    currentTurnPlayerIndex: 0,
    potStack: [],
    selectedDraftIds: []
};


export const draftState = { options: [] };
export const BURST_PENALTY_SCORE = -50000;

/* --- ゲーム初期化 --- */
export function startGame(mode) {
    gameState.mode = mode;
    gameState.potStack = [];
    gameState.currentDraftPlayerIndex = 0;
    gameState.currentTurnPlayerIndex = 0;
    gameState.potTemplate = null; // 特性選択後に決定

    if (mode === 'vs-cpu') {
        gameState.players = [
            { id: 0, name: 'あなた (P1)', isCpu: false, bowl: [], isPassed: false, isBusted: false, trait: null },
            { id: 1, name: 'モツ太郎 (CPU)', isCpu: true, bowl: [], isPassed: false, isBusted: false, trait: null },
            { id: 2, name: 'キャベ子 (CPU)', isCpu: true, bowl: [], isPassed: false, isBusted: false, trait: null },
            { id: 3, name: '闇シェフ (CPU)', isCpu: true, bowl: [], isPassed: false, isBusted: false, trait: null }
        ];
    } else {
        gameState.players = [
            { id: 0, name: 'プレイヤー1', isCpu: false, bowl: [], isPassed: false, isBusted: false, trait: null },
            { id: 1, name: 'プレイヤー2', isCpu: false, bowl: [], isPassed: false, isBusted: false, trait: null }
        ];
    }

    document.getElementById('start-screen').style.display = 'none';

    // 鍋テンプレートや食材の決定前にUser（人間プレイヤー）が特性を選択
    startTraitSelectionSequence(gameState.players, () => {
        // 全人間プレイヤーの特性選択が完了した後に鍋テンプレートを決定
        gameState.potTemplate = getRandomPotTemplate();

        // ゲーム開始時にステップバーを表示
        document.getElementById('phase-stepper-bar').classList.add('active');
        renderPotHintBanner(gameState.potTemplate);

        // BGM再生開始（和風ロックBGM）
        playBGM('MAIN', { fadeIn: true });

        switchPhase(1);
    });
}

export function startTraitSelectionSequence(players, onComplete) {
    const humanPlayers = players.filter(p => !p.isCpu);
    let currentIndex = 0;

    function promptNextPlayer() {
        if (currentIndex >= humanPlayers.length) {
            if (typeof onComplete === 'function') onComplete();
            return;
        }

        const player = humanPlayers[currentIndex];
        openTraitSelectModal(player, (selectedTrait) => {
            player.trait = selectedTrait;
            currentIndex++;
            promptNextPlayer();
        });
    }

    promptNextPlayer();
}

export function resetToStart() {
    if (firebaseState.roomRef) {
        firebaseState.roomRef.off();
        firebaseState.roomRef = null;
    }
    // BGM停止（フェードアウト）
    stopBGM({ fadeOut: true });
    closeTraitSelectModal();
    resetOnlineSetup();
    resetPhase3State();
    firebaseState.currentRoomId = null;
    document.getElementById('start-screen').style.display = 'block';
    document.getElementById('phase-stepper-bar').classList.remove('active');
    document.querySelectorAll('.phase-container').forEach(el => el.classList.remove('active'));
    
    // 3D鍋のリソース解放
    if (typeof window.disposePot3D === 'function') {
        window.disposePot3D();
    }
    
    // UI側の入力やリストのクリア
    const listEl = document.getElementById('lobby-players-list');
    if (listEl) listEl.innerHTML = '';
    const countEl = document.getElementById('lobby-player-count');
    if (countEl) countEl.innerText = '0';
    const codeInput = document.getElementById('input-room-code');
    if (codeInput) codeInput.value = '';
}

// import resetOnlineSetup callback
import { resetOnlineSetup } from './firebase.js';

export function switchPhase(phaseNum) {
    gameState.currentPhase = phaseNum;
    updatePhaseStepper(phaseNum);

    // すべてのフェーズビューを非表示にする
    document.querySelectorAll('.phase-container').forEach(el => el.classList.remove('active'));

    if (phaseNum === 1) {
        document.getElementById('phase-1-view').classList.add('active');
        initPhase1Draft();
    } else if (phaseNum === 2) {
        document.getElementById('phase-2-view').classList.add('active');
        initPhase2Pot();
        triggerPotRevealModal(gameState.potTemplate);
    } else if (phaseNum === 3) {
        document.getElementById('phase-3-view').classList.add('active');
        initPhase3Results();
    }
}

export function initPhase1Draft() {
    const player = gameState.players[gameState.currentDraftPlayerIndex];
    const traitChipHtml = player.trait ? getTraitChipHtml(player.trait) : '';
    document.getElementById('p1-player-title').innerHTML = `
        <span style="vertical-align:middle;">${player.name} の手番：具材選択</span>
        ${traitChipHtml ? `<span style="display:inline-block; margin-left:8px; vertical-align:middle;">${traitChipHtml}</span>` : ''}
    `;
    renderPotHintBanner(gameState.potTemplate);

    if (player.isCpu) {
        handleCpuDraft(player);
    } else {
        draftState.options = generatePhase1DraftPool();
        renderDraftGrid(draftState.options);
        updateDraftButtonState();
    }
}

export function generatePhase1DraftPool() {
    const pool = [];

    // 1. もつ系から2枚選出
    const motsuList = INGREDIENTS_DATABASE.filter(x => x.category === 'motsu');
    const shuffledMotsu = [...motsuList].sort(() => 0.5 - Math.random());
    for (let i = 0; i < 2; i++) {
        const item = shuffledMotsu[i % shuffledMotsu.length];
        pool.push(createIngredientInstance(item));
    }

    // 2. 定番系から1枚選出
    const classicList = INGREDIENTS_DATABASE.filter(x => x.category === 'classic');
    const shuffledClassic = [...classicList].sort(() => 0.5 - Math.random());
    pool.push(createIngredientInstance(shuffledClassic[0]));

    // 3. 全具材からランダムに3枚選出
    const shuffledAll = [...INGREDIENTS_DATABASE].sort(() => 0.5 - Math.random());
    for (let i = 0; i < 3; i++) {
        pool.push(createIngredientInstance(shuffledAll[i]));
    }

    // 6枚の並び順をランダムにシャッフル
    return pool.sort(() => 0.5 - Math.random());
}

export function getRandomIngredients(count) {
    const shuffled = [...INGREDIENTS_DATABASE].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map(item => createIngredientInstance(item));
}

export function submitDraftChoice() {
    playSound('add');

    // 選択されたインスタンスカードを取得
    const selectedCards = draftState.options.filter(x => gameState.selectedDraftIds.includes(x.id));

    if (gameState.mode === 'online') {
        if (!firebaseState.roomRef) return;
        
        const curPlayer = gameState.players[gameState.currentDraftPlayerIndex];
        if (curPlayer.uid !== myPlayerId) return;

        const updatedPotStack = [...(gameState.potStack || []), ...selectedCards];
        const nextDraftIndex = gameState.currentDraftPlayerIndex + 1;

        if (nextDraftIndex < gameState.players.length) {
            firebaseState.roomRef.update({
                potStack: updatedPotStack,
                currentDraftPlayerIndex: nextDraftIndex
            });
        } else {
            // 全員のドラフト完了：テンプレート具材を追加してPhase 2へ
            const baseItems = generatePotTemplateIngredients(gameState.potTemplate);
            baseItems.forEach(item => {
                updatedPotStack.push(item);
            });
            updatedPotStack.sort(() => 0.5 - Math.random());

            // 最初の取札3枚を準備
            const firstScoopCount = Math.min(3, updatedPotStack.length);
            const firstScoopOptions = [];
            for (let i = 0; i < firstScoopCount; i++) {
                firstScoopOptions.push(updatedPotStack.pop());
            }

            firebaseState.roomRef.update({
                potStack: updatedPotStack,
                currentDraftPlayerIndex: nextDraftIndex,
                currentPhase: 2,
                currentTurnPlayerIndex: 0,
                currentScoopOptions: firstScoopOptions,
                hasRerolledThisTurn: false
            });
        }
        gameState.selectedDraftIds = [];
        return;
    }

    selectedCards.forEach(card => {
        gameState.potStack.push(card);
    });

    showToast(`${gameState.players[gameState.currentDraftPlayerIndex].name} が具材を3枚投入しました！`);

    gameState.currentDraftPlayerIndex++;
    if (gameState.currentDraftPlayerIndex < gameState.players.length) {
        initPhase1Draft();
    } else {
        // 全員投入完了 -> 基本具材追加してフェーズ2へ
        addDefaultPotBase();
        switchPhase(2);
    }
    gameState.selectedDraftIds = [];
}

export function handleCpuDraft(cpuPlayer) {
    showToast(`${cpuPlayer.name} (CPU) が思考中...`);
    setTimeout(() => {
        const pool = generatePhase1DraftPool();
        // CPUはランダムに3つ選ぶ
        const selected = [];
        const indices = [0, 1, 2, 3, 4, 5].sort(() => 0.5 - Math.random()).slice(0, 3);
        indices.forEach(idx => {
            selected.push(pool[idx]);
        });

        selected.forEach(card => {
            gameState.potStack.push(card);
        });

        showToast(`${cpuPlayer.name} が具材を3枚投入しました！`);

        gameState.currentDraftPlayerIndex++;
        if (gameState.currentDraftPlayerIndex < gameState.players.length) {
            initPhase1Draft();
        } else {
            addDefaultPotBase();
            switchPhase(2);
        }
    }, 1000);
}

export function addDefaultPotBase() {
    const baseItems = generatePotTemplateIngredients(gameState.potTemplate);
    baseItems.forEach(item => {
        gameState.potStack.push(item);
    });
    // シャッフル
    gameState.potStack.sort(() => 0.5 - Math.random());
}

export function logPhase2Debug(actionName) {
    const curPlayer = gameState.players[gameState.currentTurnPlayerIndex];
    const pot = gameState.potStack || [];
    const scoops = Object.values(gameState.currentScoopOptions || {});

    console.group(`[Phase2 Debug] ${actionName}`);
    console.log("🎳現在の鍋の残り枚数:", pot.length);
    console.log("🥁現在の取札の中身:", scoops.map(c => c.name || c.id));
    console.log("🔄 リロール使用済みか:", !!gameState.hasRerolledThisTurn);

    // 山札の各カードのScoreとSpicy/Tasteを出力
    const potCardDetails = pot.map(c => {
        const t = (c.taste !== undefined) ? c.taste : (c.spice || 0);
        return `${c.rawName || c.name}(Score:${c.score >= 0 ? '+'+c.score : c.score}, Spicy:${t >= 0 ? '+'+t : t})`;
    });
    console.log("📊 山札の全カード内訳:", potCardDetails);

    // 計算された HSL 値の詳細を別の group で出力
    const colorDetails = getPotSoupColorDetails(pot);
    console.groupCollapsed(`🎨 鍋のスープ色計算結果 (HSL) [H:${colorDetails.H}deg, S:${colorDetails.S}%, L:${colorDetails.L}%]`);
    console.log("📈 山札合計Score:", colorDetails.totalScore, `(平均Score: ${colorDetails.avgScore}, 健全度Factor: ${colorDetails.fHealth})`);
    console.log("🌶️ 山札合計Spicy/Taste:", colorDetails.totalTaste, `(平均Spicy: ${colorDetails.avgTaste}, 味覚Factor: ${colorDetails.fTaste})`);
    console.log("🌈 計算色相 (Hue):", `${colorDetails.H}deg`);
    console.log("✨ 計算彩度 (Saturation):", `${colorDetails.S}%`);
    console.log("💡 計算明度 (Lightness):", `${colorDetails.L}%`);
    console.log("🎨 中央色 (Center):", colorDetails.centerColor);
    console.log("🎨 中間色 (Mid):", colorDetails.midColor);
    console.log("🎨 外縁色 (Outer):", colorDetails.outerColor);
    console.log("🖼️ 適用CSS Gradient:", colorDetails.gradient);
    console.groupEnd();

    console.groupEnd();
}

export function initPhase2Pot() {
    gameState.currentTurnPlayerIndex = 0;
    gameState.hasRerolledThisTurn = false;
    gameState.currentScoopOptions = [];
    prepareScoopForCurrentTurn();
    renderPotUI();

    // 3D鍋を初期化（Phase 2 表示後に呼び出す）
    if (typeof window.initPot3D === 'function') {
        // DOMが表示された後にレンダラーを初期化するため少し遅延
        requestAnimationFrame(() => window.initPot3D());
    }

    logPhase2Debug("Phase 2 初期化完了");
    addGameLog('🍲 鍋がグツグツ煮立ちました！影絵の取札から具材を選んでください。', true);
    checkTurnStep();
}

export function prepareScoopForCurrentTurn() {
    if (!gameState.potStack || gameState.potStack.length === 0) {
        gameState.currentScoopOptions = [];
        logPhase2Debug("取札準備: 鍋が空のため取札なし");
        return;
    }

    const scoopCount = Math.min(3, gameState.potStack.length);
    gameState.currentScoopOptions = [];
    for (let i = 0; i < scoopCount; i++) {
        gameState.currentScoopOptions.push(gameState.potStack.pop());
    }
    logPhase2Debug(`取札準備完了: 鍋から${scoopCount}枚掬い上げました`);
}

export function pIsUnavailable(p) {
    return !p || p.isPassed || p.isBusted || (p.bowl && p.bowl.length >= 4);
}

export function reshuffleScoop() {
    const curPlayer = gameState.players[gameState.currentTurnPlayerIndex];
    if (pIsUnavailable(curPlayer)) return;

    if (gameState.hasRerolledThisTurn) {
        showToast("1ターンにリロールできるのは1回までです");
        return;
    }

    if (gameState.mode === 'online') {
        if (!firebaseState.roomRef || curPlayer.uid !== myPlayerId) return;
        executeOnlineReroll();
        return;
    }

    playSound('add');
    gameState.hasRerolledThisTurn = true;

    const scoops = Object.values(gameState.currentScoopOptions || {});
    if (scoops.length > 0) {
        gameState.potStack.push(...scoops);
        gameState.currentScoopOptions = [];
    }

    // シャッフル
    gameState.potStack.sort(() => 0.5 - Math.random());

    // 再度取札を掬う
    prepareScoopForCurrentTurn();

    addGameLog(`${curPlayer.name} が「もう一回掬う」で取札を鍋に戻してリロールしました！`);
    renderPotUI();
}

export function selectScoopedItem(scoopIndex) {
    const curPlayer = gameState.players[gameState.currentTurnPlayerIndex];
    if (pIsUnavailable(curPlayer)) return;

    if (gameState.mode === 'online') {
        if (!firebaseState.roomRef || curPlayer.uid !== myPlayerId) return;
        executeOnlineScoopSelect(scoopIndex);
        return;
    }

    const scoops = Object.values(gameState.currentScoopOptions || {});
    if (!scoops || !scoops[scoopIndex]) return;

    playSound('draw');
    const chosenItem = scoops.splice(scoopIndex, 1)[0];

    if (!curPlayer.bowl) curPlayer.bowl = [];
    curPlayer.bowl.push(chosenItem);

    // 選ばれなかった残りの取札を確実に鍋に戻してシャッフル
    const remainingCount = scoops.length;
    if (remainingCount > 0) {
        gameState.potStack.push(...scoops);
    }
    gameState.potStack.sort(() => 0.5 - Math.random());
    gameState.currentScoopOptions = [];

    const pot = document.getElementById('pot-element');
    if (pot) {
        pot.classList.add('shaking');
        setTimeout(() => pot.classList.remove('shaking'), 400);
    }

    addGameLog(`${curPlayer.name} が 【${chosenItem.icon} ${chosenItem.name}】 を獲得！（選ばれなかった${remainingCount}枚は鍋に戻してシャッフルしました）`);
    logPhase2Debug(`具材選択完了 (${chosenItem.name} を獲得, ${remainingCount}枚返却)`);

    const currentTaste = curPlayer.bowl.reduce((acc, cur) => acc + (cur.taste !== undefined ? cur.taste : (cur.spice || 0)), 0);
    const isBurstImmune = curPlayer.trait?.id === 'burst_immune';

    if (currentTaste >= 300) {
        if (!isBurstImmune) {
            curPlayer.isBusted = true;
            playSound('bust');
            addGameLog(`💥💥 ${curPlayer.name} のお椀が辛み度 (🔥+${currentTaste}) に達し【激辛バースト】しました！（最終スコアから ${BURST_PENALTY_SCORE} pt）`, false, true);
        } else {
            playSound('add');
            addGameLog(`🛡️ ${curPlayer.name} は辛み度 (🔥+${currentTaste}) に達しましたが【鋼の胃袋】によりバーストを無効化しました！`, true);
        }
    } else if (currentTaste <= -300) {
        if (!isBurstImmune) {
            curPlayer.isBusted = true;
            playSound('bust');
            addGameLog(`💥💥 ${curPlayer.name} のお椀が甘み度 (🍬${currentTaste}) に達し【激甘バースト】しました！（最終スコアから ${BURST_PENALTY_SCORE} pt）`, false, true);
        } else {
            playSound('add');
            addGameLog(`🛡️ ${curPlayer.name} は甘み度 (🍬${currentTaste}) に達しましたが【鋼の胃袋】によりバーストを無効化しました！`, true);
        }
    }

    if (curPlayer.bowl.length >= 4 && !curPlayer.isBusted) {
        curPlayer.isPassed = true;
        addGameLog(`🥣 ${curPlayer.name} は上限の4枚の具材を確保し、お椀が完成しました！`);
    }

    advanceTurn();
}

export function checkTurnStep() {
    if (gameState.mode === 'online') return; // オンライン時はFirebaseリスナーが描画

    const activePlayers = gameState.players.filter(p => !p.isPassed && !p.isBusted);
    const scoops = Object.values(gameState.currentScoopOptions || {});

    // 全員終了か、鍋と手札（取札）が完全に空になったらゲーム終了
    if (activePlayers.length === 0 || (gameState.potStack.length === 0 && scoops.length === 0)) {
        addGameLog('🏁 全員の具材が確定したため、ゲーム終了です！結果発表へ移行します。', true);
        setTimeout(() => {
            switchPhase(3);
        }, 1500);
        return;
    }

    const p = gameState.players[gameState.currentTurnPlayerIndex];
    if (pIsUnavailable(p)) {
        advanceTurn();
        return;
    }

    // 新しいターンの準備
    gameState.hasRerolledThisTurn = false;
    prepareScoopForCurrentTurn();
    renderPotUI();
    logPhase2Debug(`ターンステップ確認完了 (次手番: ${p.name}, CPU: ${p.isCpu})`);

    if (p.isCpu) {
        if (gameState.cpuTimerId) clearTimeout(gameState.cpuTimerId);
        gameState.cpuTimerId = setTimeout(() => {
            gameState.cpuTimerId = null;
            handleCpuTurn(p);
        }, 1200);
    }
}

export function advanceTurn() {
    logPhase2Debug("手番交代 (advanceTurn 実行前)");

    if (gameState.cpuTimerId) {
        clearTimeout(gameState.cpuTimerId);
        gameState.cpuTimerId = null;
    }

    // ⚠️ 安全保護: 未選択の取札が残っていた場合、破棄せず必ず鍋に返却
    const leftoverScoops = Object.values(gameState.currentScoopOptions || {});
    if (leftoverScoops.length > 0) {
        gameState.potStack.push(...leftoverScoops);
        gameState.potStack.sort(() => 0.5 - Math.random());
        gameState.currentScoopOptions = [];
    }

    gameState.currentTurnPlayerIndex = (gameState.currentTurnPlayerIndex + 1) % gameState.players.length;
    gameState.hasRerolledThisTurn = false;
    checkTurnStep();
}

export function handleCpuTurn(cpu) {
    // タイマー発火時に手番がズレていればスキップ
    const curPlayer = gameState.players[gameState.currentTurnPlayerIndex];
    if (!curPlayer || curPlayer.id !== cpu.id) return;

    logPhase2Debug(`CPU思考開始 (${cpu.name})`);
    const scoops = Object.values(gameState.currentScoopOptions || {});
    if (scoops.length === 0) {
        advanceTurn();
        return;
    }

    const currentTaste = (cpu.bowl || []).reduce((acc, cur) => acc + (cur.taste !== undefined ? cur.taste : (cur.spice || 0)), 0);
    const currentScore = (cpu.bowl || []).reduce((acc, cur) => acc + cur.score, 0);

    // パス判定 (味覚の絶対値が200以上でバースト防止のためパス)
    let shouldPass = false;
    if ((cpu.bowl || []).length >= 3 && currentScore >= 100000) shouldPass = true;
    else if (Math.abs(currentTaste) >= 200 && Math.random() < 0.8) shouldPass = true;
    else if ((cpu.bowl || []).length >= 3 && Math.random() < 0.5) shouldPass = true;

    if (shouldPass) {
        cpu.isPassed = true;
        playSound('select');
        addGameLog(`${cpu.name} は満足してパス（確定）しました。`);
        advanceTurn();
    } else {
        // 取札の中からランダム選択
        const randomIdx = Math.floor(Math.random() * scoops.length);
        selectScoopedItem(randomIdx);
    }
}

// Dead code from previous versions, kept for compatibility/rules
export function executeDraw(player) {
    if (gameState.potStack.length === 0) return;

    playSound('draw');
    const drawnItem = gameState.potStack.pop();
    player.bowl.push(drawnItem);

    const pot = document.getElementById('pot-element');
    pot.classList.add('shaking');
    setTimeout(() => pot.classList.remove('shaking'), 400);

    addGameLog(`${player.name} が鍋から 【${drawnItem.icon} ${drawnItem.name}】 を引きました！ (${drawnItem.score >= 0 ? '+'+drawnItem.score : drawnItem.score}pt)`);

    const currentSpice = player.bowl.reduce((acc, cur) => acc + cur.spice, 0);
    if (currentSpice >= 400) {
        player.isBusted = true;
        playSound('bust');
        addGameLog(`💥💥 ${player.name} のお椀が激辛度 (🔥${currentSpice}) に達し【激辛バースト】しました！（最終スコアから ${BURST_PENALTY_SCORE} pt）`, false, true);
    } else if (player.bowl.length >= 4) {
        player.isPassed = true;
        addGameLog(`🥣 ${player.name} は上限の4枚の具材を確保し、お椀が完成しました！`);
    }

    renderPotUI();
    setTimeout(() => advanceTurn(), 800);
}

export function handleCpuTurnOld(cpu) {
    const currentSpice = cpu.bowl.reduce((acc, cur) => acc + cur.spice, 0);
    const currentScore = cpu.bowl.reduce((acc, cur) => acc + cur.score, 0);

    let shouldPass = false;

    if (cpu.bowl.length === 0) {
        shouldPass = false;
    } else if (cpu.bowl.length >= 3 && currentScore >= 100000) {
        shouldPass = true;
    } else if (currentSpice >= 300 && Math.random() < 0.8) {
        shouldPass = true;
    } else if (cpu.bowl.length >= 3 && Math.random() < 0.5) {
        shouldPass = true;
    }

    if (shouldPass) {
        cpu.isPassed = true;
        playSound('select');
        addGameLog(`${cpu.name} は満足してパス（確定）しました。`);
        advanceTurn();
    } else {
        executeDraw(cpu);
    }
}

/**
 * プレイヤーの特性を加味した具材1枚のスコアを計算
 * @param {object} player 
 * @param {object} item 
 * @returns {number}
 */
export function calculatePlayerItemScore(player, item) {
    if (!item) return 0;
    let score = item.score || 0;

    // 闇の美食家: 闇素材のマイナススコアを正のスコアに反転
    if (player?.trait?.id === 'yami_positive' && item.category === 'yami' && score < 0) {
        score = Math.abs(score);
    }

    // 王道の探求者: 定番具材の基礎スコアを 1.5倍 にアップ
    if (player?.trait?.id === 'classic_boost' && item.category === 'classic') {
        const mult = player.trait.params?.multiplier || 1.5;
        score = Math.round(score * mult);
    }

    return score;
}

export function calculateFinalScores() {
    gameState.players.forEach(p => {
        const bowl = p.bowl || [];
        p.achievedCombos = [];

        let baseScore = bowl.reduce((acc, cur) => acc + calculatePlayerItemScore(p, cur), 0);
        let bonus = 0;
        let details = [];

        COMBOS_DATABASE.forEach(combo => {
            if (combo.check && combo.check(bowl)) {
                let comboScore = combo.score;
                // 出汁の匠: 成立した役（コンボ）の追加ボーナスを 1.3倍 にアップ (正のボーナスのみ対象)
                if (p.trait?.id === 'combo_boost' && comboScore > 0) {
                    const mult = p.trait.params?.multiplier || 1.3;
                    comboScore = Math.round(comboScore * mult);
                }

                bonus += comboScore;
                const sign = comboScore >= 0 ? '+' : '';
                details.push(`${combo.name}(${sign}${comboScore})`);
                p.achievedCombos.push({
                    id: combo.id,
                    name: combo.name,
                    score: comboScore,
                    icon: combo.icon || '🍲'
                });
            }
        });

        let finalScore = baseScore + bonus;
        if (p.isBusted) {
            finalScore += BURST_PENALTY_SCORE;
        }

        p.baseScore = baseScore;
        p.comboBonus = bonus;
        p.finalScore = finalScore;

        let breakdownParts = [`基本:${baseScore}pt`];
        if (p.trait && p.trait.id !== 'none') {
            breakdownParts.push(`[${p.trait.icon}${p.trait.subName}]`);
        }
        if (details.length) {
            breakdownParts.push(`(${details.join(', ')})`);
        }
        if (p.isBusted) {
            breakdownParts.push(`バーストペナルティ(${BURST_PENALTY_SCORE}pt)`);
        }
        p.scoreBreakdown = breakdownParts.join(' ');
    });
}

export function handlePassClick() {
    const p = gameState.players[gameState.currentTurnPlayerIndex];
    if (p.isCpu || p.isPassed || p.isBusted) return;

    if (gameState.mode === 'online') {
        if (!firebaseState.roomRef || p.uid !== myPlayerId) return;
        executeOnlinePass();
        return;
    }

    p.isPassed = true;
    playSound('select');
    addGameLog(`${p.name} が「いただきます！」とパスしてお椀を確定しました。`, true);
    advanceTurn();
}
