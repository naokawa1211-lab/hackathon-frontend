import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/home'; 
import { AuthPage } from './pages/auth';
import { DMPage } from './pages/DM';
import { SellPage } from './pages/sell';
import { SearchPage } from './pages/search';
import { MyPage } from './pages/mypage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext'; // 💡 useAuthもインポート
import { injectUniverseData } from "./utils/seedData";

// 🛰️ [A] メインのコンテンツ（ルーティングとローディング監視）
const AppContent = () => {
  // 💡 Contextから、Firebaseの接続状態（user, loading）を直接召喚！
  const { user, loading } = useAuth(); 

  // 📡 通信チェック中は、世界観に合わせたローディング画面を表示
  if (loading) {
    return (
      <div className="min-h-screen bg-[#060913] flex flex-col justify-center items-center text-cyan-400 font-mono">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-400 mb-4"></div>
        <p className="tracking-widest animate-pulse">📡 CONNECTING TO MILKYWAY NETWORK...</p>
      </div>
    );
  }
  return (
    <Router>
      <div className="min-h-screen bg-[#060913] flex flex-col justify-between">
        
        {/* 🌌 メインコンテンツ */}
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/search" element={<SearchPage />} />
            
            {/* 💡 user={user} の Propsバケツリレーが不要になり、めちゃくちゃスッキリします！ */}
            <Route path="/dm" element={<ProtectedRoute><DMPage /></ProtectedRoute>} />
            <Route path="/sell" element={<ProtectedRoute><SellPage /></ProtectedRoute>} />
            <Route path="/mypage" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
          </Routes>
        </div>

      </div>
    </Router>
  );
};

// 🌌 [B] アプリケーションの最外殻（すべての親）
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};


export default App;