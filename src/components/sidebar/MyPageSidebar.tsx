import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  History, 
  MessageSquare, 
  Heart, 
  Star, 
  Settings, 
  HelpCircle 
} from 'lucide-react';

export type MyPageTab = 'dashboard' | 'listings' | 'purchased' | 'favorites' | 'reviews' | 'settings';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem = ({ icon, label, active = false, onClick }: SidebarItemProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all ${
    active ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'
  }`}>
    {icon}
    <span>{label}</span>
  </button>
);

interface MyPageSidebarProps {
  activeTab: MyPageTab;
  onTabChange: (tab: MyPageTab) => void;
  onOpenMessages: () => void;
}

export const MyPageSidebar: React.FC<MyPageSidebarProps> = ({ activeTab, onTabChange, onOpenMessages }) => {
  return (
    <aside className="w-80 border-r border-slate-800/60 bg-[#060913]/80 p-6 flex flex-col gap-8 h-full">
      <div className="space-y-6">
        <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">マイページ</h2>
        <nav className="space-y-1">
          <SidebarItem icon={<LayoutDashboard size={18} />} label="ダッシュボード" active={activeTab === 'dashboard'} onClick={() => onTabChange('dashboard')} />
          <SidebarItem icon={<Package size={18} />} label="出品した商品" active={activeTab === 'listings'} onClick={() => onTabChange('listings')} />
          <SidebarItem icon={<History size={18} />} label="購入した商品" active={activeTab === 'purchased'} onClick={() => onTabChange('purchased')} />
          <SidebarItem icon={<MessageSquare size={18} />} label="メッセージ" onClick={onOpenMessages} />
          <SidebarItem icon={<Heart size={18} />} label="お気に入り" active={activeTab === 'favorites'} onClick={() => onTabChange('favorites')} />
          <SidebarItem icon={<Star size={18} />} label="レビュー" active={activeTab === 'reviews'} onClick={() => onTabChange('reviews')} />
        </nav>
      </div>

      <div className="mt-auto space-y-4">
        <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
          <div className="flex items-center gap-2 text-cyan-400 mb-2">
            <HelpCircle size={16} />
            <span className="text-[11px] font-bold">ヘルプセンター</span>
          </div>
          <p className="text-[9px] text-slate-400 leading-relaxed">ご不明な点はお気軽にご相談ください</p>
        </div>
        <SidebarItem icon={<Settings size={18} />} label="設定" active={activeTab === 'settings'} onClick={() => onTabChange('settings')} />
      </div>
    </aside>
  );
};