// =============================================
// Component: Navbar
// Description: Glass navbar with search
// =============================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Plus, Menu, Bell, X } from 'lucide-react';
import styles from './Navbar.module.css';

const Navbar = ({ onMenuToggle, onSearch }) => {
    const navigate = useNavigate();
    const [searchVal, setSearchVal] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);

    const handleSearch = (e) => {
        const val = e.target.value;
        setSearchVal(val);
        onSearch?.(val);
    };

    const clearSearch = () => {
        setSearchVal('');
        onSearch?.('');
    };

    return (
        <header className={styles.navbar}>

            {/* ── Left ── */}
            <div className={styles.left}>
                {/* Mobile menu */}
                <button className={styles.menuBtn} onClick={onMenuToggle}>
                    <Menu size={20} strokeWidth={1.8} />
                </button>

                {/* Page title */}
                <div className={styles.pageTitle}>
                    <h1>My Notes</h1>
                </div>
            </div>

            {/* ── Center — Search ── */}
            <div className={`${styles.searchWrap} ${searchOpen ? styles.searchOpen : ''}`}>
                <Search size={16} className={styles.searchIcon} />
                <input
                    type="text"
                    value={searchVal}
                    onChange={handleSearch}
                    placeholder="Search notes..."
                    className={styles.searchInput}
                    onFocus={() => setSearchOpen(true)}
                    onBlur={() => setSearchOpen(false)}
                />
                {searchVal && (
                    <button className={styles.clearBtn} onClick={clearSearch}>
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* ── Right ── */}
            <div className={styles.right}>
                {/* New Note Button */}
                <motion.button
                    className={styles.newNoteBtn}
                    onClick={() => navigate('/notes/new')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                >
                    <Plus size={16} strokeWidth={2.5} />
                    <span>New Note</span>
                </motion.button>
            </div>

        </header>
    );
};

export default Navbar;