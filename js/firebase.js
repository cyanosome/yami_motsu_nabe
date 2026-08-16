import { 
    showToast, 
    showLobbyUI, 
    updatePhaseStepper, 
    renderOnlineDraftPhase, 
    renderOnlinePotPhase, 
    initPhase3Results,
    triggerPotRevealModal,
    openTraitSelectModal,
    closeTraitSelectModal,
    updateTraitWaitingPlayers,
    resetPhase3State
} from './ui.js';
import { playSound, playBGM, stopBGM } from './sound.js';
import { gameState, generatePhase1DraftPool } from './gameLogic.js';
import { getRandomPotTemplate } from './ingredients.js';

/* --- Firebase Realtime Database 初期化 --- */
const firebaseConfig = {
    databaseURL: "https://yami-motsu-nabe-default-rtdb.firebaseio.com/"
};
firebase.initializeApp(firebaseConfig);
export const db = firebase.database();

/* --- プレイヤーセッション設定 --- */
function getMyPlayerId() {
    let pid = sessionStorage.getItem('yami_motsu_pid');
    if (!pid) {
        pid = 'p_' + Math.random().toString(36).substring(2, 9);
        sessionStorage.setItem('yami_motsu_pid', pid);
    }
    return pid;
}

export const myPlayerId = getMyPlayerId();

export const firebaseState = {
    currentRoomId: null,
    isHost: false,
    roomRef: null
};

export function closeOnlineModal() {
    if (firebaseState.roomRef) {
        // ロビー中またはモーダルを閉じた際の退室処理
        if (!firebaseState.isHost) {
            firebaseState.roomRef.child('players/' + myPlayerId).remove().catch(() => {});
        } else {
            firebaseState.roomRef.remove().catch(() => {});
        }
        firebaseState.roomRef.off();
        firebaseState.roomRef = null;
    }
    closeTraitSelectModal();
    resetOnlineSetup();
    resetPhase3State();
    if (typeof window.disposePot3D === 'function') {
        window.disposePot3D();
    }
    stopBGM({ fadeOut: true });
    firebaseState.isHost = false;
    firebaseState.currentRoomId = null;
    const startScreen = document.getElementById('start-screen');
    if (startScreen) startScreen.style.display = 'block';
    const stepperBar = document.getElementById('phase-stepper-bar');
    if (stepperBar) stepperBar.classList.remove('active');
    document.querySelectorAll('.phase-container').forEach(el => el.classList.remove('active'));
    document.getElementById('online-modal').classList.remove('active');
}

/**
 * ゲストが結果画面やロビーから単独退出する
 */
export function leaveOnlineRoomGuest() {
    if (firebaseState.roomRef) {
        if (!firebaseState.isHost) {
            firebaseState.roomRef.child('players/' + myPlayerId).remove().catch(() => {});
        } else {
            firebaseState.roomRef.remove().catch(() => {});
        }
        firebaseState.roomRef.off();
        firebaseState.roomRef = null;
    }
    firebaseState.isHost = false;
    firebaseState.currentRoomId = null;

    if (typeof window.resetToStart === 'function') {
        window.resetToStart();
    }
}

function getEnteredPlayerName() {
    const nameInput = document.getElementById('input-player-name').value.trim();
    const name = nameInput || `プレイヤー_${Math.floor(100 + Math.random() * 900)}`;
    localStorage.setItem('yami_motsu_name', name);
    return name;
}

export function createOnlineRoom() {
    const playerName = getEnteredPlayerName();
    const roomId = Math.floor(1000 + Math.random() * 9000).toString();
    firebaseState.currentRoomId = roomId;
    firebaseState.isHost = true;

    firebaseState.roomRef = db.ref('rooms/' + roomId);
    
    const initialRoomData = {
        roomId: roomId,
        status: 'waiting',
        hostPlayerId: myPlayerId,
        createdAt: Date.now(),
        players: {
            [myPlayerId]: {
                id: myPlayerId,
                name: playerName,
                isHost: true,
                joinedAt: Date.now()
            }
        }
    };

    firebaseState.roomRef.set(initialRoomData).then(() => {
        // 切断時に自動削除
        firebaseState.roomRef.child('players/' + myPlayerId).onDisconnect().remove();
        showLobbyUI(roomId);
        listenLobbyChanges();
    }).catch(err => {
        showToast("部屋の作成に失敗しました: " + err.message);
    });
}

