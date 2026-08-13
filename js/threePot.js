/**
 * threePot.js - Three.jsを用いたリアルな3D土鍋・スープ液面・泡・湯気のレンダラー
 */

let scene, camera, renderer;
let potMesh, soupMesh, soupGeometry;
let bubbleGroup, steamGroup;
let animationFrameId = null;
let clock;

// 波立ちのパラメータ
const waveParams = {
    speed: 2.2,
    height: 0.08,
    frequency: 3.5
};

/**
 * 3D鍋の初期化関数
 * @param {HTMLElement|string} containerInput - Canvasを配置する親要素またはID
 */
export function initThreePot(containerInput = 'pot-element') {
    const container = typeof containerInput === 'string' ? document.getElementById(containerInput) : containerInput;
    if (!container) return;

    // Three.jsライブラリが読み込まれているかチェック
    if (typeof THREE === 'undefined') {
        console.warn('Three.js is not loaded yet.');
        return;
    }

    // 既存のCanvasがある場合は削除
    const oldCanvas = container.querySelector('canvas#pot-3d-canvas');
    if (oldCanvas) {
        oldCanvas.remove();
    }
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    const width = container.clientWidth || 260;
    const height = container.clientHeight || 260;

    // 1. Scene, Camera, Renderer
    scene = new THREE.Scene();
    clock = new THREE.Clock();

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    // 斜め上からの見下ろし視点
    camera.position.set(0, 3.2, 4.2);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.id = 'pot-3d-canvas';
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.zIndex = '2';
    renderer.domElement.style.pointerEvents = 'none'; // クリックイベントを通過

    container.appendChild(renderer.domElement);

    // 2. ライティング
    setupLighting();

    // 3. 3D土鍋の作成
    createDonabePot();

    // 4. リアルスープ液面の作成
    createSoupSurface();

    // 5. 泡＆湯気パーティクルの作成
    createBubblesAndSteam();

    // 6. アニメーションループ開始
    animate();
}

/**
 * ライティング設定
 */
function setupLighting() {
    // 暖かみのある環境光
    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.7);
    scene.add(ambientLight);

    // 主光源（斜め前上からの強いハイライト光）
    const dirLight = new THREE.DirectionalLight(0xfff5ea, 1.2);
    dirLight.position.set(3, 6, 4);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // スープを内部から照らす赤いスポット光
    const potInnerLight = new THREE.PointLight(0xff3300, 1.5, 4);
    potInnerLight.position.set(0, 0.5, 0);
    scene.add(potInnerLight);

    // 金色の補調光
    const rimLight = new THREE.PointLight(0xfdcb6e, 0.8, 5);
    rimLight.position.set(-3, 3, -2);
    scene.add(rimLight);
}

/**
 * 3D土鍋（Donabe）ジオメトリ & マテリアル
 */
function createDonabePot() {
    const potGroup = new THREE.Group();

    // LatheGeometry（回転体）で土鍋本体の断面カーブを定義
    const points = [];
    points.push(new THREE.Vector2(0, 0));
    points.push(new THREE.Vector2(1.2, 0.05));
    points.push(new THREE.Vector2(1.6, 0.3));
    points.push(new THREE.Vector2(1.85, 0.8));
    points.push(new THREE.Vector2(1.9, 1.3));
    points.push(new THREE.Vector2(2.05, 1.45));
    points.push(new THREE.Vector2(1.95, 1.55));
    points.push(new THREE.Vector2(1.75, 1.4));
    points.push(new THREE.Vector2(1.68, 0.4));
    points.push(new THREE.Vector2(0, 0.35));

    const latheGeometry = new THREE.LatheGeometry(points, 48);
    latheGeometry.computeVertexNormals();

    const potMaterial = new THREE.MeshStandardMaterial({
        color: 0x261516,
        roughness: 0.55,
        metalness: 0.15
    });

    potMesh = new THREE.Mesh(latheGeometry, potMaterial);
    potMesh.castShadow = true;
    potMesh.receiveShadow = true;
    potGroup.add(potMesh);

    // 土鍋の耳（取っ手）2個を追加
    const handleGeo = new THREE.TorusGeometry(0.35, 0.12, 16, 24, Math.PI);
    const handleMat = new THREE.MeshStandardMaterial({
        color: 0x1f1011,
        roughness: 0.6,
        metalness: 0.1
    });

    const handleLeft = new THREE.Mesh(handleGeo, handleMat);
    handleLeft.position.set(-1.88, 1.15, 0);
    handleLeft.rotation.z = Math.PI / 2;
    handleLeft.rotation.y = -Math.PI / 2;
    potGroup.add(handleLeft);

    const handleRight = new THREE.Mesh(handleGeo, handleMat);
    handleRight.position.set(1.88, 1.15, 0);
    handleRight.rotation.z = -Math.PI / 2;
    handleRight.rotation.y = Math.PI / 2;
    potGroup.add(handleRight);

    potGroup.rotation.x = 0.35;
    scene.add(potGroup);
}

/**
 * リアルスープ液面の構築
 */
