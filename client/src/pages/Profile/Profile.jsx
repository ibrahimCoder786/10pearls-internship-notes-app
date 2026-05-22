// =============================================
// Page: Profile
// Description: Premium user profile page
// =============================================

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User, Mail, Lock, Save, LogOut,
    FileText, Pin, Archive, Calendar,
    Shield, Eye, EyeOff, Camera
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthService from '../../services/auth.service';
import NotesService from '../../services/notes.service';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { formatFullDate } from '../../utils/formatDate';
import styles from './Profile.module.css';

const Profile = () => {
    const { user, updateUser, logout } = useAuth();
    const navigate = useNavigate();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [email] = useState(user?.email || '');
    const [currPass, setCurrPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [showCurr, setShowCurr] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [saving, setSaving] = useState(false);
    const [stats, setStats] = useState({ total: 0, pinned: 0, archived: 0 });

    // Fetch stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [all, pinned, archived] = await Promise.all([
                    NotesService.getAll({ is_archived: false }),
                    NotesService.getAll({ is_pinned: true }),
                    NotesService.getAll({ is_archived: true }),
                ]);
                setStats({
                    total: all.data?.length || 0,
                    pinned: pinned.data?.length || 0,
                    archived: archived.data?.length || 0,
                });
            } catch { /* silent */ }
        };
        fetchStats();
    }, []);

    // User initials
    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    // Save profile
    const handleSave = async () => {
        if (!name.trim()) {
            toast.error('Name is required');
            return;
        }
        if (newPass && newPass !== confirmPass) {
            toast.error('Passwords do not match');
            return;
        }
        if (newPass && newPass.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        setSaving(true);
        try {
            const updated = await AuthService.updateProfile({ name: name.trim() });
            updateUser(updated.data);
            toast.success('Profile updated!');
            setCurrPass(''); setNewPass(''); setConfirmPass('');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    // Logout
    const handleLogout = async () => {
        await logout();
        toast.success('Logged out!');
        navigate('/login');
    };

    const statItems = [
        { label: 'Total Notes', value: stats.total, icon: FileText, color: '#6366F1', bg: 'rgba(99,102,241,0.10)' },
        { label: 'Pinned Notes', value: stats.pinned, icon: Pin, color: '#F59E0B', bg: 'rgba(245,158,11,0.10)' },
        { label: 'Archived Notes', value: stats.archived, icon: Archive, color: '#10B981', bg: 'rgba(16,185,129,0.10)' },
    ];

    const container = {
        hidden: {},
        show: { transition: { staggerChildren: 0.08 } },
    };

    const item = {
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    };

    return (
        <div className={styles.wrapper}>
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className={styles.mainContent}>
                <div className={styles.content}>

                    {/* ── Page Header ── */}
                    <motion.div
                        className={styles.pageHeader}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div>
                            <h2 className={styles.pageTitle}>Profile Settings</h2>
                            <p className={styles.pageSub}>Manage your account and preferences</p>
                        </div>
                        <button className={styles.logoutBtn} onClick={handleLogout}>
                            <LogOut size={16} strokeWidth={1.8} />
                            Sign out
                        </button>
                    </motion.div>

                    <motion.div
                        className={styles.grid}
                        variants={container}
                        initial="hidden"
                        animate="show"
                    >

                        {/* ── Left Column ── */}
                        <div className={styles.leftCol}>

                            {/* Avatar Card */}
                            <motion.div variants={item} className={styles.avatarCard}>
                                <div className={styles.avatarWrap}>
                                    <div className={styles.avatar}>{initials}</div>
                                    <div className={styles.avatarOverlay}>
                                        <Camera size={18} color="white" />
                                    </div>
                                </div>
                                <div className={styles.avatarInfo}>
                                    <h3 className={styles.avatarName}>{user?.name}</h3>
                                    <p className={styles.avatarEmail}>{user?.email}</p>
                                    <div className={styles.joinedDate}>
                                        <Calendar size={12} strokeWidth={1.8} />
                                        Joined {formatFullDate(user?.created_at || new Date())}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Stats Cards */}
                            <motion.div variants={item} className={styles.statsWrap}>
                                {statItems.map(({ label, value, icon: Icon, color, bg }) => (
                                    <motion.div
                                        key={label}
                                        className={styles.statCard}
                                        whileHover={{ y: -3 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className={styles.statIcon} style={{ background: bg, color }}>
                                            <Icon size={18} strokeWidth={1.8} />
                                        </div>
                                        <p className={styles.statValue}>{value}</p>
                                        <p className={styles.statLabel}>{label}</p>
                                    </motion.div>
                                ))}
                            </motion.div>

                        </div>

                        {/* ── Right Column ── */}
                        <div className={styles.rightCol}>

                            {/* Basic Info */}
                            <motion.div variants={item} className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <div className={styles.sectionIcon}>
                                        <User size={16} strokeWidth={1.8} />
                                    </div>
                                    <div>
                                        <h3 className={styles.sectionTitle}>Basic Information</h3>
                                        <p className={styles.sectionSub}>Update your personal details</p>
                                    </div>
                                </div>

                                <div className={styles.formGrid}>
                                    {/* Name */}
                                    <div className={styles.fieldGroup}>
                                        <label className={styles.label}>
                                            <User size={13} />
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            className={styles.input}
                                            placeholder="Your full name"
                                        />
                                    </div>

                                    {/* Email (readonly) */}
                                    <div className={styles.fieldGroup}>
                                        <label className={styles.label}>
                                            <Mail size={13} />
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            className={`${styles.input} ${styles.inputReadonly}`}
                                            readOnly
                                        />
                                        <span className={styles.fieldHint}>Email cannot be changed</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Security */}
                            <motion.div variants={item} className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <div className={styles.sectionIcon} style={{ background: 'rgba(99,102,241,0.10)', color: '#6366F1' }}>
                                        <Shield size={16} strokeWidth={1.8} />
                                    </div>
                                    <div>
                                        <h3 className={styles.sectionTitle}>Security Settings</h3>
                                        <p className={styles.sectionSub}>Change your password</p>
                                    </div>
                                </div>

                                <div className={styles.formGrid}>
                                    {/* Current Password */}
                                    <div className={styles.fieldGroup}>
                                        <label className={styles.label}>
                                            <Lock size={13} />
                                            Current Password
                                        </label>
                                        <div className={styles.inputWrap}>
                                            <input
                                                type={showCurr ? 'text' : 'password'}
                                                value={currPass}
                                                onChange={e => setCurrPass(e.target.value)}
                                                className={styles.input}
                                                placeholder="Enter current password"
                                            />
                                            <button className={styles.eyeBtn} onClick={() => setShowCurr(p => !p)}>
                                                {showCurr ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* New Password */}
                                    <div className={styles.fieldGroup}>
                                        <label className={styles.label}>
                                            <Lock size={13} />
                                            New Password
                                        </label>
                                        <div className={styles.inputWrap}>
                                            <input
                                                type={showNew ? 'text' : 'password'}
                                                value={newPass}
                                                onChange={e => setNewPass(e.target.value)}
                                                className={styles.input}
                                                placeholder="Min. 8 characters"
                                            />
                                            <button className={styles.eyeBtn} onClick={() => setShowNew(p => !p)}>
                                                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password */}
                                    <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                                        <label className={styles.label}>
                                            <Lock size={13} />
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={confirmPass}
                                            onChange={e => setConfirmPass(e.target.value)}
                                            className={`${styles.input} ${confirmPass && confirmPass !== newPass ? styles.inputErr : ''}`}
                                            placeholder="Repeat new password"
                                        />
                                        {confirmPass && confirmPass !== newPass && (
                                            <span className={styles.errMsg}>Passwords do not match</span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Save Button */}
                            <motion.div variants={item} className={styles.saveWrap}>
                                <motion.button
                                    className={styles.saveBtn}
                                    onClick={handleSave}
                                    disabled={saving}
                                    whileHover={{ scale: saving ? 1 : 1.01 }}
                                    whileTap={{ scale: saving ? 1 : 0.98 }}
                                >
                                    {saving ? (
                                        <span className={styles.spinner} />
                                    ) : (
                                        <>
                                            <Save size={16} strokeWidth={2} />
                                            Save Changes
                                        </>
                                    )}
                                </motion.button>
                            </motion.div>

                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Profile;