export function joinOnlineRoom() {
    const playerName = getEnteredPlayerName();
    const codeInput = document.getElementById('input-room-code').value.trim();

    if (!codeInput || codeInput.length !== 4) {
        showToast("4桁の部屋コードを入力してください");
        return;
    }

    const targetRoomRef = db.ref('rooms/' + codeInput);
    targetRoomRef.once('value').then(snapshot => {
        if (!snapshot.exists()) {
            showToast("指定された部屋コードが存在しません");
            return;
        }

        const roomData = snapshot.val();
        if (roomData.status !== 'waiting') {
            showToast("既にゲームが開始されている部屋です");
            return;
        }

        const playerKeys = Object.keys(roomData.players || {});
        if (playerKeys.length >= 4) {
            showToast("部屋が満員です(最大4人)");
            return;
        }

        firebaseState.currentRoomId = codeInput;
        firebaseState.isHost = false;
        firebaseState.roomRef = targetRoomRef;

        // プレイヤー追加
        firebaseState.roomRef.child('players/' + myPlayerId).set({
            id: myPlayerId,
            name: playerName,
            isHost: false,
            joinedAt: Date.now()
        }).then(() => {
            firebaseState.roomRef.child('players/' + myPlayerId).onDisconnect().remove();
            showLobbyUI(firebaseState.currentRoomId);
            listenLobbyChanges();
        });
    });
}

/* --- オンラインゲーム進行状態 --- */
export let isOnlineSetupDone = false;
export function resetOnlineSetup() {
    isOnlineSetupDone = false;
    hasSelectedOnlineTrait = false;
    lastSyncedPhase = 0;
}

let hasSelectedOnlineTrait = false;

