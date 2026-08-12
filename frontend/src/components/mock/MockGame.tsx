import React, { useState, useEffect } from 'react';
import { type Ingredient, type Player, INGREDIENTS_DATABASE, playSound } from './mockData';

interface MockGameProps {
  mode: 'vs-cpu' | 'hotseat';
  soundEnabled: boolean;
  onResetToStart: () => void;
}

export const MockGame: React.FC<MockGameProps> = ({
  mode,
  soundEnabled,
  onResetToStart
}) => {
  const [phase, setPhase] = useState<1 | 2 | 3>(1);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentDraftPlayerIndex, setCurrentDraftPlayerIndex] = useState(0);
  const [currentTurnPlayerIndex, setCurrentTurnPlayerIndex] = useState(0);
  const [potStack, setPotStack] = useState<Ingredient[]>([]);
  const [selectedDraftIds, setSelectedDraftIds] = useState<string[]>([]);
  const [draftOptions, setDraftOptions] = useState<Ingredient[]>([]);
  const [gameLogs, setGameLogs] = useState<{ id: number; text: string; isHighlight?: boolean; isBust?: boolean }[]>([]);
  const [isPotShaking, setIsPotShaking] = useState(false);

  // 初回プレイヤー初期化
  useEffect(() => {
    let initialPlayers: Player[] = [];
    if (mode === 'vs-cpu') {
      initialPlayers = [
        { id: 0, name: 'あなた (P1)', isCpu: false, bowl: [], isPassed: false, isBusted: false },
        { id: 1, name: 'モツ太郎 (CPU)', isCpu: true, bowl: [], isPassed: false, isBusted: false },
        { id: 2, name: 'キャベ子 (CPU)', isCpu: true, bowl: [], isPassed: false, isBusted: false },
        { id: 3, name: '闇シェフ (CPU)', isCpu: true, bowl: [], isPassed: false, isBusted: false }
      ];
    } else {
      initialPlayers = [
        { id: 0, name: 'プレイヤー1', isCpu: false, bowl: [], isPassed: false, isBusted: false },
        { id: 1, name: 'プレイヤー2', isCpu: false, bowl: [], isPassed: false, isBusted: false }
      ];
    }
    setPlayers(initialPlayers);
    setPotStack([]);
    setCurrentDraftPlayerIndex(0);
    setCurrentTurnPlayerIndex(0);
    setPhase(1);
    addLog('ゲーム開始！具材を選んで鍋に投入してください。');
  }, [mode]);

  // Phase 1: ドラフト候補更新
  useEffect(() => {
    if (phase === 1 && players.length > 0 && currentDraftPlayerIndex < players.length) {
      const currentPlayer = players[currentDraftPlayerIndex];
      setSelectedDraftIds([]);

      if (currentPlayer.isCpu) {
        // CPUの自動ドラフト
        const timer = setTimeout(() => {
          handleCpuDraft(currentPlayer);
        }, 800);
        return () => clearTimeout(timer);
      } else {
        // 6枚から3枚選択
        const options = getRandomIngredients(6);
        setDraftOptions(options);
      }
    }
  }, [phase, currentDraftPlayerIndex, players]);

  // Phase 2: CPUターンの処理
  useEffect(() => {
    if (phase === 2 && players.length > 0) {
      const activePlayers = players.filter(p => !p.isPassed && !p.isBusted);
      if (activePlayers.length === 0 || potStack.length === 0) {
        addLog('全員の行動が終了したか鍋が空になりました！点数集計へ進みます。', true);
        const timer = setTimeout(() => {
          setPhase(3);
          playSound('win', soundEnabled);
        }, 1500);
        return () => clearTimeout(timer);
      }

      const curPlayer = players[currentTurnPlayerIndex];
      if (curPlayer.isPassed || curPlayer.isBusted || curPlayer.bowl.length >= 4) {
        if (curPlayer.bowl.length >= 4 && !curPlayer.isPassed && !curPlayer.isBusted) {
          updatePlayerState(curPlayer.id, { isPassed: true });
          addLog(`${curPlayer.name} は上限の4枚引いたためお椀を確定しました。`);
        }
        advanceTurn();
        return;
      }

      if (curPlayer.isCpu) {
        const timer = setTimeout(() => {
          handleCpuTurn(curPlayer);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [phase, currentTurnPlayerIndex, players, potStack]);

  const addLog = (text: string, isHighlight = false, isBust = false) => {
    setGameLogs(prev => [...prev, { id: Date.now() + Math.random(), text, isHighlight, isBust }]);
  };

  const getRandomIngredients = (count: number): Ingredient[] => {
    const shuffled = [...INGREDIENTS_DATABASE].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const toggleDraftSelection = (id: string) => {
    playSound('select', soundEnabled);
    if (selectedDraftIds.includes(id)) {
      setSelectedDraftIds(prev => prev.filter(item => item !== id));
    } else {
      if (selectedDraftIds.length < 3) {
        setSelectedDraftIds(prev => [...prev, id]);
      }
    }
  };

  const submitHumanDraft = () => {
    if (selectedDraftIds.length !== 3) return;
    playSound('add', soundEnabled);

    const chosenItems = selectedDraftIds.map(id => INGREDIENTS_DATABASE.find(x => x.id === id)!);
    setPotStack(prev => [...prev, ...chosenItems]);

    const curPlayer = players[currentDraftPlayerIndex];
    addLog(`${curPlayer.name} が具材を3枚鍋に投入しました！`);

    const nextIndex = currentDraftPlayerIndex + 1;
    if (nextIndex < players.length) {
      setCurrentDraftPlayerIndex(nextIndex);
    } else {
      finalizePhase1();
    }
  };

  const handleCpuDraft = (cpu: Player) => {
    const options = getRandomIngredients(6);
    options.sort((a, b) => b.score - a.score);
    const chosen = [options[0], options[1], options[options.length - 1]];

    setPotStack(prev => [...prev, ...chosen]);
    addLog(`${cpu.name} が具材3枚を鍋に投入しました！`);

    const nextIndex = currentDraftPlayerIndex + 1;
    if (nextIndex < players.length) {
      setCurrentDraftPlayerIndex(nextIndex);
    } else {
      finalizePhase1();
    }
  };

  const finalizePhase1 = () => {
    // 基本具材追加（8枚）
    const baseIds = ['motsu_normal', 'motsu_premium', 'vege_cabbage', 'vege_nira', 'vege_tofu', 'spice_chili', 'spice_dashi', 'yami_pepper'];
    const baseItems = baseIds.map(id => INGREDIENTS_DATABASE.find(x => x.id === id)!);
    
    setPotStack(prev => {
      const full = [...prev, ...baseItems].sort(() => 0.5 - Math.random());
      return full;
    });

    addLog('鍋に具材と出汁が揃い、グツグツ煮立ちました！Phase 2へ移動します。', true);
    setTimeout(() => {
      setPhase(2);
      setCurrentTurnPlayerIndex(0);
    }, 1000);
  };

  const advanceTurn = () => {
    setCurrentTurnPlayerIndex(prev => (prev + 1) % players.length);
  };

  const updatePlayerState = (id: number, updates: Partial<Player>) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleDrawClick = () => {
    const curPlayer = players[currentTurnPlayerIndex];
    if (curPlayer.isCpu || curPlayer.isPassed || curPlayer.isBusted || curPlayer.bowl.length >= 4) return;
    executeDraw(curPlayer);
  };

  const handlePassClick = () => {
    const curPlayer = players[currentTurnPlayerIndex];
    if (curPlayer.isCpu || curPlayer.isPassed || curPlayer.isBusted) return;

    playSound('select', soundEnabled);
    updatePlayerState(curPlayer.id, { isPassed: true });
    addLog(`${curPlayer.name} が「いただきます！」とパスしてお椀を確定しました。`, true);
    advanceTurn();
  };

  const executeDraw = (player: Player) => {
    if (potStack.length === 0) return;

    playSound('draw', soundEnabled);
    setIsPotShaking(true);
    setTimeout(() => setIsPotShaking(false), 400);

    const newStack = [...potStack];
    const drawnItem = newStack.pop()!;
    setPotStack(newStack);

    const updatedBowl = [...player.bowl, drawnItem];
    const currentSpice = updatedBowl.reduce((acc, cur) => acc + cur.spice, 0);

    let isBusted = player.isBusted;
    let isPassed = player.isPassed;

    if (currentSpice >= 4) {
      isBusted = true;
      playSound('bust', soundEnabled);
      addLog(`💥💥 ${player.name} のお椀が激辛度(🔥${currentSpice})に達し【激辛バースト】しました！0点確定！`, false, true);
    } else if (updatedBowl.length >= 4) {
      isPassed = true;
      addLog(`🥣 ${player.name} は上限の4枚の具材を確保し、お椀が完成しました！`);
    } else {
      addLog(`${player.name} が 【${drawnItem.icon} ${drawnItem.name}】 を引きました！ (${drawnItem.score >= 0 ? '+' + drawnItem.score : drawnItem.score}pt)`);
    }

    updatePlayerState(player.id, { bowl: updatedBowl, isBusted, isPassed });
    setTimeout(() => advanceTurn(), 600);
  };

  const handleCpuTurn = (cpu: Player) => {
    const currentSpice = cpu.bowl.reduce((acc, cur) => acc + cur.spice, 0);
    const currentScore = cpu.bowl.reduce((acc, cur) => acc + cur.score, 0);

    let shouldPass = false;
    if (cpu.bowl.length === 0) {
      shouldPass = false;
    } else if (cpu.bowl.length >= 3 && currentScore >= 10) {
      shouldPass = true;
    } else if (currentSpice >= 3 && Math.random() < 0.8) {
      shouldPass = true;
    } else if (cpu.bowl.length >= 3 && Math.random() < 0.5) {
      shouldPass = true;
    }

    if (shouldPass) {
      playSound('select', soundEnabled);
      updatePlayerState(cpu.id, { isPassed: true });
      addLog(`${cpu.name} は満足してパス（確定）しました。`);
      advanceTurn();
    } else {
      executeDraw(cpu);
    }
  };

  // 最終スコア計算
  const getCalculatedRankings = () => {
    return players.map(p => {
      if (p.isBusted) {
        return { ...p, finalScore: 0, scoreBreakdown: '激辛バーストにより 0 pt' };
      }
      const baseScore = p.bowl.reduce((acc, cur) => acc + cur.score, 0);
      let bonus = 0;
      const details: string[] = [];

      const hasMotsu = p.bowl.some(b => b.category === 'motsu');
      const hasVege = p.bowl.some(b => b.category === 'vege');
      const hasSpice = p.bowl.some(b => b.category === 'spice');
      const motsuCount = p.bowl.filter(b => b.category === 'motsu').length;

      if (hasMotsu && hasVege) { bonus += 3; details.push('王道組み合わせ(+3)'); }
      if (hasMotsu && hasSpice) { bonus += 2; details.push('出汁マリアージュ(+2)'); }
      if (motsuCount >= 3) { bonus += 4; details.push('メガ盛りもつコンボ(+4)'); }

      const finalScore = baseScore + bonus;
      const scoreBreakdown = `基本:${baseScore}pt ` + (details.length ? `(${details.join(', ')})` : '');
      return { ...p, finalScore, scoreBreakdown };
    }).sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0));
  };

  return (
    <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', color: '#f5f6fa', fontFamily: "'Shippori Mincho', serif" }}>
      {/* ステッパー */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', margin: '20px 0' }}>
        {[1, 2, 3].map(num => (
          <div
            key={num}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              border: '1px solid ' + (phase === num ? '#d63031' : 'rgba(255,255,255,0.1)'),
              background: phase === num ? 'rgba(214,48,49,0.2)' : 'rgba(255,255,255,0.03)',
              color: phase === num ? '#fdcb6e' : '#b2bec3',
              fontSize: '0.9rem'
            }}
          >
            Step {num}: {num === 1 ? '具材を入れる' : num === 2 ? '鍋から引く' : '集計結果'}
          </div>
        ))}
      </div>

      {/* PHASE 1: 具材ドラフト */}
      {phase === 1 && (
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#fdcb6e', fontSize: '1.6rem', marginBottom: '8px' }}>
            {players[currentDraftPlayerIndex]?.name} の手番：具材を選ぼう
          </h2>
          <p style={{ color: '#b2bec3', marginBottom: '20px' }}>
            鍋に投入する具材を <b>3枚</b> 選んでください（選んだ数: {selectedDraftIds.length}/3）
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
            {draftOptions.map(item => {
              const isSelected = selectedDraftIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleDraftSelection(item.id)}
                  style={{
                    background: isSelected ? 'rgba(214, 48, 49, 0.2)' : '#1c1417',
                    border: '1px solid ' + (isSelected ? '#d63031' : 'rgba(255,255,255,0.1)'),
                    borderRadius: '12px',
                    padding: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                  <div style={{ fontSize: '2.5rem' }}>{item.icon}</div>
                  <div style={{ fontWeight: 'bold', color: '#fdcb6e', margin: '6px 0' }}>{item.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#b2bec3', height: '36px', overflow: 'hidden' }}>{item.desc}</div>
                  <div style={{ marginTop: '8px', fontWeight: 'bold', color: item.score < 0 ? '#ff7675' : '#55efc4' }}>
                    {item.score >= 0 ? '+' : ''}{item.score} pt {item.spice > 0 ? `🔥+${item.spice}` : ''}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={submitHumanDraft}
            disabled={selectedDraftIds.length !== 3}
            style={{
              padding: '12px 32px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              borderRadius: '30px',
              border: 'none',
              background: selectedDraftIds.length === 3 ? 'linear-gradient(135deg, #d63031, #b22222)' : '#555',
              color: '#fff',
              cursor: selectedDraftIds.length === 3 ? 'pointer' : 'not-allowed'
            }}
          >
            鍋に投入する (3/3)
          </button>
        </div>
      )}

      {/* PHASE 2: メイン鍋漁り */}
      {phase === 2 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
          {/* 鍋と手番エリア */}
          <div style={{ background: '#1c1417', border: '1px solid rgba(253, 203, 110, 0.3)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
            <div style={{ color: '#fdcb6e', fontSize: '1.1rem', marginBottom: '10px' }}>
              🎲 <strong style={{ color: '#fff' }}>{players[currentTurnPlayerIndex]?.name}</strong> の手番
            </div>

            {/* 鍋ビジュアル */}
            <div
              onClick={handleDrawClick}
              style={{
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #800f13 0%, #3a0507 70%, #150203 100%)',
                border: '10px solid #2d1819',
                margin: '15px auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 0 25px rgba(214, 48, 49, 0.4)',
                transform: isPotShaking ? 'rotate(3deg) scale(0.98)' : 'none',
                transition: 'transform 0.1s'
              }}
            >
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fdcb6e' }}>{potStack.length}</div>
                <div style={{ fontSize: '0.8rem', color: '#b2bec3' }}>残り具材</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
              <button
                onClick={handleDrawClick}
                disabled={players[currentTurnPlayerIndex]?.isCpu}
                style={{ padding: '10px 24px', background: '#d63031', color: '#fff', border: 'none', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                🍲 鍋から1枚引く
              </button>
              <button
                onClick={handlePassClick}
                disabled={players[currentTurnPlayerIndex]?.isCpu}
                style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid #666', borderRadius: '20px', cursor: 'pointer' }}
              >
                🛑 パス (確定)
              </button>
            </div>

            {/* お椀グリッド (4スロット) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              {players.map((p, idx) => {
                const isTurn = idx === currentTurnPlayerIndex && !p.isPassed && !p.isBusted;
                const spiceCount = p.bowl.reduce((acc, cur) => acc + cur.spice, 0);
                return (
                  <div
                    key={p.id}
                    style={{
                      background: isTurn ? 'rgba(253, 203, 110, 0.1)' : 'rgba(255,255,255,0.03)',
                      border: '1px solid ' + (p.isBusted ? '#ff7675' : isTurn ? '#fdcb6e' : 'rgba(255,255,255,0.1)'),
                      borderRadius: '10px',
                      padding: '10px',
                      opacity: p.isPassed ? 0.6 : 1
                    }}
                  >
                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{p.name}</span>
                      <span style={{ fontSize: '0.75rem', color: p.isBusted ? '#ff7675' : p.isPassed ? '#b2bec3' : '#fdcb6e' }}>
                        {p.isBusted ? '💥バースト' : p.isPassed ? '確定' : '手番'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', margin: '8px 0' }}>
                      {[0, 1, 2, 3].map(slotIdx => {
                        const item = p.bowl[slotIdx];
                        return (
                          <div key={slotIdx} style={{ width: '40px', height: '50px', border: '1px dashed #555', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', background: '#000' }}>
                            {item ? item.icon : ''}
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#b2bec3', display: 'flex', justifyContent: 'space-between' }}>
                      <span>激辛: {'🔥'.repeat(spiceCount) || '0'}</span>
                      <span>{p.bowl.length}/4枚</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ログ領域 */}
          <div style={{ background: '#1c1417', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', height: '420px' }}>
            <h4 style={{ color: '#fdcb6e', marginBottom: '10px' }}>📜 状況ログ</h4>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
              {gameLogs.map(log => (
                <div
                  key={log.id}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: log.isBust ? 'rgba(108, 92, 231, 0.2)' : log.isHighlight ? 'rgba(214, 48, 49, 0.15)' : 'rgba(255,255,255,0.03)',
                    color: log.isBust ? '#ff7675' : '#f5f6fa',
                    borderLeft: '3px solid ' + (log.isBust ? '#6c5ce7' : log.isHighlight ? '#d63031' : '#fdcb6e')
                  }}
                >
                  {log.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PHASE 3: リザルト */}
      {phase === 3 && (
        <div style={{ background: '#1c1417', border: '1px solid #fdcb6e', borderRadius: '16px', padding: '30px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem' }}>🏆</div>
          <h2 style={{ color: '#fdcb6e', fontSize: '2rem', margin: '10px 0' }}>
            {getCalculatedRankings()[0]?.name} の勝利！
          </h2>
          <p style={{ color: '#b2bec3', marginBottom: '30px' }}>最高のお椀が完成しました！</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
            {getCalculatedRankings().map((p, rank) => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 20px',
                  background: rank === 0 ? 'rgba(253, 203, 110, 0.15)' : 'rgba(255,255,255,0.04)',
                  border: '1px solid ' + (rank === 0 ? '#fdcb6e' : 'rgba(255,255,255,0.08)'),
                  borderRadius: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: rank === 0 ? '#fdcb6e' : '#555', color: '#000', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {rank + 1}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 'bold' }}>{p.name} {p.isBusted && <span style={{ color: '#ff7675' }}>[バースト]</span>}</div>
                    <div style={{ fontSize: '0.75rem', color: '#b2bec3' }}>{p.scoreBreakdown}</div>
                  </div>
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#fdcb6e' }}>
                  {p.finalScore} pt
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onResetToStart}
            style={{ padding: '12px 32px', background: '#d63031', color: '#fff', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', borderRadius: '30px', cursor: 'pointer' }}
          >
            🔄 タイトルへ戻る
          </button>
        </div>
      )}
    </div>
  );
};
