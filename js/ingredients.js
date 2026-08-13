export const INGREDIENTS_DATABASE = [
            // もつ系
            { id: 'motsu_premium', name: '極上牛もつ', category: 'motsu', score: 6, taste: 0, icon: '🥩', iconUrl: 'assets/icon/Motsu.png', allowedSizes: ['large'], desc: 'ぷりぷりの脂がのった高級もつ。高得点！', unique: true },
            { id: 'motsu_normal', name: '国産牛もつ', category: 'motsu', score: 4, taste: 0, icon: '🥓', iconUrl: 'assets/icon/Motsu.png', allowedSizes: ['small', 'mid', 'large'], desc: '定番のうまみ豊かな牛もつ。', unique: false },
            { id: 'motsu_mince', name: 'もつダンゴ', category: 'motsu', score: 3, taste: 0, icon: '🧆', allowedSizes: ['small', 'mid'], desc: '出汁がよく染み込む絶品つくね。', unique: false },
            { id: 'motsu_suburi', name: '特選ハツ・センマイ', category: 'motsu', score: 4, taste: 0, icon: '🍖', allowedSizes: ['mid', 'large'], desc: 'コリコリ食感がたまらない部位。', unique: false },
            
            // 野菜系
            { id: 'vege_cabbage', name: 'シャキシャキキャベツ', category: 'vege', score: 2, taste: 0, icon: '🥬', iconUrl: 'assets/icon/NapaCabbage.png', allowedSizes: ['small'], desc: '甘みがあってスープとよく合う。', unique: false },
            { id: 'vege_nira', name: 'シャキッとニラ', category: 'vege', score: 2, taste: 0, icon: '🌱', iconUrl: 'assets/icon/GarlicChives.png', allowedSizes: ['small', 'mid'], desc: 'もつ鍋には欠かせないスタミナ野菜。', unique: false },
            { id: 'vege_tofu', name: '絹ごし豆腐', category: 'vege', score: 3, taste: 0, icon: '🧊', allowedSizes: ['mid', 'large'], desc: 'アツアツの味が染みた豆腐。', unique: false },
            { id: 'vege_garlic', name: 'にんにくスライス', category: 'vege', score: 2, taste: 0, icon: '🧄', allowedSizes: ['small', 'mid'], desc: 'もつの旨味を爆発させる！', unique: false },
            { id: 'vege_gobou', name: 'ささがきゴボウ', category: 'vege', score: 3, taste: 0, icon: '🪵', allowedSizes: ['small', 'mid'], desc: '香りと食感のアクセント。', unique: false },

            // スパイス / 特殊
            { id: 'spice_chili', name: '鷹の爪唐辛子', category: 'spice', score: 1, taste: 1, icon: '🌶️', allowedSizes: ['small', 'mid', 'large'], desc: 'ピリッと引き締める。辛さ+1。', unique: false },
            { id: 'spice_dashi', name: '秘伝の特製出汁', category: 'spice', score: 4, taste: 0, icon: '🍶', allowedSizes: ['mid', 'large'], desc: '全体の旨味を大幅アップ。', unique: false },
            { id: 'spice_ramen', name: '〆のちゃんぽん麺', category: 'spice', score: 5, taste: 0, icon: '🍜', allowedSizes: ['mid', 'large'], desc: '最後の満足度を加速させる麺。', unique: false },
            { id: 'spice_yuzu', name: '爽やか柚子胡椒', category: 'spice', score: 3, taste: 1, icon: '🍋', allowedSizes: ['small', 'mid'], desc: '風味豊かな高級薬味。辛さ+1。', unique: false },

            // お菓子系 (辛さを相殺する甘み属性)
            { id: 'sweets_candy', name: 'カラフルキャンディ', category: 'sweets', score: 2, taste: -1, icon: '🍬', allowedSizes: ['small', 'mid'], desc: '甘くて可愛いお菓子。辛さを和らげる！(甘さ-1)', unique: false },
            { id: 'sweets_dogcookie', name: '子犬のクッキー', category: 'sweets', score: 4, taste: -1, icon: '🍪', iconUrl: 'assets/icon/DogCookie.png', allowedSizes: ['small', 'mid', 'large'], desc: '犬の形をしたクッキー。甘くて香ばしい！(甘さ-1)', unique: true },
            { id: 'sweets_donut', name: '濃厚ドーナツ', category: 'sweets', score: 3, taste: -2, icon: '🍩', iconUrl: 'assets/icon/Donut.png', allowedSizes: ['mid', 'large'], desc: '甘さたっぷり！味覚を一気に甘くする。(甘さ-2)', unique: false },

            // 闇具材（トラップ / バースト要素）
            { id: 'yami_pepper', name: 'デスソースペッパー', category: 'yami', score: -2, taste: 2, icon: '🔥', allowedSizes: ['small', 'mid', 'large'], desc: '超危険！一気に辛さ+2。', unique: false },
            { id: 'yami_tyre', name: 'ゴムタイヤ ', category: 'yami', score: -6, taste: 0, icon: '🛞', iconUrl: 'assets/icon/Tire.png', allowedSizes: ['large'], desc: '固くて噛み切れないタイヤ！食べられない！大幅マイナス点。', unique: true },
            { id: 'yami_slime', name: '紫色物体X', category: 'yami', score: -4, taste: 1, icon: '👾', allowedSizes: ['mid', 'large'], desc: '闇鍋の象徴。怪しいエキスが溢れ出る。', unique: true },
            { id: 'yami_wasabi', name: '大量の生ワサビ', category: 'yami', score: -1, taste: 2, icon: '🟢', allowedSizes: ['small', 'mid'], desc: '鼻に抜ける痛烈なツーン！辛さ+2。', unique: false },
            { id: 'yami_hellsauce', name: '地獄の激辛ソース', category: 'yami', score: -3, taste: 3, icon: '🍾', iconUrl: 'assets/icon/HellSauce.png', allowedSizes: ['mid', 'large'], desc: '一発即死レベルの極悪激辛ソース！(辛さ+3)', unique: true },
            { id: 'yami_syrup', name: '大量の角砂糖シロップ', category: 'yami', score: -3, taste: -3, icon: '🍯', allowedSizes: ['mid', 'large'], desc: '超危険！一発即死レベルの激甘トラップ！(甘さ-3)', unique: false }
        ];
        
