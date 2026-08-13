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
