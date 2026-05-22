// =============================================
// Page: Signup
// Description: Premium signup screen with robust error handling & 2-col mockup
// =============================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, FileText, Check, Search, Tag, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import styles from './Signup.module.css';

// ─── Animation Variants for Staggered Reveal ────────────────
const containerVariants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
};

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ─── Password Strength Evaluator ──────────────────────────
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;

    const map = [
      { label: '', color: '' },
      { label: 'Weak', color: '#EF4444' },
      { label: 'Fair', color: '#F59E0B' },
      { label: 'Good', color: '#6366F1' },
      { label: 'Strong', color: '#10B981' },
    ];
    return { score, ...map[score] };
  };

  const strength = getPasswordStrength(formData.password);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      errs.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please provide a valid email';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      errs.password = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(formData.password)) {
      errs.password = 'Password must contain at least one lowercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      errs.password = 'Password must contain at least one number';
    }

    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
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
      await signup({ name: formData.name, email: formData.email, password: formData.password });
      toast.success('Account created! Welcome to NoteFlow 🎉');
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
        if (resData.message.toLowerCase().includes('email') || err.response?.status === 409) {
          setErrors({ email: resData.message });
        } else {
          setErrors({ email: resData.message });
        }
      } else {
        toast.error('Signup failed. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const perks = [
    'Free forever — unlimited notes and zero ads',
    'Rich text editor for clean formatting',
    'Secure local exports in markdown, JSON, or CSV',
  ];

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
              ✦ SECURE • AD-FREE • CRAFTED FOR FOCUS
            </div>

            {/* 2. H1 Typography Upgrade */}
            <motion.h1
              className={styles.heroTitle}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.55 }}
            >
              Capture ideas that <span className={styles.gradientText}>matter.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.55 }}
            >
              Create your free account today and experience a calm, distractions-free writing space built for your productivity.
            </motion.p>

            {/* 3. Feature Badges Container - Sharp & Low-Contrast */}
            <motion.div
              className={styles.featureBadgesContainer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <span className={styles.featureBadge}>
                <span className={styles.badgeIconWrap}><Sparkles size={11} /></span>
                <span>Free Forever</span>
              </span>
              <span className={styles.featureBadge}>
                <span className={styles.badgeIconWrap}><Tag size={11} /></span>
                <span>Rich Formatting</span>
              </span>
              <span className={styles.featureBadge}>
                <span className={styles.badgeIconWrap}><Check size={11} /></span>
                <span>Secure local exports</span>
              </span>
            </motion.div>
          </div>

          {/* Right Column: Premium Search & Filtering Mockup */}
          <div className={styles.mockupCol}>
            <div className={styles.mockupWorkspace}>

              {/* Layer 1: App Search Bar Card */}
              <motion.div
                className={styles.mockSearchCard}
                initial={{ opacity: 0, y: -15, rotate: -4 }}
                animate={{ opacity: 1, y: 0, rotate: -2 }}
                transition={{ delay: 0.45, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <Search size={14} color="var(--color-primary)" />
                <span className={styles.mockSearchQuery}>query: <span>&quot;marketing&quot;</span></span>
              </motion.div>

              {/* Layer 2: Filtered Results List (Decluttered to 1 single clean card) */}
              <div className={styles.mockFilteredResults}>
                <motion.div
                  className={`${styles.mockResultCard} ${styles.active}`}
                  initial={{ opacity: 0, x: 15, rotate: 3 }}
                  animate={{ opacity: 1, x: 0, rotate: 2 }}
                  transition={{ delay: 0.52, duration: 0.65, ease: [0.34, 1.56, 0.64, 1] }}
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                >
                  <span className={styles.resultTitle}>🎯 Q4 Marketing Strategy</span>
                  <p className={styles.resultSnippets}>
                    Focus campaign outreach on organic growth channels, premium newsletters, and <strong>marketing</strong> funnels.
                  </p>
                </motion.div>
              </div>

              {/* Layer 3: Tags Cloud Row */}
              <motion.div
                className={styles.mockTagsCloud}
                initial={{ opacity: 0, y: 15, rotate: -3 }}
                animate={{ opacity: 1, y: 0, rotate: -1 }}
                transition={{ delay: 0.58, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <span className={styles.mockCloudTag}><Tag size={10} style={{ display: 'inline', marginRight: '2px' }} /> design</span>
                <span className={`${styles.mockCloudTag} ${styles.selected}`}>marketing</span>
                <span className={styles.mockCloudTag}>ideas</span>
              </motion.div>

            </div>
          </div>

        </div>

        {/* Bottom Footer (Cleaned to satisfy whitespace guidelines) */}
        <div className={styles.leftFooter} />
      </motion.div>

      {/* ════════════════════════════════════════════
          RIGHT PANEL — Sign Up Form Card
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
            <h2>Create account</h2>
            <p>Get started with NoteFlow for free</p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className={styles.form} noValidate>

            {/* Name */}
            <motion.div variants={itemVariants} className={styles.fieldGroup}>
              <label className={styles.label}>Full name</label>
              <div className={styles.inputWrap}>
                <User size={16} className={styles.inputIcon} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={`${styles.input} ${errors.name ? styles.inputErr : ''}`}
                  autoComplete="name"
                />
              </div>
              {errors.name && <span className={styles.errMsg}>{errors.name}</span>}
            </motion.div>

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
                  placeholder="Min. 8 chars (Uppercase, lowercase & number)"
                  className={`${styles.input} ${errors.password ? styles.inputErr : ''}`}
                  autoComplete="new-password"
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

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className={styles.strengthWrap}>
                  <div className={styles.strengthBars}>
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={styles.strengthBar}
                        style={{ background: i <= strength.score ? strength.color : 'var(--border-default)' }}
                      />
                    ))}
                  </div>
                  <span className={styles.strengthLabel} style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}
              {errors.password && <span className={styles.errMsg}>{errors.password}</span>}
            </motion.div>

            {/* Confirm Password */}
            <motion.div variants={itemVariants} className={styles.fieldGroup}>
              <label className={styles.label}>Confirm password</label>
              <div className={styles.inputWrap}>
                <Lock size={16} className={styles.inputIcon} />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  className={`${styles.input} ${errors.confirmPassword ? styles.inputErr : ''}`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowConfirm(p => !p)}
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.confirmPassword && <span className={styles.errMsg}>{errors.confirmPassword}</span>}
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
                  : <> Create account <ArrowRight size={16} /> </>
                }
              </motion.button>
            </motion.div>

          </form>

          {/* Footer */}
          <motion.div variants={itemVariants} className={styles.formFooter}>
            <p>
              Already have an account?{' '}
              <Link to="/login" className={styles.link}>Sign in</Link>
            </p>
          </motion.div>

        </motion.div>
      </div>

    </div>
  );
};

export default Signup;
