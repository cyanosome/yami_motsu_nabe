/**
 * devColorMatrix.js - 開発者モード用 2D色彩空間マトリクス & 鍋中身インスペクター
 * 
 * URL（/dev, ?dev, #dev）で起動可能。
 * 現在の鍋（山札＋取札）の OKLab 補間平面上のプロット位置と、
 * 鍋に残っている具材の全カード内訳をリアルタイムに可視化する。
 */

import { 
    VERTEX_COLORS, 
    AVG_SCORE_MIN, 
    AVG_SCORE_MAX, 
    AVG_TASTE_MIN, 
    AVG_TASTE_MAX, 
    interpolateSoupColor 
} from './pot3d.js';
import { getIngredientIconHtml } from './ui.js';

let isDevMode = false;
let isPanelOpen = true;
let isPanelMinimized = false;
let matrixBgCanvas = null; // 背景グラデーションのキャッシュ用

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
                <!-- 1. 2D 色彩空間マトリクス -->
                <div class="dev-section">
                    <div class="dev-section-title">🎨 2D 色彩空間マトリクス (OKLab補間)</div>
                    
                    <div class="dev-matrix-wrapper">
                        <!-- 軸ラベル -->
                        <div class="dev-axis-label dev-axis-top">Score (+) 美味 (+${AVG_SCORE_MAX})</div>
                        <div class="dev-axis-label dev-axis-bottom">Score (-) 闇 (${AVG_SCORE_MIN})</div>
                        <div class="dev-axis-label dev-axis-left">Taste (-) 甘 (${AVG_TASTE_MIN})</div>
                        <div class="dev-axis-label dev-axis-right">Taste (+) 辛 (+${AVG_TASTE_MAX})</div>

                        <!-- Canvas -->
                        <canvas id="devMatrixCanvas" width="220" height="220" class="dev-matrix-canvas"></canvas>
                    </div>

                    <!-- リアルタイム数値インジケータ -->
                    <div class="dev-stats-grid">
                        <div class="dev-stat-card">
                            <div class="dev-stat-label">残り枚数 (山札+取札)</div>
                            <div class="dev-stat-val" id="dev-stat-count">0 枚</div>
                        </div>
                        <div class="dev-stat-card">
                            <div class="dev-stat-label">平均スコア (v座標)</div>
                            <div class="dev-stat-val" id="dev-stat-score">0.0 (v: 0.50)</div>
                        </div>
                        <div class="dev-stat-card">
                            <div class="dev-stat-label">平均味覚 (u座標)</div>
                            <div class="dev-stat-val" id="dev-stat-taste">0.0 (u: 0.50)</div>
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

                <!-- 2. 鍋の具材インスペクター（全カード内訳） -->
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

    // 初回描画
    if (window.gameState) {
        updateDevInspector(window.gameState);
    }
}

/**
 * 2Dマトリクスの背景グラデーションを事前キャッシュ生成
 */
function createMatrixBackgroundCache() {
    matrixBgCanvas = document.createElement('canvas');
    matrixBgCanvas.width = 220;
    matrixBgCanvas.height = 220;
    const ctx = matrixBgCanvas.getContext('2d');

    const w = matrixBgCanvas.width;
    const h = matrixBgCanvas.height;
    const imgData = ctx.createImageData(w, h);
    const data = imgData.data;

    // 2px ステップで高速レンダリング
    const step = 2;
    for (let y = 0; y < h; y += step) {
        const v = 1 - (y / h); // Score (Top=1, Bottom=0)
        for (let x = 0; x < w; x += step) {
            const u = x / w;   // Taste (Left=0, Right=1)
            const hex = interpolateSoupColor(u, v);
            
            // Hex to RGB
            const num = parseInt(hex.replace('#', ''), 16);
            const r = (num >> 16) & 255;
            const g = (num >> 8) & 255;
            const b = num & 255;

            for (let dy = 0; dy < step && (y + dy) < h; dy++) {
                for (let dx = 0; dx < step && (x + dx) < w; dx++) {
                    const idx = ((y + dy) * w + (x + dx)) * 4;
                    data[idx] = r;
                    data[idx + 1] = g;
                    data[idx + 2] = b;
                    data[idx + 3] = 255;
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
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();
    ctx.setLineDash([]);
}

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

    let avgScore = 0;
    let avgTaste = 0;
    let u = 0.5;
    let v = 0.5;
    let hex = '#000000';

    if (totalCount > 0) {
        const totalScore = allPotCards.reduce((acc, cur) => acc + (cur.score || 0), 0);
        const totalTaste = allPotCards.reduce((acc, cur) => acc + (cur.taste !== undefined ? cur.taste : (cur.spice || 0)), 0);

        avgScore = totalScore / totalCount;
        avgTaste = totalTaste / totalCount;

        const clampedScore = Math.max(AVG_SCORE_MIN, Math.min(AVG_SCORE_MAX, avgScore));
        v = (clampedScore - AVG_SCORE_MIN) / (AVG_SCORE_MAX - AVG_SCORE_MIN);

        const clampedTaste = Math.max(AVG_TASTE_MIN, Math.min(AVG_TASTE_MAX, avgTaste));
        u = (clampedTaste - AVG_TASTE_MIN) / (AVG_TASTE_MAX - AVG_TASTE_MIN);

        hex = interpolateSoupColor(u, v);
    } else {
        hex = interpolateSoupColor(0.5, 0.5);
    }

    // 1. 2Dマトリクス Canvas 再描画
    renderMatrixCanvas(u, v, hex);

    // 2. 数値インジケータ更新
    const countEl = document.getElementById('dev-stat-count');
    const scoreEl = document.getElementById('dev-stat-score');
    const tasteEl = document.getElementById('dev-stat-taste');
    const hexEl = document.getElementById('dev-stat-hex');
    const swatchEl = document.getElementById('dev-color-swatch');

    if (countEl) countEl.innerText = `${totalCount} 枚 (山:${potCards.length}/取:${scoopCards.length})`;
    if (scoreEl) scoreEl.innerText = `${avgScore >= 0 ? '+' : ''}${avgScore.toFixed(2)} (v: ${v.toFixed(2)})`;
    if (tasteEl) tasteEl.innerText = `${avgTaste >= 0 ? '+' : ''}${avgTaste.toFixed(2)} (u: ${u.toFixed(2)})`;
    if (hexEl) hexEl.innerText = hex;
    if (swatchEl) swatchEl.style.backgroundColor = hex;

    // 3. カード内訳更新
    renderCardChipsList(potCards, scoopCards);
}

/**
 * 2D Canvas にターゲットプロットを描画
 */
function renderMatrixCanvas(u, v, currentHex) {
    const canvas = document.getElementById('devMatrixCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // 背景キャッシュを描画
    if (matrixBgCanvas) {
        ctx.drawImage(matrixBgCanvas, 0, 0);
    } else {
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, w, h);
    }

    // ターゲット座標
    const targetX = Math.max(8, Math.min(w - 8, u * w));
    const targetY = Math.max(8, Math.min(h - 8, (1 - v) * h));

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
