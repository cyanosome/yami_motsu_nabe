/**
 * pot3d.js - Three.js 3D 土鍋レンダリングモジュール
 * 
 * サンプル「Hotpot Color Interpolator.html」から3D描画部分を切り出し、
 * 本体アプリの Phase 2 で使用するための独立モジュール。
 * 
 * Three.js はグローバル（window.THREE）として CDN から読み込まれている前提。
 */

// --- Module State ---
let scene, camera, renderer;
let potMesh, liquidMesh, liquidGeometry;
let steamParticles, steamGeometry;
let animClock = null;
let animationFrameId = null;
let isInitialized = false;

// 固定カメラ設定
const CAMERA_RADIUS = 8.3;
const CAMERA_THETA = Math.PI / 4;       // 水平角
const CAMERA_PHI = Math.PI / 3.5;       // 垂直角
const CAMERA_LOOK_AT_Y = 0.9;

// デフォルトスープ色
const DEFAULT_SOUP_COLOR = 0xd63031;

// --- 4頂点キーカラー（バイリニア補間用） ---
const VERTEX_COLORS = {
    c01: '#FC42FF', // TL: 甘口 × 高スコア (U=0, V=1)
    c11: '#FF0A0A', // TR: 辛口 × 高スコア (U=1, V=1)
    c00: '#38113C', // BL: 甘口 × 低スコア (U=0, V=0)
    c10: '#4A001F'  // BR: 辛口 × 低スコア (U=1, V=0)
};

// 正規化パラメータ
const SCORE_MIN = -10;
const SCORE_MAX = 10;
const TASTE_MIN = -5;
const TASTE_MAX = 5;

/* =========================================================================
   OKLab 色空間変換（Hotpot Color Interpolator から移植）
   ========================================================================= */

function hexToRgb(hex) {
    let clean = hex.replace('#', '');
    if (clean.length === 3) {
        clean = clean.split('').map(c => c + c).join('');
    }
    const num = parseInt(clean, 16);
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255
    };
}