export function listenLobbyChanges() {
    if (!firebaseState.roomRef) return;

    firebaseState.roomRef.on('value', snapshot => {
        const roomData = snapshot.val();
        if (!roomData) {
            showToast("部屋が解散されました");
            closeOnlineModal();
            return;
        }

        if (roomData.status === 'waiting') {
            // ゲーム画面からロビーへの復帰クリーンアップ & 初期化
            resetOnlineSetup();
            resetPhase3State();
            if (typeof window.disposePot3D === 'function') {
                window.disposePot3D();
            }
            stopBGM({ fadeOut: true });

            // ゲーム進行UIを非表示にしてロビーモーダルを表示
            const stepperBar = document.getElementById('phase-stepper-bar');
            if (stepperBar) stepperBar.classList.remove('active');
            document.querySelectorAll('.phase-container').forEach(el => el.classList.remove('active'));

            const startScreen = document.getElementById('start-screen');
            if (startScreen) startScreen.style.display = 'none';

            const onlineModal = document.getElementById('online-modal');
            if (onlineModal) onlineModal.classList.add('active');

            showLobbyUI(roomData.roomId);

            // 参加者リストの更新
            const playersObj = roomData.players || {};
            const playersArr = Object.values(playersObj).sort((a, b) => a.joinedAt - b.joinedAt);

            const countEl = document.getElementById('lobby-player-count');
            if (countEl) countEl.innerText = playersArr.length;
            const listEl = document.getElementById('lobby-players-list');
            if (listEl) {
                listEl.innerHTML = '';
                playersArr.forEach(p => {
                    const item = document.createElement('div');
                    item.className = 'lobby-player-item';
                    item.innerHTML = `
                        <span>${p.name} ${p.isHost ? '<span class="host-badge">ホスト</span>' : ''} ${p.id === myPlayerId ? '<span style="color:var(--accent-gold); font-size:0.8rem;">(あなた)</span>' : ''}</span>
                        <span style="color:var(--accent-green); font-size:0.85rem;">✔ 参加中</span>
                    `;
                    listEl.appendChild(item);
                });
            }
        } else if (roomData.status === 'trait_selection') {
            // ホストがゲームを開始し、特性選択フェーズへ移行！
            document.getElementById('online-modal').classList.remove('active');

            const playersObj = roomData.players || {};
            const playersArr = Object.values(playersObj).sort((a, b) => a.joinedAt - b.joinedAt);
            const myData = playersObj[myPlayerId];

            if (!hasSelectedOnlineTrait && myData && !myData.traitReady) {
                hasSelectedOnlineTrait = true;
                openTraitSelectModal(
                    { name: myData.name || 'あなた' }, 
                    (selectedTrait) => {
                        firebaseState.roomRef.child('players/' + myPlayerId).update({
                            trait: selectedTrait,
                            traitReady: true
                        }).then(() => {
                            showToast("✨ 特性を決定しました！全プレイヤーの選択を待っています...");
                        });
                    },
                    {
                        keepOpenOnSelect: true,
                        myPlayerId: myPlayerId,
                        players: playersArr
                    }
                );
            } else if (myData && myData.traitReady) {
                // 既に選択済みの場合、他のプレイヤーの準備状況をリアルタイム更新
                updateTraitWaitingPlayers(playersArr, myPlayerId);
            }

            // ホストのみ：全プレイヤーの特性選択完了をチェック
            if (firebaseState.isHost) {
                const playersObj = roomData.players || {};
                const playersArr = Object.values(playersObj).sort((a, b) => a.joinedAt - b.joinedAt);
                const allReady = playersArr.length >= 2 && playersArr.every(p => p.traitReady === true);

                if (allReady) {
                    // 全員の特性が確定したら、鍋テンプレートを決定してPhase 1（ドラフト）を開始
                    const initialPlayers = playersArr.map((p, idx) => ({
                        id: idx,
                        uid: p.id,
                        name: p.name,
                        isCpu: false,
                        bowl: [],
                        isPassed: false,
                        isBusted: false,
                        trait: p.trait || null
                    }));

                    const draftOptionsPerPlayer = {};
                    initialPlayers.forEach(p => {
                        draftOptionsPerPlayer[p.uid] = generatePhase1DraftPool();
                    });

                    const selectedTemplate = getRandomPotTemplate();

                    const gameInitData = {
                        status: 'playing',
                        mode: 'online',
                        currentPhase: 1,
                        potTemplate: selectedTemplate,
                        players: initialPlayers,
                        currentDraftPlayerIndex: 0,
                        currentTurnPlayerIndex: 0,
                        potStack: [],
                        draftOptionsPerPlayer: draftOptionsPerPlayer,
                        selectedDraftIds: []
                    };

                    firebaseState.roomRef.update(gameInitData);
                }
            }
        } else if (roomData.status === 'playing') {
            // ホストがゲームを開始した（Phase 1 へ突入）！
            document.getElementById('online-modal').classList.remove('active');
            closeTraitSelectModal();
            setupOnlineGameClient(roomData);
            syncOnlineStateToLocal(roomData);
        }
    });
}

export function startOnlineGameHost() {
    if (!firebaseState.roomRef || !firebaseState.isHost) return;

    firebaseState.roomRef.once('value').then(snapshot => {
        const roomData = snapshot.val();
        const playersObj = roomData.players || {};
        const playersArr = Object.values(playersObj).sort((a, b) => a.joinedAt - b.joinedAt);

        if (playersArr.length < 2) {
            showToast("対戦相手が参加するまで待ってください (2人以上で開始可能)");
            return;
        }

        // 特性選択フェーズへ遷移
        firebaseState.roomRef.update({
            status: 'trait_selection'
        });
    });
}

/**
 * ホストがゲーム終了後に同じルームを待機状態（ロビー）に戻す
 */
