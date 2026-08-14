/**
 * devColorMatrix.js - 開発者モード用 2D色彩空間マトリクス & 鍋中身インスペクター
 * 
 * URL（/dev, ?dev, #dev）で起動可能。
 * 現在の鍋（山札＋取札）の OKLab 補間平面上のプロット位置と、
 * 鍋に残っている具材の全カード内訳をリアルタイムに可視化する。
 */

import { 
    DIAMOND_COLORS,
    DEFAULT_DIAMOND_COLORS,
    setDiamondColor,
    resetDiamondColors,
    AVG_SCORE_MIN, 
    AVG_SCORE_MAX, 
    AVG_TASTE_MIN, 
    AVG_TASTE_MAX, 
    interpolateSoupColor,
    updateSoupColor,
    updateSoupColorFromGameState
} from './pot3d.js';
import { getIngredientIconHtml } from './ui.js';

let isDevMode = false;
let isPanelOpen = true;
let isPanelMinimized = false;
let matrixBgCanvas = null; // 背景グラデーションのキャッシュ用

// 手動調整（ドラッグ操作）用ステート
let isDragging = false;
let isManualOverride = false;
let currentNx = 0.0;
let currentNy = 0.0;

/**
 * URL判定（/dev, ?dev, #dev で開発者モードをONにする）
 */
export function checkDevMode() {
    const path = window.location.pathname.toLowerCase();
    const search = window.location.search.toLowerCase();
    const hash = window.location.hash.toLowerCase();

    return path.endsWith('/dev') || path.endsWith('/dev/') || 
           search.includes('dev') || hash.includes('dev');
}

/**
 * 開発者モードの初期化（URL条件合致時のみDOMを注入）
 */
