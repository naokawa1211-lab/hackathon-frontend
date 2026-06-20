// バックエンドAPIのベースURL。
// ローカル開発では未設定時に http://localhost:8080 にフォールバックする。
// 本番（Vercel）では環境変数 REACT_APP_API_BASE_URL に Cloud Run のURLを設定して上書きする。
// 💡 CRA の環境変数はビルド時に埋め込まれるため、Vercel の Project Settings > Environment Variables に
//    REACT_APP_API_BASE_URL を設定してから（再）デプロイする必要がある。
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
