import { firebaseState, myPlayerId } from './firebase.js';
import { playSound } from './sound.js';
import { INGREDIENTS_DATABASE, createIngredientInstance } from './ingredients.js';
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
    showToast 
} from './ui.js';
import { executeOnlineReroll, executeOnlineScoopSelect, executeOnlinePass } from './firebase.js';

/* --- ゲーム状態構造 --- */
export let gameState = {
    mode: 'vs-cpu', // 'vs-cpu' | 'hotseat' | 'online'
    soundEnabled: true,
    currentPhase: 1,
    players: [],
    currentDraftPlayerIndex: 0,
    currentTurnPlayerIndex: 0,
    potStack: [],
    selectedDraftIds: []
};

export const draftState = { options: [] };

/* --- ゲーム初期化 --- */
export function startGame(mode) {
    gameState.mode = mode;
    gameState.potStack = [];
    gameState.currentDraftPlayerIndex = 0;
    gameState.currentTurnPlayerIndex = 0;

    if (mode === 'vs-cpu') {
        gameState.players = [
            { id: 0, name: 'あなた (P1)', isCpu: false, bowl: [], isPassed: false, isBusted: false },
            { id: 1, name: 'モツ太郎 (CPU)', isCpu: true, bowl: [], isPassed: false, isBusted: false },
            { id: 2, name: 'キャベ子 (CPU)', isCpu: true, bowl: [], isPassed: false, isBusted: false },
            { id: 3, name: '闇シェフ (CPU)', isCpu: true, bowl: [], isPassed: false, isBusted: false }
        ];
    } else {
        gameState.players = [
            { id: 0, name: 'プレイヤー1', isCpu: false, bowl: [], isPassed: false, isBusted: false },
            { id: 1, name: 'プレイヤー2', isCpu: false, bowl: [], isPassed: false, isBusted: false }
        ];
    }

    document.getElementById('start-screen').style.display = 'none';
    // ゲーム開始時にステップバーを表示
    document.getElementById('phase-stepper-bar').classList.add('active');
    switchPhase(1);
}

export function resetToStart() {
    if (firebaseState.roomRef) {
        firebaseState.roomRef.off();
        firebaseState.roomRef = null;
    }
    // We modify app.js's local isOnlineSetupDone by setting it inside app.js if needed,
    // but resetToStart can just assign it if imported. Wait! isOnlineSetupDone is in app.js.
    // If resetToStart needs to modify isOnlineSetupDone, we can export a function resetOnlineSetup() in app.js
    // or just trigger it. Let's export resetOnlineSetup from app.js.
    resetOnlineSetup();
    firebaseState.currentRoomId = null;
    document.getElementById('start-screen').style.display = 'block';
    document.getElementById('phase-stepper-bar').classList.remove('active');
    document.querySelectorAll('.phase-container').forEach(el => el.classList.remove('active'));
    
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
    } else if (phaseNum === 3) {
        document.getElementById('phase-3-view').classList.add('active');
        initPhase3Results();
    }
}

export function initPhase1Draft() {
    const player = gameState.players[gameState.currentDraftPlayerIndex];
    document.getElementById('p1-player-title').innerText = `${player.name} の手番：具材選択`;

    if (player.isCpu) {
        handleCpuDraft(player);
    } else {
        draftState.options = getRandomIngredients(6);
        renderDraftGrid(draftState.options);
        updateDraftButtonState();
    }
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
            // 全員のドラフト完了：基本具材を追加してPhase 2へ
            const baseItemIds = ['motsu_normal', 'motsu_premium', 'vege_cabbage', 'vege_nira', 'vege_tofu', 'spice_chili', 'spice_dashi', 'yami_pepper'];
            baseItemIds.forEach(id => {
                const base = INGREDIENTS_DATABASE.find(x => x.id === id);
                if (base) updatedPotStack.push(createIngredientInstance(base));
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
        const pool = getRandomIngredients(6);
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
    const baseItemIds = ['motsu_normal', 'motsu_premium', 'vege_cabbage', 'vege_nira', 'vege_tofu', 'spice_chili', 'spice_dashi', 'yami_pepper'];
    baseItemIds.forEach(id => {
        const base = INGREDIENTS_DATABASE.find(x => x.id === id);
        if (base) gameState.potStack.push(createIngredientInstance(base));
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
    console.groupEnd();
}

export function initPhase2Pot() {
    gameState.currentTurnPlayerIndex = 0;
    gameState.hasRerolledThisTurn = false;
    gameState.currentScoopOptions = [];
    prepareScoopForCurrentTurn();
    renderPotUI();
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
    if (currentTaste >= 3) {
        curPlayer.isBusted = true;
        playSound('bust');
        addGameLog(`💥💥 ${curPlayer.name} のお椀が辛み度 (🔥+${currentTaste}) に達し【激辛バースト】しました！0点確定！`, false, true);
    } else if (currentTaste <= -3) {
        curPlayer.isBusted = true;
        playSound('bust');
        addGameLog(`💥💥 ${curPlayer.name} のお椀が甘み度 (🍬${currentTaste}) に達し【激甘バースト】しました！0点確定！`, false, true);
    } else if (curPlayer.bowl.length >= 4) {
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

    // パス判定 (味覚の絶対値が2以上でバースト防止のためパス)
    let shouldPass = false;
    if ((cpu.bowl || []).length >= 3 && currentScore >= 10) shouldPass = true;
    else if (Math.abs(currentTaste) >= 2 && Math.random() < 0.8) shouldPass = true;
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
    if (currentSpice >= 4) {
        player.isBusted = true;
        playSound('bust');
        addGameLog(`💥💥 ${player.name} のお椀が激辛度 (🔥${currentSpice}) に達し【激辛バースト】しました！0点確定！`, false, true);
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
    } else if (cpu.bowl.length >= 3 && currentScore >= 10) {
        shouldPass = true;
    } else if (currentSpice >= 3 && Math.random() < 0.8) {
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

export function calculateFinalScores() {
    gameState.players.forEach(p => {
        const bowl = p.bowl || [];
        if (p.isBusted) {
            p.finalScore = 0;
            p.scoreBreakdown = '激辛バーストにより 0 pt';
            return;
        }

        let baseScore = bowl.reduce((acc, cur) => acc + cur.score, 0);
        let bonus = 0;
        let details = [];

        const hasMotsu = bowl.some(b => b.category === 'motsu');
        const hasVege = bowl.some(b => b.category === 'vege');
        const hasSpice = bowl.some(b => b.category === 'spice');
        const motsuCount = bowl.filter(b => b.category === 'motsu').length;

        if (hasMotsu && hasVege) {
            bonus += 3;
            details.push('王道組み合わせ(+3)');
        }
        if (hasMotsu && hasSpice) {
            bonus += 2;
            details.push('出汁マリアージュ(+2)');
        }
        if (motsuCount >= 3) {
            bonus += 4;
            details.push('メガ盛りもつコンボ(+4)');
        }

        let finalScore = baseScore + bonus;
        p.finalScore = finalScore;
        p.scoreBreakdown = `基本:${baseScore}pt ` + (details.length ? `(${details.join(', ')})` : '');
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
