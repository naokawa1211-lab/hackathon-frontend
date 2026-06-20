import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SatelliteDish } from 'lucide-react';
import { HomePage } from './pages/home';
import { AuthPage } from './pages/auth';
import { DMPage } from './pages/DM';
import { SellPage } from './pages/sell';
import { SearchPage } from './pages/search';
import { MyPage } from './pages/mypage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext'; // 💡 useAuthもインポート
import { useAlertInterceptor } from './hooks/useAlertInterceptor';
import { ErrorModal } from './components/Modal/ErrorModal';
import { SuccessModal } from './components/Modal/SuccessModal';

// 🛰️ [A] メインのコンテンツ（ルーティングとローディング監視）
const AppContent = () => {
  // 💡 Contextから、Firebaseの接続状態（user, loading）を直接召喚！
  const { user, loading } = useAuth(); 
  const { isOpen, message, type, closeAlert } = useAlertInterceptor();

  // 📡 通信チェック中は、世界観に合わせたローディング画面を表示
  if (loading) {
    return (
      <div className="min-h-screen bg-[#060913] flex flex-col justify-center items-center text-cyan-400 font-mono">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-400 mb-4"></div>
        <p className="flex items-center gap-2 tracking-widest animate-pulse">
          <SatelliteDish size={16} />
          CONNECTING TO MILKYWAY NETWORK...
        </p>
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
            <Route path="/dm/:sellerId" element={<ProtectedRoute><DMPage /></ProtectedRoute>} />
            <Route path="/sell" element={<ProtectedRoute><SellPage /></ProtectedRoute>} />
            <Route path="/mypage" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
          </Routes>
        </div>
        {isOpen && (
          type === 'success' ? (
            <SuccessModal 
              isOpen={isOpen} 
              onClose={closeAlert} 
              message={message} 
            />
          ) : (
            <ErrorModal 
              isOpen={isOpen} 
              onClose={closeAlert} 
              message={message} 
            />
          )
        )}
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