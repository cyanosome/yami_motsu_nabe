export const INGREDIENTS_DATABASE = [
    // ----------------------------------------------------
    // ■ 汎用シルエット具材 (unique: false)
    // ----------------------------------------------------
    // もつ
    {
        id: 'motsu_normal',
        name: '国産ぷりぷり牛もつ',
        category: 'motsu',
        score: 4,
        taste: 0,
        icon: '🥩',
        iconUrl: 'assets/icon/Motsu.png',
        allowedSizes: ['small', 'mid', 'large'],
        desc: 'もつ鍋の主役！脂が乗った定番の牛もつ。',
        unique: false
    },

    // 定番（野菜・薬味・麺などを統合）
    {
        id: 'classic_nira',
        name: '鮮緑スタミナニラ',
        category: 'classic',
        score: 3,
        taste: 0,
        icon: '🌱',
        iconUrl: 'assets/icon/GarlicChives.png',
        allowedSizes: ['small', 'mid', 'large'],
        desc: 'もつ鍋に欠かせない、香りと栄養満点の定番野菜。',
        unique: false
    },
    {
        id: 'classic_hakusai',
        name: 'みずみずしい甘白菜',
        category: 'classic',
        score: 3,
        taste: 0,
        icon: '🥬',
        iconUrl: 'assets/icon/NapaCabbage.png',
        allowedSizes: ['small', 'mid', 'large'],
        desc: '出汁をたっぷり吸い込んで甘みが増す定番具材。',
        unique: false
    },
    {
        id: 'classic_men',
        name: '〆の特製ちゃんぽん麺',
        category: 'classic',
        score: 4,
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
        name: '深紅の一本唐辛子',
        category: 'spice',
        score: 2,
        taste: 2,
        icon: '🌶️',
        iconUrl: null,
        allowedSizes: ['small', 'mid', 'large'],
        desc: 'ピリッとスープを引き締める定番の辛味。(小:+1/中:+2/大:+3)',
        unique: false
    },
    {
        id: 'spice_pepper',
        name: '粗挽き黒胡椒ミル',
        category: 'spice',
        score: 2,
        taste: 2,
        icon: '🧂',
        iconUrl: null,
        allowedSizes: ['small', 'mid', 'large'],
        desc: 'スパイシーな香りで食欲をそそる本格薬味。(小:+1/中:+2/大:+3)',
        unique: false
    },
    {
        id: 'spice_mentai',
        name: '博多熟成明太子',
        category: 'spice',
        score: 3,
        taste: 2,
        icon: '🔴',
        iconUrl: null,
        allowedSizes: ['small', 'mid', 'large'],
        desc: 'ピリ辛の粒々がスープに溶け込む贅沢具材。(小:+1/中:+2/大:+3)',
        unique: false
    },

    // 甘味
    {
        id: 'sweets_castella',
        name: '黄金の長崎カステラ',
        category: 'sweets',
        score: 2,
        taste: -2,
        icon: '🥮',
        iconUrl: null,
        allowedSizes: ['small', 'mid', 'large'],
        desc: 'しっとり甘いカステラ。辛さを和らげる！(小:-1/中:-2/大:-3)',
        unique: false
    },
    {
        id: 'sweets_choco',
        name: 'とろけるビターチョコ',
        category: 'sweets',
        score: 2,
        taste: -2,
        icon: '🍫',
        iconUrl: null,
        allowedSizes: ['small', 'mid', 'large'],
        desc: '濃厚な甘みとコクが広がるお菓子具材。(小:-1/中:-2/大:-3)',
        unique: false
    },
    {
        id: 'sweets_lollipop',
        name: '虹色ぐるぐるキャンディ',
        category: 'sweets',
        score: 2,
        taste: -2,
        icon: '🍭',
        iconUrl: null,
        allowedSizes: ['small', 'mid', 'large'],
        desc: 'ポップで甘いキャンディ。辛味を中和する！(小:-1/中:-2/大:-3)',
        unique: false
    },

    // 闇
    {
        id: 'yami_compass',
        name: '狂った真鍮の羅針盤',
        category: 'yami',
        score: -3,
        taste: 0,
        icon: '🧭',
        iconUrl: null,
        allowedSizes: ['small', 'mid', 'large'],
        desc: 'ぐるぐる針が回る謎の羅針盤。食べられない！',
        unique: false
    },
    {
        id: 'yami_pencil',
        name: '芯の尖った黒鉛筆',
        category: 'yami',
        score: -2,
        taste: 0,
        icon: '✏️',
        iconUrl: null,
        allowedSizes: ['small', 'mid', 'large'],
        desc: '鍋の底に沈む筆記用具。出汁が黒ずんでしまう。',
        unique: false
    },
    {
        id: 'yami_gear',
        name: '錆びついた古歯車',
        category: 'yami',
        score: -3,
        taste: 0,
        icon: '⚙️',
        iconUrl: null,
        allowedSizes: ['small', 'mid', 'large'],
        desc: '噛んだら歯が折れる重厚な鉄の歯車。',
        unique: false
    },
    {
        id: 'yami_capsule',
        name: '怪光を放つカプセル錠剤',
        category: 'yami',
        score: -3,
        taste: 0,
        icon: '💊',
        iconUrl: null,
        allowedSizes: ['small', 'mid', 'large'],
        desc: '何が入っているか分からない怪しい薬品。',
        unique: false
    },

    // ----------------------------------------------------
    // ■ ユニークシルエット具材 (unique: true)
    // ----------------------------------------------------
    // 【至高のモツ型】(最高峰・極大スコア)
    {
        id: 'u_motsu_supreme',
        name: '至高の一本マルチョウ',
        category: 'motsu',
        silhouetteType: 'motsu_supreme',
        score: 10,
        taste: 0,
        icon: '🥩',
        iconUrl: null,
        allowedSizes: ['large'],
        desc: '切らずに一本丸ごとの超極上マルチョウ！圧倒的高得点！',
        unique: true
    },
    {
        id: 'u_sweets_churros',
        name: '黄金の渦巻きチュロス',
        category: 'sweets',
        silhouetteType: 'motsu_supreme',
        score: 8,
        taste: -4,
        icon: '🥨',
        iconUrl: null,
        allowedSizes: ['large'],
        desc: 'マルチョウそっくりに巻かれた巨大チュロス！強烈な甘さ！',
        unique: true
    },
    {
        id: 'u_spice_tteokbokki',
        name: '旨辛もっちりトッポギ',
        category: 'spice',
        silhouetteType: 'motsu_supreme',
        score: 8,
        taste: 4,
        icon: '🥢',
        iconUrl: null,
        allowedSizes: ['large'],
        desc: '極太マルチョウに見紛う激辛ロングトッポギ！',
        unique: true
    },
    {
        id: 'u_yami_magnet',
        name: '超強力U字マグネット',
        category: 'yami',
        silhouetteType: 'motsu_supreme',
        score: -9,
        taste: 0,
        icon: '🧲',
        iconUrl: null,
        allowedSizes: ['large'],
        desc: 'マルチョウ型に湾曲した巨大磁石！鍋のすべてを狂わせる。',
        unique: true
    },

    // 【ソース型】(特大スコア & 味激変)
    {
        id: 'u_classic_dashi',
        name: '秘伝・黄金の極み出汁',
        category: 'classic',
        silhouetteType: 'sauce',
        score: 9,
        taste: 0,
        icon: '🍶',
        iconUrl: null,
        allowedSizes: ['large'],
        desc: '創業以来継ぎ足された伝説の出汁ボトル。鍋全体が至福の味に。',
        unique: true
    },
    {
        id: 'u_sweets_condensed',
        name: '特濃とろける練乳クリーム',
        category: 'sweets',
        silhouetteType: 'sauce',
        score: 7,
        taste: -5,
        icon: '🥛',
        iconUrl: null,
        allowedSizes: ['large'],
        desc: 'チューブから溢れ出る超濃厚練乳！一気に激甘バースト寸前！',
        unique: true
    },
    {
        id: 'u_spice_hellsauce',
        name: '地獄の激辛ソース',
        category: 'spice',
        silhouetteType: 'sauce',
        score: 7,
        taste: 5,
        icon: '🍾',
        iconUrl: 'assets/icon/HellSauce.png',
        allowedSizes: ['large'],
        desc: '一滴で鍋が灼熱地獄と化す極悪辛味ソース！',
        unique: true
    },
    {
        id: 'u_yami_detergent',
        name: '危険な泡立つ青色洗剤',
        category: 'yami',
        silhouetteType: 'sauce',
        score: -8,
        taste: 0,
        icon: '🧴',
        iconUrl: null,
        allowedSizes: ['large'],
        desc: '出汁ボトルと間違えて投入された洗剤！絶対口にしてはならない。',
        unique: true
    },

    // 【ドーナツ型】(中〜大スコア)
    {
        id: 'u_sweets_donut',
        name: '贅沢ショコラドーナツ',
        category: 'sweets',
        silhouetteType: 'donut',
        score: 6,
        taste: -3,
        icon: '🍩',
        iconUrl: 'assets/icon/Donut.png',
        allowedSizes: ['mid', 'large'],
        desc: '甘みたっぷりの揚げドーナツ。味覚を一気に甘く染める。',
        unique: true
    },
    {
        id: 'u_yami_tire',
        name: '極厚重機ゴムタイヤ',
        category: 'yami',
        silhouetteType: 'donut',
        score: -6,
        taste: 0,
        icon: '🛞',
        iconUrl: 'assets/icon/Tire.png',
        allowedSizes: ['large'],
        desc: 'ドーナツそっくりの黒いタイヤ！噛み切れるはずもない。',
        unique: true
    },
    {
        id: 'u_motsu_hatsumoto',
        name: '幻のコリコリハツモト',
        category: 'motsu',
        silhouetteType: 'donut',
        score: 6,
        taste: 0,
        icon: '🥩',
        iconUrl: null,
        allowedSizes: ['mid', 'large'],
        desc: 'ドーナツ状の希少部位ハツモト。抜群の歯ごたえと旨味！',
        unique: true
    },

    // 【長靴型】(中〜大スコア)
    {
        id: 'u_sweets_dogcookie',
        name: '愛らしき仔犬のクッキー',
        category: 'sweets',
        silhouetteType: 'boots',
        score: 6,
        taste: -3,
        icon: '🍪',
        iconUrl: 'assets/icon/DogCookie.png',
        allowedSizes: ['mid', 'large'],
        desc: '愛らしい犬の形をした香ばしいクッキー。甘みしっかり。',
        unique: true
    },
    {
        id: 'u_yami_boots',
        name: '泥まみれの作業用長靴',
        category: 'yami',
        silhouetteType: 'boots',
        score: -6,
        taste: 0,
        icon: '👢',
        iconUrl: 'assets/icon/Shoes.png',
        allowedSizes: ['large'],
        desc: '鍋に放り込まれたゴム長靴。泥とゴムの臭いが充満する。',
        unique: true
    },
    {
        id: 'u_classic_matsutake',
        name: '薫り高き極上松茸',
        category: 'classic',
        silhouetteType: 'boots',
        score: 6,
        taste: 0,
        icon: '🍄',
        iconUrl: null,
        allowedSizes: ['mid', 'large'],
        desc: '長靴のような曲がった形をした高級松茸。芳醇な香り！',
        unique: true
    },

    // 【立方体型】(中スコア)
    {
        id: 'u_classic_tofu',
        name: '極上なめらか絹ごし豆腐',
        category: 'classic',
        silhouetteType: 'cube',
        score: 4,
        taste: 0,
        icon: '🧊',
        iconUrl: null,
        allowedSizes: ['mid', 'large'],
        desc: '四角くカットされた純白の豆腐。出汁の旨味を吸収する。',
        unique: true
    },
    {
        id: 'u_spice_curry',
        name: '熟成スパイシーカレールー',
        category: 'spice',
        silhouetteType: 'cube',
        score: 4,
        taste: 3,
        icon: '🍛',
        iconUrl: null,
        allowedSizes: ['mid', 'large'],
        desc: '四角いカレールー。鍋が一瞬で本格スパイスカレー鍋に！',
        unique: true
    },
    {
        id: 'u_sweets_sugar',
        name: '高純度クリスタル角砂糖',
        category: 'sweets',
        silhouetteType: 'cube',
        score: 4,
        taste: -3,
        icon: '🧊',
        iconUrl: null,
        allowedSizes: ['mid', 'large'],
        desc: '豆腐と見紛う四角い角砂糖。一気に甘みが跳ね上がる！',
        unique: true
    },
    {
        id: 'u_yami_eraser',
        name: '四角い新品プラスチック消しゴム',
        category: 'yami',
        silhouetteType: 'cube',
        score: -4,
        taste: 0,
        icon: '🧼',
        iconUrl: null,
        allowedSizes: ['mid', 'large'],
        desc: '豆腐そっくりの消しゴム。文字は消せても点数は削られる。',
        unique: true
    }
];
        
