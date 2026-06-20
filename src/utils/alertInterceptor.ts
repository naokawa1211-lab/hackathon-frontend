/**
 * ブラウザ標準の window.alert を宇宙通信エラーイベントにインターセプト（傍受）するユーティリティ
 */
export const initAlertInterceptor = () => {
  if (typeof window === 'undefined') return;

  // 二重に上書きしてしまうのを防ぐ安全弁
  if ((window as any).__alertIntercepted__) return;

  window.alert = (message: any) => {
    // 万が一オブジェクト型のエラーが来ても綺麗に文字列化する
    const msgString = typeof message === 'object' ? JSON.stringify(message) : String(message);

    // 全域に「量子シグナル異常」のカスタムイベントを発射
    const event = new CustomEvent('space-alert', {
      detail: { message: msgString },
    });
    window.dispatchEvent(event);

    // 開発中にデバッグしやすいようコンソールにもログを残す
    console.warn("🚀 [Quantum Interceptor] Intercepted alert:", msgString);
  };

  // 上書き完了フラグをwindowオブジェクトに刻む
  (window as any).__alertIntercepted__ = true;
};