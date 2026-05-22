// =============================================
// Component: Loader
// Description: Premium loading spinner
// =============================================

import { motion } from 'framer-motion';

const Loader = ({ fullScreen = false, size = 'md', text = '' }) => {

  const sizes = {
    sm: { spinner: 16, border: 2 },
    md: { spinner: 24, border: 2.5 },
    lg: { spinner: 36, border: 3 },
    xl: { spinner: 48, border: 3.5 },
  };

  const { spinner, border } = sizes[size];

  const SpinnerEl = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <motion.div
        style={{
          width: spinner,
          height: spinner,
          borderRadius: '50%',
          border: `${border}px solid var(--border-default)`,
          borderTop: `${border}px solid var(--color-primary)`,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
      />
      {text && (
        <p style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-body)',
        }}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-base)',
          zIndex: 9999,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          {/* Logo mark */}
          <motion.div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-xl)',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
          <SpinnerEl />
        </div>
      </motion.div>
    );
  }

  return <SpinnerEl />;
};

export default Loader;