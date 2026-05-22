// =============================================
// Component: Sidebar
// Description: Premium navigation sidebar
// =============================================

import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, LayoutDashboard, Archive,
    User, LogOut, Moon, Sun, X, Pin
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { LOCAL_STORAGE_KEYS } from '../../../utils/constants';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import styles from './Sidebar.module.css';

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isDark, setIsDark] = useState(false);

    // Theme initialize
    useEffect(() => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.THEME);
        setIsDark(saved === 'dark');
    }, []);

    // Theme toggle
    const toggleTheme = () => {
        const newTheme = isDark ? 'light' : 'dark';
        setIsDark(!isDark);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, newTheme);
    };

    // Logout
    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out successfully');
            navigate('/login');
        } catch {
            toast.error('Logout failed');
        }
    };

    // Nav items
    const navItems = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/notes/new', icon: FileText, label: 'New Note' },
        { to: '/profile', icon: User, label: 'Profile' },
    ];

    // User initials
    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className={styles.overlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}
                initial={false}
            >
                {/* ── Header ── */}
                <div className={styles.header}>
                    <div className={styles.brand}>
                        <div className={styles.brandIcon}>
                            <FileText size={18} color="white" strokeWidth={2} />
                        </div>
                        <span className={styles.brandName}>NoteFlow</span>
                    </div>

                    {/* Mobile close */}
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                {/* ── Navigation ── */}
                <nav className={styles.nav}>
                    <p className={styles.navLabel}>Menu</p>
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `${styles.navItem} ${isActive ? styles.active : ''}`
                            }
                            onClick={onClose}
                        >
                            <Icon size={18} strokeWidth={1.8} />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* ── Divider ── */}
                <div className={styles.divider} />

                {/* ── Bottom Section ── */}
                <div className={styles.bottom}>

                    {/* Theme Toggle */}
                    <button className={styles.themeToggle} onClick={toggleTheme}>
                        <div className={styles.themeIcon}>
                            {isDark
                                ? <Sun size={16} strokeWidth={1.8} />
                                : <Moon size={16} strokeWidth={1.8} />
                            }
                        </div>
                        <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                        <div className={`${styles.togglePill} ${isDark ? styles.toggleOn : ''}`}>
                            <motion.div
                                className={styles.toggleThumb}
                                animate={{ x: isDark ? 16 : 0 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                        </div>
                    </button>

                    {/* Divider */}
                    <div className={styles.divider} />

                    {/* User Profile */}
                    <div className={styles.userSection}>
                        <div className={styles.avatar}>{initials}</div>
                        <div className={styles.userInfo}>
                            <p className={styles.userName}>{user?.name || 'User'}</p>
                            <p className={styles.userEmail}>{user?.email || ''}</p>
                        </div>
                        <button
                            className={styles.logoutBtn}
                            onClick={handleLogout}
                            title="Logout"
                        >
                            <LogOut size={16} strokeWidth={1.8} />
                        </button>
                    </div>

                </div>
            </motion.aside>
        </>
    );
};

export default Sidebar;