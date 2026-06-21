import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, Loader2 } from 'lucide-react';
import { useAIAgent } from '../../context/AIAgentContext';
import { API_BASE_URL } from '../../config/api';

interface AgentMessage {
  role: 'user' | 'model';
  text: string;
}

const GREETING = 'やあ、旅人。私はPolaris、宇宙フリマの案内人だ。何をお探しかな？';

export const AIAgentPanel: React.FC = () => {
  const { isOpen, mode, product, closeAgent } = useAIAgent();
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // 同じ商品で鑑定リクエストが二重発火しないようにするためのガード
  const lastAppraisedTitleRef = useRef<string | null>(null);

  const sendToAgent = async (message: string, currentMode: string, currentProduct: typeof product) => {
    setLoading(true);
    try {
      const body: Record<string, unknown> = { mode: currentMode, message };

      if (currentMode === 'appraise' && currentProduct) {
        body.product = currentProduct;
      }

      if (currentMode === 'concierge') {
        // 🛰️ 「今あるリスト」としてバックエンドの本物の商品一覧をコンテキストに含める
        try {
          const res = await fetch(`${API_BASE_URL}/api/products`);
          if (res.ok) {
            const products = await res.json();
            body.products = (products || []).slice(0, 20).map((p: any) => ({
              title: p.title,
              description: p.description,
              price: p.price,
              category: p.category,
            }));
          }
        } catch {
          // 商品リストの取得に失敗しても会話自体は継続させる
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/ai/agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Polarisとの通信に失敗しました');
      }

      setMessages((prev) => [...prev, { role: 'model', text: data.reply }]);
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: 'model', text: `⚠️ 通信エラー: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  // 🔭 鑑定モードで新しい商品が渡されたら自動で鑑定開始。コンシェルジュモードは初回だけ挨拶。
  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'appraise' && product && lastAppraisedTitleRef.current !== product.title) {
      lastAppraisedTitleRef.current = product.title;
      const seed = `「${product.title}」を鑑定してください。`;
      setMessages([{ role: 'user', text: seed }]);
      sendToAgent(seed, 'appraise', product);
    } else if (mode === 'concierge' && messages.length === 0) {
      setMessages([{ role: 'model', text: GREETING }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode, product]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    sendToAgent(userMessage, mode, product);
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-slate-950/95 backdrop-blur-xl border-l border-cyan-500/30 shadow-[0_0_40px_rgba(168,85,247,0.2)] z-[60] flex flex-col transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between p-4 border-b border-cyan-500/20 bg-gradient-to-r from-purple-950/40 to-slate-950/40 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-purple-400 animate-pulse" />
          <div>
            <h2 className="text-sm font-bold font-mono text-cyan-300 tracking-widest">POLARIS</h2>
            <p className="text-[9px] text-purple-400/80 font-mono uppercase tracking-wider">
              {mode === 'appraise' ? '鑑定モード' : 'コンシェルジュモード'}
            </p>
          </div>
        </div>
        <button onClick={closeAgent} className="text-slate-400 hover:text-rose-400 transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* メッセージエリア */}
      <div className="flex-grow overflow-y-auto p-4 space-y-3 font-mono text-sm">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] p-3 rounded-lg text-xs leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-cyan-950/40 border border-cyan-500/30 text-cyan-100 rounded-tr-none'
                  : 'bg-purple-950/30 border border-purple-500/30 text-purple-100 rounded-tl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-purple-950/30 border border-purple-500/30 text-purple-300 rounded-lg rounded-tl-none p-3 flex items-center gap-2 text-xs">
              <Loader2 size={12} className="animate-spin" />
              Polarisが交信中...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア */}
      <form onSubmit={handleSend} className="p-3 border-t border-cyan-500/20 flex gap-2 flex-shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'appraise' ? '鑑定結果について質問する...' : '欲しいものを伝える...'}
          className="flex-grow bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-mono"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-3 py-2 bg-purple-950 text-purple-300 border border-purple-400/40 rounded hover:bg-purple-400 hover:text-slate-950 transition-all flex items-center justify-center disabled:opacity-50"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
};
