import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Lock, Send } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { DMSidebar } from '../components/sidebar/DMSidebar';
import { useAuth } from '../context/AuthContext';

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
  const [selectedUserId, setSelectedUserId] = useState<string>(sellerId ?? 'user_B');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 🛰️ 購入直後など、未知の取引相手とのDMルームへ遷移してきた場合はリストへ動的追加
  useEffect(() => {
    if (!sellerId) return;
    setSelectedUserId(sellerId);
    setChats((prev) => {
      if (prev.some((c) => c.id === sellerId)) return prev;
      return [
        { id: sellerId, username: sellerName ?? `取引相手 (${sellerId.slice(0, 8)})`, status: 'ONLINE', lastMessage: '取引を開始しました' },
        ...prev,
      ];
    });
  }, [sellerId, sellerName]);

  const fetchChatHistory = async (receiverId: string) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/messages/history?sender_id=${CURRENT_USER_ID}&receiver_id=${receiverId}`
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
        await fetchChatHistory(selectedUserId);
      }
    } catch (err) {
      console.error('メッセージの送信に失敗しました:', err);
    }
  };

  useEffect(() => {
    fetchChatHistory(selectedUserId);
    const interval = setInterval(() => fetchChatHistory(selectedUserId), 3000);
    return () => clearInterval(interval);
  }, [selectedUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  //過去にやり取りしたチャット相手のリストをバックエンドから取得して復元
  useEffect(() => {
    const fetchPartners = async () => {
      if (!CURRENT_USER_ID || CURRENT_USER_ID === 'guest') return;

      try {
        const response = await fetch(`http://localhost:8080/api/messages/partners?user_id=${CURRENT_USER_ID}`);
        if (response.ok) {
          const partnerIds: string[] = await response.json(); // 例: ["mock_uid_naoya"]
          
          // 取得したUIDを、サイドバーが読めるChatUser型にマッピング
          const fetchedChats: ChatUser[] = partnerIds.map((id) => ({
            id: id,
            username: id === 'mock_uid_naoya' ? 'Naoya' : `取引相手 (${id.slice(0, 8)})`, // 本来はユーザー名もDBから引きたいが、ハッカソンならこれで爆速対応！
            status: 'ONLINE',
            lastMessage: '過去の通信記録あり',
          }));

          // デフォルトのエイリアンたちとガッチャンコ（重複は排除）
          setChats((prev) => {
            const combined = [...fetchedChats, ...DEFAULT_CHATS];
            // 重複排除ロジック
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
    <AppLayout
      // 🚀 スロットにDMSidebarを流し込む。Stateと関数をPropsでバインド
      sidebar={
        <DMSidebar
          chats={chats}
          selectedUserId={selectedUserId}
          onSelectUser={setSelectedUserId}
        />
      }
    >
      {/* 💬 メインのトーク画面（AppLayoutのchildrenとして、高さいっぱいに広げる） */}
      <div className="h-full flex flex-col bg-slate-950/20 font-mono text-slate-200">
        
        {/* トークルームヘッダー */}
        <div className="p-4 bg-slate-950/60 border-b border-cyan-500/10 flex justify-between items-center flex-shrink-0">
          <div>
            <span className="text-xs text-cyan-500 tracking-wider">SECURE CONNECTION WITH:</span>
            <h1 className="text-base font-bold text-white">
              {activeUser?.username} <span className="text-xs text-slate-500">({activeUser?.id})</span>
            </h1>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-amber-400/80 bg-amber-950/30 border border-amber-500/20 px-2 py-1 rounded animate-pulse">
            <Lock size={11} />
            END-TO-END QUANTUM ENCRYPTED
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

      </div>
    </AppLayout>
  );
};