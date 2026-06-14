import React from 'react';
import HeaderNavigation from '../navigation/HeaderNavigation';

interface AppLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, sidebar }) => {
  return (
    // 💡 1. まず全体を縦並び（flex-col）にして、画面サイズ（h-screen）からはみ出さないようにロック
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-black text-slate-100">
      
      {/* ✦ 上部ヘッダー（横いっぱいに広がる） */}
      <HeaderNavigation />
      
      {/* 💡 2. ヘッダーの下の残りエリア（flex-1）を、今度は横並び（flex）にする */}
      <div className="flex flex-1 h-full overflow-hidden">
        
        {/* 🚀 サイドバー領域：左側に固定。h-fullでヘッダー下の高さいっぱいに */}
        {sidebar && (
          <div className="hidden lg:block h-full flex-shrink-0 z-20">
            {sidebar}
          </div>
        )}

        {/* 🌌 メインコンテンツ領域：ここだけが独立して縦スクロール（overflow-y-auto）する */}
        <div className="flex-1 h-full overflow-y-auto bg-slate-950/20">
          <main className="w-full">
            {children}
          </main>
        </div>

      </div>

    </div>
  );
};

export default AppLayout;