export function returnToOnlineLobbyHost() {
    if (!firebaseState.roomRef || !firebaseState.isHost) return;

    firebaseState.roomRef.once('value').then(snapshot => {
        const roomData = snapshot.val();
        if (!roomData) return;

        const hostPlayerId = roomData.hostPlayerId || myPlayerId;

        // 現在のプレイヤー配列またはオブジェクトから待機用マップを再構築
        const currentPlayers = Array.isArray(roomData.players)
            ? roomData.players
            : Object.values(roomData.players || {});

        const resetPlayersMap = {};
        currentPlayers.forEach(p => {
            const pid = p.uid || p.id;
            if (pid) {
                resetPlayersMap[pid] = {
                    id: pid,
                    name: p.name || 'プレイヤー',
                    isHost: pid === hostPlayerId,
                    joinedAt: p.joinedAt || Date.now()
                };
            }
        });

        // ルームデータを待機状態に完全リセット（過去のゲーム固有ステートを削除）
        const newRoomData = {
            roomId: roomData.roomId || firebaseState.currentRoomId,
            status: 'waiting',
            hostPlayerId: hostPlayerId,
            createdAt: roomData.createdAt || Date.now(),
            players: resetPlayersMap
        };

        firebaseState.roomRef.set(newRoomData).then(() => {
            // 切断時自動削除フックを再登録
            firebaseState.roomRef.child('players/' + myPlayerId).onDisconnect().remove();
        }).catch(err => {
            showToast("ロビーへの復帰に失敗しました: " + err.message);
        });
    });
}

let lastSyncedPhase = 0;

/* --- オンラインゲームリアルタイム同期 --- */
export function setupOnlineGameClient(roomData) {
    gameState.mode = 'online';
    lastSyncedPhase = 0;
    const startScreen = document.getElementById('start-screen');
    if (startScreen) startScreen.style.display = 'none';
    const stepperBar = document.getElementById('phase-stepper-bar');
    if (stepperBar) stepperBar.classList.add('active');

    if (isOnlineSetupDone) return;
    isOnlineSetupDone = true;
}

export function syncOnlineStateToLocal(data) {
    const prevPhase = lastSyncedPhase;
    lastSyncedPhase = data.currentPhase;

    // オンラインゲーム進行中はBGMを再生
    playBGM('MAIN', { fadeIn: true });

    gameState.currentPhase = data.currentPhase;
    gameState.potTemplate = data.potTemplate || null;
    gameState.players = data.players || [];
    gameState.currentDraftPlayerIndex = data.currentDraftPlayerIndex || 0;
    gameState.currentTurnPlayerIndex = data.currentTurnPlayerIndex || 0;
    gameState.potStack = data.potStack || [];
    gameState.currentScoopOptions = data.currentScoopOptions || [];
    gameState.hasRerolledThisTurn = data.hasRerolledThisTurn || false;

    updatePhaseStepper(data.currentPhase);

    // PhaseごとのUI画面切り替えと描画
    if (data.currentPhase === 1) {
        if (typeof window.disposePot3D === 'function') window.disposePot3D();
        document.querySelectorAll('.phase-container').forEach(el => el.classList.remove('active'));
        document.getElementById('phase-1-view').classList.add('active');
        renderOnlineDraftPhase(data);
    } else if (data.currentPhase === 2) {
        document.querySelectorAll('.phase-container').forEach(el => el.classList.remove('active'));
        document.getElementById('phase-2-view').classList.add('active');
        renderOnlinePotPhase(data);
        
        // 初めてPhase 2に入った時にカットインを表示
        if (prevPhase === 1 && data.potTemplate) {
            triggerPotRevealModal(data.potTemplate);
        }

        // 3D鍋を初期化
        if (typeof window.initPot3D === 'function') {
            requestAnimationFrame(() => window.initPot3D());
        }
    } else if (data.currentPhase === 3) {
        if (typeof window.disposePot3D === 'function') window.disposePot3D();
        document.querySelectorAll('.phase-container').forEach(el => el.classList.remove('active'));
        document.getElementById('phase-3-view').classList.add('active');
        initPhase3Results();
    }
}

/* --- オンライン用 取札＆リロール同期 --- */
export function executeOnlineReroll() {
    playSound('add');
    const updatedPotStack = [...(gameState.potStack || [])];
    const currentScoops = Object.values(gameState.currentScoopOptions || {});
    
    if (currentScoops.length > 0) {
        updatedPotStack.push(...currentScoops);
    }
    updatedPotStack.sort(() => 0.5 - Math.random());

    const newScoopCount = Math.min(3, updatedPotStack.length);
    const newScoopOptions = [];
    for (let i = 0; i < newScoopCount; i++) {
        newScoopOptions.push(updatedPotStack.pop());
    }

    firebaseState.roomRef.update({
        potStack: updatedPotStack,
        currentScoopOptions: newScoopOptions,
        hasRerolledThisTurn: true
    });
}

