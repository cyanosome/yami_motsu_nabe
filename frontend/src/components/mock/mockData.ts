export interface Ingredient {
  id: string;
  name: string;
  category: 'motsu' | 'vege' | 'spice' | 'yami';
  score: number;
  spice: number;
  icon: string;
  desc: string;
}

export interface Player {
  id: number;
  name: string;
  isCpu: boolean;
  bowl: Ingredient[];
  isPassed: boolean;
  isBusted: boolean;
  finalScore?: number;
  scoreBreakdown?: string;
}

// 18種類の具材マスターデータ
export const INGREDIENTS_DATABASE: Ingredient[] = [
  // もつ系
  { id: 'motsu_premium', name: '極上牛もつ', category: 'motsu', score: 6, spice: 0, icon: '🥩', desc: 'ぷりぷりの脂がのった高級もつ。高得点！' },
  { id: 'motsu_normal', name: '国産牛もつ', category: 'motsu', score: 4, spice: 0, icon: '🥓', desc: '定番のうまみ豊かな牛もつ。' },
  { id: 'motsu_mince', name: 'もつダンゴ', category: 'motsu', score: 3, spice: 0, icon: '🧆', desc: '出汁がよく染み込む絶品つくね。' },
  { id: 'motsu_suburi', name: '特選ハツ・センマイ', category: 'motsu', score: 4, spice: 0, icon: '🍖', desc: 'コリコリ食感がたまらない部位。' },

  // 野菜系
  { id: 'vege_cabbage', name: 'シャキシャキキャベツ', category: 'vege', score: 2, spice: 0, icon: '🥬', desc: '甘みがあってスープとよく合う。' },
  { id: 'vege_nira', name: 'シャキッとニラ', category: 'vege', score: 2, spice: 0, icon: '🌱', desc: 'もつ鍋には欠かせないスタミナ野菜。' },
  { id: 'vege_tofu', name: '絹ごし豆腐', category: 'vege', score: 3, spice: 0, icon: '🧊', desc: 'アツアツの味が染みた豆腐。' },
  { id: 'vege_garlic', name: 'にんにくスライス', category: 'vege', score: 2, spice: 0, icon: '🧄', desc: 'もつの旨味を爆発させる！' },
  { id: 'vege_gobou', name: 'ささがきゴボウ', category: 'vege', score: 3, spice: 0, icon: '🪵', desc: '香りと食感のアクセント。' },

  // スパイス / 特殊
  { id: 'spice_chili', name: '鷹の爪唐辛子', category: 'spice', score: 1, spice: 1, icon: '🌶️', desc: 'ピリッと引き締める。激辛度+1。' },
  { id: 'spice_dashi', name: '秘伝の特製出汁', category: 'spice', score: 4, spice: 0, icon: '🍶', desc: '全体の旨味を大幅アップ。' },
  { id: 'spice_ramen', name: '〆のちゃんぽん麺', category: 'spice', score: 5, spice: 0, icon: '🍜', desc: '最後の満足度を加速させる麺。' },
  { id: 'spice_yuzu', name: '爽やか柚子胡椒', category: 'spice', score: 3, spice: 1, icon: '🍋', desc: '風味豊かな高級薬味。激辛度+1。' },

  // 闇具材（トラップ / バースト要素）
  { id: 'yami_pepper', name: 'デスソースペッパー', category: 'yami', score: -2, spice: 2, icon: '🔥', desc: '超危険！一気に激辛度+2。' },
  { id: 'yami_tawashi', name: '謎のたわし', category: 'yami', score: -6, spice: 0, icon: '🧽', desc: '食べられない！大幅マイナス点。' },
  { id: 'yami_slime', name: '紫色物体X', category: 'yami', score: -4, spice: 1, icon: '👾', desc: '闇鍋の象徴。怪しいエキスが溢れ出る。' },
  { id: 'yami_wasabi', name: '大量の生ワサビ', category: 'yami', score: -1, spice: 2, icon: '🟢', desc: '鼻に抜ける痛烈なツーン！激辛度+2。' },
  { id: 'yami_habanero', name: '魔界ハバネロ', category: 'yami', score: -3, spice: 3, icon: '💀', desc: '一発即死レベルの超極悪唐辛子！激辛度+3。' }
];

// Web Audio API 効果音再生ユーティリティ
let audioCtx: AudioContext | null = null;

export function playSound(type: 'select' | 'add' | 'draw' | 'bust' | 'win', soundEnabled: boolean = true) {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

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
    console.log("Audio play error", e);
  }
}
