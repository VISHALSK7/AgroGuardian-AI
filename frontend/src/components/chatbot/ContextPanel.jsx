import React from 'react';
import { motion } from 'framer-motion';
import { 
  Leaf, 
  ThermometerSun, 
  Droplets, 
  Wind, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck,
  Info
} from 'lucide-react';

const ContextPanel = () => {
  // Mock data for the design UI
  const contextData = {
    crop: 'Tomato',
    disease: 'Late Blight',
    confidence: 94.5,
    weatherRisk: 'High',
    imagePreview: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&q=80&w=400',
    recommendations: [
      'Apply copper-based fungicide immediately.',
      'Remove and destroy infected leaves.',
      'Improve air circulation around plants.'
    ]
  };

  return (
    <div className="hidden xl:flex flex-col w-72 bg-[#0b1326]/40 backdrop-blur-md border-l border-white/5 h-full overflow-y-auto custom-scrollbar relative z-20 shrink-0">
      <div className="p-6 space-y-6 h-full flex flex-col">
        
        {/* Header */}
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <Info size={16} className="text-green-400" />
            Diagnostic Context
          </h3>
          <p className="text-xs text-white/40 mt-1">Real-time analysis parameters</p>
        </div>

        {/* Empty State Body */}
        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/10">
            <Leaf size={28} className="text-white/40" />
          </div>
          <p className="text-sm font-medium text-white mb-2">No active diagnosis</p>
          <p className="text-xs text-white/50 px-4 leading-relaxed">
            Upload a crop image or describe an issue to receive real-time environmental risks and action plans here.
          </p>
        </div>

      </div>
    </div>
  );
};

export default ContextPanel;
