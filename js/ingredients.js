export const INGREDIENTS_DATABASE = [
    // ----------------------------------------------------
    // ■ 汎用シルエット具材 (unique: false)
    // ----------------------------------------------------
    // もつ
    {
        id: 'motsu_normal',
        name: 'もつ',
        category: 'motsu',
        score: 40000,
        taste: 0,
        icon: '🥩',
        iconUrl: 'assets/icon/Motsu.png',
        allowedSizes: ['small', 'mid', 'large'],
        desc: 'もつ鍋の主役！',
        unique: false
    },

    // 定番（野菜・薬味・麺などを統合）
    {
        id: 'classic_nira',
        name: 'にら',
        category: 'classic',
        score: 30000,
        taste: 0,
        icon: '🌱',
        iconUrl: 'assets/icon/GarlicChives.png',
        allowedSizes: ['small', 'mid', 'large'],
        desc: '香りと栄養満点の定番野菜',
        unique: false
    },
    {
        id: 'classic_hakusai',
        name: '白菜',
        category: 'classic',
        score: 30000,
        taste: 0,
        icon: '🥬',
        iconUrl: 'assets/icon/NapaCabbage.png',
        allowedSizes: ['small', 'mid', 'large'],
        desc: '出汁の甘みが増す定番具材',
        unique: false
    },
    {
        id: 'classic_men',
        name: '麺',
        category: 'classic',
        score: 40000,
        taste: 0,
        icon: '🍜',
        iconUrl: null,
        allowedSizes: ['small', 'mid', 'large'],
        desc: '鍋の旨味を一滴残らず吸い上げる至高の〆。',
        unique: false
    },

    // 辛味
    {
        id: 'spice_chili',
        name: 'とうがらし',
        category: 'spice',
        score: 20000,
        taste: 200,
        icon: '🌶️',
        iconUrl: null,
        allowedSizes: ['small', 'mid', 'large'],
        desc: 'ピリッとスープを引き締める定番の辛味',
        unique: false
    },
    {
        id: 'spice_pepper',
        name: '胡椒',
        category: 'spice',
        score: 20000,
        taste: 200,
        icon: '🧂',
        iconUrl: null,
        allowedSizes: ['small', 'mid', 'large'],
        desc: 'スパイシーな香りで食欲をそそる本格薬味',
        unique: false
    },
    {
        id: 'spice_mentai',
        name: '明太子',
        category: 'spice',
        score: 30000,
        taste: 200,
        icon: '🔴',
        iconUrl: null,
        allowedSizes: ['small', 'mid', 'large'],
        desc: 'ピリ辛の粒々がスープに溶け込む贅沢具材',
        unique: false
    },

    // 甘味
    {
        id: 'sweets_castella',
        name: 'カステラ',
        category: 'sweets',
        score: 20000,
        taste: -200,
        icon: '🥮',
        iconUrl: null,
        allowedSizes: ['small', 'mid', 'large'],
        desc: 'しっとり甘いカステラ',
        unique: false
    },
    {
        id: 'sweets_choco',
        name: 'チョコ',
        category: 'sweets',
        score: 20000,
        taste: -200,
        icon: '🍫',
        iconUrl: null,
        allowedSizes: ['small', 'mid', 'large'],
        desc: '濃厚な甘みとコクが広がるお菓子具材',
        unique: false
    },
    {
        id: 'sweets_lollipop',
        name: 'キャンディ',
        category: 'sweets',
        score: 20000,
        taste: -200,
        icon: '🍭',
        iconUrl: null,
        allowedSizes: ['small', 'mid', 'large'],
        desc: 'ポップで甘いキャンディ',
        unique: false
    },

    // 闇
    {
        id: 'yami_compass',
        name: '羅針盤',
        category: 'yami',
        score: -30000,
        taste: 0,
        icon: '🧭',
        iconUrl: null,
        allowedSizes: ['small', 'mid', 'large'],
        desc: 'ぐるぐる針が回る謎の羅針盤',
        unique: false
    },
    {
        id: 'yami_pencil',
        name: 'えんぴつ',
        category: 'yami',
        score: -20000,
        taste: 0,
        icon: '✏️',
        iconUrl: null,
        allowedSizes: ['small', 'mid', 'large'],
        desc: '鍋の底に沈む筆記用具',
        unique: false
    },
    {
        id: 'yami_gear',
        name: '歯車',
        category: 'yami',
        score: -30000,
        taste: 0,
        icon: '⚙️',
        iconUrl: null,
        allowedSizes: ['small', 'mid', 'large'],
        desc: '噛んだら歯が折れる重厚な鉄の歯車。',
        unique: false
    },
    {
        id: 'yami_capsule',
        name: 'カプセル錠剤',
        category: 'yami',
        score: -30000,
        taste: 0,
        icon: '💊',
        iconUrl: null,
        allowedSizes: ['small', 'mid', 'large'],
        desc: '何が入っているか分からない怪しい薬品',
        unique: false
    },

    // ----------------------------------------------------
    // ■ ユニークシルエット具材 (unique: true)
    // ----------------------------------------------------
    // 【至高のモツ型】(最高峰・極大スコア)
    {
        id: 'u_motsu_supreme',
        name: '至高のモツ',
        category: 'motsu',
        silhouetteType: 'motsu_supreme',
        score: 100000,
        taste: 0,
        icon: '🥩',
        iconUrl: null,
        allowedSizes: ['mid'],
        desc: '一本丸ごとの極上もつ',
        unique: true
    },
    {
        id: 'u_sweets_churros',
        name: 'チュロス',
        category: 'sweets',
        silhouetteType: 'motsu_supreme',
        score: 80000,
        taste: -400,
        icon: '🥨',
        iconUrl: null,
        allowedSizes: ['mid'],
        desc: '巨大チュロス！強烈な甘さ！',
        unique: true
    },
    {
        id: 'u_spice_tteokbokki',
        name: 'トッポギ',
        category: 'spice',
        silhouetteType: 'motsu_supreme',
        score: 80000,
        taste: 400,
        icon: '🥢',
        iconUrl: null,
        allowedSizes: ['mid'],
        desc: '激辛ロングトッポギ！',
        unique: true
    },
    {
        id: 'u_yami_magnet',
        name: '磁石',
        category: 'yami',
        silhouetteType: 'motsu_supreme',
        score: -90000,
        taste: 0,
        icon: '🧲',
        iconUrl: null,
        allowedSizes: ['mid'],
        desc: '湾曲した巨大磁石！',
        unique: true
    },

    // 【ソース型】(特大スコア & 味激変)
    {
        id: 'u_classic_dashi',
        name: '至高のダシ',
        category: 'classic',
        silhouetteType: 'sauce',
        score: 90000,
        taste: 0,
        icon: '🍶',
        iconUrl: null,
        allowedSizes: ['mid'],
        desc: '創業以来継ぎ足された伝説の出汁',
        unique: true
    },
    {
        id: 'u_sweets_condensed',
        name: 'ラグドゥネームソース',
        category: 'sweets',
        silhouetteType: 'sauce',
        score: 70000,
        taste: -500,
        icon: '🥛',
        iconUrl: null,
        allowedSizes: ['mid'],
        desc: '溢れ出る濃厚練乳!',
        unique: true
    },
    {
        id: 'u_spice_hellsauce',
        name: 'ヘルソース',
        category: 'spice',
        silhouetteType: 'sauce',
        score: 70000,
        taste: 500,
        icon: '🍾',
        iconUrl: 'assets/icon/HellSauce.png',
        allowedSizes: ['mid'],
        desc: '鍋を地獄へと変える辛味ソース！',
        unique: true
    },
    {
        id: 'u_yami_detergent',
        name: '洗剤',
        category: 'yami',
        silhouetteType: 'sauce',
        score: -80000,
        taste: 0,
        icon: '🧴',
        iconUrl: null,
        allowedSizes: ['mid'],
        desc: '洗剤！絶対口にしてはならない',
        unique: true
    },

    // 【ドーナツ型】(中〜大スコア)
    {
        id: 'u_sweets_donut',
        name: 'ドーナツ',
        category: 'sweets',
        silhouetteType: 'donut',
        score: 60000,
        taste: -300,
        icon: '🍩',
        iconUrl: 'assets/icon/Donut.png',
        allowedSizes: ['mid'],
        desc: '甘みたっぷりのドーナツ',
        unique: true
    },
    {
        id: 'u_yami_tire',
        name: 'タイヤ',
        category: 'yami',
        silhouetteType: 'donut',
        score: -60000,
        taste: 0,
        icon: '🛞',
        iconUrl: 'assets/icon/Tire.png',
        allowedSizes: ['mid'],
        desc: '噛み切れるはずもない',
        unique: true
    },
    {
        id: 'u_motsu_hatsumoto',
        name: 'はつもと',
        category: 'motsu',
        silhouetteType: 'donut',
        score: 60000,
        taste: 0,
        icon: '🥩',
        iconUrl: null,
        allowedSizes: ['mid'],
        desc: '希少部位!抜群の歯ごたえと旨味！',
        unique: true
    },

    // 【長靴型】(中〜大スコア)
    {
        id: 'u_sweets_dogcookie',
        name: '犬型のマラサダ',
        category: 'sweets',
        silhouetteType: 'boots',
        score: 60000,
        taste: -300,
        icon: '🍪',
        iconUrl: 'assets/icon/DogCookie.png',
        allowedSizes: ['mid'],
        desc: '犬の形の香ばしいマラサダ',
        unique: true
    },
    {
        id: 'u_yami_boots',
        name: '長靴',
        category: 'yami',
        silhouetteType: 'boots',
        score: -60000,
        taste: 0,
        icon: '👢',
        iconUrl: 'assets/icon/Shoes.png',
        allowedSizes: ['mid'],
        desc: '泥とゴムの臭いがする',
        unique: true
    },
    {
        id: 'u_classic_matsutake',
        name: '松茸',
        category: 'classic',
        silhouetteType: 'boots',
        score: 60000,
        taste: 0,
        icon: '🍄',
        iconUrl: null,
        allowedSizes: ['mid'],
        desc: '高級な松茸。芳醇な香り！',
        unique: true
    },

    // 【立方体型】(中スコア)
    {
        id: 'u_classic_tofu',
        name: 'とうふ',
        category: 'classic',
        silhouetteType: 'cube',
        score: 40000,
        taste: 0,
        icon: '🧊',
        iconUrl: null,
        allowedSizes: ['mid'],
        desc: '四角くカットされた純白の豆腐',
        unique: true
    },
    {
        id: 'u_spice_curry',
        name: 'カレールー',
        category: 'spice',
        silhouetteType: 'cube',
        score: 40000,
        taste: 300,
        icon: '🍛',
        iconUrl: null,
        allowedSizes: ['mid'],
        desc: '鍋が一瞬でスパイスカレーに！',
        unique: true
    },
    {
        id: 'u_sweets_sugar',
        name: '角砂糖',
        category: 'sweets',
        silhouetteType: 'cube',
        score: 40000,
        taste: -300,
        icon: '🧊',
        iconUrl: null,
        allowedSizes: ['mid'],
        desc: '豆腐と見紛う四角い角砂糖',
        unique: true
    },
    {
        id: 'u_yami_eraser',
        name: '消しゴム',
        category: 'yami',
        silhouetteType: 'cube',
        score: -40000,
        taste: 0,
        icon: '🧼',
        iconUrl: null,
        allowedSizes: ['mid'],
        desc: '文字も点数も削られる',
        unique: true
    }
];
        
