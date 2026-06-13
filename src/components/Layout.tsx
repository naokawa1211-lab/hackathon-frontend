import React from 'react';
import { Link, useLocation } from 'react-router-dom'; //React router

// ナビゲーション
const navItems = [
  { label: "ホーム", path: "/", icon: "🏠" },
  { label: "探す", path: "/search", icon: "🔍" },
  { label: "出品", path: "/sell", icon: "🔍" },
  { label: "お気に入り", path: "/like", icon: "🔍" },
  { label: "メッセージ", path: "/DM", icon: "🔍" },
  { label: "マイページ", path: "/mypage", icon: "🔍" },
];

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation(); //現在のURL情報を取得

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      
      {/* 🧭 左側：サイドバー（パソコン版だけで見えるようにする設定） */}
      {/* ※ Tailwindの hidden lg:block を使うか、使っていない場合はインラインスタイルでレスポンシブにします */}
      <aside 
        className="hidden lg:block" // Tailwindが入っているならこれでPCのみ表示になります
        style={{
          width: '260px',
          backgroundColor: '#f8f9fa',
          borderRight: '1px solid #e9ecef',
          padding: '20px',
          position: 'sticky',
          top: 0,
          height: '100vh',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ marginBottom: '30px', fontWeight: 'bold', fontSize: '18px', color: '#1890ff' }}>
          🚀 ハッカソンアプリ
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {navItems.map((item) => {
            // ✨ 現在のページとメニューのパスが一致しているか判定
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  // 👇 アクティブ（今開いているページ）なら青枠と薄青背景にする
                  backgroundColor: isActive ? '#e6f7ff' : 'transparent',
                  color: isActive ? '#1890ff' : '#555',
                  border: isActive ? '2px solid #1890ff' : '2px solid transparent',
                  fontWeight: isActive ? 'bold' : 'normal',
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* 📄 右側：メインコンテンツ（ページごとに中身が切り替わるエリア） */}
      <main style={{ flex: 1, backgroundColor: '#fff' }}>
        {children}
      </main>

    </div>
  );
};