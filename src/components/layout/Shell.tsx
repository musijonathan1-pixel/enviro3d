import React, { useState, useCallback, useEffect } from 'react';
import { 
  Box, 
  Layers, 
  Settings2, 
  Zap, 
  Maximize2, 
  Download, 
  FileCode,
  Activity,
  Palette,
  Grid3X3,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Viewport3D } from '../viewport/Viewport3D';
import { NodePipeline } from '../workflow/NodePipeline';
import { ProjectService, ProjectData } from '@/services/ProjectService';

interface PanelProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const Panel: React.FC<PanelProps> = ({ title, icon, children, className }) => (
  <div className={cn("bg-[#0f1115] border border-white/5 flex flex-col overflow-hidden", className)}>
    <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/5 bg-[#16191f]">
      <span className="text-zinc-500">{icon}</span>
      <h3 className="text-[10px] font-mono tracking-wider text-zinc-400 font-bold uppercase">
        {title}
      </h3>
    </div>
    <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
      {children}
    </div>
  </div>
);

const PBRMapThumbnail = ({ label, color, active = false }: { label: string, color: string, active?: boolean }) => (
  <div className={cn(
    "group flex flex-col gap-1.5 p-2 rounded transition-all cursor-pointer border",
    active ? "bg-white/5 border-white/10" : "hover:bg-white/5 border-transparent"
  )}>
    <div className="flex justify-between items-center">
      <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase">{label}</span>
      <div className={cn("w-1.5 h-1.5 rounded-full", active ? "bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]" : "bg-zinc-800")} />
    </div>
    <div className="aspect-square rounded border border-white/10 relative overflow-hidden bg-zinc-900">
      <div className={cn("absolute inset-2 rounded-sm opacity-80", color)} />
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
    </div>
  </div>
);

export const Shell: React.FC = () => {
  const [wireframe, setWireframe] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<ProjectData | null>(null);

  // Initialize project
  useEffect(() => {
    const saved = ProjectService.getActive();
    if (saved) {
      setActiveProject(saved);
      if (saved.sourceAsset) setModelUrl(saved.sourceAsset);
    } else {
      const newProj = ProjectService.createNew('Untitled_Project');
      setActiveProject(newProj);
    }
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setModelUrl(url);
      
      if (activeProject) {
        const updated = {
          ...activeProject,
          sourceAsset: url,
          projectName: file.name.split('.')[0]
        };
        setActiveProject(updated);
        ProjectService.saveToLocalStorage(updated);
      }
    }
  }, [activeProject]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'model/gltf-binary': ['.glb'],
      'model/gltf+json': ['.gltf'],
      'application/octet-stream': ['.obj', '.fbx']
    },
    multiple: false,
    noClick: true // Only allow drag-and-drop for the main viewport
  });

  const handleExecuteRetopo = () => {
    if (isProcessing || !modelUrl) return;
    setIsProcessing(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          return 100;
        }
        return prev + 2;
      });
    }, 40);
  };

  return (
    <div {...getRootProps()} className="flex flex-col h-screen w-full bg-[#090a0c] text-zinc-300 font-sans selection:bg-cyan-500/30 overflow-hidden select-none outline-none">
      <input {...getInputProps()} />
      
      {/* Drag Overlay */}
      <AnimatePresence>
        {isDragActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-cyan-500/20 backdrop-blur-md flex flex-col items-center justify-center border-4 border-dashed border-cyan-500/50 m-4 rounded"
          >
            <Upload size={48} className="text-cyan-400 mb-4 animate-bounce" />
            <h2 className="text-2xl font-mono font-bold text-white uppercase tracking-tighter">Drop 3D Asset Here</h2>
            <p className="text-cyan-300/60 font-mono text-sm mt-2">SUPPORTED: GLB, GLTF, OBJ, FBX</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <header className="h-10 border-b border-white/5 flex items-center justify-between px-4 bg-[#121418] shrink-0 z-50">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 bg-cyan-500 rounded-sm flex items-center justify-center rotate-45">
              <Box size={12} className="text-black -rotate-45" />
            </div>
            <span className="font-mono font-bold text-xs tracking-tight text-white uppercase">
              {activeProject?.projectName || 'Musi Enviro 3D'}
            </span>
          </div>
          <div className="h-4 w-px bg-white/5 ml-2" />
          <nav className="flex items-center gap-5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            <button className="text-cyan-400 hover:text-white transition-colors">Project</button>
            <button className="hover:text-white transition-colors">Analyze</button>
            <button className="hover:text-white transition-colors">Retopo</button>
            <button className="hover:text-white transition-colors">Texturing</button>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-1">
              <div className="w-5 h-5 rounded-full bg-zinc-800 border border-black flex items-center justify-center text-[8px] font-bold">ME</div>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 lowercase">v1.2.0.functional</span>
          </div>
          <button className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-[10px] flex items-center gap-2 rounded-sm transition-all shadow-lg shadow-cyan-900/20 active:translate-y-px uppercase">
            <Download size={14} />
            Export Asset
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex overflow-hidden p-[2px] gap-[2px]">
        
        {/* Sidebar Left: Asset & Layers */}
        <div className="w-72 flex flex-col gap-[2px]">
          <Panel title="Asset Browser" icon={<Layers size={14} />} className="flex-1">
            <div className="space-y-5">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1 mb-2">
                  <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Source Input</span>
                  <FileCode size={12} className="text-zinc-600" />
                </div>
                {activeProject?.sourceAsset ? (
                   <div className="group flex items-center gap-3 p-2 rounded-sm cursor-pointer border border-cyan-500/20 bg-cyan-500/10 transition-all">
                    <Box size={14} className="text-cyan-400" />
                    <div className="flex flex-col">
                      <span className="text-xs font-mono truncate text-cyan-100">{activeProject.projectName}</span>
                      <span className="text-[8px] text-zinc-500 font-mono">LOADED FROM STORAGE</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border border-dashed border-white/5 rounded text-center space-y-2">
                    <Upload size={20} className="mx-auto text-zinc-700" />
                    <p className="text-[9px] text-zinc-600 uppercase font-bold">Drag models here to start</p>
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t border-white/5 space-y-2">
                <div className="text-[9px] text-zinc-500 uppercase font-black tracking-widest px-1">Active Masks</div>
                {['skin_repro', 'metal_grit', 'cloth_ao'].map((mask, i) => (
                  <div key={mask} className={cn(
                    "flex items-center gap-3 p-2 rounded-sm border transition-all cursor-pointer group",
                    i === 0 ? "bg-violet-900/10 border-violet-500/30" : "bg-zinc-900/30 border-white/5 hover:border-white/10"
                  )}>
                    <div className="w-10 h-10 bg-black rounded-sm border border-white/10 flex-shrink-0 relative overflow-hidden group-hover:border-violet-400/50 transition-colors">
                       <div className="absolute inset-0 bg-violet-500/20 mix-blend-overlay" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className={cn("text-[11px] font-bold", i === 0 ? "text-violet-300" : "text-zinc-400")}>{mask.toUpperCase()}</span>
                      <span className="text-[8px] text-zinc-500 font-mono uppercase tracking-tighter">Channel: R • Luma: 1.0</span>
                    </div>
                  </div>
                ))}
                <button className="w-full py-1.5 border border-dashed border-white/10 rounded-sm text-[9px] font-mono text-zinc-600 hover:text-zinc-400 hover:border-white/20 transition-all uppercase">
                  + Add Mask Layer
                </button>
              </div>
            </div>
          </Panel>
          
          <Panel title="Mesh Analyzer" icon={<Activity size={12} />} className="h-56">
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-mono mb-1">
                  <span className="text-zinc-500 uppercase font-black">Topology Analysis</span>
                  <span className="text-red-400 font-black">POOR / DENSE</span>
                </div>
                <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                  <div className="w-1/4 h-full bg-red-400" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 font-mono text-[10px]">
                <div className="flex flex-col">
                  <span className="text-[9px] text-zinc-600 font-bold">TRIANGLES</span>
                  <span className="text-white">2,405,118</span>
                </div>
                <div className="flex flex-col border-l border-white/5 pl-2">
                  <span className="text-[9px] text-zinc-600 font-bold">OVERLAPS</span>
                  <span className="text-yellow-500">12</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-zinc-600 font-bold">NON-MANIFOLD</span>
                  <span className="text-red-500">2</span>
                </div>
                <div className="flex flex-col border-l border-white/5 pl-2">
                  <span className="text-[9px] text-zinc-600 font-bold">UV RATIO</span>
                  <span className="text-zinc-400">0.92</span>
                </div>
              </div>
            </div>
          </Panel>
        </div>

        {/* Center: Viewport & Pipeline */}
        <div className="flex-1 flex flex-col gap-[2px]">
          <div className="flex-1 relative bg-[#090a0c] border border-white/5 overflow-hidden">
            <Viewport3D url={modelUrl || undefined} wireframe={wireframe} />
            
            {/* Viewport Overlay Tabs */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 flex bg-black/60 backdrop-blur-md px-1 py-1 rounded-sm border border-white/10 text-[9px] font-bold z-10">
               {['Model', 'Retopo', 'UV', 'Texture'].map((tab, i) => (
                 <button key={tab} className={cn(
                   "px-4 py-1.5 rounded-sm transition-all uppercase tracking-widest",
                   i === 1 ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                 )}>
                   {tab}
                 </button>
               ))}
            </div>

            {/* Viewport Gizmos */}
            <div className="absolute bottom-4 left-4 flex gap-2">
              <div className="bg-black/60 backdrop-blur px-3 py-1.5 rounded border border-white/10 flex items-center gap-4 text-[9px] font-mono">
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]" />
                   <span>X: 0.0</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                   <span>Y: 0.0</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
                   <span>Z: 0.0</span>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-4 right-4 flex gap-2">
               <button 
                 onClick={() => setWireframe(!wireframe)}
                 className={cn(
                   "bg-black/60 p-2 rounded border border-white/10 transition-colors",
                   wireframe ? "text-cyan-400 border-cyan-500/50" : "text-zinc-400 hover:text-white"
                 )}
               >
                 <Grid3X3 size={16} />
               </button>
               <button className="bg-black/60 p-2 rounded border border-white/10 text-zinc-400 hover:text-white transition-colors">
                 <Maximize2 size={16} />
               </button>
            </div>

            {/* Progress Overlay */}
            <AnimatePresence>
              {isProcessing && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-20"
                >
                  <div className="w-64 bg-[#121418] border border-white/10 p-6 rounded shadow-2xl space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] font-mono text-cyan-400 font-black uppercase tracking-widest">Processing</span>
                      <span className="text-[10px] font-mono text-zinc-500 font-bold">{progress}%</span>
                    </div>
                    <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-[8px] font-mono text-zinc-600 uppercase text-center tracking-tighter font-bold">
                      {progress < 30 ? 'Analyzing Manifold Edges...' : progress < 70 ? 'Generating Quad Flow...' : 'Baking Normal Maps...'}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="h-32 bg-[#0d0f13] border border-white/5">
            <NodePipeline 
              activeStep={isProcessing ? (progress < 40 ? 'analyze' : 'retopo') : (progress === 100 ? 'uv' : 'import')} 
              progress={progress}
            />
          </div>
        </div>

        {/* Sidebar Right: Workflow Controls */}
        <div className="w-80 flex flex-col gap-[2px]">
          <Panel title="Texture Studio" icon={<Palette size={14} />} className="flex-1">
             <div className="space-y-4">
               <div className="grid grid-cols-2 gap-1.5">
                 <PBRMapThumbnail label="Albedo" color="bg-violet-500" active />
                 <PBRMapThumbnail label="Normal" color="bg-cyan-500" />
                 <PBRMapThumbnail label="Roughness" color="bg-zinc-600" />
                 <PBRMapThumbnail label="Metallic" color="bg-zinc-800" />
               </div>
               
               <div className="p-3 bg-zinc-900/50 rounded-sm border border-white/5 space-y-3">
                 <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Map Resolution</span>
                    <span className="text-[10px] font-mono font-bold text-cyan-400">4096 px</span>
                 </div>
                 <div className="flex gap-1">
                    {[1, 2, 4, 8].map(res => (
                      <button key={res} className={cn(
                        "flex-1 py-1.5 rounded-sm text-[9px] font-mono border transition-all font-bold",
                        res === 4 ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-200" : "bg-black border-white/5 text-zinc-600 hover:border-white/20"
                      )}>{res}K</button>
                    ))}
                 </div>
               </div>

               <button className="w-full py-2.5 bg-zinc-800/50 hover:bg-zinc-800 border border-white/10 rounded-sm text-[9px] font-black tracking-[0.2em] text-zinc-400 hover:text-zinc-200 transition-all uppercase">
                  Export Texture Set
               </button>
             </div>
          </Panel>
          
          <Panel title="Retopo Engine" icon={<Settings2 size={14} />} className="h-[42%]">
            <div className="space-y-4">
              <div className="space-y-3 p-3 bg-cyan-950/20 border border-cyan-500/10 rounded-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 p-1 opacity-20">
                   <Activity size={40} className="text-cyan-500" />
                </div>
                <div className="flex justify-between items-center relative z-10">
                  <label className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.15em]">Target Density</label>
                  <span className="text-[10px] font-mono font-bold text-cyan-400 tracking-tighter">25,000 QUADS</span>
                </div>
                
                {/* Visual Density Indicators from PDF */}
                <div className="flex flex-col gap-1.5 py-2 relative z-10">
                  {[0.85, 0.65, 0.35].map((w, i) => (
                    <div key={i} className="h-[3px] bg-zinc-900 border border-white/5 w-full rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${w * 100}%` }}
                        transition={{ delay: i * 0.1 }}
                        className="h-full bg-cyan-500/60 shadow-[0_0_8px_rgba(6,182,212,0.3)]" 
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2 relative z-10">
                   <div className="flex flex-col gap-1">
                      <span className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Algorithm</span>
                      <select className="bg-black border border-white/5 p-2 text-[10px] rounded-sm outline-none text-zinc-300 font-mono">
                        <option>X-ATLAS REDUX</option>
                        <option>QUADFLOW 4.0</option>
                      </select>
                   </div>
                   <div className="flex flex-col gap-1">
                      <span className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Symmetry</span>
                      <div className="flex border border-white/5 rounded-sm overflow-hidden text-[10px] h-full font-bold">
                         <button className="flex-1 py-1.5 bg-cyan-500 text-black">X</button>
                         <button className="flex-1 py-1.5 bg-zinc-900 text-zinc-600 hover:text-zinc-400">Y</button>
                         <button className="flex-1 py-1.5 bg-zinc-900 text-zinc-600 hover:text-zinc-400">Z</button>
                      </div>
                   </div>
                </div>
              </div>
              
              <div className="space-y-3 px-1">
                <div className="flex items-center justify-between">
                   <span className="text-[11px] text-zinc-400 font-medium tracking-tight">Feature Preservation</span>
                   <div className="w-8 h-4 bg-zinc-800 rounded-full relative p-0.5 border border-white/10 cursor-pointer">
                     <div className="w-3 h-3 bg-cyan-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.4)]" />
                   </div>
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-[11px] text-zinc-400 font-medium tracking-tight">Project UV Wraps</span>
                   <div className="w-8 h-4 bg-zinc-800 rounded-full relative p-0.5 border border-white/10 cursor-pointer">
                     <div className="w-3 h-3 bg-zinc-600 rounded-full translate-x-4" />
                   </div>
                </div>
              </div>
              
              <button 
                onClick={handleExecuteRetopo}
                disabled={isProcessing}
                className="group w-full flex items-center justify-center gap-2 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-zinc-900 disabled:text-zinc-700 text-black rounded-sm font-black text-[10px] uppercase tracking-[0.2em] mt-2 transition-all shadow-xl active:scale-[0.98] shadow-cyan-900/10"
              >
                {isProcessing ? (
                   <Activity size={14} className="animate-spin" />
                ) : (
                   <Zap size={14} className="group-hover:animate-pulse" />
                )}
                {isProcessing ? 'Processing...' : 'Solve Retopology'}
              </button>
            </div>
          </Panel>
        </div>
      </main>

      {/* Footer / Project Manifest Info */}
      <footer className="h-6 border-t border-white/5 flex items-center justify-between px-3 bg-[#0a0b0e] shrink-0 font-mono text-[9px] text-zinc-600 uppercase tracking-widest overflow-hidden">
        <div className="flex gap-5 items-center">
           <div className="flex items-center gap-2">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full transition-colors duration-500",
                isProcessing ? "bg-yellow-500 animate-pulse" : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"
              )} />
              <span className={cn("font-bold transition-colors animate-pulse", isProcessing ? "text-yellow-500" : "text-zinc-500")}>
                {isProcessing ? 'STATUS: PROCESSING' : 'CORE: ACTIVE'}
              </span>
           </div>
           <span className="text-zinc-800 select-none">|</span>
           <span className="hover:text-cyan-400 cursor-pointer transition-colors">Manifest: char_dev_v1.musi3dproj</span>
        </div>
        <div className="flex gap-6 items-center">
           <div className="flex gap-3 text-zinc-700 font-bold">
             <span>MEM: 1.25GB</span>
             <span className="text-zinc-800">/</span>
             <span className="text-zinc-500">TRIS: 2.4M</span>
           </div>
           <div className="bg-zinc-900/50 px-2 py-0.5 rounded-sm text-zinc-500 border border-white/5 flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
             GPU READY
           </div>
        </div>
      </footer>
    </div>
  );
};

