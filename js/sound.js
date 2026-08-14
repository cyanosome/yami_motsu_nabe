import { gameState } from './gameLogic.js';

/* --- BGM トラック定義 --- */
export const BGM_TRACKS = {
    MAIN: 'assets/sound/和風ロックBGM.wav'
};

/* --- Web Audio API 共通基盤 --- */
const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new AudioCtxClass();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

/* --- BGM コントローラー状態 --- */
const bgmBufferCache = new Map(); // URL -> AudioBuffer
let bgmGainNode = null;
let bgmSourceNode = null;
let currentTrackKey = null;
let targetBgmVolume = 0.35;
let bgmStartTime = 0;
let bgmPauseOffset = 0;
let isBgmPlaying = false;
let bgmStopTimeout = null;

/**
 * BGM用の GainNode を取得または初期化
 */
function getBgmGainNode() {
    const ctx = getAudioContext();
    if (!bgmGainNode) {
        bgmGainNode = ctx.createGain();
        bgmGainNode.gain.setValueAtTime(targetBgmVolume, ctx.currentTime);
        bgmGainNode.connect(ctx.destination);
    }
    return bgmGainNode;
}

/**
 * 音声ファイルを非同期ロードして AudioBuffer を取得（キャッシュ付き）
 * @param {string} trackKey 
 * @returns {Promise<AudioBuffer>}
 */