export function createIngredientInstance(baseItem, forceSize = null) {
    const isUnique = !!baseItem.unique;
    const allowed = baseItem.allowedSizes || ['mid'];
    // ユニーク具材は強制的に 'mid' 固定
    const chosenSize = isUnique ? 'mid' : (forceSize || allowed[Math.floor(Math.random() * allowed.length)]);
    
    let score = baseItem.score;
    let taste = baseItem.taste || 0;
    let sizeLabel = '';
    let sizeBadgeText = '中';
    let sizeBadgeClass = 'size-mid';

    if (isUnique) {
        // ユニーク具材はサイズ固定のため名前修飾なし、ベース値をそのまま適用
        sizeLabel = '';
        sizeBadgeText = '中';
        sizeBadgeClass = 'size-mid';
    } else {
        // 汎用具材のサイズ連動計算 (万点スケール)
        if (chosenSize === 'small') {
            score = (baseItem.score >= 0) 
                ? Math.max(10000, Math.floor(baseItem.score * 0.6))
                : Math.min(-10000, Math.ceil(baseItem.score * 0.6));
            // taste: 小は ±100
            if (baseItem.taste > 0) taste = 100;
            else if (baseItem.taste < 0) taste = -100;
            else taste = 0;

            sizeLabel = ' (小)';
            sizeBadgeText = '小';
            sizeBadgeClass = 'size-small';
        } else if (chosenSize === 'large') {
            score = (baseItem.score >= 0)
                ? Math.ceil(baseItem.score * 1.5)
                : Math.floor(baseItem.score * 1.5);
            // taste: 大は ±300
            if (baseItem.taste > 0) taste = 300;
            else if (baseItem.taste < 0) taste = -300;
            else taste = 0;

            sizeLabel = ' (大盛)';
            sizeBadgeText = '大';
            sizeBadgeClass = 'size-large';
        } else {
            // mid: 中は ±200 (ベース値)
            if (baseItem.taste > 0) taste = 200;
            else if (baseItem.taste < 0) taste = -200;
            else taste = 0;
        }
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
    // ----------------------------------------------------
    // ■ 基本・もつ系
    // ----------------------------------------------------
    {
        id: 'combo_motsu_pot',
        name: 'もつ鍋',
        score: 20000,
        icon: '🍲',
        conditionText: 'お椀にもつが1枚以上含まれている',
        desc: '基本にして至高。もつが入ってこそのもつ鍋！',
        check: (bowl) => bowl.some(b => b.category === 'motsu')
    },
    {
        id: 'combo_classic_motsu',
        name: '定番のもつ鍋',
        score: 30000,
        icon: '🍲',
        conditionText: '「もつ」系1枚以上 ＋「定番具材」1枚以上',
        desc: 'もつの旨味と定番具材（にら・白菜・麺・出汁等）が調和した安定の味。',
        check: (bowl) => bowl.some(b => b.category === 'motsu') && bowl.some(b => b.category === 'classic')
    },
    {
        id: 'combo_have_not',
        name: 'もたざるもの',
        score: -30000,
        icon: '🙅',
        conditionText: 'お椀に「もつ」が1枚も入っていない',
        desc: 'もつが入っていない鍋をもつ鍋と呼べるのか…？悲哀の減点ペナルティ。',
        check: (bowl) => bowl.length > 0 && !bowl.some(b => b.category === 'motsu')
    },
    {
        id: 'combo_kids_pot',
        name: 'お子様もつ鍋',
        score: 80000,
        icon: '👶',
        conditionText: '「もつ」系具材が4枚以上',
        desc: '野菜は嫌い！肉だけをもりもり食べたいわんぱくな鍋。',
        check: (bowl) => bowl.filter(b => b.category === 'motsu').length >= 4
    },
    {
        id: 'combo_hermit_motsu',
        name: '世捨てもつ',
        score: 50000,
        icon: '🧘',
        conditionText: 'お椀の具材が「もつ」1枚のみ',
        desc: '余計な飾りは一切不要。ただ一粒のもつと向き合う求道者の境地。',
        check: (bowl) => bowl.length === 1 && bowl[0].category === 'motsu'
    },
    {
        id: 'combo_all_the_same',
        name: '全部同じじゃないですか',
        score: 90000,
        icon: '🥩',
        conditionText: '「もつ」＋「至高のモツ」＋「はつもと」',
        desc: '「これ全部同じもつでは…？」「ちがいます！部位と格が違います！」',
        check: (bowl) => {
            const ids = bowl.map(b => b.baseId || b.id.split('_')[0]);
            return ids.includes('motsu_normal') && ids.includes('u_motsu_supreme') && ids.includes('u_motsu_hatsumoto');
        }
    },
    {
        id: 'combo_thin_meat',
        name: '肉はペラペラですか',
        score: 40000,
        icon: '🥓',
        conditionText: 'お椀の「もつ」具材が全て小サイズ(small)のみ',
        desc: '「これ肉入ってます…？」薄切り小粒もつでかさ増しした鍋。',
        check: (bowl) => {
            const motsuItems = bowl.filter(b => b.category === 'motsu');
            return motsuItems.length >= 1 && motsuItems.every(b => b.size === 'small');
        }
    },

    // ----------------------------------------------------
    // ■ ポーカー・サイズ系
    // ----------------------------------------------------
    {
        id: 'combo_two_card',
        name: '２カード',
        score: 10000,
        icon: '✌️',
        conditionText: '同じ具材が2枚（サイズ不問）',
        desc: '同じ具材を2枚揃えたお手軽ペア役！',
        check: (bowl) => {
            const counts = {};
            bowl.forEach(b => {
                const id = b.baseId || b.id.split('_')[0];
                counts[id] = (counts[id] || 0) + 1;
            });
            const max = Math.max(0, ...Object.values(counts));
            return max === 2;
        }
    },
    {
        id: 'combo_three_card',
        name: '３カード',
        score: 30000,
        icon: '☘️',
        conditionText: '同じ具材が3枚（サイズ不問）',
        desc: '同じ具材が3枚集結！トリプルコンボ！',
        check: (bowl) => {
            const counts = {};
            bowl.forEach(b => {
                const id = b.baseId || b.id.split('_')[0];
                counts[id] = (counts[id] || 0) + 1;
            });
            const max = Math.max(0, ...Object.values(counts));
            return max === 3;
        }
    },
    {
        id: 'combo_four_card',
        name: '４カード',
        score: 60000,
        icon: '🃏',
        conditionText: '同じ具材が4枚以上（サイズ不問）',
        desc: '同じ具材が4枚！奇跡のカルテット！',
        check: (bowl) => {
            const counts = {};
            bowl.forEach(b => {
                const id = b.baseId || b.id.split('_')[0];
                counts[id] = (counts[id] || 0) + 1;
            });
            const max = Math.max(0, ...Object.values(counts));
            return max >= 4;
        }
    },
    {
        id: 'combo_frugal',
        name: '質素倹約',
        score: 50000,
        icon: '🥣',
        conditionText: 'お椀が3枚以上かつ全て小サイズ(small)',
        desc: '小ぶりな具材でちまちま味わう、慎ましくも温かい一杯。',
        check: (bowl) => bowl.length >= 3 && bowl.every(b => b.size === 'small')
    },
    {
        id: 'combo_all_or_nothing',
        name: '一か八か',
        score: 80000,
        icon: '💥',
        conditionText: 'お椀が3枚以上かつ全て大盛サイズ(large)',
        desc: '溢れんばかりの大盛具材で攻める、豪快なハイリスク鍋！',
        check: (bowl) => bowl.length >= 3 && bowl.every(b => b.size === 'large')
    },

    // ----------------------------------------------------
    // ■ カテゴリ・味覚バランス系
    // ----------------------------------------------------
    {
        id: 'combo_balanced_diet',
        name: 'バランスの取れた食事',
        score: 100000,
        icon: '🍱',
        conditionText: '全5ジャンル（もつ・定番・辛味・甘味・闇）が各1枚以上',
        desc: '全ジャンルが揃った、カオスでありながら完璧な黄金バランス。',
        check: (bowl) => ['motsu', 'classic', 'spice', 'sweets', 'yami'].every(cat => bowl.some(b => b.category === cat))
    },
    {
        id: 'combo_gentle_life',
        name: 'やさしいせいかつ',
        score: 40000,
        icon: '🥗',
        conditionText: '「にら」＋「白菜」を含む',
        desc: '新鮮野菜たっぷり。身体に染み渡るヘルシーな味わい。',
        check: (bowl) => {
            const ids = bowl.map(b => b.baseId || b.id.split('_')[0]);
            return ids.includes('classic_nira') && ids.includes('classic_hakusai');
        }
    },
    {
        id: 'combo_shojin',
        name: '精進料理',
        score: 70000,
        icon: '🎋',
        conditionText: 'お椀が2枚以上かつ「にら」「白菜」「松茸」「とうふ」のみで構成',
        desc: '殺生を断ち、清らかな野菜とキノコ・豆腐だけで仕立てた仏の御膳。',
        check: (bowl) => {
            if (bowl.length < 2) return false;
            const valid = ['classic_nira', 'classic_hakusai', 'u_classic_matsutake', 'u_classic_tofu'];
            return bowl.every(b => valid.includes(b.baseId || b.id.split('_')[0]));
        }
    },
    {
        id: 'combo_hot_pot',
        name: '火鍋',
        score: 60000,
        icon: '🔥',
        conditionText: '辛味の合計値が +300以上',
        desc: '真っ赤に燃え盛る激辛スパイス尽くし！汗だくで平らげる本格火鍋。',
        check: (bowl) => bowl.reduce((acc, cur) => acc + (cur.taste || 0), 0) >= 300
    },
    {
        id: 'combo_dos_pink',
        name: 'どすピンクですわ！',
        score: 60000,
        icon: '💖',
        conditionText: '甘味の合計値が -300以下',
        desc: '視界が甘いピンク色に染まるほどの猛烈な糖分ラッシュ！',
        check: (bowl) => bowl.reduce((acc, cur) => acc + (cur.taste || 0), 0) <= -300
    },
    {
        id: 'combo_curry_pot',
        name: 'カレー鍋',
        score: 50000,
        icon: '🍛',
        conditionText: '「カレールー」を含み、それ以外の辛味・甘味具材を含まない',
        desc: '純粋なカレースパイスの芳醇な香りを楽しむ王道カレー鍋。',
        check: (bowl) => {
            const hasCurry = bowl.some(b => (b.baseId || b.id.split('_')[0]) === 'u_spice_curry');
            if (!hasCurry) return false;
            const hasOtherSpiceOrSweet = bowl.some(b => {
                const id = b.baseId || b.id.split('_')[0];
                if (id === 'u_spice_curry') return false;
                return b.category === 'spice' || b.category === 'sweets';
            });
            return !hasOtherSpiceOrSweet;
        }
    },
    {
        id: 'combo_minimum_life',
        name: '最低限度の生活',
        score: 30000,
        icon: '📦',
        conditionText: '「定番具材」1枚以上 ＋「闇具材」1枚以上',
        desc: 'わずかな野菜と怪しいゴミで飢えをしのぐ、限界サバイバル鍋。',
        check: (bowl) => bowl.some(b => b.category === 'classic') && bowl.some(b => b.category === 'yami')
    },
    {
        id: 'combo_trick_or_treat',
        name: 'TRICK OR TREAT',
        score: 70000,
        icon: '🎃',
        conditionText: '「甘味」2枚以上 ＋「闇」2枚以上',
        desc: 'お菓子くれなきゃイタズラしちゃうぞ！混沌と甘さが交錯するハロウィン鍋。',
        check: (bowl) => bowl.filter(b => b.category === 'sweets').length >= 2 && bowl.filter(b => b.category === 'yami').length >= 2
    },
    {
        id: 'combo_dark_lord',
        name: '♰暗黒素材大明神♰',
        score: 450000,
        icon: '💀',
        conditionText: 'お椀が3枚以上かつ全て闇具材',
        desc: '危険物とゴミだけで満たされた伝説の禁忌鍋。闇のマイナスを全て打ち消し、一撃必殺の大逆転勝利を掴み取る！',
        check: (bowl) => bowl.length >= 3 && bowl.every(b => b.category === 'yami')
    },

    // ----------------------------------------------------
    // ■ 特定ペア・トリオ系
    // ----------------------------------------------------
    {
        id: 'combo_mentai_motsu',
        name: '明太もつ鍋',
        score: 60000,
        icon: '🔴',
        conditionText: '「明太子」＋「麺」＋「もつ」系',
        desc: '明太子のプチプチと濃厚なもつ、絡みつく麺が織りなす博多名物！',
        check: (bowl) => {
            const ids = bowl.map(b => b.baseId || b.id.split('_')[0]);
            return ids.includes('spice_mentai') && ids.includes('classic_men') && bowl.some(b => b.category === 'motsu');
        }
    },
    {
        id: 'combo_hell',
        name: '地獄',
        score: 100000,
        icon: '🔥',
        conditionText: '「ヘルソース」＋「ラグドゥネームソース」',
        desc: '激辛と激甘の極限ソースが激突！味覚を破壊する地獄の鍋。',
        check: (bowl) => {
            const ids = bowl.map(b => b.baseId || b.id.split('_')[0]);
            return ids.includes('u_spice_hellsauce') && ids.includes('u_sweets_condensed');
        }
    },
    {
        id: 'combo_stubborn_stain',
        name: '頑固な汚れ',
        score: 70000,
        icon: '🫧',
        conditionText: '「カレールー」＋「洗剤」',
        desc: 'カレーの落ちにくい油汚れを洗剤で強力洗浄！？',
        check: (bowl) => {
            const ids = bowl.map(b => b.baseId || b.id.split('_')[0]);
            return ids.includes('u_spice_curry') && ids.includes('u_yami_detergent');
        }
    },
    {
        id: 'combo_choco_fondue',
        name: 'チョコフォンデュ',
        score: 80000,
        icon: '🍫',
        conditionText: '「チョコ」＋「もつ」系 ＋「チュロス」',
        desc: 'もつとチュロスをとろけるチョコにディップした禁断のスイーツ鍋。',
        check: (bowl) => {
            const ids = bowl.map(b => b.baseId || b.id.split('_')[0]);
            return ids.includes('sweets_choco') && ids.includes('u_sweets_churros') && bowl.some(b => b.category === 'motsu');
        }
    },
    {
        id: 'combo_bright_reply',
        name: '明るい返事',
        score: 40000,
        icon: '🍭',
        conditionText: '「チョコ」＋「キャンディ」',
        desc: '「ハイ！チュウ・チョコ」元気いっぱいの返事とお菓子のハーモニー。',
        check: (bowl) => {
            const ids = bowl.map(b => b.baseId || b.id.split('_')[0]);
            return ids.includes('sweets_choco') && ids.includes('sweets_lollipop');
        }
    },
    {
        id: 'combo_white_box',
        name: '白箱',
        score: 80000,
        icon: '🧊',
        conditionText: '「角砂糖」＋「消しゴム」＋「とうふ」',
        desc: 'どれも真っ白な直方体！見分けがつかないサイコロ三銃士。',
        check: (bowl) => {
            const ids = bowl.map(b => b.baseId || b.id.split('_')[0]);
            return ids.includes('u_sweets_sugar') && ids.includes('u_yami_eraser') && ids.includes('u_classic_tofu');
        }
    },
    {
        id: 'combo_metaphysical',
        name: '形而上学的もつ鍋',
        score: 80000,
        icon: '🍩',
        conditionText: '「ドーナツ」＋「タイヤ」',
        desc: '同じドーナツ型でありながら、甘美と硬質という対立概念を内包した哲学的一杯。',
        check: (bowl) => {
            const ids = bowl.map(b => b.baseId || b.id.split('_')[0]);
            return ids.includes('u_sweets_donut') && ids.includes('u_yami_tire');
        }
    },
    {
        id: 'combo_puss_in_boots',
        name: '長靴をはいた犬',
        score: 80000,
        icon: '👢',
        conditionText: '「長靴」＋「犬型のマラサダ」',
        desc: '長靴の影に寄り添う犬型のマラサダ。童話の世界が闇鍋に顕現する。',
        check: (bowl) => {
            const ids = bowl.map(b => b.baseId || b.id.split('_')[0]);
            return ids.includes('u_yami_boots') && ids.includes('u_sweets_dogcookie');
        }
    },
    {
        id: 'combo_civilization',
        name: '文明開化',
        score: 60000,
        icon: '⚙️',
        conditionText: '「えんぴつ」＋「歯車」',
        desc: '近代科学と筆記用具の融合。産業革命の風が鍋に吹き荒れる。',
        check: (bowl) => {
            const ids = bowl.map(b => b.baseId || b.id.split('_')[0]);
            return ids.includes('yami_pencil') && ids.includes('yami_gear');
        }
    },
    {
        id: 'combo_nanban_trade',
        name: '南蛮貿易',
        score: 80000,
        icon: '⛵',
        conditionText: '「胡椒」＋「カステラ」＋「羅針盤」',
        desc: '大航海時代を駆け抜けた南蛮船の積荷が今、鍋の中に集う！',
        check: (bowl) => {
            const ids = bowl.map(b => b.baseId || b.id.split('_')[0]);
            return ids.includes('spice_pepper') && ids.includes('sweets_castella') && ids.includes('yami_compass');
        }
    },
    {
        id: 'combo_tool_box',
        name: 'お道具箱',
        score: 50000,
        icon: '✏️',
        conditionText: '「えんぴつ」＋「消しゴム」',
        desc: '書いては消す、懐かしの文房具セット。',
        check: (bowl) => {
            const ids = bowl.map(b => b.baseId || b.id.split('_')[0]);
            return ids.includes('yami_pencil') && ids.includes('u_yami_eraser');
        }
    },
    {
        id: 'combo_supreme_realm',
        name: '至高の領域',
        score: 250000,
        icon: '👑',
        conditionText: '「至高のモツ」＋「至高のダシ」＋「松茸」＋「とうふ」',
        desc: '最高級の素材と伝説の出汁が織りなす、もつ鍋の究極完全形態！',
        check: (bowl) => {
            const ids = bowl.map(b => b.baseId || b.id.split('_')[0]);
            return ids.includes('u_motsu_supreme') && ids.includes('u_classic_dashi') && ids.includes('u_classic_matsutake') && ids.includes('u_classic_tofu');
        }
    },
    {
        id: 'combo_dr_pepper',
        name: '胡椒先生',
        score: 50000,
        icon: '🥤',
        conditionText: '「胡椒」＋「カプセル錠剤」',
        desc: 'ピリリと刺激的なスパイスと怪しい薬品。ドクター・ペッパー！？',
        check: (bowl) => {
            const ids = bowl.map(b => b.baseId || b.id.split('_')[0]);
            return ids.includes('spice_pepper') && ids.includes('yami_capsule');
        }
    },
    {
        id: 'combo_carbs',
        name: '炭水化物',
        score: 50000,
        icon: '🍜',
        conditionText: '「麺」＋「トッポギ」',
        desc: '糖質×糖質の悪魔的コンビ！ガッツリ満腹カーボローディング。',
        check: (bowl) => {
            const ids = bowl.map(b => b.baseId || b.id.split('_')[0]);
            return ids.includes('classic_men') && ids.includes('u_spice_tteokbokki');
        }
    },
    {
        id: 'combo_amusement_park',
        name: '遊園地の思い出',
        score: 60000,
        icon: '🎡',
        conditionText: '「犬型のマラサダ」＋「チュロス」',
        desc: 'テーマパークの風物詩！香ばしい焼き菓子が広げる甘い思い出。',
        check: (bowl) => {
            const ids = bowl.map(b => b.baseId || b.id.split('_')[0]);
            return ids.includes('u_sweets_dogcookie') && ids.includes('u_sweets_churros');
        }
    },
    {
        id: 'combo_natural_enemy',
        name: '天敵',
        score: 50000,
        icon: '🧲',
        conditionText: '「磁石」＋「羅針盤」',
        desc: '強力な磁界によって羅針盤の針が狂喜乱舞する天敵の組み合わせ。',
        check: (bowl) => {
            const ids = bowl.map(b => b.baseId || b.id.split('_')[0]);
            return ids.includes('u_yami_magnet') && ids.includes('yami_compass');
        }
    }
];

export function getRecommendedCombos(bowl = []) {
    if (!bowl || bowl.length === 0) {
        return [
            {
                ...COMBOS_DATABASE.find(c => c.id === 'combo_motsu_pot'),
                statusText: '💡 おすすめ狙い目',
                statusType: 'default',
                priority: 10
            },
            {
                ...COMBOS_DATABASE.find(c => c.id === 'combo_classic_motsu'),
                statusText: '💡 定番狙い目',
                statusType: 'default',
                priority: 9
            },
            {
                ...COMBOS_DATABASE.find(c => c.id === 'combo_two_card'),
                statusText: '💡 ペア狙い目',
                statusType: 'default',
                priority: 8
            },
            {
                ...COMBOS_DATABASE.find(c => c.id === 'combo_balanced_diet'),
                statusText: '💡 5色盛り狙い目',
                statusType: 'default',
                priority: 7
            }
        ];
    }

    const itemIds = bowl.map(b => b.baseId || b.id.split('_')[0]);
    const hasMotsu = bowl.some(b => b.category === 'motsu');
    const hasClassic = bowl.some(b => b.category === 'classic');

    const evaluated = COMBOS_DATABASE.map(combo => {
        let isAchieved = combo.check(bowl);
        let statusText = '💡 狙い目コンボ';
        let statusType = 'normal';
        let priority = 0;

        if (isAchieved) {
            statusText = combo.score < 0 ? '⚠️ 減点発動中！' : '🎉 達成中！';
            statusType = combo.score < 0 ? 'warning' : 'achieved';
            priority = combo.score < 0 ? 99 : 80;
        } else {
            // 個別リーチ判定
            if (combo.id === 'combo_classic_motsu') {
                if (hasMotsu && !hasClassic) {
                    statusText = '🎯 あと「定番具材」で完成！';
                    statusType = 'close';
                    priority = 95;
                } else if (!hasMotsu && hasClassic) {
                    statusText = '🎯 あと「もつ」で完成！';
                    statusType = 'close';
                    priority = 90;
                }
            } else if (combo.id === 'combo_metaphysical') {
                if (itemIds.includes('u_sweets_donut') && !itemIds.includes('u_yami_tire')) {
                    statusText = '🎯 あと「タイヤ」で完成！';
                    statusType = 'close';
                    priority = 88;
                } else if (!itemIds.includes('u_sweets_donut') && itemIds.includes('u_yami_tire')) {
                    statusText = '🎯 あと「ドーナツ」で完成！';
                    statusType = 'close';
                    priority = 88;
                }
            } else if (combo.id === 'combo_puss_in_boots') {
                if (itemIds.includes('u_sweets_dogcookie') && !itemIds.includes('u_yami_boots')) {
                    statusText = '🎯 あと「長靴」で完成！';
                    statusType = 'close';
                    priority = 88;
                } else if (!itemIds.includes('u_sweets_dogcookie') && itemIds.includes('u_yami_boots')) {
                    statusText = '🎯 あと「犬型のマラサダ」で完成！';
                    statusType = 'close';
                    priority = 88;
                }
            } else if (combo.id === 'combo_civilization') {
                if (itemIds.includes('yami_pencil') && !itemIds.includes('yami_gear')) {
                    statusText = '🎯 あと「歯車」で完成！';
                    statusType = 'close';
                    priority = 86;
                } else if (!itemIds.includes('yami_pencil') && itemIds.includes('yami_gear')) {
                    statusText = '🎯 あと「えんぴつ」で完成！';
                    statusType = 'close';
                    priority = 86;
                }
            } else if (combo.id === 'combo_gentle_life') {
                if (itemIds.includes('classic_nira') && !itemIds.includes('classic_hakusai')) {
                    statusText = '🎯 あと「白菜」で完成！';
                    statusType = 'close';
                    priority = 87;
                } else if (!itemIds.includes('classic_nira') && itemIds.includes('classic_hakusai')) {
                    statusText = '🎯 あと「にら」で完成！';
                    statusType = 'close';
                    priority = 87;
                }
            } else if (combo.id === 'combo_natural_enemy') {
                if (itemIds.includes('u_yami_magnet') && !itemIds.includes('yami_compass')) {
                    statusText = '🎯 あと「羅針盤」で完成！';
                    statusType = 'close';
                    priority = 85;
                } else if (!itemIds.includes('u_yami_magnet') && itemIds.includes('yami_compass')) {
                    statusText = '🎯 あと「磁石」で完成！';
                    statusType = 'close';
                    priority = 85;
                }
            } else if (combo.id === 'combo_hell') {
                if (itemIds.includes('u_spice_hellsauce') && !itemIds.includes('u_sweets_condensed')) {
                    statusText = '🎯 あと「ラグドゥネーム」で完成！';
                    statusType = 'close';
                    priority = 89;
                } else if (!itemIds.includes('u_spice_hellsauce') && itemIds.includes('u_sweets_condensed')) {
                    statusText = '🎯 あと「ヘルソース」で完成！';
                    statusType = 'close';
                    priority = 89;
                }
            } else if (combo.id === 'combo_stubborn_stain') {
                if (itemIds.includes('u_spice_curry') && !itemIds.includes('u_yami_detergent')) {
                    statusText = '🎯 あと「洗剤」で完成！';
                    statusType = 'close';
                    priority = 86;
                } else if (!itemIds.includes('u_spice_curry') && itemIds.includes('u_yami_detergent')) {
                    statusText = '🎯 あと「カレールー」で完成！';
                    statusType = 'close';
                    priority = 86;
                }
            } else if (combo.id === 'combo_carbs') {
                if (itemIds.includes('classic_men') && !itemIds.includes('u_spice_tteokbokki')) {
                    statusText = '🎯 あと「トッポギ」で完成！';
                    statusType = 'close';
                    priority = 85;
                } else if (!itemIds.includes('classic_men') && itemIds.includes('u_spice_tteokbokki')) {
                    statusText = '🎯 あと「麺」で完成！';
                    statusType = 'close';
                    priority = 85;
                }
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
    return evaluated.slice(0, 4);
}

// ----------------------------------------------------
// ■ 鍋テンプレート定義 (POT_TEMPLATES)
// ----------------------------------------------------
export const POT_TEMPLATES = [
    {
        id: 'classic',
        name: '王道定番もつ鍋',
        icon: '🍲',
        hint: '出汁の良い香りが漂っている...王道もつ鍋の予感！',
        reveal: '【王道定番もつ鍋】が出現！',
        desc: 'もつと新鮮野菜、〆の麺と至高のダシが揃った平和で高得点な王道鍋。',
        itemIds: ['motsu_normal', 'motsu_normal', 'classic_nira', 'classic_nira', 'classic_hakusai', 'classic_men', 'u_classic_tofu', 'u_classic_dashi']
    },
    {
        id: 'yami',
        name: '混沌の闇鍋',
        icon: '🌀',
        hint: '鍋の底から不気味な気配と金属音が聞こえる...！？',
        reveal: '【混沌の闇鍋】が出現！',
        desc: '危険物とゴミだけで満たされた伝説の禁忌鍋。闇のマイナスに沈むか、大明神で大逆転か！？',
        itemIds: ['u_yami_magnet', 'u_yami_detergent', 'u_yami_tire', 'u_yami_boots', 'u_yami_eraser', 'yami_compass', 'yami_gear', 'yami_capsule']
    },
    {
        id: 'spicy',
        name: '灼熱激辛鍋',
        icon: '🌶️',
        hint: '立ち上る湯気からツンと刺激的なスパイスの香りがする...！',
        reveal: '【灼熱激辛鍋】が出現！',
        desc: 'ヘルソース・カレールー・とうがらし等の強烈な辛味と危険物が混在する灼熱の東極スパイス鍋。',
        itemIds: ['motsu_normal', 'u_spice_hellsauce', 'u_spice_curry', 'spice_mentai', 'spice_chili', 'u_yami_detergent', 'u_yami_tire', 'u_yami_boots']
    },
    {
        id: 'sweets',
        name: '特濃激甘スイーツ鍋',
        icon: '🍬',
        hint: 'なんだか甘〜いお菓子の匂いが充満している...？',
        reveal: '【特濃激甘スイーツ鍋】が出現！',
        desc: 'ラグドゥネームソース・ドーナツ・カステラ等の強烈な甘味と危険物が混在する特濃の西極スイーツ鍋。',
        itemIds: ['motsu_normal', 'u_sweets_condensed', 'u_sweets_donut', 'sweets_castella', 'sweets_choco', 'u_yami_magnet', 'u_yami_tire', 'u_yami_boots']
    },
    {
        id: 'unique',
        name: '幻の至高ギャンブル鍋',
        icon: '✨',
        hint: '普通ではありえない巨大で異様な具材の影が見え隠れしている...！',
        reveal: '【幻の至高ギャンブル鍋】が出現！',
        desc: '至高のモツから洗剤・磁石まで！ハイリスク・ハイリターンの究極ギャンブル鍋。',
        itemIds: ['u_motsu_supreme', 'u_classic_dashi', 'u_motsu_hatsumoto', 'u_classic_matsutake', 'u_spice_tteokbokki', 'u_sweets_churros', 'u_yami_magnet', 'u_yami_detergent']
    },
    {
        id: 'random',
        name: '気まぐれカオス鍋',
        icon: '🎲',
        hint: '何が飛び出すか全く予測がつかない混沌とした気配...！',
        reveal: '【気まぐれカオス鍋】が出現！',
        desc: '全具材からランダムに選ばれた予測不能のミステリー鍋。',
        itemIds: 'random'
    }
];

export function getRandomPotTemplate() {
    const idx = Math.floor(Math.random() * POT_TEMPLATES.length);
    return POT_TEMPLATES[idx];
}

export function generatePotTemplateIngredients(template) {
    if (!template || template.itemIds === 'random') {
        const shuffled = [...INGREDIENTS_DATABASE].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 8).map(item => createIngredientInstance(item));
    }
    
    const items = [];
    template.itemIds.forEach(id => {
        const base = INGREDIENTS_DATABASE.find(x => x.id === id);
        if (base) {
            items.push(createIngredientInstance(base));
        }
    });
    return items;
}