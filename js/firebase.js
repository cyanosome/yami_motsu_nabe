import { 
    showToast, 
    showLobbyUI, 
    updatePhaseStepper, 
    renderOnlineDraftPhase, 
    renderOnlinePotPhase, 
    initPhase3Results 
} from './ui.js';
import { playSound } from './sound.js';
import { gameState, getRandomIngredients } from './gameLogic.js';

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
        // ロビー中に閉じたら退室処理
        firebaseState.roomRef.child('players/' + myPlayerId).remove();
        firebaseState.roomRef.off();
        firebaseState.roomRef = null;
    }
    document.getElementById('online-modal').classList.remove('active');
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
}

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
            // 参加者リストの更新
            const playersObj = roomData.players || {};
            const playersArr = Object.values(playersObj).sort((a, b) => a.joinedAt - b.joinedAt);

            document.getElementById('lobby-player-count').innerText = playersArr.length;
            const listEl = document.getElementById('lobby-players-list');
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
        } else if (roomData.status === 'playing') {
            // ホストがゲームを開始した！
            document.getElementById('online-modal').classList.remove('active');
            setupOnlineGameClient(roomData);
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

        // 初期対戦プレイヤー配列の構築
        const initialPlayers = playersArr.map((p, idx) => ({
            id: idx,
            uid: p.id,
            name: p.name,
            isCpu: false,
            bowl: [],
            isPassed: false,
            isBusted: false
        }));

        // Phase 1 ドラフト用オプションの事前生成 (全プレイヤー分、インスタンス化済みカード配列)
        const draftOptionsPerPlayer = {};
        initialPlayers.forEach(p => {
            draftOptionsPerPlayer[p.uid] = getRandomIngredients(6);
        });

        const gameInitData = {
            status: 'playing',
            mode: 'online',
            currentPhase: 1,
            players: initialPlayers,
            currentDraftPlayerIndex: 0,
            currentTurnPlayerIndex: 0,
            potStack: [],
            draftOptionsPerPlayer: draftOptionsPerPlayer,
            selectedDraftIds: []
        };

        firebaseState.roomRef.update(gameInitData);
    });
}

/* --- オンラインゲームリアルタイム同期 --- */
export function setupOnlineGameClient(roomData) {
    gameState.mode = 'online';
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('phase-stepper-bar').classList.add('active');

    if (isOnlineSetupDone) return;
    isOnlineSetupDone = true;

    // ゲーム進行状態のリアルタイムリスナー
    firebaseState.roomRef.on('value', snapshot => {
        const data = snapshot.val();
        if (!data || data.status !== 'playing') return;
        syncOnlineStateToLocal(data);
    });
}

export function syncOnlineStateToLocal(data) {
    gameState.currentPhase = data.currentPhase;
    gameState.players = data.players || [];
    gameState.currentDraftPlayerIndex = data.currentDraftPlayerIndex || 0;
    gameState.currentTurnPlayerIndex = data.currentTurnPlayerIndex || 0;
    gameState.potStack = data.potStack || [];
    gameState.currentScoopOptions = data.currentScoopOptions || [];
    gameState.hasRerolledThisTurn = data.hasRerolledThisTurn || false;

    updatePhaseStepper(data.currentPhase);

    // PhaseごとのUI画面切り替えと描画
    if (data.currentPhase === 1) {
        document.querySelectorAll('.phase-container').forEach(el => el.classList.remove('active'));
        document.getElementById('phase-1-view').classList.add('active');
        renderOnlineDraftPhase(data);
    } else if (data.currentPhase === 2) {
        document.querySelectorAll('.phase-container').forEach(el => el.classList.remove('active'));
        document.getElementById('phase-2-view').classList.add('active');
        renderOnlinePotPhase(data);
    } else if (data.currentPhase === 3) {
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
    if (currentTaste >= 3 || currentTaste <= -3) {
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

