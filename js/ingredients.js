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
    }
];

export function getRecommendedCombos(bowl = []) {
    const hasMotsu = bowl.some(b => b.category === 'motsu');
    const hasClassic = bowl.some(b => b.category === 'classic');
    const hasSpiceOrSweet = bowl.some(b => b.category === 'spice' || b.category === 'sweets');
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
                statusText: '💡 スパイスの狙い目',
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
            } else if (hasMotsu && !hasClassic) {
                statusText = '🎯 あと「定番具材」で完成！';
                statusType = 'close';
                priority = 100;
            } else if (!hasMotsu && hasClassic) {
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
            } else if (hasMotsu && !hasSpiceOrSweet) {
                statusText = '🎯 あと「辛味/甘味」で完成！';
                statusType = 'close';
                priority = 90;
            } else if (!hasMotsu && hasSpiceOrSweet) {
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