export function createIngredientInstance(baseItem, forceSize = null) {
    const allowed = baseItem.allowedSizes || ['mid'];
    const chosenSize = forceSize || allowed[Math.floor(Math.random() * allowed.length)];
    
    let score = baseItem.score;
    let taste = baseItem.taste || 0;
    let sizeLabel = '';
    let sizeBadgeText = '中';
    let sizeBadgeClass = 'size-mid';

    if (baseItem.unique) {
        // ユニーク具材は大振りなベース値をそのまま適用（サイズ表示のみ付与）
        if (chosenSize === 'small') {
            sizeLabel = ' (小)';
            sizeBadgeText = '小';
            sizeBadgeClass = 'size-small';
        } else if (chosenSize === 'large') {
            sizeLabel = ' (大盛)';
            sizeBadgeText = '大';
            sizeBadgeClass = 'size-large';
        }
    } else {
        // 汎用具材のサイズ連動計算
        if (chosenSize === 'small') {
            score = (baseItem.score >= 0) 
                ? Math.max(1, Math.floor(baseItem.score * 0.6))
                : Math.min(-1, Math.ceil(baseItem.score * 0.6));
            // taste: 小は ±1
            if (baseItem.taste > 0) taste = 1;
            else if (baseItem.taste < 0) taste = -1;
            else taste = 0;

            sizeLabel = ' (小)';
            sizeBadgeText = '小';
            sizeBadgeClass = 'size-small';
        } else if (chosenSize === 'large') {
            score = (baseItem.score >= 0)
                ? Math.ceil(baseItem.score * 1.5)
                : Math.floor(baseItem.score * 1.5);
            // taste: 大は ±3
            if (baseItem.taste > 0) taste = 3;
            else if (baseItem.taste < 0) taste = -3;
            else taste = 0;

            sizeLabel = ' (大盛)';
            sizeBadgeText = '大';
            sizeBadgeClass = 'size-large';
        } else {
            // mid: 中は ±2 (ベース値)
            if (baseItem.taste > 0) taste = 2;
            else if (baseItem.taste < 0) taste = -2;
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
    {
        id: 'combo_classic',
        name: '王道もつ鍋',
        score: 3,
        icon: '🍲',
        conditionText: 'もつ系 × 1以上 + 定番具材 × 1以上',
        desc: 'もつの旨味と定番具材（ニラ・白菜・麺・出汁等）がベストマッチした王道鍋！',
        check: (bowl) => bowl.some(b => b.category === 'motsu') && bowl.some(b => b.category === 'classic')
    },
    {
        id: 'combo_dashi',
        name: '絶品アクセント',
        score: 2,
        icon: '🍶',
        conditionText: 'もつ系 × 1以上 + 辛味/甘味系 × 1以上',
        desc: 'もつの脂にスパイスや甘味アクセントが効いた刺激的なマリアージュ！',
        check: (bowl) => bowl.some(b => b.category === 'motsu') && bowl.some(b => b.category === 'spice' || b.category === 'sweets')
    },
    {
        id: 'combo_mega_motsu',
        name: 'メガ盛りもつコンボ',
        score: 4,
        icon: '🥩',
        conditionText: 'もつ系 × 3以上',
        desc: 'とにかくもつを喰らい尽くす！もつ好きにはたまらない圧倒的満足感。',
        check: (bowl) => bowl.filter(b => b.category === 'motsu').length >= 3
    },
    {
        id: 'combo_dark_lord',
        name: '♰暗黒素材大明神♰',
        score: 15,
        icon: '💀',
        conditionText: 'お椀が3枚以上かつ全て闇具材',
        desc: '危険物とゴミだけで満たされた伝説の禁忌鍋。奇跡的に生還できれば莫大な加点！',
        check: (bowl) => bowl.length >= 3 && bowl.every(b => b.category === 'yami')
    },
    {
        id: 'combo_king',
        name: '王様のもつ鍋',
        score: 20,
        icon: '👑',
        conditionText: '大盛(large)の「もつ」「定番」「辛味」を揃える',
        desc: 'すべてが特大！極限まで贅を尽くした至高のプレミアムもつ鍋。',
        check: (bowl) => bowl.some(b => b.category === 'motsu' && b.size === 'large') &&
                         bowl.some(b => b.category === 'classic' && b.size === 'large') &&
                         bowl.some(b => b.category === 'spice' && b.size === 'large')
    },
    {
        id: 'combo_sweet_spicy',
        name: '甘辛マリアージュ',
        score: 4,
        icon: '🍯',
        conditionText: '甘味(taste < 0) と 辛味(taste > 0) が両方ある',
        desc: '辛さを甘さで中和する究極の味覚バランス。クセになる旨さ！',
        check: (bowl) => bowl.some(b => (b.taste || 0) < 0) && bowl.some(b => (b.taste || 0) > 0)
    },
    {
        id: 'combo_common',
        name: '庶民のもつ鍋',
        score: 5,
        icon: '🥣',
        conditionText: 'お椀が3枚以上かつ全て小サイズ(small)',
        desc: '小ぶりな具材でちまちま味わう、慎ましくも温かい一杯。',
        check: (bowl) => bowl.length >= 3 && bowl.every(b => b.size === 'small')
    },
    {
        id: 'combo_have_not',
        name: 'もたざるもの',
        score: -3,
        icon: '🙅',
        conditionText: 'お椀に「もつ」が1枚も入っていない',
        desc: 'もつが入っていない鍋をもつ鍋と呼べるのか…？悲哀の減点ペナルティ。',
        check: (bowl) => bowl.length > 0 && !bowl.some(b => b.category === 'motsu')
    },
    {
        id: 'combo_quad_card',
        name: 'フォーカード',
        score: 6,
        icon: '🃏',
        conditionText: '同一ジャンル(カテゴリ)の具材が4枚以上',
        desc: '同じ系統の具材を極限まで重ねたポーカーライクな役！',
        check: (bowl) => ['motsu', 'classic', 'spice', 'sweets', 'yami'].some(cat => bowl.filter(b => b.category === cat).length >= 4)
    },
    {
        id: 'combo_gentle_life',
        name: 'やさしいせいかつ',
        score: 6,
        icon: '🥗',
        conditionText: 'お椀が3枚以上かつ全て「定番具材」',
        desc: 'もつすら入れず、野菜・出汁・麺だけで満たされた極めて健康的な鍋。',
        check: (bowl) => bowl.length >= 3 && bowl.every(b => b.category === 'classic')
    },
    {
        id: 'combo_thin_meat',
        name: '肉はペラペラですか？',
        score: 3,
        icon: '🥓',
        conditionText: '小サイズ(small)のもつを2個以上含む',
        desc: '「これ肉入ってます…？」薄切り小粒もつでかさ増しした鍋。',
        check: (bowl) => bowl.filter(b => b.category === 'motsu' && b.size === 'small').length >= 2
    },
    {
        id: 'combo_balanced_diet',
        name: 'バランスの取れた食事',
        score: 5,
        icon: '🍱',
        conditionText: '「もつ」「定番」「辛味」が各1枚以上ある',
        desc: 'お肉、野菜、スパイスが黄金比で調和した栄養満点なもつ鍋。',
        check: (bowl) => bowl.some(b => b.category === 'motsu') &&
                         bowl.some(b => b.category === 'classic') &&
                         bowl.some(b => b.category === 'spice')
    },
    {
        id: 'combo_metaphysical',
        name: '形而上学的もつ鍋',
        score: 8,
        icon: '🍩',
        conditionText: '「贅沢ショコラドーナツ」と「極厚重機ゴムタイヤ」',
        desc: '同じドーナツ型でありながら、甘美と硬質という対立概念を内包した哲学的一杯。',
        check: (bowl) => bowl.some(b => b.baseId === 'u_sweets_donut') && bowl.some(b => b.baseId === 'u_yami_tire')
    },
    {
        id: 'combo_puss_in_boots',
        name: '長靴をはいた犬',
        score: 8,
        icon: '👢',
        conditionText: '「泥まみれの作業用長靴」と「愛らしき仔犬のクッキー」',
        desc: '長靴の影に寄り添う仔犬のクッキー。童話の世界が闇鍋に顕現する。',
        check: (bowl) => bowl.some(b => b.baseId === 'u_yami_boots') && bowl.some(b => b.baseId === 'u_sweets_dogcookie')
    },
    {
        id: 'combo_kids',
        name: 'お子様もつ鍋',
        score: 5,
        icon: '👶',
        conditionText: 'お椀が2枚以上かつ全て「もつ」',
        desc: '野菜は嫌い！肉だけをもりもり食べたいわんぱくな鍋。',
        check: (bowl) => bowl.length >= 2 && bowl.every(b => b.category === 'motsu')
    },
    {
        id: 'combo_halloween',
        name: 'HAPPY HALLOWEEN',
        score: 7,
        icon: '🎃',
        conditionText: '甘味具材(sweets)を3枚以上集めて完食',
        desc: 'トリック・オア・トリート！甘いお菓子で満たされたスイーツパラダイス鍋。',
        check: (bowl) => bowl.filter(b => b.category === 'sweets').length >= 3
    },
    {
        id: 'combo_hot_pot',
        name: '灼熱火鍋',
        score: 7,
        icon: '🔥',
        conditionText: '辛味具材(spice)を3枚以上集めて完食',
        desc: '真っ赤に燃え盛る激辛スパイス尽くし！汗だくで平らげる本格火鍋。',
        check: (bowl) => bowl.filter(b => b.category === 'spice').length >= 3
    },
    {
        id: 'combo_civilization',
        name: '文明開化',
        score: 6,
        icon: '⚙️',
        conditionText: '「芯の尖った黒鉛筆」と「錆びついた古歯車」',
        desc: '近代科学と筆記用具の融合。産業革命の風が鍋に吹き荒れる。',
        check: (bowl) => bowl.some(b => b.baseId === 'yami_pencil') && bowl.some(b => b.baseId === 'yami_gear')
    },
    {
        id: 'combo_recycle',
        name: 'リサイクルSDGs',
        score: 5,
        icon: '♻️',
        conditionText: '歯車・タイヤ・長靴・消しゴム・磁石から2枚以上',
        desc: '資源は大切に！鍋に沈んだ産業廃棄物を有効活用したエコフレンドリーな鍋。',
        check: (bowl) => bowl.filter(b => ['yami_gear', 'u_yami_tire', 'u_yami_boots', 'u_yami_eraser', 'u_yami_magnet'].includes(b.baseId)).length >= 2
    },
    {
        id: 'combo_minimum_life',
        name: '最低限度の生活',
        score: 3,
        icon: '📦',
        conditionText: '定番具材1枚 ＋ 闇具材1枚以上',
        desc: 'わずかな野菜と怪しいゴミで飢えをしのぐ、限界サバイバル鍋。',
        check: (bowl) => bowl.some(b => b.category === 'classic') && bowl.some(b => b.category === 'yami')
    },
    {
        id: 'combo_abandoned_motsu',
        name: '世捨てもつ',
        score: 6,
        icon: '🧘',
        conditionText: '辛味具材3枚 ＋ もつ1枚',
        desc: '辛味の嵐の中にポツンと浮かぶ一粒の肉。俗世を離れた境地。',
        check: (bowl) => bowl.filter(b => b.category === 'spice').length >= 3 && bowl.filter(b => b.category === 'motsu').length === 1
    },
    {
        id: 'combo_shojin',
        name: '精進料理',
        score: 5,
        icon: '🎋',
        conditionText: 'お椀が3枚以上かつ「定番」と「辛味」のみで構成',
        desc: '殺生を断ち、清らかな野菜と出汁・薬味だけで仕立てた仏の御膳。',
        check: (bowl) => bowl.length >= 3 &&
                         bowl.every(b => b.category === 'classic' || b.category === 'spice') &&
                         bowl.some(b => b.category === 'classic') &&
                         bowl.some(b => b.category === 'spice')
    }
];

export function getRecommendedCombos(bowl = []) {
    if (!bowl || bowl.length === 0) {
        return [
            {
                ...COMBOS_DATABASE.find(c => c.id === 'combo_classic'),
                statusText: '💡 おすすめ狙い目',
                statusType: 'default',
                priority: 10
            },
            {
                ...COMBOS_DATABASE.find(c => c.id === 'combo_balanced_diet'),
                statusText: '💡 三種盛り狙い目',
                statusType: 'default',
                priority: 9
            },
            {
                ...COMBOS_DATABASE.find(c => c.id === 'combo_sweet_spicy'),
                statusText: '💡 甘辛狙い目',
                statusType: 'default',
                priority: 8
            },
            {
                ...COMBOS_DATABASE.find(c => c.id === 'combo_mega_motsu'),
                statusText: '💡 もつ特化狙い目',
                statusType: 'default',
                priority: 7
            }
        ];
    }

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
            // 代表的なコンボのリーチ判定
            const hasMotsu = bowl.some(b => b.category === 'motsu');
            const hasClassic = bowl.some(b => b.category === 'classic');
            const hasSpice = bowl.some(b => b.category === 'spice');
            const hasSweets = bowl.some(b => b.category === 'sweets');
            const motsuCount = bowl.filter(b => b.category === 'motsu').length;

            if (combo.id === 'combo_classic') {
                if (hasMotsu && !hasClassic) {
                    statusText = '🎯 あと「定番具材」で完成！';
                    statusType = 'close';
                    priority = 95;
                } else if (!hasMotsu && hasClassic) {
                    statusText = '🎯 あと「もつ」で完成！';
                    statusType = 'close';
                    priority = 90;
                }
            } else if (combo.id === 'combo_mega_motsu') {
                if (motsuCount === 2) {
                    statusText = '🎯 あと「もつ」1個で完成！';
                    statusType = 'close';
                    priority = 92;
                }
            } else if (combo.id === 'combo_sweet_spicy') {
                if (hasSpice && !hasSweets) {
                    statusText = '🎯 あと「甘味具材」で完成！';
                    statusType = 'close';
                    priority = 85;
                } else if (!hasSpice && hasSweets) {
                    statusText = '🎯 あと「辛味具材」で完成！';
                    statusType = 'close';
                    priority = 85;
                }
            } else if (combo.id === 'combo_metaphysical') {
                if (bowl.some(b => b.baseId === 'u_sweets_donut') && !bowl.some(b => b.baseId === 'u_yami_tire')) {
                    statusText = '🎯 あと「ゴムタイヤ」で完成！';
                    statusType = 'close';
                    priority = 88;
                }
            } else if (combo.id === 'combo_puss_in_boots') {
                if (bowl.some(b => b.baseId === 'u_sweets_dogcookie') && !bowl.some(b => b.baseId === 'u_yami_boots')) {
                    statusText = '🎯 あと「作業用長靴」で完成！';
                    statusType = 'close';
                    priority = 88;
                }
            } else if (combo.id === 'combo_civilization') {
                if (bowl.some(b => b.baseId === 'yami_pencil') && !bowl.some(b => b.baseId === 'yami_gear')) {
                    statusText = '🎯 あと「古歯車」で完成！';
                    statusType = 'close';
                    priority = 86;
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
        desc: 'もつと新鮮野菜、〆の麺と極み出汁が揃った平和で高得点な王道鍋。',
        itemIds: ['motsu_normal', 'motsu_normal', 'classic_nira', 'classic_nira', 'classic_hakusai', 'classic_men', 'u_classic_tofu', 'u_classic_dashi']
    },
    {
        id: 'yami',
        name: '混沌の闇鍋',
        icon: '🌀',
        hint: '鍋の底から不気味な気配と金属音が聞こえる...！？',
        reveal: '【混沌の闇鍋】が出現！',
        desc: 'ベースのもつ・野菜の隙間に危険物やゴミが大量沈没！引いたら最後の大減点トラップ鍋。',
        itemIds: ['motsu_normal', 'motsu_normal', 'classic_nira', 'classic_hakusai', 'yami_compass', 'yami_gear', 'u_yami_tire', 'u_yami_detergent']
    },
    {
        id: 'spicy',
        name: '灼熱激辛鍋',
        icon: '🌶️',
        hint: '立ち上る湯気からツンと刺激的なスパイスの香りがする...！',
        reveal: '【灼熱激辛鍋】が出現！',
        desc: 'もつと野菜に唐辛子・明太子・カレールー・地獄ソースが溶け込んだ灼熱のスパイス鍋。',
        itemIds: ['motsu_normal', 'motsu_normal', 'classic_nira', 'classic_hakusai', 'spice_chili', 'spice_mentai', 'u_spice_curry', 'u_spice_hellsauce']
    },
    {
        id: 'sweets',
        name: '特濃激甘スイーツ鍋',
        icon: '🍬',
        hint: 'なんだか甘〜いお菓子の匂いが充満している...？',
        reveal: '【特濃激甘スイーツ鍋】が出現！',
        desc: 'もつと野菜にカステラ・チョコ・ドーナツ・練乳などが侵食！味覚が激甘に変化するスイーツ鍋。',
        itemIds: ['motsu_normal', 'motsu_normal', 'classic_nira', 'classic_hakusai', 'sweets_castella', 'sweets_choco', 'u_sweets_donut', 'u_sweets_condensed']
    },
    {
        id: 'unique',
        name: '幻の至高ギャンブル鍋',
        icon: '✨',
        hint: '普通ではありえない巨大で異様な具材の影が見え隠れしている...！',
        reveal: '【幻の至高ギャンブル鍋】が出現！',
        desc: '超大物マルチョウから極悪洗剤・磁石まで！ハイリスク・ハイリターンの究極ギャンブル鍋。',
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