export function executeOnlineScoopSelect(scoopIndex) {
    playSound('draw');
    const updatedPotStack = [...(gameState.potStack || [])];
    const currentScoops = Object.values(gameState.currentScoopOptions || {});

    if (!currentScoops[scoopIndex]) return;

    const chosenItem = currentScoops.splice(scoopIndex, 1)[0];

    // 残りの取札を確実に鍋に戻してシャッフル
    if (currentScoops.length > 0) {
        updatedPotStack.push(...currentScoops);
    }
    updatedPotStack.sort(() => 0.5 - Math.random());

    const updatedPlayers = JSON.parse(JSON.stringify(gameState.players));
    const playerIndex = gameState.currentTurnPlayerIndex;
    const player = updatedPlayers[playerIndex];

    if (!player.bowl) player.bowl = [];
    player.bowl.push(chosenItem);

    const currentTaste = player.bowl.reduce((acc, cur) => acc + (cur.taste !== undefined ? cur.taste : (cur.spice || 0)), 0);
    const isBurstImmune = player.trait?.id === 'burst_immune';
    if ((currentTaste >= 300 || currentTaste <= -300) && !isBurstImmune) {
        player.isBusted = true;
        playSound('bust');
    } else if (player.bowl.length >= 4) {
        player.isPassed = true;
    }

    // 次の手番を探す
    let nextTurnIndex = (playerIndex + 1) % updatedPlayers.length;
    let loopCount = 0;
    while (loopCount < updatedPlayers.length) {
        const nextP = updatedPlayers[nextTurnIndex];
        if (!nextP.isPassed && !nextP.isBusted && (nextP.bowl ? nextP.bowl.length < 4 : true)) {
            break;
        }
        nextTurnIndex = (nextTurnIndex + 1) % updatedPlayers.length;
        loopCount++;
    }

    const activePlayers = updatedPlayers.filter(p => !p.isPassed && !p.isBusted);
    const isGameOver = (activePlayers.length === 0 || (updatedPotStack.length === 0));

    // 次の手番用の取札を準備
    const nextScoopCount = Math.min(3, updatedPotStack.length);
    const nextScoopOptions = [];
    for (let i = 0; i < nextScoopCount; i++) {
        nextScoopOptions.push(updatedPotStack.pop());
    }

    const updateData = {
        potStack: updatedPotStack,
        players: updatedPlayers,
        currentTurnPlayerIndex: nextTurnIndex,
        currentScoopOptions: nextScoopOptions,
        hasRerolledThisTurn: false
    };

    if (isGameOver) {
        updateData.currentPhase = 3;
    }

    firebaseState.roomRef.update(updateData);
}

export function executeOnlinePass() {
    playSound('select');
    const updatedPlayers = JSON.parse(JSON.stringify(gameState.players));
    const playerIndex = gameState.currentTurnPlayerIndex;
    updatedPlayers[playerIndex].isPassed = true;

    let nextTurnIndex = (playerIndex + 1) % updatedPlayers.length;
    let loopCount = 0;
    while (loopCount < updatedPlayers.length) {
        const nextP = updatedPlayers[nextTurnIndex];
        if (!nextP.isPassed && !nextP.isBusted && (nextP.bowl ? nextP.bowl.length < 4 : true)) {
            break;
        }
        nextTurnIndex = (nextTurnIndex + 1) % updatedPlayers.length;
        loopCount++;
    }

    const activePlayers = updatedPlayers.filter(p => !p.isPassed && !p.isBusted);
    const isGameOver = (activePlayers.length === 0 || gameState.potStack.length === 0);

    const updateData = {
        players: updatedPlayers,
        currentTurnPlayerIndex: nextTurnIndex
    };

    if (isGameOver) {
        updateData.currentPhase = 3;
    }

    firebaseState.roomRef.update(updateData);
}

