import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { fireAuth } from '../firebase';
import { API_BASE_URL } from '../config/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 📡 Firebaseのログイン状態を監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(fireAuth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      // 🛰️ ログイン・ソーシャルログイン・セッション復元など「Firebaseが認証済みユーザーを
      // 確認した全ての瞬間」でMySQL側のレコードを保証する（新規登録時の同期だけでは
      // ログイン/ソーシャルログイン/再訪問時にユーザーが users テーブルへ一切同期されないため）
      if (currentUser) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: currentUser.uid,
              username: currentUser.displayName || '名無しの宇宙飛行士',
              avatar_url: currentUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',
              space_credits: 100000, // 既存ユーザーの場合はバックエンド側でcredits列が更新対象外なので残高は維持される
            }),
          });
          if (!response.ok) {
            console.error('MySQLへのユーザー同期に失敗しました(status):', response.status);
          }
        } catch (err) {
          console.error('MySQLへのユーザー同期に失敗しました:', err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(fireAuth, provider);
  };

  const loginWithGithub = async () => {
    const provider = new GithubAuthProvider();
    await signInWithPopup(fireAuth, provider);
  };

  const logout = async () => {
    await signOut(fireAuth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginWithGithub, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};