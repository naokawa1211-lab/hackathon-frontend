import { useState } from "react"; // 💡 useStateを追加
import { Link, useLocation, useNavigate } from "react-router-dom";
import { User, Menu, X, Sparkles } from "lucide-react"; // 💡 Menu, X アイコンを追加
import { useAuth } from "../../context/AuthContext";
import { useAIAgent } from "../../context/AIAgentContext";
import { PRIMARY_BUTTON_CLASS } from "../../styles/buttonStyles";

const navItems = [
  { label: "HOME", path: "/" },
  { label: "SEARCH", path: "/search" },
  { label: "SELL", path: "/sell" },
  { label: "DM", path: "/dm" },
];

export default function HeaderNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isOpen: isAgentOpen, toggleAgent } = useAIAgent();

  // 📱 スマホ用メニューの開閉状態を管理
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogoutClick = async () => {
    if (window.confirm("宇宙ネットワークから切断（ログアウト）しますか？")) {
      await logout();
      setIsMenuOpen(false); // メニューを閉じる
      navigate("/auth");
    }
  };

  return (
    <>
    <header
      className="
      sticky
      top-0
      z-50
      h-20
      border-b
      border-cyan-500/20
      bg-[#030611]
      backdrop-blur-md
    "
    >
      <div
        className="
        max-w-7xl
        mx-auto
        h-full
        flex
        items-center
        justify-between
        px-6
      "
      >
        {/* 🚀 ロゴエリア（flex-shrink-0 をつけてスマホでも絶対縮ませない） */}
        <Link to="/" className="flex items-center hover:opacity-80 transition-opacity flex-shrink-0">
          <img 
            src="/logo.png" 
            alt="Milkyway Flea Market" 
            className="h-14 md:h-16 w-auto object-contain"
          />
        </Link>

        {/* 💻 PC用ナビゲーション（md:flex でPCのみ表示、スマホでは hidden） */}
        <nav className="hidden md:flex items-center gap-6">
          {/* 一般リンク */}
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                text-xs
                tracking-widest
                transition-colors
                ${
                  location.pathname === item.path
                    ? "text-cyan-400"
                    : "text-slate-500 hover:text-slate-300"
                }
              `}
            >
              {item.label}
            </Link>
          ))}

          {/* ログイン状態による出し分け */}
          {user ? (
            <div className="flex items-center gap-4 border-l border-slate-800 pl-4">
              {/* アバター */}
              <Link to="/mypage" className="relative group flex items-center">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Avatar"
                    className="w-7 h-7 rounded-full border border-cyan-500/40 object-cover group-hover:border-cyan-400 transition-all"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full border border-cyan-500/40 bg-slate-900 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-all">
                    <User size={14} />
                  </div>
                )}
              </Link>

              {/* ログアウト */}
              <button
                onClick={handleLogoutClick}
                className="text-rose-400/70 hover:text-rose-400 font-mono text-[10px] tracking-widest border border-rose-500/20 hover:border-rose-500/50 px-2 py-1 rounded transition-all bg-rose-950/10"
              >
                LOGOUT
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className={`font-mono px-3 py-1 rounded text-[11px] tracking-widest ml-2 ${PRIMARY_BUTTON_CLASS}`}
            >
              LOGIN
            </Link>
          )}
        </nav>

        {/* 📱 スマホ用：ハンバーガーボタン（md:hidden でスマホのみ表示） */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-cyan-400 focus:outline-none p-2 transition-colors hover:text-cyan-300"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* 📱 スマホ用：展開ドロップダウンメニュー（宇宙感あふれるサイバーデザイン） */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-[#030611]/95 border-b border-cyan-500/20 backdrop-blur-lg flex flex-col p-6 space-y-4 shadow-[0_10px_30px_rgba(6,182,212,0.15)] animate-in fade-in slide-in-from-top-5 duration-200">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMenuOpen(false)}
              className={`text-sm tracking-widest font-mono py-2 border-b border-slate-900 ${
                location.pathname === item.path ? "text-cyan-400" : "text-slate-400"
              }`}
            >
              {item.label}
            </Link>
          ))}
          
          <div className="pt-4 flex items-center justify-between">
            {user ? (
              <>
                <Link 
                  to="/mypage" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 text-slate-300 font-mono text-sm"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-cyan-500/40" />
                  ) : (
                    <div className="w-8 h-8 rounded-full border border-cyan-500/40 bg-slate-900 flex items-center justify-center text-cyan-400"><User size={16} /></div>
                  )}
                  <span>MY PAGE</span>
                </Link>
                <button
                  onClick={handleLogoutClick}
                  className="text-rose-400 font-mono text-xs tracking-widest border border-rose-500/30 px-3 py-1.5 rounded bg-rose-950/20"
                >
                  LOGOUT
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                onClick={() => setIsMenuOpen(false)}
                className={`font-mono w-full text-center py-2.5 rounded text-xs tracking-widest ${PRIMARY_BUTTON_CLASS}`}
              >
                LOGIN
              </Link>
            )}
          </div>
        </div>
      )}
    </header>

    {/* 🛰️ Polaris起動用の浮遊ボタン（紫×青のネオングロー、全ページ共通で右下に常駐）
        💡 Polarisのパネルが開いている間（isOpen===true）はボタン自体を非レンダリングにする */}
    {!isAgentOpen && (
      <button
        onClick={toggleAgent}
        title="Polaris（AIエージェント）を呼び出す"
        className="
          fixed bottom-6 right-6 z-[70]
          w-14 h-14 rounded-full
          flex items-center justify-center
          border transition-all duration-300
          bg-slate-950/90 border-purple-500/50 text-purple-300 shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] hover:border-cyan-400/70 hover:text-cyan-300
        "
      >
        <Sparkles size={22} className="animate-pulse" />
      </button>
    )}
    </>
  );
}