export async function loadBGMBuffer(trackKey) {
    const trackSrc = BGM_TRACKS[trackKey];
    if (!trackSrc) {
        throw new Error(`[BGM] Track not found for key: ${trackKey}`);
    }

    if (bgmBufferCache.has(trackSrc)) {
        return bgmBufferCache.get(trackSrc);
    }

    const ctx = getAudioContext();
    const response = await fetch(trackSrc);
    if (!response.ok) {
        throw new Error(`[BGM] Failed to fetch audio file: ${trackSrc} (${response.status})`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    bgmBufferCache.set(trackSrc, audioBuffer);
    return audioBuffer;
}

/**
 * BGMを完全シームレスループで再生する（Web Audio API / AudioBufferSourceNode）
 * @param {string} trackKey BGM_TRACKSのキー（デフォルト: 'MAIN'）
 * @param {Object} options 再生オプション
 */
export async function playBGM(trackKey = 'MAIN', options = {}) {
    const {
        loop = true,
        volume = targetBgmVolume,
        fadeIn = true,
        fadeInDuration = 0.8,
        offset = null
    } = options;

    currentTrackKey = trackKey;
    targetBgmVolume = volume;

    if (!gameState.bgmEnabled) {
        return;
    }

    try {
        const ctx = getAudioContext();
        const gainNode = getBgmGainNode();
        const buffer = await loadBGMBuffer(trackKey);

        // ロード完了前にBGMが無効化された場合は中断
        if (!gameState.bgmEnabled) return;

        // 既存の停止タイマーをクリア
        if (bgmStopTimeout) {
            clearTimeout(bgmStopTimeout);
            bgmStopTimeout = null;
        }

        // 既に再生中の古いソースノードがあれば停止
        if (bgmSourceNode) {
            try {
                bgmSourceNode.stop();
                bgmSourceNode.disconnect();
            } catch (e) {
                // 既に停止している場合は無視
            }
            bgmSourceNode = null;
        }

        // 新しい AudioBufferSourceNode を作成（使い捨て仕様のため毎回生成）
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = loop;
        source.connect(gainNode);

        const now = ctx.currentTime;
        const startOffset = offset !== null ? offset : (bgmPauseOffset % buffer.duration);

        if (fadeIn) {
            gainNode.gain.cancelScheduledValues(now);
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(targetBgmVolume, now + fadeInDuration);
        } else {
            gainNode.gain.cancelScheduledValues(now);
            gainNode.gain.setValueAtTime(targetBgmVolume, now);
        }

        source.start(now, startOffset);
        bgmStartTime = now - startOffset;
        bgmSourceNode = source;
        isBgmPlaying = true;

        source.onended = () => {
            if (bgmSourceNode === source && !source.loop) {
                isBgmPlaying = false;
                bgmSourceNode = null;
                bgmPauseOffset = 0;
            }
        };

    } catch (e) {
        console.warn("[BGM] Error playing Web Audio BGM:", e);
    }
}

/**
 * BGMを停止する（フェードアウト対応）
 * @param {Object} options 停止オプション
 */
export function stopBGM(options = {}) {
    const {
        fadeOut = true,
        fadeOutDuration = 0.6
    } = options;

    if (!isBgmPlaying || !bgmSourceNode) {
        isBgmPlaying = false;
        bgmPauseOffset = 0;
        return;
    }

    try {
        const ctx = getAudioContext();
        const gainNode = getBgmGainNode();
        const now = ctx.currentTime;

        if (bgmStopTimeout) {
            clearTimeout(bgmStopTimeout);
            bgmStopTimeout = null;
        }

        // 現在の再生位置をリセット
        bgmPauseOffset = 0;
        isBgmPlaying = false;

        const currentSource = bgmSourceNode;
        bgmSourceNode = null;

        if (fadeOut && gainNode.gain.value > 0) {
            gainNode.gain.cancelScheduledValues(now);
            gainNode.gain.setValueAtTime(gainNode.gain.value, now);
            gainNode.gain.linearRampToValueAtTime(0.001, now + fadeOutDuration);

            bgmStopTimeout = setTimeout(() => {
                try {
                    currentSource.stop();
                    currentSource.disconnect();
                } catch (e) {}
            }, fadeOutDuration * 1000);
        } else {
            currentSource.stop();
            currentSource.disconnect();
        }
    } catch (e) {
        console.warn("[BGM] Error stopping BGM:", e);
    }
}

/**
 * BGMを一時停止する
 */
export function pauseBGM() {
    if (!isBgmPlaying || !bgmSourceNode) return;
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;
        bgmPauseOffset = Math.max(0, now - bgmStartTime);

        bgmSourceNode.stop();
        bgmSourceNode.disconnect();
        bgmSourceNode = null;
        isBgmPlaying = false;
    } catch (e) {
        console.warn("[BGM] Error pausing BGM:", e);
    }
}

/**
 * BGMを一時停止位置から再開する
 */
export function resumeBGM() {
    if (isBgmPlaying || !gameState.bgmEnabled || !currentTrackKey) return;
    playBGM(currentTrackKey, { fadeIn: true, offset: bgmPauseOffset });
}

/**
 * BGMのON/OFF切り替え
 */
export function toggleBGM() {
    gameState.bgmEnabled = !gameState.bgmEnabled;
    const bgmBtn = document.getElementById('bgm-btn');
    if (bgmBtn) {
        bgmBtn.innerHTML = gameState.bgmEnabled ? '🎵 BGM: ON' : '🔇 BGM: OFF';
        bgmBtn.classList.toggle('muted', !gameState.bgmEnabled);
    }

    if (gameState.bgmEnabled) {
        // ゲーム中であればBGMを再生
        if (gameState.currentPhase >= 1) {
            playBGM(currentTrackKey || 'MAIN', { fadeIn: true });
        }
    } else {
        stopBGM({ fadeOut: true });
    }
}

/**
 * BGMの音量を設定する
 * @param {number} volume 0.0 〜 1.0
 */
export function setBGMVolume(volume) {
    targetBgmVolume = Math.max(0, Math.min(1, volume));
    if (bgmGainNode && audioCtx) {
        const now = audioCtx.currentTime;
        bgmGainNode.gain.cancelScheduledValues(now);
        bgmGainNode.gain.setValueAtTime(targetBgmVolume, now);
    }
}

/* --- 効果音 (Web Audio API) --- */
export function playSound(type) {
    if (!gameState.soundEnabled) return;
    try {
        const ctx = getAudioContext();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;

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
        } else if (type === 'count') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(900, now + 0.05);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.linearRampToValueAtTime(0.001, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
        } else if (type === 'combo') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(587.33, now); // D5
            osc.frequency.setValueAtTime(880.00, now + 0.08); // A5
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
            osc.start(now);
            osc.stop(now + 0.25);
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

export function toggleSound() {
    gameState.soundEnabled = !gameState.soundEnabled;
    const soundBtn = document.getElementById('sound-btn');
    if (soundBtn) {
        soundBtn.innerHTML = gameState.soundEnabled ? '🔊 効果音: ON' : '🔇 効果音: OFF';
        soundBtn.classList.toggle('muted', !gameState.soundEnabled);
    }
}

// タブ非表示時のBGM自動一時停止と復帰
document.addEventListener('visibilitychange', () => {
    if (!audioCtx) return;
    if (document.hidden) {
        if (audioCtx.state === 'running') {
            audioCtx.suspend().catch(() => {});
        }
    } else {
        if (audioCtx.state === 'suspended' && (gameState.bgmEnabled || gameState.soundEnabled)) {
            audioCtx.resume().catch(() => {});
        }
    }
});

// ブラウザのAutoplayポリシー解除のための初回ユーザー操作リスナー
function unlockAudioOnFirstGesture() {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
        ctx.resume();
    }
    // 既にBGM再生要求が出ている場合の再開
    if (gameState.bgmEnabled && !isBgmPlaying && currentTrackKey && gameState.currentPhase >= 1) {
        playBGM(currentTrackKey, { fadeIn: true });
    }
    window.removeEventListener('click', unlockAudioOnFirstGesture);
    window.removeEventListener('touchstart', unlockAudioOnFirstGesture);
}
window.addEventListener('click', unlockAudioOnFirstGesture, { passive: true });
window.addEventListener('touchstart', unlockAudioOnFirstGesture, { passive: true });
