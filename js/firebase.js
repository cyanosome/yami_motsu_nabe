import { showToast, showLobbyUI } from './ui.js';
import { listenLobbyChanges } from './app.js';

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
