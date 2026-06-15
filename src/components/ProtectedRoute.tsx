import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 💡 Contextを読み込む

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useAuth(); // 💡 Propsではなく、Contextから現在のユーザーを直接取得

  // ログインしていない（通信エリア外）なら、強制的に認証ページへワープ
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // ログインしていれば、そのまま中身のページを表示
  return <>{children}</>;
};