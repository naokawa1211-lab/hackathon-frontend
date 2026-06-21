import React from 'react';
import { Radio } from 'lucide-react';

// 1. チャットユーザーの型定義
interface ChatUser {
  id: string;
  username: string;
  status: 'ONLINE' | 'OFFLINE';
  lastMessage: string;
}

// 2. 親から受け取るPropsの型定義
interface DMSidebarProps {
  chats: ChatUser[];
  selectedUserId: string;
  onSelectUser: (id: string) => void;
}

export const DMSidebar: React.FC<DMSidebarProps> = ({
  chats,
  selectedUserId,
  onSelectUser,
}) => {
  return (
    <div className="w-full md:w-80 h-full bg-slate-950/40 border-r border-cyan-500/20 flex flex-col font-mono text-slate-200">
      {/* サイドバーヘッダー */}
      <div className="p-4 border-b border-cyan-500/20 bg-slate-950/60">
        <h2 className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 tracking-widest uppercase">
          <Radio size={13} />
          トークルーム
        </h2>
      </div>

      {/* チャット相手のリスト */}
      <div className="flex-grow overflow-y-auto">
        {chats.map((u) => (
          <button
            key={u.id}
            onClick={() => onSelectUser(u.id)}
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
  );
};