// =============================================
// Page: Login
// Description: Premium login screen — SaaS Professional Grade
// =============================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, FileText, Pin, Archive, Download, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import styles from './login.module.css';

// ─── Animation Variants for Staggered Reveal ────────────────
const containerVariants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
};

// ─── Feature Pills ──────────────────────────────────────────
const FEATURES = [
  { icon: <Sparkles size={12} />, label: 'Instant Capture' },
  { icon: <Pin size={12} />,      label: 'Smart Pinning' },
  { icon: <Download size={12} />, label: 'Markdown Export' },
  { icon: null,                   label: '🌙 Beautiful Dark Mode' },
];

const Login = () => {
  const navigate  = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.email) {
      errs.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please provide a valid email';
    }
    if (!formData.password) {
      errs.password = 'Password is required';
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await login(formData);
      toast.success('Welcome back! 👋');
      navigate('/dashboard');
    } catch (err) {
      const resData = err.response?.data;

      if (resData?.errors && Array.isArray(resData.errors)) {
        const backendErrs = {};
        resData.errors.forEach(errItem => {
          backendErrs[errItem.field] = errItem.message;
        });
        setErrors(backendErrs);
        toast.error('Please correct the highlighted errors');
      } else if (resData?.message) {
        toast.error(resData.message);
        if (resData.message.toLowerCase().includes('password') || resData.message.toLowerCase().includes('credential')) {
          setErrors({ password: resData.message });
        } else if (resData.message.toLowerCase().includes('user') || resData.message.toLowerCase().includes('email')) {
          setErrors({ email: resData.message });
        } else {
          setErrors({ email: resData.message });
        }
      } else {
        toast.error('Login failed. Please verify your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>

      {/* ════════════════════════════════════════════
          LEFT PANEL — Refactored Premium SaaS Layout
          ════════════════════════════════════════════ */}
      <motion.div
        className={styles.leftPanel}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Elite Blueprint Grid Vignette Overlay */}
        <div className={styles.gridVignette} />
        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <FileText size={16} color="white" strokeWidth={2.5} />
          </div>
          <span className={styles.brandName}>NoteFlow</span>
        </div>

        {/* Two-Column Grid */}
        <div className={styles.heroContentGrid}>
          
          {/* Left Column: Copy */}
          <div className={styles.heroCopyCol}>
            {/* 6. Elevated Social Proof Tagline */}
            <div className={styles.socialProofKicker}>
              ✦ TRUSTED BY ORGANIZED THINKERS WORLDWIDE
            </div>

            {/* 2. H1 Typography Upgrade */}
            <motion.h1
              className={styles.heroTitle}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.55 }}
            >
              Write beautifully. Think <span className={styles.gradientText}>clearly.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.55 }}
            >
              A clean, modern workspace for your thoughts, daily plans, and creative drafts. Capture what matters, instantly.
            </motion.p>

            {/* 3. Feature Badges Container - Sharp & Low-Contrast */}
            <motion.div
              className={styles.featureBadgesContainer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {FEATURES.map((f, idx) => (
                <motion.span
                  key={f.label}
                  className={styles.featureBadge}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + idx * 0.05, duration: 0.3 }}
                >
                  {f.icon && <span className={styles.badgeIconWrap}>{f.icon}</span>}
                  <span>{f.label}</span>
                </motion.span>
              ))}
            </motion.div>
          </div>

          {/* Right Column: Premium Staggered Canvas Collage */}
          <div className={styles.mockupCol}>
            <div className={styles.mockupWorkspace}>
              
              {/* Layer 1: App Mock Sidebar */}
              <motion.div
                className={styles.mockSidebar}
                initial={{ opacity: 0, x: -15, rotate: -5 }}
                animate={{ opacity: 1, x: 0, rotate: -3 }}
                transition={{ delay: 0.45, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <div className={styles.mockSidebarItem}><FileText size={12} /> All Notes</div>
                <div className={`${styles.mockSidebarItem} ${styles.active}`}><Pin size={12} /> Pinned</div>
                <div className={styles.mockSidebarItem}><Archive size={12} /> Archive</div>
              </motion.div>

              {/* Layer 2: Main Rich Editor Canvas */}
              <motion.div
                className={styles.mockEditorCard}
                initial={{ opacity: 0, scale: 0.95, rotate: 4 }}
                animate={{ opacity: 1, scale: 1, rotate: 2 }}
                transition={{ delay: 0.52, duration: 0.65, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <div className={styles.mockEditorHeader}>
                  <div className={styles.editorDots}>
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                  </div>
                  <span className={styles.editorFilename}>untitled.md</span>
                </div>
                
                <div className={styles.mockNoteTitle}>✦ Q3 Product Strategy</div>
                <div className={styles.mockNoteTags}>
                  <span className={styles.mockTag}>#roadmap</span>
                  <span className={styles.mockTag}>#ideas</span>
                </div>
                <p className={styles.mockNoteParagraph}>
                  Let&apos;s focus on improving user experience, adding premium typography, and creating smooth interactive motion.
                </p>

                {/* Floating Formatting Toolbar */}
                <div className={styles.floatingToolbar}>
                  <span className={styles.toolbarBtn}><b>B</b></span>
                  <span className={styles.toolbarBtn}><i>I</i></span>
                  <span className={styles.toolbarBtn}><u>U</u></span>
                  <span className={styles.toolbarDivider} />
                  <span className={styles.toolbarColorDot} style={{ background: '#6366F1' }} />
                  <span className={styles.toolbarColorDot} style={{ background: '#10B981' }} />
                  <span className={styles.toolbarColorDot} style={{ background: '#F59E0B' }} />
                </div>
              </motion.div>

              {/* Layer 3: Floating Pinned Note Card with Composite Shadow */}
              <motion.div
                className={styles.floatingNoteCard}
                initial={{ opacity: 0, y: 15, rotate: -2 }}
                animate={{ opacity: 1, y: 0, rotate: -1 }}
                transition={{ delay: 0.6, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <div className={styles.floatingNoteCardHeader}>
                  <span className={styles.floatingNoteCardDot} style={{ background: '#10B981' }} />
                  <span className={styles.floatingNoteCardTitle}>Marketing Ideas</span>
                </div>
                <span className={styles.floatingNoteCardTime}>Updated just now</span>
              </motion.div>

            </div>
          </div>

        </div>

        {/* Bottom Footer (Cleaned to satisfy whitespace guidelines) */}
        <div className={styles.leftFooter} />
      </motion.div>

      {/* ════════════════════════════════════════════
          RIGHT PANEL — Sign In Form Card
          ════════════════════════════════════════════ */}
      <div className={styles.rightPanel}>
        <motion.div
          className={styles.formCard}
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className={styles.formHeader}>
            <h2>Welcome back</h2>
            <p>Sign in to continue to NoteFlow</p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className={styles.form} noValidate>

            {/* Email */}
            <motion.div variants={itemVariants} className={styles.fieldGroup}>
              <label className={styles.label}>Email address</label>
              <div className={styles.inputWrap}>
                <Mail size={16} className={styles.inputIcon} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`${styles.input} ${errors.email ? styles.inputErr : ''}`}
                  autoComplete="email"
                />
              </div>
              {errors.email && <span className={styles.errMsg}>{errors.email}</span>}
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants} className={styles.fieldGroup}>
              <label className={styles.label}>Password</label>
              <div className={styles.inputWrap}>
                <Lock size={16} className={styles.inputIcon} />
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`${styles.input} ${errors.password ? styles.inputErr : ''}`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPass(p => !p)}
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <span className={styles.errMsg}>{errors.password}</span>}
            </motion.div>

            {/* Submit */}
            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                className={styles.submitBtn}
                disabled={loading}
                whileTap={{ scale: loading ? 1 : 0.975 }}
              >
                {loading
                  ? <span className={styles.btnLoader} />
                  : <> Sign in <ArrowRight size={16} /> </>
                }
              </motion.button>
            </motion.div>

          </form>

          {/* Footer */}
          <motion.div variants={itemVariants} className={styles.formFooter}>
            <p>
              Don&apos;t have an account?{' '}
              <Link to="/signup" className={styles.link}>Create one free</Link>
            </p>
          </motion.div>

        </motion.div>
      </div>

    </div>
  );
};

export default Login;
