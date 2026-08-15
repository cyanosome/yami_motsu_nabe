/**
 * traits.js
 * プレイヤー特性（Trait / Ability）の定義マスタおよび関連ユーティリティ
 */

export const TRAITS_DATABASE = [
    {
        id: 'none',
        name: '無垢なる食通',
        subName: '特性なし（ノーマル）',
        icon: '🥢',
        badgeColor: '#b2bec3',
        desc: '特性を持たず、基本ルールのみで挑むノーマルスタイル',
        detail: '特殊効果は一切発動しません。純粋な鍋の駆け引きを楽しみたい場合やハンデ戦に最適です。',
        params: {}
    },
    {
        id: 'burst_immune',
        name: '鋼の胃袋',
        subName: 'バースト無効',
        icon: '🛡️',
        badgeColor: '#e17055',
        desc: '甘み・辛みによるバースト判定を一切受けない',
        detail: 'どんなに激辛・激甘な具材を引いてもバースト(-50,000pt)せず、安全にお椀を作り続けられます。',
        params: {}
    },
    {
        id: 'classic_boost',
        name: '王道の探求者',
        subName: '定番の基礎点UP',
        icon: '🥬',
        badgeColor: '#00b894',
        desc: '「定番」具材の基礎点が 1.5倍 にアップ！',
        detail: 'ニラ・白菜・麺などの「定番」タグが付いた具材の基礎スコアが1.5倍になります。（例: 30,000pt ➔ 45,000pt）',
        params: {
            category: 'classic',
            multiplier: 1.5
        }
    },
    {
        id: 'combo_boost',
        name: '出汁の匠',
        subName: '役の追加点UP',
        icon: '✨',
        badgeColor: '#fdcb6e',
        desc: '成立した「役（コンボ）」の追加ボーナスが 1.3倍 にアップ！',
        detail: '成立したすべての役のボーナススコアが1.3倍になります。（例: 50,000ptの役 ➔ 65,000pt）',
        params: {
            multiplier: 1.3
        }
    },
    {
        id: 'yami_positive',
        name: '闇の美食家',
        subName: '闇素材＋',
        icon: '🌀',
        badgeColor: '#6c5ce7',
        desc: '「闇素材」のマイナス点がすべてプラス得点に反転！',
        detail: '本来マイナススコアとなる闇具材（例: -50,000pt）が正のスコア（+50,000pt）として加算されます。',
        params: {}
    }
];

/**
 * IDから特性データを取得
 * @param {string} traitId 
 * @returns {object|null}
 */
export function getTraitById(traitId) {
    if (!traitId) return null;
    return TRAITS_DATABASE.find(t => t.id === traitId) || null;
}

/**
 * ランダムに特性を取得
 * @returns {object}
 */
export function getRandomTrait() {
    const idx = Math.floor(Math.random() * TRAITS_DATABASE.length);
    return TRAITS_DATABASE[idx];
}

/**
 * 重複しないようにプレイヤー数分の特性をランダム割り当て
 * @param {number} count 
 * @returns {Array<object>}
 */
export function getRandomUniqueTraits(count) {
    const shuffled = [...TRAITS_DATABASE].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
}
