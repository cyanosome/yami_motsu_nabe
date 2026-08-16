import { gameState } from './gameLogic.js';

/* --- BGM トラック定義 --- */
export const BGM_TRACKS = {
    MAIN: 'assets/sound/和風ロックBGM.wav'
};

/* --- サウンド設定と永続化 (LocalStorage) --- */
const SOUND_SETTINGS_KEY = 'yami_motsu_sound_settings';

export const soundSettings = {
    bgmEnabled: true,
    bgmVolume: 0.25,      // 0.0 〜 1.0
    soundEnabled: true,
    soundVolume: 0.80     // 0.0 〜 1.0
};

// 起動時にローカルストレージから設定を復元
export function loadSoundSettings() {
    try {
        const saved = localStorage.getItem(SOUND_SETTINGS_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (typeof parsed.bgmEnabled === 'boolean') soundSettings.bgmEnabled = parsed.bgmEnabled;
            if (typeof parsed.bgmVolume === 'number') soundSettings.bgmVolume = Math.max(0, Math.min(1, parsed.bgmVolume));
            if (typeof parsed.soundEnabled === 'boolean') soundSettings.soundEnabled = parsed.soundEnabled;
            if (typeof parsed.soundVolume === 'number') soundSettings.soundVolume = Math.max(0, Math.min(1, parsed.soundVolume));
        }
    } catch (e) {
        console.warn('[Sound] Failed to load sound settings from localStorage:', e);
    }
    
    // gameStateにも同期
    gameState.bgmEnabled = soundSettings.bgmEnabled;
    gameState.soundEnabled = soundSettings.soundEnabled;
}

export function saveSoundSettings() {
    try {
        localStorage.setItem(SOUND_SETTINGS_KEY, JSON.stringify(soundSettings));
    } catch (e) {
        console.warn('[Sound] Failed to save sound settings:', e);
    }
}

// 初期ロード実行
loadSoundSettings();

/* --- Web Audio API 共通基盤 --- */
const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

export function getAudioContext() {
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
        const initialVol = soundSettings.bgmEnabled ? soundSettings.bgmVolume : 0;
        bgmGainNode.gain.setValueAtTime(initialVol, ctx.currentTime);
        bgmGainNode.connect(ctx.destination);
    }
    return bgmGainNode;
}

/**
 * 音声ファイルを非同期ロードして AudioBuffer を取得（キャッシュ付き）
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
 */
