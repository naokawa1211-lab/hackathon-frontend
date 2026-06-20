import { useState, useEffect } from 'react';
import { initAlertInterceptor } from '../utils/alertInterceptor';

export const useAlertInterceptor = () => {
  const [alertState, setAlertState] = useState({ isOpen: false, message: '', type: 'error' });

  useEffect(() => {
    // 1. マウント時に最速で window.alert を乗っ取る
    initAlertInterceptor();

    // 2. どこかで発射された「宇宙シグナル異常」イベントを捕まえるリスナー登録
    const handleSpaceAlert = (e: Event) => {
      const customEvent = e as CustomEvent;
      setAlertState({
        isOpen: true,
        message: customEvent.detail.message,
        type: customEvent.detail.type || 'error'
      });
    };

    window.addEventListener('space-alert', handleSpaceAlert);
    
    return () => {
      window.removeEventListener('space-alert', handleSpaceAlert);
    };
  }, []);

  const closeAlert = () => setAlertState({ ...alertState, isOpen: false });

  return {
    isOpen: alertState.isOpen,
    message: alertState.message,
    type: alertState.type,
    closeAlert,
  };
};