export function initDevColorMatrix() {
    isDevMode = checkDevMode();
    if (!isDevMode) return;

    console.log('[DevMode] 🛠️ 開発者モードが有効化されました (URL: /dev または ?dev/#dev)');

    // 既存の要素があれば削除
    const existing = document.getElementById('dev-inspector-root');
    if (existing) existing.remove();

    // ルートコンテナ作成
    const root = document.createElement('div');
    root.id = 'dev-inspector-root';
    root.innerHTML = `
        <!-- フローティングトグルボタン -->
        <button id="dev-toggle-btn" class="dev-toggle-btn" onclick="window.toggleDevPanel()" title="開発者パネルの開閉">
            🛠️ DEV
        </button>

        <!-- メインデバッグパネル -->
        <div id="dev-inspector-panel" class="dev-inspector-panel">
            <div class="dev-panel-header">
                <div class="dev-panel-title">
                    <span class="dev-pulse-dot"></span> 🛠️ DEV COLOR & POT INSPECTOR
                </div>
                <div class="dev-header-actions">
                    <button class="dev-header-btn" onclick="window.minimizeDevPanel()" title="最小化">─</button>
                    <button class="dev-header-btn" onclick="window.toggleDevPanel(false)" title="閉じる">✕</button>
                </div>
            </div>

            <div class="dev-panel-body" id="dev-panel-body">
                <!-- 1. 2D 色彩空間マトリクス (ひし形OKLab) -->
                <div class="dev-section">
                    <div class="dev-section-title">
                        <span>🎨 ひし形色彩空間 (OKLab重心補間) <small style="color:var(--text-sub); font-size:0.65rem;">(ドラッグで操作)</small></span>
                        <div id="dev-manual-status" class="dev-manual-status" style="display:none;">
                            <span class="dev-manual-badge">手動操作中</span>
                            <button class="dev-reset-btn" onclick="window.resetToGameSync()" title="現在のゲーム状態の色に戻す">🔄 実データ同期</button>
                        </div>
                    </div>
                    
                    <div class="dev-matrix-wrapper">
                        <!-- 軸ラベル (4極) -->
                        <div class="dev-axis-label dev-axis-top">▲ 北: 至高・美味 (+${AVG_SCORE_MAX})</div>
                        <div class="dev-axis-label dev-axis-bottom">▼ 南: 混沌・闇鍋 (${AVG_SCORE_MIN})</div>
                        <div class="dev-axis-label dev-axis-left">◀ 西: 特濃・激甘 (${AVG_TASTE_MIN})</div>
                        <div class="dev-axis-label dev-axis-right">▶ 東: 灼熱・激辛 (+${AVG_TASTE_MAX})</div>

                        <!-- Canvas -->
                        <canvas id="devMatrixCanvas" width="220" height="220" class="dev-matrix-canvas" title="クリックまたはドラッグでスープ色を変更"></canvas>
                    </div>

                    <!-- リアルタイム数値インジケータ -->
                    <div class="dev-stats-grid">
                        <div class="dev-stat-card">
                            <div class="dev-stat-label">残り枚数 (山札+取札)</div>
                            <div class="dev-stat-val" id="dev-stat-count">0 枚</div>
                        </div>
                        <div class="dev-stat-card">
                            <div class="dev-stat-label">平均スコア (Y座標)</div>
                            <div class="dev-stat-val" id="dev-stat-score">0.0 (y: 0.00)</div>
                        </div>
                        <div class="dev-stat-card">
                            <div class="dev-stat-label">平均味覚 (X座標)</div>
                            <div class="dev-stat-val" id="dev-stat-taste">0.0 (x: 0.00)</div>
                        </div>
                        <div class="dev-stat-card">
                            <div class="dev-stat-label">算出スープ色</div>
                            <div class="dev-stat-val dev-color-preview-row">
                                <span id="dev-color-swatch" class="dev-color-swatch"></span>
                                <span id="dev-stat-hex" class="dev-stat-hex">#000000</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 2. 5点キーカラー設定 (ひし形4極 ＋ 中央出汁色) -->
                <div class="dev-section">
                    <div class="dev-section-title">
                        <span>🎯 5点キーカラー設定 (4極＋中央出汁)</span>
                        <button class="dev-reset-btn" onclick="window.resetDiamondColorsToDefault()" title="初期カラー設定に戻す">🔄 色をリセット</button>
                    </div>

                    <div class="dev-diamond-grid">
                        <!-- 北 (Top: North: 美味) -->
                        <div class="dev-diamond-row top-row">
                            <div class="dev-diamond-card">
                                <div class="dev-diamond-label">▲ 北 (至高・美味)</div>
                                <div class="dev-diamond-input-row">
                                    <input type="color" id="diamond-color-north" class="dev-diamond-color-input" value="${DIAMOND_COLORS.north}" oninput="window.onDiamondColorChange('north', this.value)">
                                    <span id="diamond-hex-north" class="dev-diamond-hex-text">${DIAMOND_COLORS.north}</span>
                                </div>
                            </div>
                        </div>

                        <!-- 中段 (West / Center / East) -->
                        <div class="dev-diamond-row mid-row">
                            <!-- 西 (West: 甘口) -->
                            <div class="dev-diamond-card">
                                <div class="dev-diamond-label">◀ 西 (特濃・激甘)</div>
                                <div class="dev-diamond-input-row">
                                    <input type="color" id="diamond-color-west" class="dev-diamond-color-input" value="${DIAMOND_COLORS.west}" oninput="window.onDiamondColorChange('west', this.value)">
                                    <span id="diamond-hex-west" class="dev-diamond-hex-text">${DIAMOND_COLORS.west}</span>
                                </div>
                            </div>

                            <!-- 中央 (Center: 出汁) -->
                            <div class="dev-diamond-card center-card">
                                <div class="dev-diamond-label">● 中央 (ベース出汁)</div>
                                <div class="dev-diamond-input-row">
                                    <input type="color" id="diamond-color-center" class="dev-diamond-color-input" value="${DIAMOND_COLORS.center}" oninput="window.onDiamondColorChange('center', this.value)">
                                    <span id="diamond-hex-center" class="dev-diamond-hex-text">${DIAMOND_COLORS.center}</span>
                                </div>
                            </div>

                            <!-- 東 (East: 辛口) -->
                            <div class="dev-diamond-card">
                                <div class="dev-diamond-label">▶ 東 (灼熱・激辛)</div>
                                <div class="dev-diamond-input-row">
                                    <input type="color" id="diamond-color-east" class="dev-diamond-color-input" value="${DIAMOND_COLORS.east}" oninput="window.onDiamondColorChange('east', this.value)">
                                    <span id="diamond-hex-east" class="dev-diamond-hex-text">${DIAMOND_COLORS.east}</span>
                                </div>
                            </div>
                        </div>

                        <!-- 南 (Bottom: South: 闇鍋) -->
                        <div class="dev-diamond-row btm-row">
                            <div class="dev-diamond-card">
                                <div class="dev-diamond-label">▼ 南 (混沌・闇鍋)</div>
                                <div class="dev-diamond-input-row">
                                    <input type="color" id="diamond-color-south" class="dev-diamond-color-input" value="${DIAMOND_COLORS.south}" oninput="window.onDiamondColorChange('south', this.value)">
                                    <span id="diamond-hex-south" class="dev-diamond-hex-text">${DIAMOND_COLORS.south}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 3. 鍋の具材インスペクター（全カード内訳） -->
                <div class="dev-section">
                    <div class="dev-section-title">
                        <span>🍲 鍋のカード内訳</span>
                        <span id="dev-cards-summary" class="dev-cards-summary">山札: 0 / 取札: 0</span>
                    </div>

                    <div class="dev-cards-box">
                        <div class="dev-cards-group-title">👇 取札 (現在掬い上げ中)</div>
                        <div id="dev-scoop-cards-list" class="dev-cards-chip-container">
                            <span class="dev-empty-text">なし</span>
                        </div>

                        <div class="dev-cards-group-title" style="margin-top: 10px;">📦 山札 (鍋底のストック)</div>
                        <div id="dev-pot-cards-list" class="dev-cards-chip-container">
                            <span class="dev-empty-text">なし</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(root);

    // 背景グラデーションのキャッシュ生成
    createMatrixBackgroundCache();

    // マウス・タッチインタラクションのイベント登録
    setupMatrixInteractions();

    // 初回描画
    if (window.gameState) {
        updateDevInspector(window.gameState);
    }
}

/**
 * 2Dマトリクスの背景グラデーション（ひし形）を事前キャッシュ生成
 */
function createMatrixBackgroundCache() {
    matrixBgCanvas = document.createElement('canvas');
    matrixBgCanvas.width = 220;
    matrixBgCanvas.height = 220;
    const ctx = matrixBgCanvas.getContext('2d');

    const w = matrixBgCanvas.width;
    const h = matrixBgCanvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = w / 2 - 8; // 余白 8px

    const imgData = ctx.createImageData(w, h);
    const data = imgData.data;

    // 2px ステップで高速レンダリング
    const step = 2;
    for (let y = 0; y < h; y += step) {
        const ny = -((y - cy) / radius); // 上が +1, 下が -1
        for (let x = 0; x < w; x += step) {
            const nx = (x - cx) / radius; // 右が +1, 左が -1

            const hex = interpolateSoupColor(nx, ny);
            
            // Hex to RGB
            const num = parseInt(hex.replace('#', ''), 16);
            const r = (num >> 16) & 255;
            const g = (num >> 8) & 255;
            const b = num & 255;

            // ひし形内側判定 (|nx| + |ny| <= 1.0)
            const isInside = (Math.abs(nx) + Math.abs(ny)) <= 1.0;
            const alpha = isInside ? 255 : 35; // ひし形外周は薄暗く減衰

            for (let dy = 0; dy < step && (y + dy) < h; dy++) {
                for (let dx = 0; dx < step && (x + dx) < w; dx++) {
                    const idx = ((y + dy) * w + (x + dx)) * 4;
                    data[idx] = r;
                    data[idx + 1] = g;
                    data[idx + 2] = b;
                    data[idx + 3] = alpha;
                }
            }
        }
    }

    ctx.putImageData(imgData, 0, 0);

    // 十字基準線（破線）
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';

    ctx.beginPath();
    ctx.moveTo(cx, cy - radius);
    ctx.lineTo(cx, cy + radius);
    ctx.moveTo(cx - radius, cy);
    ctx.lineTo(cx + radius, cy);
    ctx.stroke();

    // ひし形のアウトライン（白線）
    ctx.setLineDash([]);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.beginPath();
    ctx.moveTo(cx, cy - radius);
    ctx.lineTo(cx + radius, cy);
    ctx.lineTo(cx, cy + radius);
    ctx.lineTo(cx - radius, cy);
    ctx.closePath();
    ctx.stroke();
}

/**
 * 2Dマトリクス Canvas のマウス・タッチ操作イベントを登録
 */
function setupMatrixInteractions() {
    const canvas = document.getElementById('devMatrixCanvas');
    if (!canvas) return;

    // マウスイベント
    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        isManualOverride = true;
        handleMatrixPointer(e);
    });

    window.addEventListener('mousemove', (e) => {
        if (isDragging) {
            handleMatrixPointer(e);
        }
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // タッチイベント（モバイル対応）
    canvas.addEventListener('touchstart', (e) => {
        isDragging = true;
        isManualOverride = true;
        handleMatrixPointer(e);
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
        if (isDragging) {
            e.preventDefault(); // スクロール防止
            handleMatrixPointer(e);
        }
    }, { passive: false });

    window.addEventListener('touchend', () => {
        isDragging = false;
    });
}

/**
 * ポインターイベントから (nx, ny) を計算して手動反映
 */
function handleMatrixPointer(e) {
    const canvas = document.getElementById('devMatrixCanvas');
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;

    if (clientX === undefined || clientY === undefined) return;

    const w = rect.width;
    const h = rect.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = w / 2 - 8;

    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    // nx, ny 算出 (-1.0 〜 +1.0)
    currentNx = Math.max(-1.0, Math.min(1.0, (mouseX - cx) / radius));
    currentNy = Math.max(-1.0, Math.min(1.0, -(mouseY - cy) / radius));

    applyManualColor(currentNx, currentNy);
}

/**
 * 手動で選択された (nx, ny) を 3D 鍋、マトリクス、数値 UI に反映
 */
function applyManualColor(nx, ny) {
    const hex = interpolateSoupColor(nx, ny);

    // 1. 3D 土鍋のスープ色をリアルタイムに直接更新
    updateSoupColor(hex);

    // 2. 2D マトリクス Canvas のプロットを更新
    renderMatrixCanvas(nx, ny, hex);

    // 3. 数値インジケータを換算値で更新
    const calcScore = ny * AVG_SCORE_MAX;
    const calcTaste = nx * AVG_TASTE_MAX;

    const scoreEl = document.getElementById('dev-stat-score');
    const tasteEl = document.getElementById('dev-stat-taste');
    const hexEl = document.getElementById('dev-stat-hex');
    const swatchEl = document.getElementById('dev-color-swatch');
    const manualStatusEl = document.getElementById('dev-manual-status');

    if (scoreEl) scoreEl.innerText = `${calcScore >= 0 ? '+' : ''}${calcScore.toFixed(2)} (y: ${ny.toFixed(2)}) [手動]`;
    if (tasteEl) tasteEl.innerText = `${calcTaste >= 0 ? '+' : ''}${calcTaste.toFixed(2)} (x: ${nx.toFixed(2)}) [手動]`;
    if (hexEl) hexEl.innerText = hex;
    if (swatchEl) swatchEl.style.backgroundColor = hex;
    if (manualStatusEl) manualStatusEl.style.display = 'inline-flex';
}

/**
 * 手動操作を解除し、現在のゲーム実データの色・プロットにリセット
 */
export function resetToGameSync() {
    isManualOverride = false;
    const manualStatusEl = document.getElementById('dev-manual-status');
    if (manualStatusEl) manualStatusEl.style.display = 'none';

    if (window.gameState) {
        // ゲーム状態からスープ色を再適用
        if (typeof window.updateSoupColorFromGameState === 'function') {
            window.updateSoupColorFromGameState(window.gameState);
        }
        updateDevInspector(window.gameState);
    }
}
window.resetToGameSync = resetToGameSync;

/**
 * 5点キーカラーが変更された時のハンドラー
 * @param {string} key - 'north', 'south', 'east', 'west', 'center'
 * @param {string} hexValue - 新しいHEXカラー
 */
export function onDiamondColorChange(key, hexValue) {
    setDiamondColor(key, hexValue);
    
    const hexTextEl = document.getElementById(`diamond-hex-${key}`);
    if (hexTextEl) hexTextEl.innerText = hexValue.toUpperCase();

    // 背景グラデーションキャッシュを再生成
    createMatrixBackgroundCache();

    // 3D 鍋と 2D マトリクスを描画更新
    if (isManualOverride) {
        applyManualColor(currentNx, currentNy);
    } else {
        if (window.gameState) {
            updateSoupColorFromGameState(window.gameState);
            updateDevInspector(window.gameState);
        }
    }
}
window.onDiamondColorChange = onDiamondColorChange;

/**
 * 5点キーカラーをデフォルト値にリセット
 */
export function resetDiamondColorsToDefault() {
    resetDiamondColors();

    // 各 input と hex ラベルを更新
    ['north', 'south', 'east', 'west', 'center'].forEach(key => {
        const inputEl = document.getElementById(`diamond-color-${key}`);
        const hexTextEl = document.getElementById(`diamond-hex-${key}`);
        const defaultHex = DEFAULT_DIAMOND_COLORS[key];
        if (inputEl) inputEl.value = defaultHex;
        if (hexTextEl) hexTextEl.innerText = defaultHex;
    });

    // 背景グラデーションキャッシュを再生成
    createMatrixBackgroundCache();

    // 3D 鍋と 2D マトリクスを描画更新
    if (isManualOverride) {
        applyManualColor(currentNx, currentNy);
    } else {
        if (window.gameState) {
            updateSoupColorFromGameState(window.gameState);
            updateDevInspector(window.gameState);
        }
    }
}
window.resetDiamondColorsToDefault = resetDiamondColorsToDefault;

/**
 * 開発者パネル全体のリアルタイム更新（マトリクス・数値・カード一覧）
 * @param {object} gameState 
 */
export function updateDevInspector(gameState) {
    if (!isDevMode) return;
    const panel = document.getElementById('dev-inspector-panel');
    if (!panel) return;

    // カード集約
    const potCards = gameState.potStack || [];
    const scoopCards = Object.values(gameState.currentScoopOptions || {});
    const allPotCards = [...potCards, ...scoopCards];
    const totalCount = allPotCards.length;

    // 残り枚数表示は常に更新
    const countEl = document.getElementById('dev-stat-count');
    if (countEl) countEl.innerText = `${totalCount} 枚 (山:${potCards.length}/取:${scoopCards.length})`;

    // カード内訳更新
    renderCardChipsList(potCards, scoopCards);

    // 手動操作中の場合は、ゲーム側の色でプロット・数値を上書きしない
    if (isManualOverride) return;

    let avgScore = 0;
    let avgTaste = 0;
    let nx = 0.0;
    let ny = 0.0;
    let hex = '#000000';

    if (totalCount > 0) {
        const totalScore = allPotCards.reduce((acc, cur) => acc + (cur.score || 0), 0);
        const totalTaste = allPotCards.reduce((acc, cur) => acc + (cur.taste !== undefined ? cur.taste : (cur.spice || 0)), 0);

        avgScore = totalScore / totalCount;
        avgTaste = totalTaste / totalCount;

        ny = Math.max(-1.0, Math.min(1.0, avgScore / AVG_SCORE_MAX));
        nx = Math.max(-1.0, Math.min(1.0, avgTaste / AVG_TASTE_MAX));

        hex = interpolateSoupColor(nx, ny);
    } else {
        hex = interpolateSoupColor(0.0, 0.0);
    }

    currentNx = nx;
    currentNy = ny;

    // 1. 2Dマトリクス Canvas 再描画
    renderMatrixCanvas(nx, ny, hex);

    // 2. 数値インジケータ更新
    const scoreEl = document.getElementById('dev-stat-score');
    const tasteEl = document.getElementById('dev-stat-taste');
    const hexEl = document.getElementById('dev-stat-hex');
    const swatchEl = document.getElementById('dev-color-swatch');

    if (scoreEl) scoreEl.innerText = `${avgScore >= 0 ? '+' : ''}${avgScore.toFixed(2)} (y: ${ny.toFixed(2)})`;
    if (tasteEl) tasteEl.innerText = `${avgTaste >= 0 ? '+' : ''}${avgTaste.toFixed(2)} (x: ${nx.toFixed(2)})`;
    if (hexEl) hexEl.innerText = hex;
    if (swatchEl) swatchEl.style.backgroundColor = hex;
}

/**
 * 2D Canvas にターゲットプロットを描画
 */
function renderMatrixCanvas(nx, ny, currentHex) {
    const canvas = document.getElementById('devMatrixCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = w / 2 - 8;

    // 背景キャッシュを描画
    if (matrixBgCanvas) {
        ctx.drawImage(matrixBgCanvas, 0, 0);
    } else {
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, w, h);
    }

    // ターゲット座標
    const targetX = cx + nx * radius;
    const targetY = cy - ny * radius;

    // 外側リング (白・発光)
    ctx.beginPath();
    ctx.arc(targetX, targetY, 9, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 4;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 内側カラー円
    ctx.beginPath();
    ctx.arc(targetX, targetY, 5, 0, Math.PI * 2);
    ctx.fillStyle = currentHex;
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.stroke();
}

/**
 * 山札と取札のカードチップ一覧をレンダリング
 */
function renderCardChipsList(potCards, scoopCards) {
    const summaryEl = document.getElementById('dev-cards-summary');
    if (summaryEl) summaryEl.innerText = `山札: ${potCards.length}枚 / 取札: ${scoopCards.length}枚`;

    const scoopContainer = document.getElementById('dev-scoop-cards-list');
    const potContainer = document.getElementById('dev-pot-cards-list');

    if (scoopContainer) {
        if (scoopCards.length === 0) {
            scoopContainer.innerHTML = '<span class="dev-empty-text">取札なし</span>';
        } else {
            scoopContainer.innerHTML = scoopCards.map((card, idx) => createCardChipHtml(card, `取札 #${idx+1}`)).join('');
        }
    }

    if (potContainer) {
        if (potCards.length === 0) {
            potContainer.innerHTML = '<span class="dev-empty-text">山札なし (空)</span>';
        } else {
            potContainer.innerHTML = potCards.map(card => createCardChipHtml(card)).join('');
        }
    }
}

