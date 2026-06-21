import React, { createContext, useContext, useState } from 'react';

export type AgentMode = 'appraise' | 'concierge';

export interface AgentProductContext {
  title: string;
  description: string;
  price: number;
  category: string;
}

interface AIAgentContextType {
  isOpen: boolean;
  mode: AgentMode;
  product: AgentProductContext | null;
  openAgent: (mode: AgentMode, product?: AgentProductContext) => void;
  closeAgent: () => void;
  toggleAgent: () => void;
}

const AIAgentContext = createContext<AIAgentContextType | undefined>(undefined);

// 🛰️ 統合AIエージェント「Polaris」の開閉・モード・商品コンテキストをアプリ全体で共有する
export const AIAgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AgentMode>('concierge');
  const [product, setProduct] = useState<AgentProductContext | null>(null);

  // 鑑定モード等、特定のコンテキストを指定して必ず開く（ProductDetailModal等から呼ぶ）
  const openAgent = (newMode: AgentMode, newProduct?: AgentProductContext) => {
    setMode(newMode);
    setProduct(newProduct ?? null);
    setIsOpen(true);
  };

  const closeAgent = () => setIsOpen(false);

  // ヘッダーの浮遊ボタン用：閉じていればコンシェルジュモードで開き、開いていれば閉じる
  const toggleAgent = () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }
    setMode('concierge');
    setProduct(null);
    setIsOpen(true);
  };

  return (
    <AIAgentContext.Provider value={{ isOpen, mode, product, openAgent, closeAgent, toggleAgent }}>
      {children}
    </AIAgentContext.Provider>
  );
};

export const useAIAgent = () => {
  const ctx = useContext(AIAgentContext);
  if (!ctx) throw new Error('useAIAgent must be used within an AIAgentProvider');
  return ctx;
};
