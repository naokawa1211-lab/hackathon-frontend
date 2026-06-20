import React, { useState } from 'react';
import { Star, X, Loader2 } from 'lucide-react';
import { PRIMARY_BUTTON_CLASS } from '../../styles/buttonStyles';

interface ReviewModalProps {
  isOpen: boolean;
  productTitle: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, productTitle, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(rating, comment);
      setRating(5);
      setComment('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-[#0b1224]/90 backdrop-blur-xl border border-cyan-500/40 p-6 rounded-xl max-w-md w-full shadow-2xl shadow-cyan-500/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold font-mono text-cyan-400 tracking-widest uppercase">
            取引相手を評価する
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-rose-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-slate-400 font-mono mb-4 line-clamp-1">対象商品: {productTitle}</p>

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-cyan-400/80 tracking-widest uppercase mb-2">評価</label>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-amber-400 transition-transform hover:scale-110"
                >
                  <Star size={26} fill={star <= (hoverRating || rating) ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-cyan-400/80 tracking-widest uppercase mb-1">コメント（任意）</label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="取引の感想を記入してください..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 text-white rounded p-2.5 outline-none transition-all resize-none leading-relaxed"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 py-2.5 rounded tracking-widest uppercase transition-all"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded tracking-widest uppercase active:scale-[0.98] ${PRIMARY_BUTTON_CLASS}`}
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  送信中...
                </>
              ) : (
                'レビューを送信'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
