import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Orbit, KeyRound, Satellite, Lock, Radio, Rocket, Globe, Code2, AlertTriangle, ChevronRight, User, X } from 'lucide-react';
import { fireAuth } from '../firebase';
import { useAuth } from '../context/AuthContext'; // 💡 ContextからHookをインポート
import { PRIMARY_BUTTON_CLASS } from '../styles/buttonStyles';
import { TERMS_AND_PRIVACY_TEXT } from '../data/termsText';
import { API_BASE_URL } from '../config/api';

export const AuthPage = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, loginWithGithub } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  //以下は新規登録時のみ取得
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [spaceBase, setSpaceBase] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);//誰も読まない長い利用規約を開いているかどうか

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  //1. 通常のメールアドレス認証
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    //新規登録時のバリデーション
    if (isSignUp) {
      if (password !== confirmPassword) {
        setError('アクセスキー（パスワード）が一致しません。');
        setLoading(false);
        return;
      }
      if (!agreeTerms) {
        setError('利用規約とプライバシーポリシーに同意してください。');
        setLoading(false);
        return;
      }
    }

    try {
      if (isSignUp) {
        // ① Firebase Authでアカウント作成
        const userCredential = await createUserWithEmailAndPassword(fireAuth, email, password);
        const user = userCredential.user;

        // ② Firebaseのプロフィールにユーザー名をセット（マイページ用）
        await updateProfile(user, {
          displayName: username
        });

        const response = await fetch(`${API_BASE_URL}/api/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: user.uid,
            username: username,
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200', // ダミー初期アバター
            space_credits: 100000 // 初期宇宙クレジット
          }),
        });
        if (!response.ok) {
          console.error("MySQLへのユーザーシグナル同期に失敗しました。");
        }
navigate('/search');
  } else {
    // 💡 ログイン（isSignUp が false）の時の処理がここに入ります
    await signInWithEmailAndPassword(fireAuth, email, password);
    navigate('/search');
  }
    } catch (err: any) {
      console.error("Firebase Auth Error:", err);

      if (err.code === 'auth/weak-password') {
        setError ('パスワードは6文字以上に設定してください。');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('このメールアドレスは既に登録されています。');
      } else if (
        err.code === 'auth/wrong-password' || 
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/invalid-credential' // 💡 ここにこれを追加！
      ) {
        setError('メールアドレスまたはパスワードが違います');
      } else {
        // 本当に通信が途切れた時だけここに来る
        setError(`通信エラーが発生しました。(${err.code})`); 
      }
    } finally {
      setLoading(false);
    }
  };

  // 🌐🐙 2. ソーシャルログイン用共通ハンドラー
  const handleSocialSignIn = async (signInMethod: () => Promise<void>, providerName: string) => {
    setError('');
    setLoading(true);
    try {
      await signInMethod();
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(`${providerName}回線との接続に失敗しました。`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4bg-cover" >
        {/* 🌌 変更点2【新設】: どんな画面サイズでも100%画面を埋め尽くす「背景専用レイヤー」 */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img 
          src="/ginga.png" 
          alt="Galaxy Background" 
          className="w-full h-full object-cover object-center" 
        />
        {/* 星々が眩しすぎて文字が消えないようにする、薄暗い宇宙の空気感フィルター */}
        <div className="absolute inset-0 bg-slate-950/50"></div>
      </div>

{/* 💡 背景画像を少し暗くしてフォームの文字を読みやすくするオーバーレイ層 */}
      <div className="absolute inset-0 bg-slate-950/40 pointer-events-none"></div>

      {/* 💡 変更ポイント2: bg-[#0b1224] に /70 をつけて半透明化し、backdrop-blur-md で背後の銀河をすりガラス風にぼかす */}
      <div className="bg-[#0b1224]/20 backdrop-blur-xl border border-cyan-500/30 p-8 rounded-xl max-w-md w-full shadow-2xl shadow-cyan-500/20 relative overflow-hidden z-10">    
        {/* サイバー装飾ライン */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>

        {/* タイトル */}
        <div className="text-center mb-6">
          <h2 className="flex items-center justify-center gap-2 text-cyan-400 font-mono text-xl font-bold tracking-widest uppercase">
            {isSignUp ? <Orbit size={20} /> : <KeyRound size={20} />}
            {isSignUp ? 'ユーザー新規登録' : 'ログイン'}
          </h2>
          <p className="text-slate-500 font-mono text-[10px] tracking-widest mt-1">
            MILKYWAY FLEA MARKET NETWORK
          </p>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="flex items-center gap-1.5 mb-4 p-3 bg-rose-950/40 border border-rose-500/50 text-rose-300 rounded text-xs font-mono">
            <AlertTriangle size={13} />
            {error}
          </div>
        )}

        {/* メインフォーム */}
        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="flex items-center gap-1.5 text-cyan-500/70 font-mono text-[10px] tracking-widest uppercase mb-1">
                <User size={11} />
                ユーザー名
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="例：地球 花子"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 text-white rounded p-2.5 text-sm font-mono outline-none transition-all"
              />
            </div>
          )}

          <div>
            <label className="flex items-center gap-1.5 text-cyan-500/70 font-mono text-[10px] tracking-widest uppercase mb-1">
              <Satellite size={11} />
              メールアドレス
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@milkyway.com"
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 text-white rounded p-2.5 text-sm font-mono outline-none transition-all"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-cyan-500/70 font-mono text-[10px] tracking-widest uppercase mb-1">
              <Lock size={11} />
              パスワード
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 text-white rounded p-2.5 text-sm font-mono outline-none transition-all"
            />
          </div>
          {/*signup時のみ表示 */}
          {isSignUp && (
            <div>
              <label className="flex items-center gap-1.5 text-cyan-500/70 font-mono text-[10px] tracking-widest uppercase mb-1">
                <Lock size={11} />
                パスワード（確認）
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 text-white rounded p-2.5 text-sm font-mono outline-none transition-all"
              />
            </div>
          )}
          {isSignUp && (
            <div>
              <label className="flex items-center gap-1.5 text-cyan-500/70 font-mono text-[10px] tracking-widest uppercase mb-1">
                <Globe size={11} />
                宇宙でのあなたの拠点（任意）
              </label>
              <input
                type="text"
                value={spaceBase}
                onChange={(e) => setSpaceBase(e.target.value)}
                placeholder="例：太陽系第3惑星地球"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 text-white rounded p-2.5 text-sm font-mono outline-none transition-all"
              />
            </div>
          )}

          {isSignUp && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="accent-cyan-500 bg-slate-950 border-slate-800 rounded"
              />
              <div className="text-slate-400 font-mono text-[11px] leading-tight">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();  // フォームの意図しない送信を防ぐ
                    e.stopPropagation(); // イベントがチェックボックスに流れるのを防ぐ
                    setShowTermsModal(true);
                  }}
                  className="text-cyan-400 underline hover:text-cyan-300 transition-colors font-mono mr-1 relative z-10 cursor-pointer inline-block"
                >
                  利用規約とプライバシーポリシー
                </button>
                <label htmlFor="terms" className="cursor-pointer hover:text-slate-300 transition-colors">
                  に同意します
                </label>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded font-mono text-xs tracking-widest uppercase active:scale-[0.98] ${PRIMARY_BUTTON_CLASS}`}
          >
            {loading ? (
              <>
                <Radio size={14} />
                データセンターと通信中...
              </>
            ) : isSignUp ? (
              <>
                <Rocket size={14} />
                登録
              </>
            ) : (
              <>
                <Orbit size={14} />
                ログイン
              </>
            )}
          </button>
        </form>

        {/* モード切り替え */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="flex items-center gap-1 mx-auto text-slate-500 hover:text-cyan-400 text-[11px] font-mono transition-colors"
          >
            <ChevronRight size={12} />
            {isSignUp ? 'すでにアカウントをお持ちですか？ ログインへ' : '新規登録はこちら（NEW REGISTER）'}
          </button>
        </div>

        {/* 🌌 区切り線 🌌 */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="border-t border-slate-800 w-full"></div>
          <span className="absolute bg-[#0b1224] px-5 text-[12px] font-mono text-slate-500 tracking-widest uppercase">
            GoogleまたはGitHubでログイン/新規登録
          </span>
        </div>

        {/* 🌐 ソーシャルログインボタン群 */}
        <div className="grid grid-cols-2 gap-3">
          {/* Google ボタン */}
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSocialSignIn(loginWithGoogle, 'Google')}
            className="flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 font-mono text-xs py-2 px-3 rounded transition-all hover:bg-slate-850 active:scale-[0.98]"
          >
            <Globe size={14} /> Google
          </button>

          {/* GitHub ボタン */}
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSocialSignIn(loginWithGithub, 'GitHub')}
            className="flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 hover:border-purple-500/40 text-slate-300 font-mono text-xs py-2 px-3 rounded transition-all hover:bg-slate-850 active:scale-[0.98]"
          >
            <Code2 size={14} /> GitHub
          </button>
        </div>

      </div>

      {showTermsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#070d19] border border-cyan-500/50 w-full max-w-2xl h-[80vh] rounded-xl flex flex-col shadow-2xl shadow-cyan-500/20 relative">
            
            {/* モーダルヘッダー */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0b1224]">
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-sm font-bold tracking-wider">
                <Satellite size={16} />
                利用規約とプライバシー (TERMS & PRIVACY)
              </div>
              <button 
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="text-slate-400 hover:text-cyan-400 transition-colors p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* モーダルボディ（なっがい文書がスクロールするエリア） */}
            <div className="p-6 overflow-y-auto flex-1 text-slate-300 font-mono text-xs leading-relaxed whitespace-pre-wrap select-none">
              {TERMS_AND_PRIVACY_TEXT}
            </div>

            {/* モーダルフッター */}
            <div className="p-4 border-t border-slate-800 bg-[#0b1224] text-center">
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs rounded tracking-widest uppercase transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};