/**
 * 1枚のカードチップ用HTML生成
 */
function createCardChipHtml(item, prefix = '') {
    if (!item) return '';

    let catClass = 'cat-motsu';
    if (item.category === 'classic' || item.category === 'vege') catClass = 'cat-classic';
    if (item.category === 'spice') catClass = 'cat-spice';
    if (item.category === 'sweets') catClass = 'cat-sweets';
    if (item.category === 'yami') catClass = 'cat-yami';

    const scoreText = (item.score >= 0 ? `+${item.score}` : `${item.score}`);
    const tasteVal = item.taste !== undefined ? item.taste : (item.spice || 0);
    const tasteText = (tasteVal > 0 ? `🔥+${tasteVal}` : (tasteVal < 0 ? `🍬${tasteVal}` : `⚖️0`));
    const sizeText = item.sizeBadgeText ? `[${item.sizeBadgeText}]` : '';
    const prefixText = prefix ? `<span class="dev-chip-prefix">${prefix}</span>` : '';

    return `
        <div class="dev-card-chip ${catClass}" title="${item.name}: ${item.desc || ''}">
            ${prefixText}
            <span class="dev-chip-icon">${item.icon || '🍲'}</span>
            <span class="dev-chip-name">${item.rawName || item.name} <small>${sizeText}</small></span>
            <span class="dev-chip-stat score">${scoreText}pt</span>
            <span class="dev-chip-stat taste">${tasteText}</span>
        </div>
    `;
}

/**
 * 開発者パネルの開閉
 */
export function toggleDevPanel(forceOpen = null) {
    const panel = document.getElementById('dev-inspector-panel');
    if (!panel) return;

    if (forceOpen !== null) {
        isPanelOpen = forceOpen;
    } else {
        isPanelOpen = !isPanelOpen;
    }

    if (isPanelOpen) {
        panel.classList.remove('hidden');
        if (window.gameState) {
            updateDevInspector(window.gameState);
        }
    } else {
        panel.classList.add('hidden');
    }
}

/**
 * パネルの最小化・展開
 */
export function minimizeDevPanel() {
    const body = document.getElementById('dev-panel-body');
    if (!body) return;

    isPanelMinimized = !isPanelMinimized;
    body.style.display = isPanelMinimized ? 'none' : 'block';
}

// グローバル関数登録
window.toggleDevPanel = toggleDevPanel;
window.minimizeDevPanel = minimizeDevPanel;
