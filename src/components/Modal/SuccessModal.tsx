import React from 'react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        {/* ヘッダー：成功シグナル */}
        <div style={styles.header}>
          <div style={styles.title}>
            宇宙シグナル同期完了
          </div>
          <button onClick={onClose} style={styles.closeButton}>&times;</button>
        </div>

        {/* コンテンツエリア */}
        <div style={{ marginBottom: '1.5rem' }}>
          {/* SUCCESS CODE */}
          <div style={styles.errorCodeBadge}>
            STATUS CODE : TRANSACTION_COMPLETED
          </div>
          
          <table style={styles.table}>
            <tbody>
              <tr>
                <td style={styles.label}>LOCATION</td>
                <td style={styles.value}>/sell</td>
              </tr>
              <tr>
                <td style={styles.label}>STATUS</td>
                <td style={styles.value}>
                  <span style={styles.statusBadge}>ONLINE</span>
                </td>
              </tr>
              <tr>
                <td style={styles.label}>SYSTEM</td>
                <td style={styles.value}>MILKYWAY NETWORK (v3.0.26)</td>
              </tr>
              <tr>
                <td style={styles.label}>DETAILS</td>
                <td style={styles.detailsText}>
                  {/* 成功メッセージをそのまま表示 */}
                  {message}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* フッターアクション：ホームに戻るボタン */}
        <div style={{ display: 'flex', justifyContent: 'end' }}>
          <button onClick={onClose} style={styles.actionButton}>
            ホーム画面に戻る
          </button>
        </div>
      </div>
    </div>
  );
};

// スタイル定義（ErrorModal と色違いのインラインスタイル）
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
    color: '#34d399', fontSize: '1.15rem', fontWeight: 'bold' // 緑色
  },
  warningIcon: { display: 'inline-block' },
  closeButton: { background: 'none', border: 'none', color: '#6b7280', fontSize: '1.5rem', cursor: 'pointer' },
  
  errorCodeBadge: {
    fontSize: '0.85rem', color: '#a855f7', backgroundColor: 'rgba(168, 85, 247, 0.1)', // 紫
    border: '1px solid rgba(168, 85, 247, 0.2)', padding: '4px 10px', borderRadius: '4px',
    display: 'inline-block', marginBottom: '1.25rem', fontWeight: 'bold'
  },
  
  table: { width: '100%', borderCollapse: 'collapse', color: '#9ca3af', fontSize: '0.9rem' },
  label: { width: '25%', color: '#3b82f6', fontWeight: 'bold', paddingBottom: '0.75rem', verticalAlign: 'top' }, // 青色
  value: { paddingBottom: '0.75rem', color: '#e5e7eb' },
  
  statusBadge: {
    backgroundColor: '#064e3b', color: '#a7f3d0', padding: '2px 6px', borderRadius: '4px', // 緑色バッジ
    fontSize: '0.8rem', fontWeight: 'bold'
  },
  detailsText: {
    color: '#f3f4f6', fontSize: '0.95rem', lineHeight: '1.5', paddingBottom: '0.75rem', whiteSpace: 'pre-wrap'
  },
  actionButton: {
    backgroundColor: 'transparent', border: '1px solid #3b82f6', color: '#3b82f6', // 青線ボタン
    padding: '0.6rem 1.5rem', borderRadius: '9999px', cursor: 'pointer', fontWeight: 'bold',
    transition: 'all 0.2s'
  }
};