export async function playBGM(trackKey = 'MAIN', options = {}) {
    const {
        loop = true,
        volume = soundSettings.bgmVolume,
        fadeIn = true,
        fadeInDuration = 0.8,
        offset = null
    } = options;

    currentTrackKey = trackKey;
    soundSettings.bgmVolume = volume;

    if (!soundSettings.bgmEnabled || !gameState.bgmEnabled) {
        return;
    }

    try {
        const ctx = getAudioContext();
        const gainNode = getBgmGainNode();
        const buffer = await loadBGMBuffer(trackKey);

        if (!soundSettings.bgmEnabled || !gameState.bgmEnabled) return;

        if (bgmStopTimeout) {
            clearTimeout(bgmStopTimeout);
            bgmStopTimeout = null;
        }

        if (bgmSourceNode) {
            try {
                bgmSourceNode.stop();
                bgmSourceNode.disconnect();
            } catch (e) {}
            bgmSourceNode = null;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = loop;
        source.connect(gainNode);

        const now = ctx.currentTime;
        const startOffset = offset !== null ? offset : (bgmPauseOffset % buffer.duration);

        if (fadeIn) {
            gainNode.gain.cancelScheduledValues(now);
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(soundSettings.bgmVolume, now + fadeInDuration);
        } else {
            gainNode.gain.cancelScheduledValues(now);
            gainNode.gain.setValueAtTime(soundSettings.bgmVolume, now);
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
    if (isBgmPlaying || !soundSettings.bgmEnabled || !gameState.bgmEnabled || !currentTrackKey) return;
    playBGM(currentTrackKey, { fadeIn: true, offset: bgmPauseOffset });
}

/**
 * BGMの音量を設定する (0.0 〜 1.0)
 */
export function setBGMVolume(volume) {
    const vol = Math.max(0, Math.min(1, parseFloat(volume)));
    soundSettings.bgmVolume = vol;
    saveSoundSettings();

    if (bgmGainNode && audioCtx && soundSettings.bgmEnabled) {
        const now = audioCtx.currentTime;
        bgmGainNode.gain.cancelScheduledValues(now);
        bgmGainNode.gain.setValueAtTime(vol, now);
    }
    updateSoundModalUI();
}

/**
 * 効果音のマスター音量を設定する (0.0 〜 1.0)
 */
export function setSoundVolume(volume) {
    const vol = Math.max(0, Math.min(1, parseFloat(volume)));
    soundSettings.soundVolume = vol;
    saveSoundSettings();
    updateSoundModalUI();
}

/**
 * BGM有効/無効の切り替え
 */
export function setBGMEnabled(enabled) {
    soundSettings.bgmEnabled = Boolean(enabled);
    gameState.bgmEnabled = soundSettings.bgmEnabled;
    saveSoundSettings();

    if (soundSettings.bgmEnabled) {
        if (bgmGainNode && audioCtx) {
            const now = audioCtx.currentTime;
            bgmGainNode.gain.cancelScheduledValues(now);
            bgmGainNode.gain.setValueAtTime(soundSettings.bgmVolume, now);
        }
        if (gameState.currentPhase >= 1 || isBgmPlaying) {
            playBGM(currentTrackKey || 'MAIN', { fadeIn: true });
        }
    } else {
        stopBGM({ fadeOut: true });
    }

    updateSoundButtonUI();
    updateSoundModalUI();
}

export function toggleBGM() {
    setBGMEnabled(!soundSettings.bgmEnabled);
}

/**
 * 効果音有効/無効の切り替え
 */
export function setSoundEnabled(enabled) {
    soundSettings.soundEnabled = Boolean(enabled);
    gameState.soundEnabled = soundSettings.soundEnabled;
    saveSoundSettings();

    updateSoundButtonUI();
    updateSoundModalUI();
}

export function toggleSound() {
    setSoundEnabled(!soundSettings.soundEnabled);
}

/**
 * 一括ミュート / ミュート解除の切り替え
 */
export function toggleMuteAll() {
    const isAnyActive = soundSettings.bgmEnabled || soundSettings.soundEnabled;
    if (isAnyActive) {
        // 全てOFFに
        setBGMEnabled(false);
        setSoundEnabled(false);
    } else {
        // 全てONに復帰
        setBGMEnabled(true);
        setSoundEnabled(true);
    }
}

/* --- 効果音 (Web Audio API) --- */
export function playSound(type) {
    if (!soundSettings.soundEnabled || !gameState.soundEnabled) return;
    const masterVol = soundSettings.soundVolume;
    if (masterVol <= 0.001) return;

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
            gain.gain.setValueAtTime(0.15 * masterVol, now);
            gain.gain.linearRampToValueAtTime(0.01 * masterVol, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'add') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(150, now + 0.2);
            gain.gain.setValueAtTime(0.3 * masterVol, now);
            gain.gain.linearRampToValueAtTime(0.01 * masterVol, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        } else if (type === 'draw') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15);
            gain.gain.setValueAtTime(0.2 * masterVol, now);
            gain.gain.linearRampToValueAtTime(0.01 * masterVol, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);
        } else if (type === 'bust') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(180, now);
            osc.frequency.linearRampToValueAtTime(60, now + 0.4);
            gain.gain.setValueAtTime(0.4 * masterVol, now);
            gain.gain.linearRampToValueAtTime(0.01 * masterVol, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
        } else if (type === 'count') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(900, now + 0.05);
            gain.gain.setValueAtTime(0.08 * masterVol, now);
            gain.gain.linearRampToValueAtTime(0.001 * masterVol, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
        } else if (type === 'combo') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(587.33, now); // D5
            osc.frequency.setValueAtTime(880.00, now + 0.08); // A5
            gain.gain.setValueAtTime(0.2 * masterVol, now);
            gain.gain.linearRampToValueAtTime(0.01 * masterVol, now + 0.25);
            osc.start(now);
            osc.stop(now + 0.25);
        } else if (type === 'win') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.setValueAtTime(659.25, now + 0.12);
            osc.frequency.setValueAtTime(783.99, now + 0.24);
            osc.frequency.setValueAtTime(1046.50, now + 0.36);
            gain.gain.setValueAtTime(0.2 * masterVol, now);
            gain.gain.linearRampToValueAtTime(0.01 * masterVol, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
        } else if (type === 'phase') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.setValueAtTime(659.25, now + 0.08);
            gain.gain.setValueAtTime(0.18 * masterVol, now);
            gain.gain.linearRampToValueAtTime(0.01 * masterVol, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        }
    } catch (e) {
        console.log("Audio error", e);
    }
}

