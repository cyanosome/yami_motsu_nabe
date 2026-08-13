        /* --- 具材マスターデータ --- */
        const INGREDIENTS_DATABASE = [
            // もつ系
            { id: 'motsu_premium', name: '極上牛もつ', category: 'motsu', score: 6, taste: 0, icon: '🥩', allowedSizes: ['large'], desc: 'ぷりぷりの脂がのった高級もつ。高得点！' },
            { id: 'motsu_normal', name: '国産牛もつ', category: 'motsu', score: 4, taste: 0, icon: '🥓', allowedSizes: ['small', 'mid', 'large'], desc: '定番のうまみ豊かな牛もつ。' },
            { id: 'motsu_mince', name: 'もつダンゴ', category: 'motsu', score: 3, taste: 0, icon: '🧆', allowedSizes: ['small', 'mid'], desc: '出汁がよく染み込む絶品つくね。' },
            { id: 'motsu_suburi', name: '特選ハツ・センマイ', category: 'motsu', score: 4, taste: 0, icon: '🍖', allowedSizes: ['mid', 'large'], desc: 'コリコリ食感がたまらない部位。' },
            
            // 野菜系
            { id: 'vege_cabbage', name: 'シャキシャキキャベツ', category: 'vege', score: 2, taste: 0, icon: '🥬', allowedSizes: ['small'], desc: '甘みがあってスープとよく合う。' },
            { id: 'vege_nira', name: 'シャキッとニラ', category: 'vege', score: 2, taste: 0, icon: '🌱', allowedSizes: ['small', 'mid'], desc: 'もつ鍋には欠かせないスタミナ野菜。' },
            { id: 'vege_tofu', name: '絹ごし豆腐', category: 'vege', score: 3, taste: 0, icon: '🧊', allowedSizes: ['mid', 'large'], desc: 'アツアツの味が染みた豆腐。' },
            { id: 'vege_garlic', name: 'にんにくスライス', category: 'vege', score: 2, taste: 0, icon: '🧄', allowedSizes: ['small', 'mid'], desc: 'もつの旨味を爆発させる！' },
            { id: 'vege_gobou', name: 'ささがきゴボウ', category: 'vege', score: 3, taste: 0, icon: '🪵', allowedSizes: ['small', 'mid'], desc: '香りと食感のアクセント。' },

            // スパイス / 特殊
            { id: 'spice_chili', name: '鷹の爪唐辛子', category: 'spice', score: 1, taste: 1, icon: '🌶️', allowedSizes: ['small', 'mid', 'large'], desc: 'ピリッと引き締める。辛さ+1。' },
            { id: 'spice_dashi', name: '秘伝の特製出汁', category: 'spice', score: 4, taste: 0, icon: '🍶', allowedSizes: ['mid', 'large'], desc: '全体の旨味を大幅アップ。' },
            { id: 'spice_ramen', name: '〆のちゃんぽん麺', category: 'spice', score: 5, taste: 0, icon: '🍜', allowedSizes: ['mid', 'large'], desc: '最後の満足度を加速させる麺。' },
            { id: 'spice_yuzu', name: '爽やか柚子胡椒', category: 'spice', score: 3, taste: 1, icon: '🍋', allowedSizes: ['small', 'mid'], desc: '風味豊かな高級薬味。辛さ+1。' },

            // お菓子系 (辛さを相殺する甘み属性)
            { id: 'sweets_candy', name: 'カラフルキャンディ', category: 'sweets', score: 2, taste: -1, icon: '🍬', allowedSizes: ['small', 'mid'], desc: '甘くて可愛いお菓子。辛さを和らげる！(甘さ-1)' },
            { id: 'sweets_chocolate', name: '高級チョコレート', category: 'sweets', score: 4, taste: -1, icon: '🍫', allowedSizes: ['small', 'mid', 'large'], desc: '濃厚な甘み。スープの辛味を相殺！(甘さ-1)' },
            { id: 'sweets_donut', name: '濃厚ドーナツ', category: 'sweets', score: 3, taste: -2, icon: '🍩', allowedSizes: ['mid', 'large'], desc: '甘さたっぷり！味覚を一気に甘くする。(甘さ-2)' },

            // 闇具材（トラップ / バースト要素）
            { id: 'yami_pepper', name: 'デスソースペッパー', category: 'yami', score: -2, taste: 2, icon: '🔥', allowedSizes: ['small', 'mid', 'large'], desc: '超危険！一気に辛さ+2。' },
            { id: 'yami_tawashi', name: '謎のたわし', category: 'yami', score: -6, taste: 0, icon: '🧽', allowedSizes: ['large'], desc: '食べられない！大幅マイナス点。' },
            { id: 'yami_slime', name: '紫色物体X', category: 'yami', score: -4, taste: 1, icon: '👾', allowedSizes: ['mid', 'large'], desc: '闇鍋の象徴。怪しいエキスが溢れ出る。' },
            { id: 'yami_wasabi', name: '大量の生ワサビ', category: 'yami', score: -1, taste: 2, icon: '🟢', allowedSizes: ['small', 'mid'], desc: '鼻に抜ける痛烈なツーン！辛さ+2。' },
            { id: 'yami_habanero', name: '魔界ハバネロ', category: 'yami', score: -3, taste: 3, icon: '💀', allowedSizes: ['mid', 'large'], desc: '一発即死レベルの超極悪唐辛子！(辛さ+3)' },
            { id: 'yami_syrup', name: '大量の角砂糖シロップ', category: 'yami', score: -3, taste: -3, icon: '🍯', allowedSizes: ['mid', 'large'], desc: '超危険！一発即死レベルの激甘トラップ！(甘さ-3)' }
        ];

        /* --- 食材カードインスタンス生成 (サイズ補正適用) --- */
        function createIngredientInstance(baseItem, forceSize = null) {
            const allowed = baseItem.allowedSizes || ['mid'];
            const chosenSize = forceSize || allowed[Math.floor(Math.random() * allowed.length)];
            
            let score = baseItem.score;
            let taste = baseItem.taste || 0;
            let sizeLabel = '';
            let sizeBadgeText = '中';
            let sizeBadgeClass = 'size-mid';

            if (chosenSize === 'small') {
                score = (baseItem.score >= 0) 
                    ? Math.max(1, Math.floor(baseItem.score * 0.6))
                    : Math.min(-1, Math.ceil(baseItem.score * 0.6));
                sizeLabel = ' (小)';
                sizeBadgeText = '小';
                sizeBadgeClass = 'size-small';
            } else if (chosenSize === 'large') {
                score = (baseItem.score >= 0)
                    ? Math.ceil(baseItem.score * 1.5)
                    : Math.floor(baseItem.score * 1.5);
                if (taste > 0) taste += 1; // 大盛は辛さ増加
                if (taste < 0) taste -= 1; // 大盛は甘さ増加
                sizeLabel = ' (大盛)';
                sizeBadgeText = '大';
                sizeBadgeClass = 'size-large';
            }

            const uniqueId = `${baseItem.id}_${chosenSize}_${Math.random().toString(36).substring(2, 7)}`;

            return {
                ...baseItem,
                id: uniqueId,
                baseId: baseItem.id,
                size: chosenSize,
                sizeBadgeText: sizeBadgeText,
                sizeBadgeClass: sizeBadgeClass,
                name: baseItem.name + sizeLabel,
                rawName: baseItem.name,
                score: score,
                taste: taste,
                spice: taste // 後方互換維持
            };
        }

        /* --- Firebase Realtime Database 初期化 --- */
        const firebaseConfig = {
            databaseURL: "https://yami-motsu-nabe-default-rtdb.firebaseio.com/"
        };
        firebase.initializeApp(firebaseConfig);
        const db = firebase.database();

        /* --- プレイヤーセッション設定 --- */
        function getMyPlayerId() {
            let pid = sessionStorage.getItem('yami_motsu_pid');
            if (!pid) {
                pid = 'p_' + Math.random().toString(36).substring(2, 9);
                sessionStorage.setItem('yami_motsu_pid', pid);
            }
            return pid;
        }

        const myPlayerId = getMyPlayerId();
        let currentRoomId = null;
        let isHost = false;
        let roomRef = null;

        /* --- ゲーム状態構造 --- */
        let gameState = {
            mode: 'vs-cpu', // 'vs-cpu' | 'hotseat' | 'online'
            soundEnabled: true,
            currentPhase: 1,
            players: [],
            currentDraftPlayerIndex: 0,
            currentTurnPlayerIndex: 0,
            potStack: [],
            selectedDraftIds: []
        };

        /* --- オンラインモーダル / ロビー制御 --- */
        function openOnlineModal() {
            document.getElementById('online-modal').classList.add('active');
            document.getElementById('modal-step-menu').style.display = 'block';
            document.getElementById('modal-step-lobby').style.display = 'none';

            let savedName = localStorage.getItem('yami_motsu_name') || `プレイヤー_${Math.floor(100 + Math.random() * 900)}`;
            document.getElementById('input-player-name').value = savedName;
        }

        function closeOnlineModal() {
            if (roomRef) {
                // ロビー中に閉じたら退室処理
                roomRef.child('players/' + myPlayerId).remove();
                roomRef.off();
                roomRef = null;
            }
            document.getElementById('online-modal').classList.remove('active');
        }

        function getEnteredPlayerName() {
            const nameInput = document.getElementById('input-player-name').value.trim();
            const name = nameInput || `プレイヤー_${Math.floor(100 + Math.random() * 900)}`;
            localStorage.setItem('yami_motsu_name', name);
            return name;
        }

        function createOnlineRoom() {
            const playerName = getEnteredPlayerName();
            const roomId = Math.floor(1000 + Math.random() * 9000).toString();
            currentRoomId = roomId;
            isHost = true;

            roomRef = db.ref('rooms/' + roomId);
            
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

            roomRef.set(initialRoomData).then(() => {
                // 切断時に自動削除
                roomRef.child('players/' + myPlayerId).onDisconnect().remove();
                showLobbyUI(roomId);
                listenLobbyChanges();
            }).catch(err => {
                showToast("部屋の作成に失敗しました: " + err.message);
            });
        }

        function joinOnlineRoom() {
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

                currentRoomId = codeInput;
                isHost = false;
                roomRef = targetRoomRef;

                // プレイヤー追加
                roomRef.child('players/' + myPlayerId).set({
                    id: myPlayerId,
                    name: playerName,
                    isHost: false,
                    joinedAt: Date.now()
                }).then(() => {
                    roomRef.child('players/' + myPlayerId).onDisconnect().remove();
                    showLobbyUI(currentRoomId);
                    listenLobbyChanges();
                });
            });
        }

        function showLobbyUI(roomId) {
            document.getElementById('modal-step-menu').style.display = 'none';
            document.getElementById('modal-step-lobby').style.display = 'block';
            document.getElementById('lobby-room-code').innerText = roomId;

            if (isHost) {
                document.getElementById('lobby-host-controls').style.display = 'block';
                document.getElementById('lobby-guest-notice').style.display = 'none';
            } else {
                document.getElementById('lobby-host-controls').style.display = 'none';
                document.getElementById('lobby-guest-notice').style.display = 'block';
            }
        }

        function listenLobbyChanges() {
            if (!roomRef) return;

            roomRef.on('value', snapshot => {
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

        function startOnlineGameHost() {
            if (!roomRef || !isHost) return;

            roomRef.once('value').then(snapshot => {
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

                roomRef.update(gameInitData);
            });
        }

        /* --- オンラインゲームリアルタイム同期 --- */
        let isOnlineSetupDone = false;

        function setupOnlineGameClient(roomData) {
            gameState.mode = 'online';
            document.getElementById('start-screen').style.display = 'none';
            document.getElementById('phase-stepper-bar').classList.add('active');

            if (isOnlineSetupDone) return;
            isOnlineSetupDone = true;

            // ゲーム進行状態のリアルタイムリスナー
            roomRef.on('value', snapshot => {
                const data = snapshot.val();
                if (!data || data.status !== 'playing') return;
                syncOnlineStateToLocal(data);
            });
        }

        function syncOnlineStateToLocal(data) {
            gameState.currentPhase = data.currentPhase;
            gameState.players = data.players || [];
            gameState.currentDraftPlayerIndex = data.currentDraftPlayerIndex || 0;
            gameState.currentTurnPlayerIndex = data.currentTurnPlayerIndex || 0;
            gameState.potStack = data.potStack || [];

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

        function renderOnlineDraftPhase(data) {
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
                currentDraftOptions = rawOptions.map(item => {
                    if (typeof item === 'string') {
                        const base = INGREDIENTS_DATABASE.find(x => x.id === item);
                        return base ? createIngredientInstance(base) : null;
                    }
                    return item;
                }).filter(Boolean);
                
                // 初回または手番変更時にカードを描画
                if (!grid.querySelector('.card-item') || gameState.renderedPlayerUid !== curPlayer.uid) {
                    gameState.renderedPlayerUid = curPlayer.uid;
                    renderDraftGrid(currentDraftOptions);
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

        function renderOnlinePotPhase(data) {
            renderPotUI();

            const curPlayer = data.players[data.currentTurnPlayerIndex];
            const btnDraw = document.getElementById('btn-draw');
            const btnPass = document.getElementById('btn-pass');

            if (curPlayer && curPlayer.uid === myPlayerId && !curPlayer.isPassed && !curPlayer.isBusted && curPlayer.bowl.length < 4) {
                btnDraw.disabled = false;
                btnPass.disabled = false;
            } else {
                btnDraw.disabled = true;
                btnPass.disabled = true;
            }
        }

        /* --- 効果音 (Web Audio API) --- */
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        let audioCtx = null;

        function playSound(type) {
            if (!gameState.soundEnabled) return;
            try {
                if (!audioCtx) audioCtx = new AudioCtx();
                if (audioCtx.state === 'suspended') audioCtx.resume();

                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);

                const now = audioCtx.currentTime;

                if (type === 'select') {
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(440, now);
                    osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
                    gain.gain.setValueAtTime(0.15, now);
                    gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
                    osc.start(now);
                    osc.stop(now + 0.1);
                } else if (type === 'add') {
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(300, now);
                    osc.frequency.exponentialRampToValueAtTime(150, now + 0.2);
                    gain.gain.setValueAtTime(0.3, now);
                    gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
                    osc.start(now);
                    osc.stop(now + 0.2);
                } else if (type === 'draw') {
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(523.25, now);
                    osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15);
                    gain.gain.setValueAtTime(0.2, now);
                    gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
                    osc.start(now);
                    osc.stop(now + 0.15);
                } else if (type === 'bust') {
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(180, now);
                    osc.frequency.linearRampToValueAtTime(60, now + 0.4);
                    gain.gain.setValueAtTime(0.4, now);
                    gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
                    osc.start(now);
                    osc.stop(now + 0.4);
                } else if (type === 'win') {
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(523.25, now);
                    osc.frequency.setValueAtTime(659.25, now + 0.12);
                    osc.frequency.setValueAtTime(783.99, now + 0.24);
                    osc.frequency.setValueAtTime(1046.50, now + 0.36);
                    gain.gain.setValueAtTime(0.2, now);
                    gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
                    osc.start(now);
                    osc.stop(now + 0.5);
                }
            } catch (e) {
                console.log("Audio error", e);
            }
        }

        function toggleSound() {
            gameState.soundEnabled = !gameState.soundEnabled;
            document.getElementById('sound-btn').innerText = gameState.soundEnabled ? '🔊 効果音: ON' : '🔇 効果音: OFF';
        }

        function showToast(msg) {
            const toast = document.getElementById('toast');
            toast.innerText = msg;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2500);
        }

        /* --- ゲーム初期化 --- */
        function startGame(mode) {
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

        function resetToStart() {
            if (roomRef) {
                roomRef.off();
                roomRef = null;
            }
            isOnlineSetupDone = false;
            currentRoomId = null;
            document.getElementById('start-screen').style.display = 'block';
            document.getElementById('phase-stepper-bar').classList.remove('active');
            document.querySelectorAll('.phase-container').forEach(el => el.classList.remove('active'));
            updatePhaseStepper(1);
        }

        function switchPhase(phaseNum) {
            gameState.currentPhase = phaseNum;
            updatePhaseStepper(phaseNum);

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

        function updatePhaseStepper(currentStep) {
            for (let i = 1; i <= 3; i++) {
                const el = document.getElementById(`step-${i}`);
                el.classList.remove('active', 'completed');
                if (i < currentStep) el.classList.add('completed');
                if (i === currentStep) el.classList.add('active');
            }
        }

        /* --- PHASE 1: 具材ドラフト logic --- */
        let currentDraftOptions = [];

        function initPhase1Draft() {
            const player = gameState.players[gameState.currentDraftPlayerIndex];
            document.getElementById('p1-player-title').innerText = `${player.name} の手番：鍋に入れる具材選択`;
            gameState.selectedDraftIds = [];
            updateDraftButtonState();

            if (player.isCpu) {
                setTimeout(() => handleCpuDraft(player), 800);
            } else {
                currentDraftOptions = getRandomIngredients(6);
                renderDraftGrid(currentDraftOptions);
            }
        }

        function getRandomIngredients(count) {
            const shuffled = [...INGREDIENTS_DATABASE].sort(() => 0.5 - Math.random());
            const selectedBases = shuffled.slice(0, count);
            return selectedBases.map(base => createIngredientInstance(base));
        }

        function renderDraftGrid(options) {
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
                    <div class="card-icon">${item.icon}</div>
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

        function changeCardSize(e, itemId, newSize) {
            if (e) e.stopPropagation();
            playSound('select');

            const itemIdx = currentDraftOptions.findIndex(x => x.id === itemId);
            if (itemIdx < 0) return;

            const item = currentDraftOptions[itemIdx];
            const base = INGREDIENTS_DATABASE.find(b => b.id === (item.baseId || item.id.split('_')[0]));
            if (!base) return;

            // 許可されたサイズでなければ何もしない
            if (base.allowedSizes && !base.allowedSizes.includes(newSize)) return;

            const newInstance = createIngredientInstance(base, newSize);
            newInstance.id = item.id; // 一貫性保持

            currentDraftOptions[itemIdx] = newInstance;

            // カード要素の再描画
            const cardEl = document.getElementById(`card-${itemId}`);
            if (cardEl) {
                const nameEl = cardEl.querySelector('.card-name');
                const ptsEl = cardEl.querySelector('.card-pts');
                if (nameEl) nameEl.innerText = newInstance.name;
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

        function toggleCardSelection(itemId) {
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

        function updateDraftButtonState() {
            const btn = document.getElementById('btn-add-pot');
            const count = gameState.selectedDraftIds.length;
            btn.innerText = `鍋に投入する (選んだ数: ${count}/3)`;
            btn.disabled = (count !== 3);
        }

        function submitDraftChoice() {
            playSound('add');

            // 選択されたインスタンスカードを取得
            const selectedCards = currentDraftOptions.filter(x => gameState.selectedDraftIds.includes(x.id));

            if (gameState.mode === 'online') {
                if (!roomRef) return;
                
                const curPlayer = gameState.players[gameState.currentDraftPlayerIndex];
                if (curPlayer.uid !== myPlayerId) return;

                const updatedPotStack = [...(gameState.potStack || []), ...selectedCards];
                const nextDraftIndex = gameState.currentDraftPlayerIndex + 1;

                if (nextDraftIndex < gameState.players.length) {
                    roomRef.update({
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

                    roomRef.update({
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
                addDefaultPotBase();
                setTimeout(() => switchPhase(2), 1000);
            }
        }

        function handleCpuDraft(cpuPlayer) {
            const options = getRandomIngredients(6);
            options.sort((a, b) => b.score - a.score);
            const chosen = [options[0], options[1], options[options.length - 1]];

            chosen.forEach(card => {
                gameState.potStack.push(card);
            });

            showToast(`${cpuPlayer.name} が具材3枚を鍋に投入しました！`);

            gameState.currentDraftPlayerIndex++;
            if (gameState.currentDraftPlayerIndex < gameState.players.length) {
                initPhase1Draft();
            } else {
                addDefaultPotBase();
                setTimeout(() => switchPhase(2), 1000);
            }
        }

        function addDefaultPotBase() {
            const baseItems = ['motsu_normal', 'motsu_premium', 'vege_cabbage', 'vege_nira', 'vege_tofu', 'spice_chili', 'spice_dashi', 'yami_pepper'];
            baseItems.forEach(id => {
                const item = INGREDIENTS_DATABASE.find(x => x.id === id);
                if (item) gameState.potStack.push(createIngredientInstance(item));
            });
            gameState.potStack.sort(() => 0.5 - Math.random());
        }

        /* --- PHASE 2: 鍋漁りチキンレース logic --- */
        function logPhase2Debug(actionName) {
            const curPlayer = gameState.players[gameState.currentTurnPlayerIndex];
            const pot = gameState.potStack || [];
            const scoops = Object.values(gameState.currentScoopOptions || {});

            console.group(`[Phase2 Debug] ${actionName}`);
            console.log("🎮 手番プレイヤー:", curPlayer ? `${curPlayer.name} (ID: ${curPlayer.id})` : "なし");
            console.log("🍲 鍋の残り山札(potStack)枚数:", pot.length);
            console.log("🍲 山札の中身 (Top 5):", pot.slice(-5).map(c => c.name || c.id));
            console.log("🥄 現在提示中の取札(currentScoopOptions)枚数:", scoops.length);
            console.log("🥄 取札の中身:", scoops.map(c => c.name || c.id));
            console.log("🔄 リロール使用済みか:", !!gameState.hasRerolledThisTurn);
            console.groupEnd();
        }

        function initPhase2Pot() {
            gameState.currentTurnPlayerIndex = 0;
            gameState.hasRerolledThisTurn = false;
            gameState.currentScoopOptions = [];
            prepareScoopForCurrentTurn();
            renderPotUI();
            logPhase2Debug("Phase 2 初期化完了");
            addGameLog('鍋がグツグツと煮立ちました！影絵の取札から具材を選んでください。', true);
            checkTurnStep();
        }

        function prepareScoopForCurrentTurn() {
            if (!gameState.potStack || gameState.potStack.length === 0) {
                gameState.currentScoopOptions = [];
                logPhase2Debug("取札準備: 鍋が空のため取札なし");
                return;
            }

            // 取札がすでにあれば何もしない
            if (gameState.currentScoopOptions && Object.keys(gameState.currentScoopOptions).length > 0) return;

            // 鍋から最大3枚を掬い上げる
            const scoopCount = Math.min(3, gameState.potStack.length);
            gameState.currentScoopOptions = [];
            for (let i = 0; i < scoopCount; i++) {
                gameState.currentScoopOptions.push(gameState.potStack.pop());
            }
            logPhase2Debug(`取札準備完了: 鍋から${scoopCount}枚掬いました`);
        }

        function renderPotUI() {
            document.getElementById('pot-count').innerText = (gameState.potStack ? gameState.potStack.length : 0);

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
                    if (totalTaste >= 3) statusTag = '<span class="bowl-status-tag status-bust">🔥激辛バースト</span>';
                    else if (totalTaste <= -3) statusTag = '<span class="bowl-status-tag status-bust" style="background:#e84393;">🍬激甘バースト</span>';
                    else statusTag = '<span class="bowl-status-tag status-bust">💥バースト</span>';
                }

                let slotsHtml = '';
                for (let s = 0; s < 4; s++) {
                    const item = pBowl[s];
                    if (item) {
                        const szText = item.sizeBadgeText ? `[${item.sizeBadgeText}]` : '';
                        slotsHtml += `
                            <div class="item-slot filled" title="${item.name}: ${item.desc}">
                                <span>${item.icon}</span>
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

        function renderScoopCards() {
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
                card.innerHTML = `
                    <div style="font-size:0.75rem; color:var(--accent-gold); font-weight:bold;">取札 #${idx+1}</div>
                    <div class="silhouette-icon">${item.icon}</div>
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

        function updateRerollButtonState() {
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

        function reshuffleScoop() {
            const curPlayer = gameState.players[gameState.currentTurnPlayerIndex];
            if (pIsUnavailable(curPlayer)) return;

            if (gameState.hasRerolledThisTurn) {
                showToast("1ターンにリロールできるのは1回までです");
                return;
            }

            if (gameState.mode === 'online') {
                if (!roomRef || curPlayer.uid !== myPlayerId) return;
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

        function selectScoopedItem(scoopIndex) {
            const curPlayer = gameState.players[gameState.currentTurnPlayerIndex];
            if (pIsUnavailable(curPlayer)) return;

            if (gameState.mode === 'online') {
                if (!roomRef || curPlayer.uid !== myPlayerId) return;
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

        function addGameLog(msg, isHighlight = false, isBust = false) {
            const logBox = document.getElementById('game-log');
            const item = document.createElement('div');
            item.className = `log-msg ${isHighlight ? 'highlight' : ''} ${isBust ? 'bust' : ''}`;
            item.innerText = msg;
            logBox.appendChild(item);
            logBox.scrollTop = logBox.scrollHeight;
        }

        function checkTurnStep() {
            if (gameState.mode === 'online') return; // オンライン時はFirebaseリスナーが描画

            const activePlayers = gameState.players.filter(p => !p.isPassed && !p.isBusted);
            if (activePlayers.length === 0 || (gameState.potStack.length === 0 && (!gameState.currentScoopOptions || Object.keys(gameState.currentScoopOptions).length === 0))) {
                addGameLog('全員の行動が終了したか、鍋が空になりました！点数集計へ進みます。', true);
                setTimeout(() => switchPhase(3), 1500);
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

        function advanceTurn() {
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

        function handleCpuTurn(cpu) {
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

        /* --- オンライン用 取札＆リロール同期 --- */
        function executeOnlineReroll() {
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

            roomRef.update({
                potStack: updatedPotStack,
                currentScoopOptions: newScoopOptions,
                hasRerolledThisTurn: true
            });
        }

        function executeOnlineScoopSelect(scoopIndex) {
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

            roomRef.update(updateData);
        }

        function executeOnlinePass() {
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

            roomRef.update(updateData);
        }

        function executeDraw(player) {
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

        function handleCpuTurn(cpu) {
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

        /* --- PHASE 3: 結果発表 / 集計 logic --- */
        function initPhase3Results() {
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

                const bowlIcons = p.bowl.map(b => b.icon).join(' ');

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

        function calculateFinalScores() {
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