function createSoupSurface() {
    soupGeometry = new THREE.CircleGeometry(1.68, 48, 48);

    soupGeometry.userData = {
        originalPositions: soupGeometry.attributes.position.clone()
    };

    const soupMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xd63031,
        emissive: 0x4a090b,
        emissiveIntensity: 0.3,
        roughness: 0.12,
        metalness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.08,
        reflectivity: 0.9,
        transmission: 0.2,
        ior: 1.33,
        side: THREE.DoubleSide
    });

    soupMesh = new THREE.Mesh(soupGeometry, soupMaterial);
    soupMesh.rotation.x = -Math.PI / 2 + 0.35;
    soupMesh.position.set(0, 1.05, 0.15);
    scene.add(soupMesh);
}

/**
 * 泡・湯気パーティクルの構築
 */
function createBubblesAndSteam() {
    // 泡 (Bubbles)
    bubbleGroup = new THREE.Group();
    const bubbleGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const bubbleMat = new THREE.MeshStandardMaterial({
        color: 0xffaaaa,
        roughness: 0.1,
        metalness: 0.3,
        transparent: true,
        opacity: 0.7
    });

    for (let i = 0; i < 18; i++) {
        const bubble = new THREE.Mesh(bubbleGeo, bubbleMat);
        resetBubble(bubble);
        bubbleGroup.add(bubble);
    }
    bubbleGroup.rotation.x = 0.35;
    scene.add(bubbleGroup);

    // 湯気 (Steam Particles)
    steamGroup = new THREE.Group();
    const particleCount = 25;
    const steamGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 2.2;
        positions[i * 3 + 1] = 1.1 + Math.random() * 1.5;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 2.2;
    }

    steamGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 240, 230, 0.6)');
    grad.addColorStop(0.5, 'rgba(255, 200, 180, 0.2)');
    grad.addColorStop(1, 'rgba(255, 200, 180, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const steamTexture = new THREE.CanvasTexture(canvas);

    const steamMat = new THREE.PointsMaterial({
        size: 0.45,
        map: steamTexture,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0.35
    });

    const steamPoints = new THREE.Points(steamGeo, steamMat);
    steamGroup.add(steamPoints);
    steamGroup.rotation.x = 0.35;
    scene.add(steamGroup);
}

function resetBubble(bubble) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 1.2;
    bubble.position.x = Math.cos(angle) * radius;
    bubble.position.y = 1.02;
    bubble.position.z = Math.sin(angle) * radius;
    const s = 0.4 + Math.random() * 0.8;
    bubble.scale.set(s, s, s);
    bubble.userData = {
        speedY: 0.003 + Math.random() * 0.005,
        maxLife: 60 + Math.random() * 90,
        life: 0
    };
}

function animate() {
    animationFrameId = requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // 1. スープの波立ち（Vertex displacement）
    if (soupGeometry) {
        const posAttr = soupGeometry.attributes.position;
        const origPos = soupGeometry.userData.originalPositions;

        for (let i = 0; i < posAttr.count; i++) {
            const u = origPos.getX(i);
            const v = origPos.getY(i);

            const zWave = 
                Math.sin(u * waveParams.frequency + elapsedTime * waveParams.speed) * waveParams.height * 0.5 +
                Math.cos(v * waveParams.frequency * 1.2 + elapsedTime * waveParams.speed * 1.3) * waveParams.height * 0.5 +
                Math.sin((u + v) * 2.5 + elapsedTime * 1.8) * 0.03;

            posAttr.setZ(i, zWave);
        }
        posAttr.needsUpdate = true;
        soupGeometry.computeVertexNormals();
    }

    // 2. 泡のアニメーション
    if (bubbleGroup) {
        bubbleGroup.children.forEach(bubble => {
            bubble.userData.life++;
            bubble.position.y += bubble.userData.speedY;

            const progress = bubble.userData.life / bubble.userData.maxLife;
            bubble.material.opacity = (1 - progress) * 0.6;

            if (bubble.userData.life >= bubble.userData.maxLife) {
                resetBubble(bubble);
            }
        });
    }

    // 3. 湯気のアニメーション
    if (steamGroup && steamGroup.children[0]) {
        const points = steamGroup.children[0];
        const posAttr = points.geometry.attributes.position;

        for (let i = 0; i < posAttr.count; i++) {
            let y = posAttr.getY(i);
            y += 0.008;
            if (y > 2.8) {
                y = 1.05;
                posAttr.setX(i, (Math.random() - 0.5) * 2.2);
                posAttr.setZ(i, (Math.random() - 0.5) * 2.2);
            }
            posAttr.setY(i, y);
        }
        posAttr.needsUpdate = true;
    }

    // 4. 鍋全体のゆったりとした微旋回
    if (potMesh) {
        potMesh.parent.rotation.y = Math.sin(elapsedTime * 0.5) * 0.08;
    }

    renderer.render(scene, camera);
}

export function triggerSplashEffect() {
    waveParams.height = 0.22;
    waveParams.speed = 4.5;
    setTimeout(() => {
        waveParams.height = 0.08;
        waveParams.speed = 2.2;
    }, 1500);
}

window.triggerSplashEffect = triggerSplashEffect;
