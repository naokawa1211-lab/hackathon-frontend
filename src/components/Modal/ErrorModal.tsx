import React from 'react';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  // 💡 届いたエラーメッセージの内容から、エラーコードやステータスを宇宙風に自動翻訳する
  let errorCode = "SIGNAL_DISRUPTION";
  let statusText = "ERROR";

  if (message.includes("Unauthorized") || message.includes("UID")) {
    errorCode = "401_UNAUTHORIZED";
    statusText = "AUTH_FAILED";
  } else if (message.toLowerCase().includes("fetch")) {
    errorCode = "503_GATEWAY_TIMEOUT";
    statusText = "CONN_LOST";
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        {/* ヘッダー */}
        <div style={styles.header}>
          <div style={styles.title}>
            <span style={styles.warningIcon}>⚠️</span> 通信シグナル異常検出
          </div>
          <button onClick={onClose} style={styles.closeButton}>&times;</button>
        </div>

        {/* コンテンツエリア */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={styles.errorCodeBadge}>
            🎯 ERROR CODE : {errorCode}
          </div>
          
          <table style={styles.table}>
            <tbody>
              <tr>
                <td style={styles.label}>LOCATION</td>
                <td style={styles.value}>{window.location.pathname}</td>
              </tr>
              <tr>
                <td style={styles.label}>STATUS</td>
                <td style={styles.value}>
                  <span style={styles.statusBadge}>{statusText}</span>
                </td>
              </tr>
              <tr>
                <td style={styles.label}>SYSTEM</td>
                <td style={styles.value}>MILKYWAY NETWORK (v3.0.26)</td>
              </tr>
              <tr>
                <td style={styles.label}>DETAILS</td>
                <td style={styles.detailsText}>
                  {message}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* フッターアクション */}
        <div style={{ display: 'flex', justifyContent: 'end' }}>
          <button onClick={onClose} style={styles.actionButton}>
            回線を復旧 / 同期を再試行
          </button>
        </div>
      </div>
    </div>
  );
};

// スタイル定義（プロジェクトのCSS環境に依存せず、コピーして一発で完全に動くインラインスタイル）
const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(3, 7, 18, 0.85)', backdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
  },
  container: {
    backgroundColor: '#0b0f19', border: '1px solid #1e3a8a', borderRadius: '14px',
    padding: '2rem', maxWidth: '550px', width: '90%',
    boxShadow: '0 0 30px rgba(59, 130, 246, 0.15)', fontFamily: 'monospace'
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '1.25rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem'
  },
  title: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    color: '#f87171', fontSize: '1.15rem', fontWeight: 'bold'
  },
  warningIcon: {
    display: 'inline-block'
  },
  closeButton: {
    background: 'none', border: 'none', color: '#6b7280', fontSize: '1.5rem', cursor: 'pointer'
  },
  errorCodeBadge: {
    fontSize: '0.85rem', color: '#a855f7', backgroundColor: 'rgba(168, 85, 247, 0.1)',
    border: '1px solid rgba(168, 85, 247, 0.2)', padding: '4px 10px', borderRadius: '4px',
    display: 'inline-block', marginBottom: '1.25rem', fontWeight: 'bold'
  },
  table: {
    width: '100%', borderCollapse: 'collapse', color: '#9ca3af', fontSize: '0.9rem'
  },
  label: {
    width: '25%', color: '#3b82f6', fontWeight: 'bold', paddingBottom: '0.75rem', verticalAlign: 'top'
  },
  value: {
    paddingBottom: '0.75rem', color: '#e5e7eb'
  },
  statusBadge: {
    backgroundColor: '#7f1d1d', color: '#fca5a5', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'
  },
  detailsText: {
    color: '#f3f4f6', fontSize: '0.95rem', lineHeight: '1.5', paddingBottom: '0.75rem', whiteSpace: 'pre-wrap'
  },
  actionButton: {
    backgroundColor: 'transparent', border: '1px solid #3b82f6', color: '#3b82f6',
    padding: '0.6rem 1.5rem', borderRadius: '9999px', cursor: 'pointer', fontWeight: 'bold',
    transition: 'all 0.2s'
  }
};