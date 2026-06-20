import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { Orbit, KeyRound, Satellite, Lock, Radio, Rocket, Globe, Code2, AlertTriangle, ChevronRight } from 'lucide-react';
import { fireAuth } from '../firebase';
import { useAuth } from '../context/AuthContext'; // 💡 ContextからHookをインポート
import { PRIMARY_BUTTON_CLASS } from '../styles/buttonStyles';

export const AuthPage = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, loginWithGithub } = useAuth(); // 💡 宇宙規模のロジックを召喚！
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 📡 1. 通常のメールアドレス認証
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(fireAuth, email, password);
        alert('登録が完了しました！');
      } else {
        await signInWithEmailAndPassword(fireAuth, email, password);
      }
      navigate('/');
  } catch (err: any) {
      console.error("Firebase Auth Error:", err); // 💡 ブラウザのコンソール(F12)でも確認できるように
      
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
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="bg-[#0b1224] border border-cyan-500/30 p-8 rounded-xl max-w-md w-full shadow-2xl shadow-cyan-500/10 relative overflow-hidden">
        
        {/* サイバー装飾ライン */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>

        {/* タイトル */}
        <div className="text-center mb-6">
          <h2 className="flex items-center justify-center gap-2 text-cyan-400 font-mono text-xl font-bold tracking-widest uppercase">
            {isSignUp ? <Orbit size={20} /> : <KeyRound size={20} />}
            {isSignUp ? 'Space Citizen Registration' : 'Quantum Link Connect'}
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
          <div>
            <label className="flex items-center gap-1.5 text-cyan-500/70 font-mono text-[10px] tracking-widest uppercase mb-1">
              <Satellite size={11} />
              GALACTIC EMAIL
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
              ACCESS KEY
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

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded font-mono text-xs tracking-widest uppercase active:scale-[0.98] ${PRIMARY_BUTTON_CLASS}`}
          >
            {loading ? (
              <>
                <Radio size={14} />
                TRANSMITTING...
              </>
            ) : isSignUp ? (
              <>
                <Rocket size={14} />
                REGISTER
              </>
            ) : (
              <>
                <Orbit size={14} />
                CONNECT
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
            {isSignUp ? 'EXISTING LOG-IN' : 'NEW REGISTER'}
          </button>
        </div>

        {/* 🌌 区切り線 🌌 */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="border-t border-slate-800 w-full"></div>
          <span className="absolute bg-[#0b1224] px-3 text-[9px] font-mono text-slate-500 tracking-widest uppercase">
            OR CONNECT VIA QUANTUM CHANNELS
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
    </div>
  );
};