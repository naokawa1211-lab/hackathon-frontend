import React, { useState, useEffect, useRef } from 'react';

// メッセージの型定義（Goの構造体と一致させます）
interface Message {
  id?: number;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at?: string;
}

// チャット相手の型定義（モック用）
interface ChatUser {
  id: string;
  username: string;
  status: 'ONLINE' | 'OFFLINE';
  lastMessage: string;
}

export const DMPage: React.FC = () => {
  // 💡 テスト用：現在の自分を 'user_A' と仮定（本来は Firebase の user.uid 等を紐付けます）
  const CURRENT_USER_ID = 'user_A';

  // 📡 状態管理
  const [chats] = useState<ChatUser[]>([
    { id: 'user_B', username: 'エイリアンB', status: 'ONLINE', lastMessage: 'Hackathon Win!' },
    { id: 'user_C', username: '謎の生命体C', status: 'OFFLINE', lastMessage: '通信途絶...' },
  ]);
  const [selectedUserId, setSelectedUserId] = useState<string>('user_B');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1️⃣ チャット履歴を取得する関数（GoのAPIを叩く）
  const fetchChatHistory = async (receiverId: string) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/messages/history?sender_id=${CURRENT_USER_ID}&receiver_id=${receiverId}`
      );
      if (response.ok) {
        const data = await response.json();
        setMessages(data || []); // 履歴が空なら空配列
      }
    } catch (err) {
      console.error('履歴の取得に失敗しました:', err);
    }
  };

  // 2️⃣ メッセージを送信する関数（GoのAPIを叩く）
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage: Message = {
      sender_id: CURRENT_USER_ID,
      receiver_id: selectedUserId,
      content: inputText,
    };

    try {
      const response = await fetch('http://localhost:8080/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage),
      });

      if (response.ok) {
        setInputText('');
        // 送信成功したら、最新の履歴を再取得して画面を更新
        await fetchChatHistory(selectedUserId);
      }
    } catch (err) {
      console.error('メッセージの送信に失敗しました:', err);
    }
  };

  // 🔄 選択する相手が変わるたびに、自動でAPIを叩いてチャット履歴を切り替える
  useEffect(() => {
    fetchChatHistory(selectedUserId);
    
    // ハッカソン用の簡易リアルタイム化：3秒ごとに自動リロード
    const interval = setInterval(() => fetchChatHistory(selectedUserId), 3000);
    return () => clearInterval(interval);
  }, [selectedUserId]);

  // 📜 メッセージが増えたら一番下まで自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeUser = chats.find((u) => u.id === selectedUserId);

  return (
    <div className="flex h-[calc(100vh-50px)] text-slate-200 font-mono">
      
      {/* 🧭 2カラム目：チャット相手のリスト（左サイド） */}
      <div className="w-80 bg-slate-950/40 border-r border-cyan-500/20 flex flex-col">
        <div className="p-4 border-b border-cyan-500/20 bg-slate-950/60">
          <h2 className="text-xs font-bold text-cyan-400 tracking-widest uppercase">
            📡 QUANTUM CHANNELS
          </h2>
        </div>
        <div className="flex-grow overflow-y-auto">
          {chats.map((u) => (
            <button
              key={u.id}
              onClick={() => setSelectedUserId(u.id)}
              className={`w-full text-left p-4 flex flex-col gap-1 border-b border-slate-900 transition-all ${
                selectedUserId === u.id
                  ? 'bg-cyan-950/30 border-l-2 border-l-cyan-400'
                  : 'hover:bg-slate-900/40'
              }`}
            >
              <div className="flex justify-between items-center w-full">
                <span className="font-bold text-sm">{u.username}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full border ${
                    u.status === 'ONLINE'
                      ? 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20'
                      : 'border-slate-700 text-slate-500 bg-slate-900'
                  }`}
                >
                  {u.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate w-full">{u.lastMessage}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 💬 3カラム目：メインのトーク画面（右側） */}
      <div className="flex-grow flex flex-col bg-slate-950/20">
        {/* トークルームヘッダー */}
        <div className="p-4 bg-slate-950/60 border-b border-cyan-500/10 flex justify-between items-center">
          <div>
            <span className="text-xs text-cyan-500 tracking-wider">SECURE CONNECTION WITH:</span>
            <h1 className="text-base font-bold text-white">
              {activeUser?.username} <span className="text-xs text-slate-500">({activeUser?.id})</span>
            </h1>
          </div>
          <div className="text-[10px] text-amber-400/80 bg-amber-950/30 border border-amber-500/20 px-2 py-1 rounded animate-pulse">
            🔒 END-TO-END QUANTUM ENCRYPTED
          </div>
        </div>

        {/* タイムライン（メッセージ表示エリア） */}
        <div className="flex-grow p-6 overflow-y-auto flex flex-col gap-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500 tracking-widest uppercase">
              NO NOISE DETECTED. START COMMUNICATING.
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMe = msg.sender_id === CURRENT_USER_ID;
              return (
                <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[70%] p-3 rounded-lg text-sm border transition-all ${
                      isMe
                        ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200 rounded-tr-none shadow-[0_0_10px_rgba(34,211,238,0.1)]'
                        : 'bg-slate-900/80 border-slate-700 text-slate-300 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    <span className="block text-[9px] text-slate-500 mt-1 text-right">
                      {msg.created_at ? new Date(msg.created_at).toLocaleTimeString() : 'JUST NOW'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* メッセージ入力フォーム */}
        <form onSubmit={handleSendMessage} className="p-4 bg-slate-950/60 border-t border-cyan-500/20 flex gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="量子暗号メッセージを入力..."
            className="flex-grow bg-slate-900 border border-slate-700 rounded px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
          />
          <button
            type="submit"
            className="px-5 py-2 bg-cyan-950 text-cyan-400 border border-cyan-400/40 rounded text-sm hover:bg-cyan-400 hover:text-slate-950 font-bold tracking-widest transition-all uppercase"
          >
            SEND
          </button>
        </form>

      </div>
    </div>
  );
};