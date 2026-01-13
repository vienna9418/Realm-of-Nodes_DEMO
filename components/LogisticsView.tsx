
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { BuildingType, Node, Connection } from '../types';

const BUILDINGS: Record<BuildingType, any> = {
  hq: { name: '核心总部', icon: 'fort', color: 'border-cyan-500', outputs: [], inputs: ['any'] },
  power: { name: '太阳能阵列', icon: 'wb_sunny', color: 'border-yellow-400', outputs: ['energy'], inputs: [] },
  extractor: { name: '以太提取器', icon: 'architecture', color: 'border-emerald-400', outputs: ['crystal'], inputs: [] },
  processor: { name: '等离子熔炉', icon: 'local_fire_department', color: 'border-blue-400', outputs: ['ingot'], inputs: ['crystal'] },
  assembler: { name: '量子组装机', icon: 'precision_manufacturing', color: 'border-purple-400', outputs: ['core'], inputs: ['ingot'] },
  storage: { name: '物质仓库', icon: 'inventory_2', color: 'border-slate-400', outputs: [], inputs: ['any'] },
};

const LogisticsView: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([
    { id: 'hq-main', type: 'hq', name: '大本营', x: 700, y: 300, progress: 0, status: 'idle', inventory: {}, inputs: ['any'], outputs: [] },
    { id: 'ext-1', type: 'extractor', name: '以太提取器 A', x: 100, y: 200, progress: 0, status: 'working', inventory: {}, inputs: [], outputs: ['crystal'] },
    { id: 'prc-1', type: 'processor', name: '熔炉 A', x: 400, y: 250, progress: 0, status: 'idle', inventory: {}, inputs: ['crystal'], outputs: ['ingot'] },
  ]);
  
  const [connections, setConnections] = useState<Connection[]>([
    { id: 'init-c1', fromId: 'ext-1', toId: 'prc-1' },
    { id: 'init-c2', fromId: 'prc-1', toId: 'hq-main' }
  ]);

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [activePort, setActivePort] = useState<{ id: string; type: 'in' | 'out' } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingType | null>(null);
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // 核心生产逻辑：递归检查节点是否被“激活”
  // 如果一个节点是提取器/电源，或者它有一个活跃的输入连接，则它处于工作状态
  useEffect(() => {
    const interval = setInterval(() => {
      setNodes(prevNodes => {
        // 1. 确定哪些节点应该处于 working 状态
        const workingIds = new Set<string>();
        
        // 提取器和电源总是尝试工作
        prevNodes.forEach(n => {
          if (n.type === 'extractor' || n.type === 'power') {
            workingIds.add(n.id);
          }
        });

        // 通过连接传播 working 状态 (简单模拟：如果有输入连向它，且输入源在工作，则它也在工作)
        let changed = true;
        while (changed) {
          changed = false;
          connections.forEach(conn => {
            if (workingIds.has(conn.fromId) && !workingIds.has(conn.toId)) {
              workingIds.add(conn.toId);
              changed = true;
            }
          });
        }

        // 2. 更新进度和状态
        return prevNodes.map(node => {
          const isWorking = workingIds.has(node.id);
          const newStatus = isWorking ? 'working' : 'idle';
          
          let newProgress = node.progress;
          if (isWorking && node.type !== 'hq' && node.type !== 'storage') {
            newProgress += 1.2; // 基础生产速度
            if (newProgress >= 100) newProgress = 0;
          } else if (!isWorking) {
            newProgress = 0;
          }

          return { 
            ...node, 
            status: newStatus as any, 
            progress: newProgress 
          };
        });
      });
    }, 60);
    return () => clearInterval(interval);
  }, [connections]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (selectedBuilding) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      // 修正放置坐标，考虑当前的 zoom 和鼠标位置
      const newNode: Node = {
        id: `node-${Date.now()}`,
        type: selectedBuilding,
        name: `${BUILDINGS[selectedBuilding].name} ${nodes.length}`,
        x: (e.clientX - rect.left) / zoom - 96,
        y: (e.clientY - rect.top) / zoom - 44,
        progress: 0,
        status: 'idle',
        inventory: {},
        inputs: BUILDINGS[selectedBuilding].inputs,
        outputs: BUILDINGS[selectedBuilding].outputs,
      };
      setNodes(prev => [...prev, newNode]);
      setSelectedBuilding(null);
      return;
    }
    if (activePort) setActivePort(null);
  };

  const handlePortClick = (e: React.MouseEvent, id: string, type: 'in' | 'out') => {
    e.stopPropagation();
    if (activePort) {
      if (activePort.id !== id && activePort.type !== type) {
        const fromId = activePort.type === 'out' ? activePort.id : id;
        const toId = activePort.type === 'in' ? activePort.id : id;
        
        if (!connections.find(c => c.fromId === fromId && c.toId === toId)) {
          setConnections(prev => [...prev, { id: `conn-${Date.now()}`, fromId, toId }]);
        }
        setActivePort(null);
      } else {
        setActivePort(null);
      }
    } else {
      setActivePort({ id, type });
    }
  };

  const deleteConnection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setConnections(prev => prev.filter(c => c.id !== id));
  };

  const deleteNode = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (id === 'hq-main') return;
    setNodes(prev => prev.filter(n => n.id !== id));
    setConnections(prev => prev.filter(c => c.fromId !== id && c.toId !== id));
  };

  const getPortPos = (node: Node, type: 'in' | 'out') => ({
    x: type === 'in' ? node.x : node.x + 192,
    y: node.y + 44
  });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    setMousePos({ x, y });

    if (draggingId) {
      setNodes(prev => prev.map(n => 
        n.id === draggingId ? { ...n, x: x - dragOffset.x, y: y - dragOffset.y } : n
      ));
    }
  };

  const workingCount = useMemo(() => nodes.filter(n => n.status === 'working').length, [nodes]);

  return (
    <div className="flex h-full relative overflow-hidden bg-[#020617] select-none font-sans">
      {/* 侧边栏 */}
      <aside className="w-64 bg-slate-900 border-r border-white/5 z-50 p-4 flex flex-col gap-6">
        <div>
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">组件制造库</h3>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(BUILDINGS) as BuildingType[]).map(type => (
              <button 
                key={type}
                onClick={() => setSelectedBuilding(type)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                  selectedBuilding === type ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                <span className="material-symbols-outlined">{BUILDINGS[type].icon}</span>
                <span className="text-[10px] font-bold">{BUILDINGS[type].name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <button onClick={() => {setNodes([nodes.find(n => n.id === 'hq-main')!]); setConnections([]);}} className="w-full py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-xs hover:bg-red-500/20 transition-all">清空除 HQ 外的所有节点</button>
          <button onClick={() => setZoom(1)} className="w-full py-2 bg-white/5 text-slate-400 border border-white/10 rounded-lg text-xs hover:bg-white/10">重置缩放 (100%)</button>
        </div>

        <div className="mt-auto bg-primary/10 border border-primary/20 rounded-xl p-4">
          <div className="flex items-center gap-2 text-primary mb-2">
            <span className="material-symbols-outlined text-sm">info</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">交互说明</span>
          </div>
          <ul className="text-[10px] text-slate-400 space-y-2 leading-relaxed">
            <li>• <span className="text-white">点击侧边栏</span>建筑后，在网格处点击放置</li>
            <li>• 点击<span className="text-primary">端口(圆点)</span>开始连线，再次点击目标端口完成</li>
            <li>• <span className="text-red-400">右键</span>点击任何物体（建筑物/连线）进行拆除</li>
            <li>• <span className="text-emerald-400">激活机制：</span>上级节点在工作且连接成功后，下级节点将自动启动。</li>
          </ul>
        </div>
      </aside>

      {/* 主画布 */}
      <section 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onClick={handleCanvasClick}
        onMouseUp={() => setDraggingId(null)}
        className="flex-1 relative overflow-hidden grid-bg cursor-crosshair"
      >
        <div 
          className="w-full h-full transition-transform duration-200 origin-center"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* 连线层 */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {connections.map(conn => {
              const from = nodes.find(n => n.id === conn.fromId);
              const to = nodes.find(n => n.id === conn.toId);
              if (!from || !to) return null;
              const start = getPortPos(from, 'out');
              const end = getPortPos(to, 'in');
              const cp1x = start.x + (end.x - start.x) * 0.5;
              const d = `M ${start.x},${start.y} C ${cp1x},${start.y} ${cp1x},${end.y} ${end.x},${end.y}`;
              const isActive = from.status === 'working';

              return (
                <g key={conn.id} className="pointer-events-auto cursor-pointer group/line" onContextMenu={(e) => deleteConnection(e, conn.id)}>
                  <path d={d} stroke="transparent" strokeWidth="12" fill="none" />
                  <path 
                    className={`transition-all duration-300 ${isActive ? 'conveyor-line stroke-primary opacity-100' : 'stroke-slate-700 opacity-40'}`} 
                    d={d} 
                    strokeWidth="3" 
                    fill="none" 
                    stroke={isActive ? "url(#belt-grad)" : "#334155"}
                  />
                  {isActive && (
                    <circle r="3.5" fill="#06b6d4" className="shadow-lg shadow-primary">
                      <animateMotion dur="2s" repeatCount="indefinite" path={d} />
                    </circle>
                  )}
                </g>
              );
            })}
            
            {activePort && (
              <line 
                x1={getPortPos(nodes.find(n => n.id === activePort.id)!, activePort.type).x}
                y1={getPortPos(nodes.find(n => n.id === activePort.id)!, activePort.type).y}
                x2={mousePos.x} y2={mousePos.y}
                stroke="#06b6d4" strokeWidth="2" strokeDasharray="6,4"
              />
            )}
            
            <defs>
              <linearGradient id="belt-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>

          {/* 节点层 */}
          {nodes.map(node => (
            <div 
              key={node.id}
              style={{ left: node.x, top: node.y }}
              onMouseDown={(e) => {
                e.stopPropagation();
                setDraggingId(node.id);
                setDragOffset({ x: mousePos.x - node.x, y: mousePos.y - node.y });
              }}
              onContextMenu={(e) => deleteNode(e, node.id)}
              className={`absolute w-48 bg-slate-900/90 backdrop-blur-xl border-2 ${BUILDINGS[node.type].color} rounded-2xl p-4 shadow-2xl transition-all group ${draggingId === node.id ? 'z-40 scale-105 shadow-primary/20 border-white/40' : 'z-20 border-opacity-40 hover:border-opacity-100'}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${node.status === 'working' ? 'bg-primary/10 border-primary/40 text-primary' : 'bg-white/5 border-white/5 text-slate-500'}`}>
                  <span className="material-symbols-outlined text-xl">{BUILDINGS[node.type].icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[11px] font-bold text-white truncate">{node.name}</h4>
                  <div className="flex items-center gap-1.5">
                     <div className={`w-1.5 h-1.5 rounded-full transition-all ${node.status === 'working' ? 'bg-emerald-500 animate-pulse shadow-[0_0_5px_#10b981]' : 'bg-slate-600'}`}></div>
                     <span className={`text-[8px] uppercase font-mono tracking-tighter ${node.status === 'working' ? 'text-emerald-400' : 'text-slate-500'}`}>{node.status === 'working' ? '生产中' : '待机'}</span>
                  </div>
                </div>
              </div>

              {node.type !== 'hq' && node.type !== 'storage' && (
                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mb-4">
                  <div className="bg-primary h-full transition-all duration-100" style={{ width: `${node.progress}%` }}></div>
                </div>
              )}

              {/* 端口 */}
              <div 
                onClick={(e) => handlePortClick(e, node.id, 'in')}
                className={`absolute left-[-10px] top-[40px] w-5 h-5 rounded-full border-2 border-slate-800 bg-slate-900 cursor-pointer hover:bg-primary transition-all flex items-center justify-center group-hover:scale-110 z-50 ${activePort?.id === node.id && activePort.type === 'in' ? 'bg-primary border-white scale-125 shadow-[0_0_10px_#06b6d4]' : ''}`}
              >
                <div className="w-1 h-1 bg-white/40 rounded-full"></div>
              </div>
              <div 
                onClick={(e) => handlePortClick(e, node.id, 'out')}
                className={`absolute right-[-10px] top-[40px] w-5 h-5 rounded-full border-2 border-slate-800 bg-slate-900 cursor-pointer hover:bg-primary transition-all flex items-center justify-center group-hover:scale-110 z-50 ${activePort?.id === node.id && activePort.type === 'out' ? 'bg-primary border-white scale-125 shadow-[0_0_10px_#06b6d4]' : ''}`}
              >
                <div className="w-1 h-1 bg-white/40 rounded-full"></div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-500">
                <div className="bg-white/5 p-1.5 rounded-lg flex flex-col items-center">
                  <span className="opacity-50">运行效率</span>
                  <span className="text-white font-mono">{node.status === 'working' ? '98.5%' : '0.0%'}</span>
                </div>
                <div className="bg-white/5 p-1.5 rounded-lg flex flex-col items-center">
                  <span className="opacity-50">负载指数</span>
                  <span className="text-primary font-mono">{node.progress.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          ))}

          {/* 实时预览 */}
          {selectedBuilding && (
            <div 
              className="absolute w-48 border-2 border-primary/40 border-dashed rounded-2xl p-4 pointer-events-none opacity-60 z-50 bg-primary/5 flex items-center gap-3"
              style={{ left: mousePos.x - 96, top: mousePos.y - 44 }}
            >
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                 <span className="material-symbols-outlined">{BUILDINGS[selectedBuilding].icon}</span>
              </div>
              <span className="text-xs font-bold text-white uppercase tracking-tighter">放置 {BUILDINGS[selectedBuilding].name}</span>
            </div>
          )}
        </div>

        {/* 任务指标面板 */}
        <div className="absolute top-6 right-6 w-80 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl z-50">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">物流生产实时监控</h3>
              <div className="px-3 py-1 bg-emerald-500/20 text-emerald-500 text-[10px] rounded-full font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                系统在线
              </div>
           </div>
           
           <div className="space-y-6">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                 <div className="flex justify-between text-xs mb-3">
                    <span className="text-slate-400">总吞吐能效</span>
                    <span className="text-white font-mono font-bold">{(connections.length * 15.5).toFixed(1)} Unit/min</span>
                 </div>
                 <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary shadow-[0_0_10px_#06b6d4] transition-all duration-500" style={{ width: `${Math.min(100, connections.length * 12)}%` }}></div>
                 </div>
              </div>
              
              <div className="space-y-3">
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter px-1">活跃流水线 ( {workingCount} / {nodes.length} )</p>
                 <div className="space-y-2">
                    {nodes.filter(n => n.type !== 'hq').slice(0, 3).map((n, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl text-[11px] border border-transparent hover:border-white/10 transition-all">
                        <span className={`material-symbols-outlined text-sm ${n.status === 'working' ? 'text-primary' : 'text-slate-600'}`}>{BUILDINGS[n.type].icon}</span>
                        <span className="text-slate-300 truncate w-24">{n.name}</span>
                        <span className={`ml-auto font-mono ${n.status === 'working' ? 'text-emerald-400' : 'text-slate-600'}`}>{n.status === 'working' ? 'ACTIVE' : 'IDLE'}</span>
                      </div>
                    ))}
                    {nodes.length > 4 && <p className="text-[9px] text-center text-slate-600 italic">... 以及其他 {nodes.length - 4} 个节点</p>}
                 </div>
              </div>
           </div>
        </div>

        {/* 缩放控制器 */}
        <div className="absolute bottom-8 right-8 flex flex-col gap-3 z-50">
           <button onClick={() => setZoom(z => Math.min(2, z + 0.15))} className="w-12 h-12 bg-slate-900/80 backdrop-blur border border-white/10 rounded-2xl flex items-center justify-center hover:bg-slate-700 hover:border-primary/40 transition-all text-white active:scale-90 shadow-xl">
              <span className="material-symbols-outlined">zoom_in</span>
           </button>
           <button onClick={() => setZoom(z => Math.max(0.4, z - 0.15))} className="w-12 h-12 bg-slate-900/80 backdrop-blur border border-white/10 rounded-2xl flex items-center justify-center hover:bg-slate-700 hover:border-primary/40 transition-all text-white active:scale-90 shadow-xl">
              <span className="material-symbols-outlined">zoom_out</span>
           </button>
        </div>
      </section>
    </div>
  );
};

export default LogisticsView;
