
import React, { useState, useMemo } from 'react';
import { RESOURCES } from '../constants';
import { Tier, Resource } from '../types';

interface EncyclopediaViewProps {
  onClose: () => void;
}

const EncyclopediaView: React.FC<EncyclopediaViewProps> = ({ onClose }) => {
  const [selectedTier, setSelectedTier] = useState<Tier>(Tier.BASIC);
  const [selectedResourceId, setSelectedResourceId] = useState<string>('reality_engine');
  const [isProducing, setIsProducing] = useState(false);
  const [productionProgress, setProductionProgress] = useState(0);

  // Fix: Corrected the comparison to use the state variable 'selectedResourceId' instead of the setter 'setSelectedResourceId'
  const selectedResource = useMemo(() => 
    RESOURCES.find(r => r.id === selectedResourceId) || RESOURCES[0]
  , [selectedResourceId]);

  const tierColors = {
    [Tier.BASIC]: 'tier-basic',
    [Tier.INTERMEDIATE]: 'tier-intermediate',
    [Tier.ADVANCED]: 'tier-advanced',
    [Tier.MYTHIC]: 'tier-mythic',
  };

  const startProduction = () => {
    if (isProducing) return;
    setIsProducing(true);
    setProductionProgress(0);
    const interval = setInterval(() => {
      setProductionProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setIsProducing(false);
          return 100;
        }
        return p + 2;
      });
    }, 30);
  };

  const filteredResources = RESOURCES.filter(r => r.tier === selectedTier);

  // 获取原材料资源对象
  const ingredientResources = useMemo(() => {
    return (selectedResource.ingredients || []).map(ing => {
      const res = RESOURCES.find(r => r.id === ing.resourceId);
      return { ...res, requiredAmount: ing.amount };
    });
  }, [selectedResource]);

  return (
    <div className="absolute inset-0 z-[60] p-6 flex flex-col gap-6 animate-in fade-in zoom-in duration-300">
      <div className="fixed inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1614728263952-84ea206f99b6?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-30 pointer-events-none"></div>
      <div className="fixed inset-0 z-0 node-dot pointer-events-none"></div>

      <header className="flex items-center justify-between glass rounded-3xl p-4 px-8 shadow-2xl relative border-white/10">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
            <span className="material-symbols-outlined text-white text-2xl">auto_awesome_motion</span>
          </div>
          <div>
            <h1 className="text-xl font-display font-bold tracking-tight text-white">量子资源百科</h1>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Quantum Synthesis Index v5.0</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-xl border border-white/5">
            <button className="px-5 py-2 text-xs font-bold rounded-lg bg-primary text-white shadow-lg shadow-primary/20">资源目录</button>
            <button className="px-5 py-2 text-xs font-bold rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">自动化蓝图</button>
          </div>
          <div className="h-8 w-[1px] bg-white/10"></div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 gap-6 overflow-hidden relative">
        {/* 左侧：层级筛选 */}
        <aside className="w-64 flex flex-col gap-4">
          <div className="glass rounded-3xl p-5 flex-1 border-white/5">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6 px-1">能级筛选</h3>
            <nav className="space-y-3">
              {[
                { tier: Tier.BASIC, label: 'T1 基础物质', icon: 'radio_button_checked', color: 'tier-basic' },
                { tier: Tier.INTERMEDIATE, label: 'T2 复合构件', icon: 'deployed_code', color: 'tier-intermediate' },
                { tier: Tier.ADVANCED, label: 'T3 高阶单元', icon: 'memory', color: 'tier-advanced' },
                { tier: Tier.MYTHIC, label: 'T4 禁断科技', icon: 'all_inclusive', color: 'tier-mythic' },
              ].map((t) => (
                <button
                  key={t.tier}
                  onClick={() => setSelectedTier(t.tier)}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all border group ${
                    selectedTier === t.tier 
                      ? `bg-${t.color}/10 border-${t.color}/40 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]` 
                      : 'hover:bg-white/5 border-transparent text-slate-400'
                  }`}
                >
                  <span className={`material-symbols-outlined text-lg ${selectedTier === t.tier ? `text-${t.color}` : 'group-hover:text-white'}`}>{t.icon}</span>
                  <span className="text-xs font-bold">{t.label}</span>
                  <span className={`ml-auto text-[9px] px-2 py-0.5 rounded-full font-mono ${
                    selectedTier === t.tier ? `bg-${t.color}/20 text-white` : 'bg-white/5'
                  }`}>
                    {RESOURCES.filter(r => r.tier === t.tier).length}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* 中间：资源列表 */}
        <main className="flex-1 glass rounded-3xl p-8 overflow-y-auto custom-scrollbar border-white/5">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredResources.map((res) => (
              <div 
                key={res.id} 
                onClick={() => setSelectedResourceId(res.id)}
                className={`group relative glass rounded-2xl border-2 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:scale-[1.02] active:scale-95 ${
                  selectedResourceId === res.id 
                    ? `border-${tierColors[res.tier]} bg-${tierColors[res.tier]}/5 shadow-lg shadow-${tierColors[res.tier]}/10` 
                    : `border-white/5 hover:border-white/20`
                }`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:rotate-6 ${selectedResourceId === res.id ? `bg-${tierColors[res.tier]}/20` : 'bg-white/5'}`}>
                  <span className={`material-symbols-outlined text-4xl text-${tierColors[res.tier]}`}>
                    {res.icon}
                  </span>
                </div>
                <p className="text-sm font-bold text-white mb-1 tracking-tight">{res.name}</p>
                <p className="text-[10px] font-mono text-slate-500 uppercase">{res.tier}</p>
                
                {res.count > 0 && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-mono rounded-md border border-emerald-500/20">
                    x{res.count}
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>

        {/* 右侧：详细信息与动态合成图 */}
        <aside className="w-[480px] glass rounded-3xl flex flex-col overflow-hidden border-white/10 shadow-3xl">
          <div className="p-8 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-5">
                <div className={`w-20 h-20 bg-${tierColors[selectedResource.tier]}/10 rounded-3xl flex items-center justify-center border border-${tierColors[selectedResource.tier]}/30 shadow-2xl transition-all duration-500`}>
                  <span className={`material-symbols-outlined text-${tierColors[selectedResource.tier]} text-5xl`}>
                    {selectedResource.icon}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold text-white tracking-tight">{selectedResource.name}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold bg-${tierColors[selectedResource.tier]}/20 text-${tierColors[selectedResource.tier]} border border-${tierColors[selectedResource.tier]}/20 uppercase tracking-widest`}>
                      Tier {selectedResource.tier.substring(0, 2)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">UID: {selectedResource.id.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              {selectedResource.description}
            </p>
          </div>

          <div className="flex-1 overflow-hidden relative p-6 flex flex-col">
            <div className="flex items-center justify-between mb-8 px-2">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                动态合成蓝图
              </h3>
              <span className="text-[9px] text-slate-500 font-mono">ENCODED SCHEMATIC v2.1</span>
            </div>

            <div className="flex-1 relative flex items-center justify-center">
              {/* 背景装饰线 */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
                    <stop offset="50%" stopColor="rgba(255,255,255,0.2)" />
                    <stop offset="100%" stopColor="rgba(6,182,212,0.4)" />
                  </linearGradient>
                </defs>
                {ingredientResources.length > 0 && ingredientResources.map((_, idx) => {
                  const startY = (idx + 1) * (100 / (ingredientResources.length + 1)) + '%';
                  return (
                    <path 
                      key={idx}
                      d={`M 120 ${startY} C 200 ${startY}, 220 50%, 250 50%`} 
                      fill="none" 
                      stroke="url(#line-grad)" 
                      strokeWidth="2" 
                      strokeDasharray="4 4"
                    />
                  );
                })}
                <path d="M 330 50% L 380 50%" fill="none" stroke="url(#line-grad)" strokeWidth="2" strokeDasharray="4 4" />
              </svg>

              {/* 输入原材料节点 */}
              <div className="absolute left-4 h-full flex flex-col justify-around py-4 gap-4 z-10 w-36">
                {ingredientResources.length > 0 ? ingredientResources.map((ing, idx) => {
                  const hasStock = (ing.count || 0) >= (ing.requiredAmount || 0);
                  return (
                    <div 
                      key={ing.id || idx} 
                      onClick={() => ing.id && setSelectedResourceId(ing.id)}
                      className={`glass p-3 rounded-xl border transition-all cursor-pointer hover:scale-105 active:scale-95 ${hasStock ? 'border-emerald-500/30' : 'border-red-500/30 grayscale opacity-70'}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`material-symbols-outlined text-[14px] ${hasStock ? 'text-emerald-400' : 'text-red-400'}`}>{ing.icon}</span>
                        <span className="text-[9px] text-white font-bold truncate">{ing.name}</span>
                      </div>
                      <div className="flex justify-between items-center text-[8px] font-mono">
                        <span className="text-slate-500">需求: {ing.requiredAmount}</span>
                        <span className={hasStock ? 'text-emerald-500' : 'text-red-400'}>持有: {ing.count || 0}</span>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="glass p-4 rounded-xl border border-white/5 text-center italic text-[9px] text-slate-500">
                    无前置配方
                  </div>
                )}
              </div>

              {/* 中央加工节点 */}
              <div className="absolute z-20 w-24 h-24 rounded-full bg-slate-900 border-2 border-primary/40 flex flex-col items-center justify-center shadow-3xl group overflow-hidden">
                <div className={`absolute inset-0 bg-primary/10 transition-transform duration-1000 ${isProducing ? 'animate-pulse scale-150' : 'scale-0'}`}></div>
                <span className={`material-symbols-outlined text-primary text-3xl mb-1 relative z-10 ${isProducing ? 'animate-spin' : ''}`}>settings_suggest</span>
                <p className="text-[8px] font-bold text-primary relative z-10 tracking-widest">ASSEMBLER</p>
              </div>

              {/* 输出目标节点 */}
              <div className="absolute right-4 z-10">
                <div className={`w-16 h-16 glass rounded-2xl border-2 border-${tierColors[selectedResource.tier]}/40 flex items-center justify-center shadow-2xl shadow-${tierColors[selectedResource.tier]}/10 transition-all duration-500 ${isProducing ? 'scale-110' : ''}`}>
                  <span className={`material-symbols-outlined text-${tierColors[selectedResource.tier]} text-3xl ${isProducing ? 'animate-pulse' : ''}`}>{selectedResource.icon}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 底部操作区 */}
          <div className="p-8 bg-slate-900/40 backdrop-blur-sm space-y-5">
            {isProducing ? (
               <div className="space-y-3">
                 <div className="flex justify-between items-end">
                   <div className="flex flex-col">
                     <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">正在优化原子排列...</span>
                     <span className="text-xs text-primary font-mono font-bold animate-pulse">SYNTHESIZING...</span>
                   </div>
                   <span className="text-sm text-white font-mono font-bold">{productionProgress}%</span>
                 </div>
                 <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="bg-gradient-to-r from-primary to-blue-500 h-full transition-all duration-300 shadow-[0_0_15px_#06b6d4]" 
                      style={{ width: `${productionProgress}%` }}
                    ></div>
                 </div>
               </div>
            ) : (
              <div className="flex items-center gap-4 text-[10px] font-mono p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="material-symbols-outlined text-slate-500 text-sm">inventory_2</span>
                <span className="text-slate-400">当前库存:</span>
                <span className="text-white font-bold">{selectedResource.count} Units</span>
                <span className="ml-auto text-emerald-500/60 uppercase">Ready for export</span>
              </div>
            )}
            
            <button 
              onClick={startProduction}
              disabled={isProducing || ingredientResources.some(ing => (ing.count || 0) < (ing.requiredAmount || 0))}
              className={`group w-full py-4 rounded-2xl font-display font-bold text-sm flex items-center justify-center gap-3 transition-all relative overflow-hidden shadow-2xl ${
                isProducing 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : ingredientResources.some(ing => (ing.count || 0) < (ing.requiredAmount || 0))
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20 cursor-not-allowed'
                  : 'bg-primary hover:bg-cyan-400 text-white shadow-primary/30 active:scale-[0.98]'
              }`}
            >
              <div className={`absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300`}></div>
              <span className="material-symbols-outlined text-xl relative z-10">bolt</span>
              <span className="relative z-10">
                {isProducing ? '自动化构筑中...' : 
                 ingredientResources.some(ing => (ing.count || 0) < (ing.requiredAmount || 0)) ? '原材料不足' : '启动自动化生产循环'}
              </span>
            </button>
          </div>
        </aside>
      </div>

      {/* 装饰背景文字 */}
      <div className="fixed bottom-12 left-12 z-0 text-[160px] font-black text-white/[0.01] pointer-events-none select-none uppercase tracking-tighter leading-none hidden xl:block">
        {selectedResource.name}
      </div>
    </div>
  );
};

export default EncyclopediaView;
