import React from 'react';

interface MockStartProps {
  onStartGame: (mode: 'vs-cpu' | 'hotseat') => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  navigateTo: (path: string) => void;
}

export const MockStart: React.FC<MockStartProps> = ({
  onStartGame,
  soundEnabled,
  onToggleSound,
  navigateTo
}) => {
  return (
    <div style={{
      width: '100%',
      maxWidth: '600px',
      margin: '40px auto 0',
      background: '#1c1417',
      border: '1px solid rgba(253, 203, 110, 0.3)',
      borderRadius: '16px',
      padding: '36px 28px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
      textAlign: 'center',
      color: '#f5f6fa',
      fontFamily: "'Shippori Mincho', serif"
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button
          onClick={() => navigateTo('/')}
          style={{ background: 'transparent', border: '1px solid #b2bec3', color: '#b2bec3', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer' }}
        >
          ← トップポータルへ
        </button>
        <button
          onClick={onToggleSound}
          style={{ background: 'transparent', border: '1px solid rgba(253, 203, 110, 0.3)', color: '#fdcb6e', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer' }}
        >
          {soundEnabled ? '🔊 効果音: ON' : '🔇 効果音: OFF'}
        </button>
      </div>

      <h2 style={{ fontSize: '2.2rem', color: '#fdcb6e', marginBottom: '12px' }}>
        🍲 闇もつ鍋へようこそ
      </h2>
      <p style={{ color: '#b2bec3', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '24px' }}>
        美味しいもつ鍋を作るか、闇の具材で全員を巻き込むか！？<br />
        チキンレースで最高の「お椀」を作り上げよう！
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
        <button
          onClick={() => onStartGame('vs-cpu')}
          style={{
            padding: '16px 20px',
            border: '1px solid rgba(253, 203, 110, 0.4)',
            background: 'rgba(255,255,255,0.03)',
            color: '#f5f6fa',
            fontSize: '1.1rem',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'all 0.3s'
          }}
        >
          <span>🤖 VS CPU モード (1P vs CPU3体)</span>
          <span style={{ fontSize: '0.85rem', color: '#fdcb6e' }}>手軽にプレイ ➔</span>
        </button>

        <button
          onClick={() => onStartGame('hotseat')}
          style={{
            padding: '16px 20px',
            border: '1px solid rgba(253, 203, 110, 0.4)',
            background: 'rgba(255,255,255,0.03)',
            color: '#f5f6fa',
            fontSize: '1.1rem',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'all 0.3s'
          }}
        >
          <span>👥 2人対戦 モード (1P vs 2P)</span>
          <span style={{ fontSize: '0.85rem', color: '#fdcb6e' }}>交互に操作 ➔</span>
        </button>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px dashed rgba(253, 203, 110, 0.3)',
        padding: '14px 18px',
        borderRadius: '8px',
        fontSize: '0.85rem',
        color: '#b2bec3',
        textAlign: 'left',
        lineHeight: '1.5'
      }}>
        💡 <b>ルール概要</b><br />
        1. 具材を選んで鍋に投入！（各プレイヤー3枚選択）<br />
        2. 鍋から具材を最大4枚引く（いつでもパス可能）。<br />
        3. 闇具材や唐辛子で【激辛バースト(🔥4以上)】すると0点！引き際を見極めろ！
      </div>
    </div>
  );
};