function rgbToHex(r, g, b) {
    const toHex = (c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function rgbToOklab(r, g, b) {
    let rL = r / 255, gL = g / 255, bL = b / 255;

    // Linearize sRGB
    rL = rL > 0.04045 ? Math.pow((rL + 0.055) / 1.055, 2.4) : rL / 12.92;
    gL = gL > 0.04045 ? Math.pow((gL + 0.055) / 1.055, 2.4) : gL / 12.92;
    bL = bL > 0.04045 ? Math.pow((bL + 0.055) / 1.055, 2.4) : bL / 12.92;

    let l = 0.4122214708 * rL + 0.5363325363 * gL + 0.0514459929 * bL;
    let m = 0.2119034982 * rL + 0.6806995451 * gL + 0.1073969767 * bL;
    let s = 0.0883024619 * rL + 0.2817188376 * gL + 0.6299787005 * bL;

    let l_ = Math.cbrt(l);
    let m_ = Math.cbrt(m);
    let s_ = Math.cbrt(s);

    return {
        L: 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
        a: 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
        b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757971 * s_
    };
}

function oklabToRgb(L, a, b) {
    let l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    let m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    let s_ = L - 0.0894841775 * a - 1.2914855480 * b;

    let l = l_ * l_ * l_;
    let m = m_ * m_ * m_;
    let s = s_ * s_ * s_;

    let r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    let b_ = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

    // Delinearize to sRGB
    let rd = r > 0.0031308 ? 1.055 * Math.pow(r, 1/2.4) - 0.055 : 12.92 * r;
    let gd = g > 0.0031308 ? 1.055 * Math.pow(g, 1/2.4) - 0.055 : 12.92 * g;
    let bd = b_ > 0.0031308 ? 1.055 * Math.pow(b_, 1/2.4) - 0.055 : 12.92 * b_;

    return {
        r: Math.max(0, Math.min(255, Math.round(rd * 255))),
        g: Math.max(0, Math.min(255, Math.round(gd * 255))),
        b: Math.max(0, Math.min(255, Math.round(bd * 255)))
    };
}

/**
 * OKLab 色空間でのバイリニア補間
 * @param {number} u - Taste 軸 [0..1] (0=甘口, 1=辛口)
 * @param {number} v - Score 軸 [0..1] (0=低スコア, 1=高スコア)
 * @returns {string} HEX カラー文字列
 */
function interpolateSoupColor(u, v) {
    const rgb00 = hexToRgb(VERTEX_COLORS.c00); // BL
    const rgb10 = hexToRgb(VERTEX_COLORS.c10); // BR
    const rgb01 = hexToRgb(VERTEX_COLORS.c01); // TL
    const rgb11 = hexToRgb(VERTEX_COLORS.c11); // TR

    const lab00 = rgbToOklab(rgb00.r, rgb00.g, rgb00.b);
    const lab10 = rgbToOklab(rgb10.r, rgb10.g, rgb10.b);
    const lab01 = rgbToOklab(rgb01.r, rgb01.g, rgb01.b);
    const lab11 = rgbToOklab(rgb11.r, rgb11.g, rgb11.b);

    const L = (1 - u) * (1 - v) * lab00.L + u * (1 - v) * lab10.L + (1 - u) * v * lab01.L + u * v * lab11.L;
    const a = (1 - u) * (1 - v) * lab00.a + u * (1 - v) * lab10.a + (1 - u) * v * lab01.a + u * v * lab11.a;
    const b = (1 - u) * (1 - v) * lab00.b + u * (1 - v) * lab10.b + (1 - u) * v * lab01.b + u * v * lab11.b;

    const finalRgb = oklabToRgb(L, a, b);
    return rgbToHex(finalRgb.r, finalRgb.g, finalRgb.b);
}

/**
 * 3Dシーンを初期化し、#pot-3d-viewport にレンダリングを開始する。
 * 既に初期化済みの場合はスキップする。
 */
export function initPot3D() {
    if (isInitialized) return;

    const container = document.getElementById('pot-3d-viewport');
    if (!container) {
        console.warn('[pot3d] #pot-3d-viewport が見つかりません');
        return;
    }

    const THREE = window.THREE;
    if (!THREE) {
        console.error('[pot3d] Three.js が読み込まれていません');
        return;
    }

    const w = container.clientWidth;
    const h = container.clientHeight;

    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0f0a0c, 0.04);

    // Camera（固定アングル）
    camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
    setCameraPosition();

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setClearColor(0x000000, 0); // 透明背景

    container.appendChild(renderer.domElement);

    // Lighting
    setupLighting();

    // 3D Objects
    createDonabePot();
    createLiquidSurface();
    createIngredients();
    createSteamParticles();

    // Resize
    window.addEventListener('resize', resizePot3D);

    // Animation Clock
    animClock = new THREE.Clock();

    // Start Animation Loop
    isInitialized = true;
    animate3D();

    console.log('[pot3d] 3D土鍋シーン初期化完了');
}

/**
 * 3Dリソースを解放する。Phase遷移やリセット時に呼び出す。
 */
export function disposePot3D() {
    if (!isInitialized) return;

    // アニメーションループ停止
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    // リサイズリスナー解除
    window.removeEventListener('resize', resizePot3D);

    // Three.js リソース解放
    if (renderer) {
        renderer.dispose();
        const container = document.getElementById('pot-3d-viewport');
        if (container && renderer.domElement && container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
        }
    }

    // ジオメトリ・マテリアル解放
    if (scene) {
        scene.traverse((obj) => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(m => m.dispose());
                } else {
                    obj.material.dispose();
                }
            }
        });
    }

    scene = null;
    camera = null;
    renderer = null;
    potMesh = null;
    liquidMesh = null;
    liquidGeometry = null;
    steamParticles = null;
    steamGeometry = null;
    animClock = null;
    isInitialized = false;

    console.log('[pot3d] 3D土鍋シーン破棄完了');
}

/**
 * スープの色を更新する（将来の色補間統合用API）。
 * @param {string} hexColor - HEXカラー文字列 (例: '#d63031')
 */
export function updateSoupColor(hexColor) {
    if (!liquidMesh) return;
    const THREE = window.THREE;
    if (!THREE) return;

    const color = new THREE.Color(hexColor);
    liquidMesh.material.color.set(color);
}

/**
 * ゲーム状態（山札＋取札）から合計 score / taste を算出し、
 * OKLab バイリニア補間でスープ色を更新する。
 * 
 * プレイヤーの手札（bowl）は含めない。
 * 鍋に残っている具材の傾向を視覚的に推測するヒントとして機能する。
 * 
 * @param {object} gameState - ゲーム状態オブジェクト
 */
