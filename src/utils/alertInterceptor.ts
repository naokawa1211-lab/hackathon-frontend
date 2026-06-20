/**
 * ブラウザ標準の window.alert を宇宙通信シグナルイベントにインターセプト（傍受）するユーティリティ
 */
export const initAlertInterceptor = () => {
  if (typeof window === 'undefined') return;

  // 二重に上書きしてしまうのを防ぐ安全弁
  if ((window as any).__alertIntercepted__) return;

  window.alert = (message: any) => {
    // 万が一オブジェクト型のエラーが来ても綺麗に文字列化する
    const msgString = typeof message === 'object' ? JSON.stringify(message) : String(message);

    // 💡 変更点1: メッセージが「成功シグナル」かどうかを判定
    // 今回は、"TRANSACTION COMPLETED" という文字列が含まれているかを条件にします。
    const isSuccess = msgString.includes("TRANSACTION COMPLETED");

    // 全域に「量子シグナル通信」のカスタムイベントを発射
    const event = new CustomEvent('space-alert', {
      detail: { 
        message: msgString,
        // 💡 変更点2: イベントの detail に 'type' プロパティを追加
        // 成功なら 'success'、それ以外（エラー）なら 'error' をセットします。
        type: isSuccess ? 'success' : 'error' 
      },
    });
    window.dispatchEvent(event);

    // コンソールログも「成否」を区別できるように変更
    if (isSuccess) {
      console.info("✨ [Quantum Interceptor] Intercepted SUCCESS signal:", msgString);
    } else {
      console.warn("🚀 [Quantum Interceptor] Intercepted alert:", msgString);
    }
  };

  // 上書き完了フラグをwindowオブジェクトに刻む
  (window as any).__alertIntercepted__ = true;
};