export function createIngredientInstance(baseItem, forceSize = null) {
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

export const COMBOS_DATABASE = [
    {
        id: 'combo_classic',
        name: '王道組み合わせ',
        score: 3,
        icon: '🍲',
        conditionText: 'もつ系 × 1以上 + 野菜系 × 1以上',
        desc: 'もつの旨味とシャキシャキ野菜の甘みがベストマッチした王道もつ鍋！',
        check: (bowl) => bowl.some(b => b.category === 'motsu') && bowl.some(b => b.category === 'vege')
    },
    {
        id: 'combo_dashi',
        name: '出汁マリアージュ',
        score: 2,
        icon: '🍶',
        conditionText: 'もつ系 × 1以上 + 薬味/出汁系 × 1以上',
        desc: '特製出汁や薬味がもつの脂を引き立てる絶品マリアージュ！',
        check: (bowl) => bowl.some(b => b.category === 'motsu') && bowl.some(b => b.category === 'spice')
    },
    {
        id: 'combo_mega_motsu',
        name: 'メガ盛りもつコンボ',
        score: 4,
        icon: '🥩',
        conditionText: 'もつ系 × 3以上',
        desc: 'とにかくもつを喰らい尽くす！もつ好きにはたまらない圧倒的満足感。',
        check: (bowl) => bowl.filter(b => b.category === 'motsu').length >= 3
    }
];

export function getRecommendedCombos(bowl = []) {
    const hasMotsu = bowl.some(b => b.category === 'motsu');
    const hasVege = bowl.some(b => b.category === 'vege');
    const hasSpice = bowl.some(b => b.category === 'spice');
    const motsuCount = bowl.filter(b => b.category === 'motsu').length;

    if (!bowl || bowl.length === 0) {
        return [
            {
                ...COMBOS_DATABASE.find(c => c.id === 'combo_classic'),
                statusText: '💡 おすすめ狙い目',
                statusType: 'default',
                priority: 1
            },
            {
                ...COMBOS_DATABASE.find(c => c.id === 'combo_dashi'),
                statusText: '💡 スープの狙い目',
                statusType: 'default',
                priority: 2
            }
        ];
    }

    const evaluated = COMBOS_DATABASE.map(combo => {
        let isAchieved = combo.check(bowl);
        let statusText = '';
        let statusType = 'normal';
        let priority = 0;

        if (combo.id === 'combo_classic') {
            if (isAchieved) {
                statusText = '🎉 達成中！';
                statusType = 'achieved';
                priority = 80;
            } else if (hasMotsu && !hasVege) {
                statusText = '🎯 あと「野菜」で完成！';
                statusType = 'close';
                priority = 100;
            } else if (!hasMotsu && hasVege) {
                statusText = '🎯 あと「もつ」で完成！';
                statusType = 'close';
                priority = 95;
            } else {
                statusText = '💡 狙い目コンボ';
                statusType = 'default';
                priority = 40;
            }
        } else if (combo.id === 'combo_dashi') {
            if (isAchieved) {
                statusText = '🎉 達成中！';
                statusType = 'achieved';
                priority = 75;
            } else if (hasMotsu && !hasSpice) {
                statusText = '🎯 あと「薬味/出汁」で完成！';
                statusType = 'close';
                priority = 90;
            } else if (!hasMotsu && hasSpice) {
                statusText = '🎯 あと「もつ」で完成！';
                statusType = 'close';
                priority = 85;
            } else {
                statusText = '💡 狙い目コンボ';
                statusType = 'default';
                priority = 35;
            }
        } else if (combo.id === 'combo_mega_motsu') {
            if (isAchieved) {
                statusText = '🎉 達成中！';
                statusType = 'achieved';
                priority = 85;
            } else if (motsuCount === 2) {
                statusText = '🎯 あと「もつ」1個で完成！';
                statusType = 'close';
                priority = 98;
            } else if (motsuCount === 1) {
                statusText = '🎯 あと「もつ」2個必要';
                statusType = 'normal';
                priority = 50;
            } else {
                statusText = '💡 もつ特化狙い目';
                statusType = 'default';
                priority = 30;
            }
        }

        return {
            ...combo,
            isAchieved,
            statusText,
            statusType,
            priority
        };
    });

    evaluated.sort((a, b) => b.priority - a.priority);
    return evaluated.slice(0, 2);
}