export function updateSoupColorFromGameState(gameState) {
    if (!gameState) return;

    // 山札 + 取札のカードを集約
    const potCards = gameState.potStack || [];
    const scoopCards = Object.values(gameState.currentScoopOptions || {});
    const allPotCards = [...potCards, ...scoopCards];

    // 合計 score / taste を算出
    const totalScore = allPotCards.reduce((acc, cur) => acc + (cur.score || 0), 0);
    const totalTaste = allPotCards.reduce((acc, cur) => acc + (cur.taste !== undefined ? cur.taste : (cur.spice || 0)), 0);

    // 正規化: score -20〜+20 → 0.0〜1.0（クランプ）
    const clampedScore = Math.max(SCORE_MIN, Math.min(SCORE_MAX, totalScore));
    const v = (clampedScore - SCORE_MIN) / (SCORE_MAX - SCORE_MIN);

    // 正規化: taste -10〜+10 → 0.0〜1.0（クランプ）
    const clampedTaste = Math.max(TASTE_MIN, Math.min(TASTE_MAX, totalTaste));
    const u = (clampedTaste - TASTE_MIN) / (TASTE_MAX - TASTE_MIN);

    // OKLab バイリニア補間で色を算出
    const hex = interpolateSoupColor(u, v);
    updateSoupColor(hex);
}

/**
 * ウィンドウリサイズ時のハンドラ
 */
export function resizePot3D() {
    const container = document.getElementById('pot-3d-viewport');
    if (!container || !camera || !renderer) return;

    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
}

// --- Internal Functions ---

function setCameraPosition() {
    const THREE = window.THREE;
    camera.position.x = CAMERA_RADIUS * Math.sin(CAMERA_PHI) * Math.sin(CAMERA_THETA);
    camera.position.y = CAMERA_RADIUS * Math.cos(CAMERA_PHI);
    camera.position.z = CAMERA_RADIUS * Math.sin(CAMERA_PHI) * Math.cos(CAMERA_THETA);
    camera.lookAt(0, CAMERA_LOOK_AT_Y, 0);
}

function setupLighting() {
    const THREE = window.THREE;

    const ambientLight = new THREE.AmbientLight(0xfff5ea, 0.8);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xfffaed, 1.8);
    mainLight.position.set(5, 8, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    scene.add(mainLight);

    const warmRimLight = new THREE.PointLight(0xff8833, 2, 10);
    warmRimLight.position.set(-4, 3, -4);
    scene.add(warmRimLight);

    const bottomGlow = new THREE.PointLight(0xff2200, 1.2, 5);
    bottomGlow.position.set(0, -1.5, 0);
    scene.add(bottomGlow);
}

/**
 * LatheGeometry による土鍋（土鍋外壁＋取手）を生成
 */
function createDonabePot() {
    const THREE = window.THREE;

    // 土鍋の断面プロファイル
    const points = [];
    points.push(new THREE.Vector2(0, 0));       // 底面中央
    points.push(new THREE.Vector2(1.8, 0));     // 底面幅
    points.push(new THREE.Vector2(2.6, 0.8));   // 胴回り曲線
    points.push(new THREE.Vector2(2.4, 1.8));   // 首
    points.push(new THREE.Vector2(2.5, 2.0));   // 縁外側
    points.push(new THREE.Vector2(2.2, 1.95));  // 縁上面
    points.push(new THREE.Vector2(2.15, 0.4));  // 内壁底面曲線
    points.push(new THREE.Vector2(0, 0.35));    // 内底面中央

    const potGeo = new THREE.LatheGeometry(points, 64);
    const potMat = new THREE.MeshStandardMaterial({
        color: 0x221c18,      // 暗い陶器色
        roughness: 0.85,
        metalness: 0.05,
        bumpScale: 0.02
    });

    potMesh = new THREE.Mesh(potGeo, potMat);
    potMesh.castShadow = true;
    potMesh.receiveShadow = true;
    scene.add(potMesh);

    // 取手（耳）
    const handleGeo = new THREE.TorusGeometry(0.35, 0.12, 16, 32, Math.PI);
    const handleMat = potMat;

    const handleLeft = new THREE.Mesh(handleGeo, handleMat);
    handleLeft.position.set(-2.5, 1.6, 0);
    handleLeft.rotation.z = Math.PI / 2;
    handleLeft.rotation.x = -Math.PI / 2;
    potMesh.add(handleLeft);

    const handleRight = new THREE.Mesh(handleGeo, handleMat);
    handleRight.position.set(2.5, 1.6, 0);
    handleRight.rotation.z = -Math.PI / 2;
    handleRight.rotation.x = -Math.PI / 2;
    potMesh.add(handleRight);
}

/**
 * スープ液面を MeshPhysicalMaterial で生成
 */