/* --- UI 同期・更新 --- */
export function updateSoundButtonUI() {
    const mainBtn = document.getElementById('sound-main-btn');
    if (!mainBtn) return;

    const bgm = soundSettings.bgmEnabled;
    const se = soundSettings.soundEnabled;

    if (bgm && se) {
        mainBtn.innerHTML = '🔊 サウンド';
        mainBtn.classList.remove('muted');
        mainBtn.title = `サウンド: ON (BGM: ${Math.round(soundSettings.bgmVolume * 100)}% / SE: ${Math.round(soundSettings.soundVolume * 100)}%)`;
    } else if (bgm && !se) {
        mainBtn.innerHTML = '🎵 音楽のみ';
        mainBtn.classList.remove('muted');
        mainBtn.title = 'BGM: ON / 効果音: OFF';
    } else if (!bgm && se) {
        mainBtn.innerHTML = '🔔 効果音のみ';
        mainBtn.classList.remove('muted');
        mainBtn.title = 'BGM: OFF / 効果音: ON';
    } else {
        mainBtn.innerHTML = '🔇 ミュート';
        mainBtn.classList.add('muted');
        mainBtn.title = '全サウンド: OFF';
    }
}

export function updateSoundModalUI() {
    const bgmToggle = document.getElementById('bgm-toggle-chk');
    const bgmSlider = document.getElementById('bgm-volume-slider');
    const bgmLabel = document.getElementById('bgm-volume-label');

    const seToggle = document.getElementById('se-toggle-chk');
    const seSlider = document.getElementById('se-volume-slider');
    const seLabel = document.getElementById('se-volume-label');

    const muteBtn = document.getElementById('sound-mute-all-btn');

    if (bgmToggle) bgmToggle.checked = soundSettings.bgmEnabled;
    if (bgmSlider) bgmSlider.value = Math.round(soundSettings.bgmVolume * 100);
    if (bgmLabel) bgmLabel.textContent = `${Math.round(soundSettings.bgmVolume * 100)}%`;

    if (seToggle) seToggle.checked = soundSettings.soundEnabled;
    if (seSlider) seSlider.value = Math.round(soundSettings.soundVolume * 100);
    if (seLabel) seLabel.textContent = `${Math.round(soundSettings.soundVolume * 100)}%`;

    if (muteBtn) {
        const isAnyActive = soundSettings.bgmEnabled || soundSettings.soundEnabled;
        muteBtn.innerHTML = isAnyActive ? '🔇 一括ミュート' : '🔊 ミュート解除';
        muteBtn.classList.toggle('muted-active', !isAnyActive);
    }
}

/* --- モーダル制御 --- */
export function openSoundModal() {
    const modal = document.getElementById('sound-modal');
    if (!modal) return;
    updateSoundModalUI();
    modal.classList.add('active');
}

export function closeSoundModal() {
    const modal = document.getElementById('sound-modal');
    if (!modal) return;
    modal.classList.remove('active');
}

export function toggleSoundModal() {
    const modal = document.getElementById('sound-modal');
    if (!modal) return;
    if (modal.classList.contains('active')) {
        closeSoundModal();
    } else {
        openSoundModal();
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
        if (audioCtx.state === 'suspended' && (soundSettings.bgmEnabled || soundSettings.soundEnabled)) {
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
    if (soundSettings.bgmEnabled && !isBgmPlaying && currentTrackKey && gameState.currentPhase >= 1) {
        playBGM(currentTrackKey, { fadeIn: true });
    }
    window.removeEventListener('click', unlockAudioOnFirstGesture);
    window.removeEventListener('touchstart', unlockAudioOnFirstGesture);
}
window.addEventListener('click', unlockAudioOnFirstGesture, { passive: true });
window.addEventListener('touchstart', unlockAudioOnFirstGesture, { passive: true });

// 初期UI更新
document.addEventListener('DOMContentLoaded', () => {
    updateSoundButtonUI();
    updateSoundModalUI();
});
