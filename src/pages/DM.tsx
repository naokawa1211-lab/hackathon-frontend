import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Lock, Send, ChevronLeft } from 'lucide-react'; // 💡 ChevronLeft（戻るアイコン）を追加
import AppLayout from '../components/layout/AppLayout';
import { DMSidebar } from '../components/sidebar/DMSidebar';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

interface Message {
  id?: number;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at?: string;
}

interface ChatUser {
  id: string;
  username: string;
  status: 'ONLINE' | 'OFFLINE';
  lastMessage: string;
}

const DEFAULT_CHATS: ChatUser[] = [
  { id: 'user_B', username: 'エイリアンB', status: 'ONLINE', lastMessage: 'Hackathon Win!' },
  { id: 'user_C', username: '謎の生命体C', status: 'OFFLINE', lastMessage: '通信途絶...' },
];

export const DMPage: React.FC = () => {
  const { user } = useAuth();
  const CURRENT_USER_ID = user?.uid ?? 'guest';

  const { sellerId } = useParams<{ sellerId?: string }>();
  const location = useLocation();
  const sellerName = (location.state as { sellerName?: string } | null)?.sellerName;

  const [chats, setChats] = useState<ChatUser[]>(DEFAULT_CHATS);
  
  // 💡 初期値を string | null に変更し、最初は一覧を見せられるようにする
  const [selectedUserId, setSelectedUserId] = useState<string | null>(sellerId ?? null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // 🛰️ 購入直後の「取引を開始しました」メッセージを、同じ相手に対して二重送信しないためのガード
  const startedTransactionsRef = useRef<Set<string>>(new Set());

  const fetchUsernameFromAPI = async (id: string): Promise<string> => {
    if (id === 'mock_uid_naoya') return 'Naoya';
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${id}`);
      if (res.ok) {
        const userData = await res.json();
        return userData.username;
      }
    } catch (err) {
      console.error(`UID: ${id} の名前解決に失敗しました:`, err);
    }
    return `未知の生命体 (${id.slice(0, 5)})`;
  };

  useEffect(() => {
    if (!sellerId) return;
    setSelectedUserId(sellerId);

    const resolveAndAddRoute = async () => {
      const finalName = sellerName || (await fetchUsernameFromAPI(sellerId));

      setChats((prev) => {
        if (prev.some((c) => c.id === sellerId)) return prev;
        return [
          { id: sellerId, username: finalName, status: 'ONLINE', lastMessage: '取引を開始しました' },
          ...prev,
        ];
      });

      // 🛰️ sellerName はsearchページの購入成功時にしか渡されない値なので、
      // 「購入直後の遷移である」ことの判定に使い、実際の会話にも開始メッセージを残す
      if (sellerName && !startedTransactionsRef.current.has(sellerId)) {
        startedTransactionsRef.current.add(sellerId);
        try {
          await fetch(`${API_BASE_URL}/api/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sender_id: CURRENT_USER_ID,
              receiver_id: sellerId,
              content: '取引を開始しました。よろしくお願いします！',
            }),
          });
          await fetchChatHistory(sellerId);
        } catch (err) {
          console.error('取引開始メッセージの送信に失敗しました:', err);
        }
      }
    };

    resolveAndAddRoute();
  }, [sellerId, sellerName]);

  const fetchChatHistory = async (receiverId: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/messages/history?sender_id=${CURRENT_USER_ID}&receiver_id=${receiverId}`
      );
      if (response.ok) {
        const data = await response.json();
        setMessages(data || []);
      }
    } catch (err) {
      console.error('履歴の取得に失敗しました:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedUserId) return; // 💡 selectedUserId の存在チェックを追加

    const newMessage: Message = {
      sender_id: CURRENT_USER_ID,
      receiver_id: selectedUserId,
      content: inputText,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage),
      });

      if (response.ok) {
        setInputText('');
        await fetchChatHistory(selectedUserId);
      }
    } catch (err) {
      console.error('メッセージの送信に失敗しました:', err);
    }
  };

  // 💡 selectedUserId があるときだけ通信するようにガードを入れる
  useEffect(() => {
    if (!selectedUserId) {
      setMessages([]);
      return;
    }
    fetchChatHistory(selectedUserId);
    const interval = setInterval(() => fetchChatHistory(selectedUserId), 3000);
    return () => clearInterval(interval);
  }, [selectedUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const fetchPartners = async () => {
      if (!CURRENT_USER_ID || CURRENT_USER_ID === 'guest') return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/messages/partners?user_id=${CURRENT_USER_ID}`);
        if (response.ok) {
          const partnerIds: string[] = await response.json();
          
          const fetchedChats: ChatUser[] = await Promise.all(
            partnerIds.map(async (id) => {
              const resolvedName = await fetchUsernameFromAPI(id);
              return {
                id: id,
                username: resolvedName,
                status: 'ONLINE',
                lastMessage: '過去の通信記録あり',
              };
            })
          );

          setChats((prev) => {
            const combined = [...fetchedChats, ...DEFAULT_CHATS];
            return combined.filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i);
          });
        }
      } catch (err) {
        console.error('チャット相手の一覧取得に失敗しました:', err);
      }
    };

    fetchPartners();
  }, [CURRENT_USER_ID]);

  const activeUser = chats.find((u) => u.id === selectedUserId);

  return (
    <AppLayout>
      {/* 💡 sidebar属性は使わず、children の中でサイドバーとトーク画面を横並び(flex)にする */}
      <div className="h-full flex w-full overflow-hidden">
        
        {/* 👤 サイドバーエリア */}
        {/* スマホ時: 誰かを選んでいたら hidden / 選んでいなければ block（全画面） */}
        {/* PC時: 常に block（幅はDMSidebar内の md:w-80 が適用される） */}
        <div
          className={`
            ${selectedUserId ? 'hidden md:block' : 'block'}
            w-full md:w-auto flex-shrink-0 h-full
          `}
        >
          <DMSidebar
            chats={chats}
            selectedUserId={selectedUserId ?? ''}
            onSelectUser={setSelectedUserId}
          />
        </div>

        {/* 💬 メインのトーク画面 */}
        {/* スマホ時: 誰かを選んでいたら flex（全画面） / 選んでいなければ hidden */}
        {/* PC時: 常に flex（残りの画面幅をすべて埋める） */}
        <div 
          className={`
            ${selectedUserId ? 'flex' : 'hidden'} 
            md:flex flex-grow h-full flex-col bg-slate-950/20 font-mono text-slate-200
          `}
        >
          {selectedUserId ? (
            <>
              {/* トークルームヘッダー */}
              <div className="p-4 bg-slate-950/60 border-b border-cyan-500/10 flex justify-between items-center flex-shrink-0">
                <div className="flex items-center gap-2">
                  {/* 📱 スマホ用「◀ LIST」ボタン（md:hidden でPCでは隠す） */}
                  <button
                    onClick={() => setSelectedUserId(null)} // null にして一覧に戻る
                    className="md:hidden p-1 mr-1 text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-0.5"
                  >
                    <ChevronLeft size={20} />
                    <span className="text-xs tracking-wider">LIST</span>
                  </button>
                  
                  <div>
                    <span className="text-[10px] md:text-xs text-cyan-500 tracking-wider block">SECURE CONNECTION WITH:</span>
                    <h1 className="text-sm md:text-base font-bold text-white">
                      {activeUser?.username} <span className="text-[10px] md:text-xs text-slate-500">({activeUser?.id})</span>
                    </h1>
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] text-amber-400/80 bg-amber-950/30 border border-amber-500/20 px-2 py-1 rounded animate-pulse flex-shrink-0">
                  <Lock size={11} />
                  <span className="hidden sm:inline">END-TO-END</span> QUANTUM ENCRYPTED
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
              <form onSubmit={handleSendMessage} className="p-4 bg-slate-950/60 border-t border-cyan-500/20 flex gap-3 flex-shrink-0">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="量子暗号メッセージを入力..."
                  className="flex-grow bg-slate-900 border border-slate-700 rounded px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                />
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-950 text-cyan-400 border border-cyan-400/40 rounded text-sm hover:bg-cyan-400 hover:text-slate-950 font-bold tracking-widest transition-all uppercase flex-shrink-0 flex items-center gap-1.5"
                >
                  <Send size={14} />
                  SEND
                </button>
              </form>
            </>
          ) : (
            // ─── PC用：誰も選択されていない時のプレースホルダー ───
            <div className="hidden md:flex flex-col flex-1 justify-center items-center text-slate-500">
              <svg className="h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="tracking-wider text-sm">通信相手のシグナルを選択してください</p>
            </div>
          )}
        </div>

      </div>
    </AppLayout>
  );
}