import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; 
import { injectUniverseData } from "../../utils/seedData"; // 💡 シード関数を召喚

const navItems = [
  { label: "HOME", path: "/" },
  { label: "SEARCH", path: "/search" },
  { label: "SELL", path: "/sell" },
  { label: "LIKE", path: "/like" },
  { label: "DM", path: "/dm" },
];

export default function HeaderNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // ⚙️ デモデータ注入ロジックをヘッダー内に統合
  const handleSeedClick = async () => {
    if (!user) return;
    if (window.confirm("Firestoreにデモ用データを一括生成しますか？")) {
      await injectUniverseData(user.uid);
    }
  };

  const handleLogoutClick = async () => {
    if (window.confirm("宇宙ネットワークから切断（ログアウト）しますか？")) {
      await logout();
      navigate("/auth");
    }
  };

  return (
    <header
      className="
      sticky
      top-0
      z-50
      h-16
      border-b
      border-cyan-500/20
      bg-[#030611]/90
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
        {/* ロゴ */}
        <Link
          to="/"
          className="
          text-cyan-400
          font-bold
          tracking-widest
          hover:opacity-80
          transition-opacity
        "
        >
          ✦ MILKYWAY MARKET
        </Link>

        <nav className="flex items-center gap-6">
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
              
              {/* 💡 【ここに統合】デモ用SEEDボタン。デザインをヘッダー用に最適化 */}
              <button
                onClick={handleSeedClick}
                className="
                  bg-purple-950/40
                  hover:bg-purple-900/60
                  text-purple-300
                  font-mono
                  text-[10px]
                  tracking-widest
                  border
                  border-purple-500/40
                  hover:border-purple-400
                  px-2.5
                  py-1
                  rounded
                  transition-all
                  shadow-sm
                  shadow-purple-500/10
                  mr-1
                "
              >
                🧬 SEED DATA
              </button>

              {/* アバター */}
              <Link to="/mypage" className="relative group flex items-center">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Avatar"
                    className="w-7 h-7 rounded-full border border-cyan-500/40 object-cover group-hover:border-cyan-400 transition-all"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full border border-cyan-500/40 bg-slate-900 flex items-center justify-center text-[10px] text-cyan-400 group-hover:border-cyan-400 transition-all">
                    👽
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
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono px-3 py-1 rounded text-[11px] tracking-widest transition-all shadow-md shadow-cyan-500/10 ml-2"
            >
              LOGIN
            </Link>
          )}

        </nav>
      </div>
    </header>
  );
}