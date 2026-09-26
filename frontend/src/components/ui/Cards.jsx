import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useCountUp } from '../../hooks/useCountUp';

/* ── Spring config ─────────────────────────────────────────────────────── */
const spring = { type: 'spring', stiffness: 280, damping: 22 };

/* ── Stat Card ─────────────────────────────────────────────────────────── */
export const StatCard = ({
  icon: Icon,
  label,
  value,
  change,
  changeType = 'up',
  color = '#22c55e',
  delay = 0,
}) => {
  // Animate the number from 0 → actual value
  const animatedValue = useCountUp(value, 1300);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...spring, delay }}
      whileHover={{
        y: -4,
        scale: 1.02,
        boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px ${color}22`,
      }}
      className="stat-card"
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {/* Shimmer on hover */}
      <motion.div
        initial={{ x: '-100%', opacity: 0 }}
        whileHover={{ x: '200%', opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: `linear-gradient(105deg, transparent 40%, ${color}0d 50%, transparent 60%)`,
          pointerEvents: 'none',
        }}
      />

      <div className="flex items-start justify-between mb-4">
        <motion.div
          whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
          transition={{ duration: 0.4 }}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}18` }}
        >
          <Icon size={18} style={{ color }} />
        </motion.div>

        {change && (
          <motion.span
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.3, duration: 0.3 }}
            className={`chip ${changeType === 'up' ? 'chip-success' : 'chip-danger'}`}
          >
            {changeType === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {change}
          </motion.span>
        )}
      </div>

      <p
        className="text-[26px] font-bold leading-none mb-1.5"
        style={{ color: '#e8eee9', letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}
      >
        {animatedValue}
      </p>
      <p className="text-[12px] font-medium" style={{ color: '#6a8070' }}>
        {label}
      </p>
    </motion.div>
  );
};

/* ── Card ──────────────────────────────────────────────────────────────── */
export const Card = ({
  children,
  className = '',
  style = {},
  hover = false,
  padding = 'p-5',
  animate = false,
  delay = 0,
}) => {
  const Comp = animate ? motion.div : 'div';
  const animProps = animate
    ? {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { ...spring, delay },
      }
    : {};

  return (
    <Comp
      className={`card ${padding} ${hover ? 'card-hoverable cursor-pointer' : ''} ${className}`}
      style={style}
      {...animProps}
    >
      {children}
    </Comp>
  );
};

/* ── Card Header ───────────────────────────────────────────────────────── */
export const CardHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-4" style={{ gap: '1rem' }}>
    <div className="min-w-0">
      <h3
        className="text-[13px] font-semibold leading-tight"
        style={{ color: '#c8d5ca', letterSpacing: '-0.01em' }}
      >
        {title}
      </h3>
      {subtitle && (
        <p className="text-[11px] mt-0.5 leading-tight" style={{ color: '#6a8070' }}>
          {subtitle}
        </p>
      )}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

/* ── Skeleton ──────────────────────────────────────────────────────────── */
export const SkeletonCard = ({ lines = 3, height = 100 }) => (
  <div className="card p-5">
    <div className="skeleton mb-3" style={{ height: 11, width: '45%' }} />
    {lines > 1 && <div className="skeleton mb-2" style={{ height: 9, width: '80%' }} />}
    {lines > 2 && <div className="skeleton mb-4" style={{ height: 9, width: '60%' }} />}
    <div className="skeleton" style={{ height }} />
  </div>
);

/* ── Badge ─────────────────────────────────────────────────────────────── */
export const Badge = ({ children, variant = 'success' }) => (
  <span className={`chip chip-${variant}`}>{children}</span>
);

/* ── Divider ───────────────────────────────────────────────────────────── */
export const Divider = () => <div className="divider" />;

/* ── Empty State ───────────────────────────────────────────────────────── */
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={spring}
    className="flex flex-col items-center justify-center py-14 text-center px-6"
  >
    {Icon && (
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{
          background: 'rgba(34,197,94,0.07)',
          border: '1px solid rgba(34,197,94,0.1)',
        }}
      >
        <Icon size={26} style={{ color: '#22c55e', opacity: 0.7 }} />
      </motion.div>
    )}
    <h3
      className="text-sm font-semibold mb-1.5"
      style={{ color: '#c8d5ca', letterSpacing: '-0.01em' }}
    >
      {title}
    </h3>
    {description && (
      <p className="text-xs leading-relaxed max-w-[240px]" style={{ color: '#6a8070' }}>
        {description}
      </p>
    )}
    {action && <div className="mt-5">{action}</div>}
  </motion.div>
);

/* ── Animated Progress Bar ─────────────────────────────────────────────── */
export const AnimatedBar = ({ value, color, delay = 0, height = 6 }) => (
  <div
    className="rounded-full overflow-hidden"
    style={{ background: 'rgba(42,56,41,0.5)', height }}
  >
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${value}%` }}
      transition={{ duration: 0.9, delay, ease: [0.4, 0, 0.2, 1] }}
      style={{ height: '100%', background: color, borderRadius: 99 }}
    />
  </div>
);

/* ── Section Label ─────────────────────────────────────────────────────── */
export const SectionLabel = ({ children }) => (
  <p
    className="text-[11px] font-semibold uppercase tracking-widest mb-3"
    style={{ color: '#4a6050', letterSpacing: '0.1em' }}
  >
    {children}
  </p>
);

/* ── Stagger list wrapper ──────────────────────────────────────────────── */
export const StaggerList = ({ children, className = '' }) => (
  <motion.div
    className={className}
    initial="hidden"
    animate="visible"
    variants={{
      hidden: {},
      visible: { transition: { staggerChildren: 0.07 } },
    }}
  >
    {children}
  </motion.div>
);

export const StaggerItem = ({ children, className = '' }) => (
  <motion.div
    className={className}
    variants={{
      hidden: { opacity: 0, y: 16 },
      visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } },
    }}
  >
    {children}
  </motion.div>
);
