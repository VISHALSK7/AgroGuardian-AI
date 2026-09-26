import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Button that produces a radial ripple on click and has magnetic hover.
 * Accepts all standard button props + `variant` ('primary' | 'secondary' | 'ghost').
 */
const RippleButton = ({
  children,
  variant = 'primary',
  className = '',
  style = {},
  onClick,
  disabled,
  type = 'button',
  ...props
}) => {
  const btnRef = useRef(null);
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    if (disabled) return;

    const rect = btnRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);

    onClick?.(e);
  };

  const base = `btn-${variant}`;

  return (
    <motion.button
      ref={btnRef}
      type={type}
      className={`${base} ${className} relative overflow-hidden`}
      style={style}
      disabled={disabled}
      onClick={handleClick}
      whileHover={!disabled ? { scale: 1.02, y: -1 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      {...props}
    >
      {/* Ripple effects */}
      <AnimatePresence>
        {ripples.map(({ id, x, y }) => (
          <motion.span
            key={id}
            initial={{ width: 0, height: 0, opacity: 0.5, x, y, translateX: '-50%', translateY: '-50%' }}
            animate={{ width: 400, height: 400, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              borderRadius: '50%',
              background: variant === 'primary'
                ? 'rgba(255,255,255,0.25)'
                : 'rgba(34,197,94,0.15)',
              pointerEvents: 'none',
            }}
          />
        ))}
      </AnimatePresence>
      {children}
    </motion.button>
  );
};

export default RippleButton;
