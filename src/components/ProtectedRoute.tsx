import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { User } from 'firebase/auth';

interface ProtectedRouteProps {
  user: User | null;
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ user, children }) => {
  // 💡 モーダルが開いているかどうかの状態（初期値は開く）
  const [isOpen, setIsOpen] = useState(true);

  // 1. ログインしている場合は、何事もなかったかのようにページを表示
  if (user) {
    return <>{children}</>;
  }

  // 2. モーダルで「ログインへ」が押されて閉じられたら、/auth へワープ
  if (!isOpen) {
    return <Navigate to="/auth" replace />;
  }

  // 3. 🔑 未ログイン時の「宇宙フリマ専用カスタムモーダル」
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      
      {/* 🛸 モーダルの外箱（サイバーパンク風のダークネイビー＆ネオンシアン） */}
      <div className="bg-[#0b1224] border border-cyan-500/40 p-8 rounded-xl max-w-sm w-full text-center shadow-2xl shadow-cyan-500/20 relative overflow-hidden">
        
        {/* 装飾用のネオンレーザーライン */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
        
        {/* 宇宙感のあるパルスアイコン */}
        <div className="mx-auto w-16 h-16 rounded-full bg-cyan-950/50 border border-cyan-500/30 flex items-center justify-center mb-6 shadow-inner animate-pulse">
          <span className="text-2xl">📡</span>
        </div>

        {/* テキストエリア（フォントをモノスペースにしてSF感を演出） */}
        <h3 className="text-cyan-400 font-mono text-lg font-bold tracking-widest mb-1">
          SECURITY ALERT
        </h3>
        <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest mb-4">
          Unauthorized Access Detected
        </p>
        <p className="text-slate-300 text-xs leading-relaxed mb-8">
          このセクター（特定領域）に進入するには、認証シグナルが必要です。ログインまたはアカウント作成を行ってください。
        </p>

        {/* 近未来的なボタン */}
        <button
          onClick={() => setIsOpen(false)} // 押すと isOpen が false になり、上の Navigate が発動
          className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 px-6 rounded-lg font-mono text-xs tracking-widest uppercase transition-all duration-300 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-400/40 active:scale-95"
        >
          🔑 CONNECT IDENTITY
        </button>
      </div>
    </div>
  );
};