function createLiquidSurface() {
    const THREE = window.THREE;

    liquidGeometry = new THREE.CircleGeometry(2.12, 64);

    const liquidMaterial = new THREE.MeshPhysicalMaterial({
        color: DEFAULT_SOUP_COLOR,
        transmission: 0.7,
        opacity: 0.95,
        transparent: true,
        roughness: 0.08,
        ior: 1.333,
        thickness: 1.5,
        specularIntensity: 1.0
    });

    liquidMesh = new THREE.Mesh(liquidGeometry, liquidMaterial);
    liquidMesh.rotation.x = -Math.PI / 2;
    liquidMesh.position.y = 1.35; // 鍋内のスープ水位
    scene.add(liquidMesh);
}

/**
 * 浮遊する具材オブジェクトを生成
 */
function createIngredients() {
    const THREE = window.THREE;
    const ingGroup = new THREE.Group();

    // 1. 豆腐ブロック（白い立方体）
    const tofuGeo = new THREE.BoxGeometry(0.45, 0.35, 0.45);
    const tofuMat = new THREE.MeshStandardMaterial({ color: 0xfaf4e8, roughness: 0.6 });

    const tofu1 = new THREE.Mesh(tofuGeo, tofuMat);
    tofu1.position.set(-0.8, 1.32, -0.5);
    tofu1.rotation.y = 0.4;
    ingGroup.add(tofu1);

    const tofu2 = new THREE.Mesh(tofuGeo, tofuMat);
    tofu2.position.set(-0.5, 1.3, -0.9);
    tofu2.rotation.y = -0.2;
    ingGroup.add(tofu2);

    // 2. しいたけ（半球キャップ）
    const shiiGeo = new THREE.SphereGeometry(0.4, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const shiiMat = new THREE.MeshStandardMaterial({ color: 0x3d281c, roughness: 0.9 });
    const shiitake = new THREE.Mesh(shiiGeo, shiiMat);
    shiitake.position.set(0.7, 1.3, 0.4);
    shiitake.rotation.x = 0.2;
    ingGroup.add(shiitake);

    // 3. 唐辛子（赤いコーン）
    const chiliGeo = new THREE.ConeGeometry(0.08, 0.5, 12);
    const chiliMat = new THREE.MeshStandardMaterial({ color: 0xdd1100, roughness: 0.3 });
    const chili1 = new THREE.Mesh(chiliGeo, chiliMat);
    chili1.position.set(0.2, 1.38, -0.7);
    chili1.rotation.z = Math.PI / 2.3;
    ingGroup.add(chili1);

    // 4. 長ネギリング
    const onionGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 12);
    const onionMat = new THREE.MeshStandardMaterial({ color: 0x44aa44, roughness: 0.5 });
    for (let i = 0; i < 4; i++) {
        const ring = new THREE.Mesh(onionGeo, onionMat);
        ring.position.set(0.3 + (i * 0.25) - 0.4, 1.36, 0.8 - (i * 0.15));
        ring.rotation.x = Math.random() * 0.3;
        ingGroup.add(ring);
    }

    scene.add(ingGroup);
}

/**
 * 湯気パーティクルシステムを生成
 */
function createSteamParticles() {
    const THREE = window.THREE;

    const particleCount = 40;
    steamGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 2.8;
        positions[i * 3 + 1] = 1.4 + Math.random() * 2.5;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 2.8;
    }

    steamGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const steamMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.35,
        transparent: true,
        opacity: 0.25
    });

    steamParticles = new THREE.Points(steamGeometry, steamMat);
    scene.add(steamParticles);
}

/**
 * アニメーションループ
 */
function animate3D() {
    animationFrameId = requestAnimationFrame(animate3D);

    if (!animClock || !renderer || !scene || !camera) return;

    const elapsedTime = animClock.getElapsedTime();

    // 沸騰アニメーション（液面の波打ち）
    if (liquidGeometry) {
        const pos = liquidGeometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const u = pos.getX(i);
            const v = pos.getY(i);
            const z = Math.sin(u * 5 + elapsedTime * 4) * 0.03
                    + Math.cos(v * 6 + elapsedTime * 3) * 0.02;
            pos.setZ(i, z);
        }
        liquidGeometry.computeVertexNormals();
        liquidGeometry.attributes.position.needsUpdate = true;
    }

    // 湯気パーティクルの上昇
    if (steamParticles) {
        const pos = steamParticles.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            let y = pos.getY(i);
            y += 0.012;
            if (y > 4.0) {
                y = 1.4;
                pos.setX(i, (Math.random() - 0.5) * 2.8);
                pos.setZ(i, (Math.random() - 0.5) * 2.8);
            }
            pos.setY(i, y);
        }
        steamParticles.geometry.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
}
