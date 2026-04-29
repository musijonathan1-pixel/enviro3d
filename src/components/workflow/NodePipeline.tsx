import React from 'react';
import { motion } from 'motion/react';
import { 
  FileUp, 
  Activity, 
  Maximize2, 
  Zap, 
  Download,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NodePipelineProps {
  activeStep?: string;
  progress?: number;
}

const STEPS = [
  { id: 'import', label: 'Import', icon: <FileUp size={14} /> },
  { id: 'analyze', label: 'Analyze', icon: <Activity size={14} /> },
  { id: 'retopo', label: 'Retopo', icon: <Zap size={14} /> },
  { id: 'uv', label: 'UV Unwrap', icon: <Maximize2 size={14} /> },
  { id: 'bake', label: 'Bake PBR', icon: <Download size={14} /> },
];

export const NodePipeline: React.FC<NodePipelineProps> = ({ activeStep = 'import', progress = 0 }) => {
  const getStatus = (stepId: string) => {
    const currentIdx = STEPS.findIndex(s => s.id === activeStep);
    const stepIdx = STEPS.findIndex(s => s.id === stepId);
    
    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'current';
    return 'pending';
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-zinc-500 uppercase">Process Pipeline</span>
        </div>
        {activeStep === 'retopo' && (
          <span className="text-[10px] font-mono text-cyan-500">SOLVING: {progress}%</span>
        )}
      </div>
      
      <div className="flex-1 flex items-center justify-between px-10 relative">
        {/* Background Line */}
        <div className="absolute top-1/2 left-20 right-20 h-[2px] bg-zinc-900 -translate-y-1/2 z-0" />
        
        {STEPS.map((step, idx) => {
          const status = getStatus(step.id);
          
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-3 z-10">
                <motion.div 
                  initial={false}
                  animate={{
                    scale: status === 'current' ? 1.15 : 1,
                    backgroundColor: status === 'completed' ? '#06b6d4' : status === 'current' ? (step.id === 'retopo' ? '#8b5cf6' : '#27272a') : '#090a0c',
                    borderColor: status === 'pending' ? '#18181b' : status === 'current' ? '#8b5cf6' : 'transparent',
                    boxShadow: status === 'current' ? '0 0 20px rgba(139, 92, 246, 0.2)' : 'none'
                  }}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all duration-500",
                    status === 'completed' ? "shadow-[0_0_15px_rgba(6,182,212,0.3)]" : ""
                  )}
                >
                  <span className={cn(
                    "transition-colors duration-500",
                    status === 'completed' ? "text-black" : status === 'current' ? "text-white" : "text-zinc-700"
                  )}>
                    {step.icon}
                  </span>
                </motion.div>
                <span className={cn(
                  "text-[9px] font-mono font-black tracking-widest uppercase transition-colors duration-500",
                  status === 'completed' ? "text-cyan-500" : status === 'current' ? "text-white" : "text-zinc-800"
                )}>
                  {step.label}
                </span>
              </div>
              
              {idx < STEPS.length - 1 && (
                <div className="z-10">
                  <ArrowRight size={14} className={cn(
                    "transition-colors duration-500",
                    getStatus(STEPS[idx+1].id) === 'completed' ? "text-cyan-900" : "text-zinc-900"
                  )} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

