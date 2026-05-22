// =============================================
// Component: NoteCard
// Description: Premium note card with actions
// =============================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Pin, PinOff, Archive, ArchiveRestore,
    Trash2, Edit3, Clock, Tag, MoreHorizontal
} from 'lucide-react';
import { formatDate } from '../../../../utils/formatDate';
import { stripHtml, truncate } from '../../../../utils/validators';
import { resolveNoteColor } from '../../../../utils/constants';
import styles from './NoteCard.module.css';

const NoteCard = ({ note, onPin, onArchive, onDelete, index = 0, searchTerm = '' }) => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const plainContent = stripHtml(note.content);
    const preview = truncate(plainContent, 130);

    const renderHighlightedTitle = () => {
        if (!searchTerm || !note.title) return note.title;
        const parts = note.title.split(new RegExp(`(${searchTerm})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) => 
                    part.toLowerCase() === searchTerm.toLowerCase()
                        ? <mark key={i} className={styles.highlight}>{part}</mark>
                        : part
                )}
            </span>
        );
    };

    // Resolve note color — drives card bg (CSS var) + accent bar
    const colorConfig = resolveNoteColor(note.color);

    const handleEdit = (e) => {
        e.stopPropagation();
        navigate(`/notes/${note.id}/edit`);
    };

    const handlePin = (e) => {
        e.stopPropagation();
        setMenuOpen(false);
        onPin(note.id);
    };

    const handleArchive = (e) => {
        e.stopPropagation();
        setMenuOpen(false);
        onArchive(note.id);
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        setMenuOpen(false);
        setDeleting(true);
        setTimeout(() => onDelete(note.id), 300);
    };

    const toggleMenu = (e) => {
        e.stopPropagation();
        setMenuOpen(p => !p);
    };

    return (
        <motion.div
            className={`${styles.card} ${note.is_pinned ? styles.pinned : ''} ${deleting ? styles.deleting : ''}`}
            style={{ background: `var(${colorConfig.cssVar})`, '--accent': colorConfig.accent }}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{
                duration: 0.35,
                delay: index * 0.06,
                ease: [0.4, 0, 0.2, 1],
            }}
            onClick={() => navigate(`/notes/${note.id}/edit`)}
            layout
        >
            {/* ── Accent Top Bar — matches note color ── */}
            <div className={styles.accentBar} style={{ background: colorConfig.accent }} />

            {/* ── Card Header ── */}
            <div className={styles.cardHeader}>
                <h3 className={styles.title}>{renderHighlightedTitle()}</h3>

                <div className={styles.headerActions}>
                    {/* Pin indicator */}
                    {note.is_pinned && (
                        <span className={styles.pinnedBadge}>
                            <Pin size={10} strokeWidth={2.5} />
                            Pinned
                        </span>
                    )}

                    {/* More menu */}
                    <div className={styles.menuWrap}>
                        <button
                            className={styles.menuBtn}
                            onClick={toggleMenu}
                        >
                            <MoreHorizontal size={16} />
                        </button>

                        <AnimatePresence>
                            {menuOpen && (
                                <motion.div
                                    className={styles.menu}
                                    initial={{ opacity: 0, scale: 0.92, y: -4 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.92, y: -4 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <button className={styles.menuItem} onClick={handleEdit}>
                                        <Edit3 size={14} /> Edit
                                    </button>

                                    <button className={styles.menuItem} onClick={handlePin}>
                                        {note.is_pinned
                                            ? <><PinOff size={14} /> Unpin</>
                                            : <><Pin size={14} /> Pin</>
                                        }
                                    </button>

                                    <button className={styles.menuItem} onClick={handleArchive}>
                                        {note.is_archived
                                            ? <><ArchiveRestore size={14} /> Unarchive</>
                                            : <><Archive size={14} /> Archive</>
                                        }
                                    </button>

                                    <div className={styles.menuDivider} />

                                    <button className={`${styles.menuItem} ${styles.menuDanger}`} onClick={handleDelete}>
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* ── Content Preview ── */}
            {preview && (
                <p className={styles.preview}>{preview}</p>
            )}

            {/* ── Tags ── */}
            {note.tags && note.tags.length > 0 && (
                <div className={styles.tags}>
                    {note.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className={styles.tag}>
                            <Tag size={10} />
                            {tag}
                        </span>
                    ))}
                    {note.tags.length > 3 && (
                        <span className={styles.tagMore}>+{note.tags.length - 3}</span>
                    )}
                </div>
            )}

            {/* ── Card Footer ── */}
            <div className={styles.cardFooter}>
                <span className={styles.date}>
                    <Clock size={11} strokeWidth={1.8} />
                    {formatDate(note.updated_at)}
                </span>

                {/* Quick Actions */}
                <div className={styles.quickActions}>
                    <motion.button
                        className={`${styles.quickBtn} ${note.is_pinned ? styles.quickActive : ''}`}
                        onClick={handlePin}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title={note.is_pinned ? 'Unpin' : 'Pin'}
                    >
                        <Pin size={13} strokeWidth={1.8} />
                    </motion.button>

                    <motion.button
                        className={styles.quickBtn}
                        onClick={handleArchive}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title={note.is_archived ? 'Unarchive' : 'Archive'}
                    >
                        <Archive size={13} strokeWidth={1.8} />
                    </motion.button>

                    <motion.button
                        className={`${styles.quickBtn} ${styles.quickDanger}`}
                        onClick={handleDelete}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Delete"
                    >
                        <Trash2 size={13} strokeWidth={1.8} />
                    </motion.button>
                </div>
            </div>

        </motion.div>
    );
};

export default NoteCard;