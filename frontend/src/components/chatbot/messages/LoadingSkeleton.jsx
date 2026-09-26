import React from 'react';
import { motion } from 'framer-motion';

const LoadingSkeleton = () => {
  return (
    <div className="flex justify-start mb-8 w-full">
      <div className="flex gap-4 w-[80%]">
        <div className="flex-shrink-0 mt-1">
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
        </div>
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-white/5 rounded-full w-3/4 animate-pulse" />
          <div className="h-4 bg-white/5 rounded-full w-1/2 animate-pulse" />
          <div className="h-20 bg-white/5 rounded-2xl w-full animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
