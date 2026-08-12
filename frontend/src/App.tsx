import { useState, useEffect, useRef } from 'react'
import './App.css'
import { MockStart } from './components/mock/MockStart'
import { MockGame } from './components/mock/MockGame'

interface HealthResponse {
  status: string;
  redis_connected: boolean;
}

interface WebSocketMsg {
  type: string;
  sender?: string;
  player_name?: string;
  room_id?: string;
  message?: string;
  data?: any;
  active_players?: string[];
}

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [gameMode, setGameMode] = useState<'vs-cpu' | 'hotseat'>('vs-cpu');
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const handleStartGame = (mode: 'vs-cpu' | 'hotseat') => {
    setGameMode(mode);
    navigateTo('/mock/game');
  };

  // /infra ルート
  if (currentPath === '/infra' || currentPath === '/infra/') {
    return <InfraPanel navigateTo={navigateTo} />;
  }

  // /mock/game ルート
  if (currentPath === '/mock/game' || currentPath === '/mock/game/') {
    return (
      <div style={{ padding: '20px', minHeight: '100vh', background: '#0f0a0c' }}>
        <MockGame
          mode={gameMode}
          soundEnabled={soundEnabled}
          onResetToStart={() => navigateTo('/mock')}
        />
      </div>
    );
  }

  // /mock ルート
  if (currentPath === '/mock' || currentPath === '/mock/' || currentPath.startsWith('/mock')) {
    return (
      <div style={{ padding: '20px', minHeight: '100vh', background: '#0f0a0c' }}>
        <MockStart
          onStartGame={handleStartGame}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(prev => !prev)}
          navigateTo={navigateTo}
        />
      </div>
    );
  }

  // トップポータル ( / )
  return (
    <div style={{ maxWidth: '800px', margin: '60px auto', textAlign: 'center', fontFamily: 'sans-serif', color: '#f5f6fa' }}>
      <h1>🍲 闇もつ鍋 Web アプリケーション ポータル</h1>
      <p style={{ color: '#b2bec3', margin: '20px 0', lineHeight: '1.6' }}>
        以下のナビゲーションからモックゲームをプレイいただくか、インフラの疎通確認が行えます。
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px' }}>
        <button
          onClick={() => navigateTo('/mock')}
          style={{
            background: 'linear-gradient(135deg, #d63031, #b22222)',
            color: '#fff',
            padding: '16px 32px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(214, 48, 49, 0.4)'
          }}
        >
          🎮 闇もつ鍋 モックゲームを遊ぶ (`/mock`)
        </button>

        <button
          onClick={() => navigateTo('/infra')}
          style={{
            background: '#89b4fa',
            color: '#11111b',
            padding: '16px 32px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer'
          }}
        >
          🔍 インフラ疎通確認パネル (`/infra`)
        </button>
      </div>
    </div>
  );
}

// インフラ疎通確認専用コンポーネント (domain/infra)
function InfraPanel({ navigateTo }: { navigateTo: (path: string) => void }) {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  const [roomId, setRoomId] = useState('nabe-room-1');
  const [playerName, setPlayerName] = useState('プレイヤー1');
  const [isConnected, setIsConnected] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [activePlayers, setActivePlayers] = useState<string[]>([]);

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data: HealthResponse) => setHealth(data))
      .catch((err) => setHealthError(err.message));
  }, []);

  const connectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ws/room/${roomId}/${encodeURIComponent(playerName)}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      addLog(`[SYSTEM] ルーム [${roomId}] の WebSocket に接続しました`);
    };

    ws.onmessage = (event) => {
      try {
        const data: WebSocketMsg = JSON.parse(event.data);
        if (data.message) {
          addLog(data.message);
        }
        if (data.active_players) {
          setActivePlayers(data.active_players);
        }
      } catch (e) {
        addLog(`[RAW] ${event.data}`);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      addLog(`[SYSTEM] 接続が切断されました`);
    };

    ws.onerror = (err) => {
      console.error('WebSocket Error:', err);
      addLog(`[ERROR] WebSocketエラーが発生しました`);
    };
  };

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  const sendMessage = () => {
    if (!wsRef.current || !inputMsg.trim()) return;
    wsRef.current.send(JSON.stringify({ type: 'CHAT', content: inputMsg }));
    setInputMsg('');
  };

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>🍲 インフラ疎通確認パネル (`/infra`)</h1>
        <button onClick={() => navigateTo('/')} style={{ padding: '6px 12px' }}>
          ← トップへ戻る
        </button>
      </div>

      <div style={{ background: '#1e1e2e', color: '#cdd6f4', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>🖥️ API & インフラステータス</h3>
        {healthError ? (
          <p style={{ color: '#f38ba8' }}>❌ API接続エラー: {healthError}</p>
        ) : health ? (
          <div>
            <p>✅ FastAPI Status: <strong style={{ color: '#a6e3a1' }}>{health.status}</strong></p>
            <p>✅ Redis Connected: <strong style={{ color: health.redis_connected ? '#a6e3a1' : '#f38ba8' }}>{health.redis_connected ? 'OK' : 'Disconnected'}</strong></p>
          </div>
        ) : (
          <p>ヘルスチェック確認中...</p>
        )}
      </div>

      <div style={{ background: '#181825', color: '#cdd6f4', padding: '20px', borderRadius: '8px' }}>
        <h3>🔌 WebSocket ルーム疎通テスト</h3>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <label>
            ルームID:
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              disabled={isConnected}
              style={{ marginLeft: '5px', padding: '6px' }}
            />
          </label>
          <label>
            プレイヤー名:
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              disabled={isConnected}
              style={{ marginLeft: '5px', padding: '6px' }}
            />
          </label>

          {!isConnected ? (
            <button onClick={connectWebSocket} style={{ background: '#a6e3a1', padding: '6px 16px', fontWeight: 'bold' }}>
              ルームに参加 (接続)
            </button>
          ) : (
            <button onClick={disconnectWebSocket} style={{ background: '#f38ba8', padding: '6px 16px', fontWeight: 'bold' }}>
              退出 (切断)
            </button>
          )}
        </div>

        {isConnected && (
          <div style={{ marginBottom: '15px' }}>
            <strong>現在参加中のプレイヤー: </strong>
            {activePlayers.map((p, i) => (
              <span key={i} style={{ background: '#313244', padding: '3px 8px', borderRadius: '4px', marginRight: '6px' }}>
                {p}
              </span>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="送信テストメッセージ..."
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            disabled={!isConnected}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            style={{ flex: 1, padding: '8px' }}
          />
          <button onClick={sendMessage} disabled={!isConnected} style={{ padding: '8px 16px' }}>
            送信
          </button>
        </div>

        <div style={{ background: '#11111b', height: '220px', overflowY: 'auto', padding: '10px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.9rem' }}>
          {logs.length === 0 ? (
            <span style={{ color: '#6c7086' }}>ここにWebSocket受信ログが表示されます...</span>
          ) : (
            logs.map((log, index) => <div key={index} style={{ marginBottom: '4px' }}>{log}</div>)
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
