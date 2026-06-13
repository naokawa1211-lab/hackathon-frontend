import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { fireAuth } from './firebase';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User, signOut} from 'firebase/auth';
import { Layout } from './components/Layout';
import { HomePage } from './pages/home'; // もしファイル名が大文字なら 'HomePage' に適宜修正してください
import { AuthPage } from './pages/auth';
import { DMPage } from './pages/DM';
import { SellPage } from './pages/sell';
import { SearchPage } from './pages/search';
import { MyPage } from './pages/mypage';
import { ProtectedRoute } from './components/ProtectedRoute';


const App = () => {
  // 🌌 ユーザーの状態と、Firebaseのチェック中フラグを管理
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(fireAuth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // チェックが終わったらローディングを解除
    });
    return () => unsubscribe(); // メモリリーク防止のお片付け
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(fireAuth);
      alert('宇宙ネットワークから切断しました（ログアウト完了）');
    } catch (err) {
      console.error('ログアウトエラー:', err);
    }
  };

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
      <Layout>
      {/* 💡 ハッカソン用のデモ便利バー 
        画面の一番下に、各ページに一瞬でワープできる秘密のボタンを置いておきます。
        デモの時に審査員に見せるのにもめちゃくちゃ便利です！
      */}
        <div className="min-h-screen bg-[#060913] flex flex-col justify-between">
          
          {/* 🌌 メインコンテンツ（URLに応じてここがパッと切り替わる） */}
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route 
                path="/dm"
                element={
                  <ProtectedRoute user={user}>
                    <DMPage />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/sell"
                element={
                  <ProtectedRoute user={user}>
                    <SellPage />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/mypage"
                element={
                  <ProtectedRoute user={user}>
                    <MyPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>

        {/* 🛸 画面最下部のナビゲーション（デモ用リンク ＋ ログアウト） */}
          <footer className="bg-slate-950/80 border-t border-cyan-500/20 p-3 flex justify-center items-center gap-6 text-xs font-mono">
            <Link to="/" className="text-cyan-400 hover:underline">📡 HOME (/)</Link>
            <Link to="/auth" className="text-purple-400 hover:underline">🔑 AUTH (/auth)</Link>
            <Link to="/dm" className="text-amber-400 hover:underline">💬 DM (/dm)</Link>
            
            {/* 🔒 ログイン中（userが存在する時）のみ、サイバー感あるログアウトボタンを表示 */}
            {user && (
              <button
                onClick={handleLogout}
                className="ml-4 px-2 py-1 bg-rose-950/60 border border-rose-500/40 text-rose-400 rounded hover:bg-rose-900/60 hover:text-rose-300 transition-all text-[10px] tracking-wider uppercase font-bold"
              >
                🔴 DISCONNECT
              </button>
            )}
          </footer>

        </div>
      </Layout>
    </Router>
  );
}

export default App;