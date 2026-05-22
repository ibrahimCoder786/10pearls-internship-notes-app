// =============================================
// Page: NoteEditor
// Description: Premium rich note editor
// =============================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
    ArrowLeft, Pin, PinOff, Save, Trash2,
    Tag, X, Clock, FileText, Check, Palette,
    Archive, ArchiveRestore
} from 'lucide-react';
import toast from 'react-hot-toast';
import NotesService from '../../services/notes.service';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { formatFullDate } from '../../utils/formatDate';
import { NOTE_COLORS, resolveNoteColor } from '../../utils/constants';
import styles from './NoteEditor.module.css';

// ─── Quill Toolbar Config ─────────────────
const quillModules = {
    toolbar: [
        [{ header: [1, 2, 3, 4, false] }],
        [{ font: [] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        [{ script: 'sub' }, { script: 'super' }],
        [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
        [{ indent: '-1' }, { indent: '+1' }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        ['clean'],
    ],
};

const quillFormats = [
    'header', 'font',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'align',
    'script',
    'list', 'bullet', 'check', 'indent',
    'blockquote', 'code-block',
    'link', 'image',
];

// ─── Word Count ───────────────────────────
const getWordCount = (html) => {
    if (!html) return 0;
    const text = html.replace(/<[^>]*>/g, ' ').trim();
    return text ? text.split(/\s+/).filter(Boolean).length : 0;
};

const NoteEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [colorKey, setColorKey] = useState('default');
    const [isPinned, setIsPinned] = useState(false);
    const [isArchived, setIsArchived] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(isEdit);
    const [showColors, setShowColors] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);

    const autoSaveTimer = useRef(null);
    const titleRef = useRef(null);

    // ─── Fetch note if editing ────────────
    useEffect(() => {
        if (!isEdit) {
            titleRef.current?.focus();
            return;
        }
        const fetchNote = async () => {
            try {
                setFetchLoading(true);
                const res = await NotesService.getById(id);
                const note = res.data;
                setTitle(note.title || '');
                setContent(note.content || '');
                setTags(note.tags || []);
                // resolveNoteColor handles both new keys ('amber') and legacy hex ('#FEF9EE')
                setColorKey(resolveNoteColor(note.color).key);
                setIsPinned(note.is_pinned || false);
                setIsArchived(note.is_archived || false);
            } catch {
                toast.error('Failed to load note');
                navigate('/dashboard');
            } finally {
                setFetchLoading(false);
            }
        };
        fetchNote();
    }, [id, isEdit, navigate]);

    // ─── Auto save draft (localStorage) ──
    useEffect(() => {
        if (isEdit) return;
        clearTimeout(autoSaveTimer.current);
        autoSaveTimer.current = setTimeout(() => {
            if (title || content) {
                localStorage.setItem('noteflow_draft', JSON.stringify({ title, content, tags, colorKey }));
                setSaved(true);
                setLastSaved(new Date());
                setTimeout(() => setSaved(false), 2000);
            }
        }, 1500);
        return () => clearTimeout(autoSaveTimer.current);
    }, [title, content, tags, colorKey, isEdit]);

    // ─── Load draft ───────────────────────
    useEffect(() => {
        if (isEdit) return;
        const draft = localStorage.getItem('noteflow_draft');
        if (draft) {
            const { title: t, content: c, tags: tg, colorKey: ck } = JSON.parse(draft);
            if (t) setTitle(t);
            if (c) setContent(c);
            if (tg) setTags(tg);
            // Also handle old drafts that stored hex
            if (ck) setColorKey(resolveNoteColor(ck).key);
        }
    }, [isEdit]);

    // ─── Tag handlers ─────────────────────
    const addTag = (e) => {
        if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
            e.preventDefault();
            const newTag = tagInput.trim().toLowerCase().replace(/,/g, '');
            if (!tags.includes(newTag) && tags.length < 8) {
                setTags(prev => [...prev, newTag]);
            }
            setTagInput('');
        }
        if (e.key === 'Backspace' && !tagInput && tags.length) {
            setTags(prev => prev.slice(0, -1));
        }
    };

    const removeTag = (tag) => setTags(prev => prev.filter(t => t !== tag));

    // ─── Save ─────────────────────────────
    const handleSave = async () => {
        if (!title.trim()) {
            toast.error('Please enter a note title');
            titleRef.current?.focus();
            return;
        }
        setSaving(true);
        try {
            const payload = { title: title.trim(), content, tags, color: colorKey, is_pinned: isPinned, is_archived: isArchived };
            if (isEdit) {
                await NotesService.update(id, payload);
                toast.success('Note updated!');
            } else {
                await NotesService.create(payload);
                localStorage.removeItem('noteflow_draft');
                toast.success('Note created!');
            }
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save note');
        } finally {
            setSaving(false);
        }
    };

    // ─── Delete ───────────────────────────
    const handleDelete = async () => {
        if (!isEdit) return;
        if (!window.confirm('Delete this note?')) return;
        try {
            await NotesService.delete(id);
            toast.success('Note deleted');
            navigate('/dashboard');
        } catch {
            toast.error('Failed to delete note');
        }
    };

    const wordCount = getWordCount(content);
    // Resolve current color config — drives card bg + accent bar
    const colorConfig = resolveNoteColor(colorKey);

    if (fetchLoading) {
        return (
            <div className={styles.fetchLoader}>
                <div className={styles.fetchSpinner} />
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className={styles.mainContent}>

                {/* ── Top Toolbar ── */}
                <div className={styles.toolbar}>
                    <div className={styles.toolbarLeft}>
                        <motion.button
                            className={styles.backBtn}
                            onClick={() => navigate('/dashboard')}
                            whileHover={{ x: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <ArrowLeft size={18} strokeWidth={1.8} />
                        </motion.button>

                        {/* Save status */}
                        <AnimatePresence mode="wait">
                            {saved && (
                                <motion.div
                                    className={styles.savedBadge}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                >
                                    <Check size={12} strokeWidth={2.5} />
                                    Draft saved
                                </motion.div>
                            )}
                            {lastSaved && !saved && (
                                <motion.span
                                    className={styles.lastSaved}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <Clock size={11} />
                                    Saved {formatFullDate(lastSaved)}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className={styles.toolbarRight}>
                        {/* Color Picker */}
                        <div className={styles.colorWrap}>
                            <motion.button
                                className={styles.toolBtn}
                                onClick={() => setShowColors(p => !p)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                title="Note color"
                            >
                                <Palette size={17} strokeWidth={1.8} />
                            </motion.button>

                            <AnimatePresence>
                                {showColors && (
                                    <motion.div
                                        className={styles.colorPicker}
                                        initial={{ opacity: 0, scale: 0.92, y: -4 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.92, y: -4 }}
                                    >
                                        <p className={styles.colorLabel}>Note Color</p>
                                        <div className={styles.colorGrid}>
                                            {NOTE_COLORS.map((c) => (
                                                <motion.button
                                                    key={c.key}
                                                    className={`${styles.colorSwatch} ${colorKey === c.key ? styles.colorActive : ''}`}
                                                    style={{
                                                        background: `var(${c.cssVar})`,
                                                        borderBottomColor: c.accent,
                                                    }}
                                                    onClick={() => { setColorKey(c.key); setShowColors(false); }}
                                                    title={c.label}
                                                    whileHover={{ scale: 1.15 }}
                                                    whileTap={{ scale: 0.9 }}
                                                />
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Pin */}
                        <motion.button
                            className={`${styles.toolBtn} ${isPinned ? styles.toolActive : ''}`}
                            onClick={() => setIsPinned(p => !p)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            title={isPinned ? 'Unpin' : 'Pin note'}
                        >
                            {isPinned
                                ? <PinOff size={17} strokeWidth={1.8} />
                                : <Pin size={17} strokeWidth={1.8} />
                            }
                        </motion.button>

                        {/* Archive — only in Edit mode */}
                        {isEdit && (
                            <motion.button
                                className={`${styles.toolBtn} ${isArchived ? styles.toolActive : ''}`}
                                onClick={() => setIsArchived(p => !p)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                title={isArchived ? 'Restore note from archive' : 'Archive note'}
                            >
                                {isArchived
                                    ? <ArchiveRestore size={17} strokeWidth={1.8} />
                                    : <Archive size={17} strokeWidth={1.8} />
                                }
                            </motion.button>
                        )}

                        {/* Delete — only edit mode */}
                        {isEdit && (
                            <motion.button
                                className={`${styles.toolBtn} ${styles.toolDanger}`}
                                onClick={handleDelete}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                title="Delete note"
                            >
                                <Trash2 size={17} strokeWidth={1.8} />
                            </motion.button>
                        )}

                        {/* Save */}
                        <motion.button
                            className={styles.saveBtn}
                            onClick={handleSave}
                            disabled={saving}
                            whileHover={{ scale: saving ? 1 : 1.02 }}
                            whileTap={{ scale: saving ? 1 : 0.97 }}
                        >
                            {saving ? (
                                <span className={styles.savingSpinner} />
                            ) : (
                                <>
                                    <Save size={15} strokeWidth={2} />
                                    {isEdit ? 'Update Note' : 'Create Note'}
                                </>
                            )}
                        </motion.button>
                    </div>
                </div>

                {/* ── Editor Area ── */}
                <div className={styles.editorArea}>
                    <motion.div
                        className={styles.editorCard}
                        style={{ background: `var(${colorConfig.cssVar})` }}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    >
                        {/* Accent bar — matches note color */}
                        <div
                            className={styles.accentBar}
                            style={{ background: colorConfig.accent }}
                        />
                        {/* Title */}
                        <div className={styles.titleWrap}>
                            <input
                                ref={titleRef}
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Enter note title..."
                                className={styles.titleInput}
                                maxLength={255}
                            />
                            {isPinned && (
                                <span className={styles.pinnedIndicator}>
                                    <Pin size={12} strokeWidth={2.5} />
                                    Pinned
                                </span>
                            )}
                        </div>

                        {/* Divider */}
                        <div className={styles.divider} />

                        {/* Tags */}
                        <div className={styles.tagsRow}>
                            <Tag size={14} className={styles.tagIcon} strokeWidth={1.8} />
                            <div className={styles.tagsInput}>
                                {tags.map(tag => (
                                    <motion.span
                                        key={tag}
                                        className={styles.tagPill}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.8, opacity: 0 }}
                                    >
                                        #{tag}
                                        <button
                                            className={styles.tagRemove}
                                            onClick={() => removeTag(tag)}
                                        >
                                            <X size={10} strokeWidth={2.5} />
                                        </button>
                                    </motion.span>
                                ))}
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={e => setTagInput(e.target.value)}
                                    onKeyDown={addTag}
                                    placeholder={tags.length ? '' : 'Press enter to add tags...'}
                                    className={styles.tagInputField}
                                    maxLength={30}
                                />
                            </div>
                        </div>

                        {/* Divider */}
                        <div className={styles.divider} />

                        {/* Rich Text Editor */}
                        <div className={styles.quillWrap}>
                            <ReactQuill
                                theme="snow"
                                value={content}
                                onChange={setContent}
                                modules={quillModules}
                                formats={quillFormats}
                                placeholder="Start writing your note here..."
                                className={styles.quill}
                            />
                        </div>

                        {/* Footer */}
                        <div className={styles.editorFooter}>
                            <div className={styles.footerLeft}>
                                <FileText size={12} strokeWidth={1.8} />
                                <span>{wordCount} word{wordCount !== 1 ? 's' : ''}</span>
                            </div>
                            <div className={styles.footerRight}>
                                <span>{title.length}/255</span>
                            </div>
                        </div>

                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default NoteEditor;