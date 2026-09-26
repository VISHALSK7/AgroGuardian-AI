import { useState, useEffect, useRef } from 'react';

/**
 * Animates a number from 0 → rawValue over `duration` ms.
 * Handles formats like "1,247", "94.2%", "2.4T", "+12%", or plain numbers.
 *
 * The animation runs once when the rawValue is first provided.
 * Returns the formatted string at the current animation frame.
 */
export const useCountUp = (rawValue, duration = 1000) => {
  const str = String(rawValue);

  // Parse formatting
  const hasPercent = str.includes('%');
  const hasPlus    = str.startsWith('+');
  const hasT       = /T$/i.test(str.replace('%', ''));
  const hasComma   = str.includes(',');
  const prefix     = hasPlus ? '+' : '';
  const suffix     = hasPercent ? '%' : hasT ? 'T' : '';
  const numStr     = str.replace(/[^0-9.]/g, '');
  const end        = parseFloat(numStr);
  const isFloat    = numStr.includes('.');
  const decimals   = isFloat ? (numStr.split('.')[1]?.length ?? 1) : 0;

  // Format a number to match the input style
  const format = (n) => {
    let formatted;
    if (decimals > 0) {
      formatted = n.toFixed(decimals);
    } else {
      const r = Math.round(n);
      formatted = hasComma ? r.toLocaleString() : String(r);
    }
    return `${prefix}${formatted}${suffix}`;
  };

  const [display, setDisplay] = useState(() => isNaN(end) ? str : format(0));
  const raf = useRef(null);
  const startTime = useRef(null);

  useEffect(() => {
    if (isNaN(end) || end === 0) {
      setDisplay(str);
      return;
    }

    // Reset for animation
    setDisplay(format(0));
    startTime.current = performance.now();

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const tick = () => {
      const elapsed = performance.now() - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const current = end * easeOutCubic(progress);

      setDisplay(format(current));

      if (progress < 1) {
        raf.current = requestAnimationFrame(tick);
      }
    };

    raf.current = requestAnimationFrame(tick);

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [rawValue]); // re-run if rawValue changes

  return display;
};
