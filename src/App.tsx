import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { HomePage } from './pages/home'; // もしファイル名が大文字なら 'HomePage' に適宜修正してください
import { AuthPage } from './pages/auth';
import { DMPage } from './pages/DM';

function App() {
  return (
    <Router>
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
            <Route path="/dm" element={<DMPage />} />
          </Routes>
        </div>

        {/* 🛸 画面最下部のナビゲーション（デモ用リンク） */}
        <footer className="bg-slate-950/80 border-t border-cyan-500/20 p-3 flex justify-center gap-6 text-xs font-mono">
          <Link to="/" className="text-cyan-400 hover:underline">📡 HOME (/)</Link>
          <Link to="/auth" className="text-purple-400 hover:underline">🔑 AUTH (/auth)</Link>
          <Link to="/dm" className="text-amber-400 hover:underline">💬 DM (/dm)</Link>
        </footer>

      </div>
    </Router>
  );
}

export default App;