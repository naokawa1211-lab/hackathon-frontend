import React from 'react';
import { Package, Lightbulb } from 'lucide-react';

// 🌌 ステップの定義
const STEPS = [
  { id: 1, name: '基本情報' },
  { id: 2, name: '詳細情報' },
  { id: 3, name: '価格設定' },
  { id: 4, name: '確認・出品' },
];

interface SellSidebarProps {
  currentStep: number;
}

export const SellSidebar: React.FC<SellSidebarProps> = ({ currentStep }) => {
  return (
    <div className="w-80 h-full bg-slate-950/40 border-r border-cyan-500/20 flex flex-col justify-between p-6 font-mono text-slate-200">
      
      {/* 📋 上部：出品の流れ */}
      <div className="space-y-6">
        <h2 className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 tracking-widest uppercase border-b border-cyan-500/20 pb-4">
          <Package size={14} />
          出品の流れ
        </h2>
        
        <div className="space-y-6">
          {STEPS.map((step) => (
            <div key={step.id} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border transition-all ${
                currentStep === step.id
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)]'
                  : currentStep > step.id
                  ? 'bg-slate-800 border-slate-700 text-slate-400 line-through'
                  : 'bg-slate-950 border-slate-800 text-slate-600'
              }`}>
                {step.id}
              </div>
              <span className={`text-xs tracking-wider transition-colors ${
                currentStep === step.id ? 'text-cyan-300 font-bold' : 'text-slate-500'
              }`}>
                {step.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 💡 下部：ヒントボックス */}
      <div className="p-4 bg-slate-950/40 border border-slate-800 rounded text-[11px] text-slate-400 leading-relaxed">
        <span className="flex items-center gap-1.5 text-cyan-400 font-bold mb-1">
          <Lightbulb size={13} />
          ヒント
        </span>
        魅力的な商品画像や詳細なパラメータを記述すると、銀河系全域のバイヤーから注目されやすくなります。
      </div>

    </div>
  );
};