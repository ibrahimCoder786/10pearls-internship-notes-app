// =============================================
// Page: Dashboard
// Description: Premium notes dashboard
// =============================================

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Pin, Archive, StickyNote,
  Filter, Grid3X3, List, Plus, Download, Upload, ChevronDown, FileCode, Table, File, Loader2,
  SlidersHorizontal, Tag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import Sidebar from '../../components/layout/Sidebar/Sidebar';
import Navbar from '../../components/layout/Navbar/Navbar';
import NoteCard from './components/NoteCard/NoteCard';
import NotesService from '../../services/notes.service';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import styles from './Dashboard.module.css';

// ─── Skeleton Card ────────────────────────
const SkeletonCard = () => (
  <div className={styles.skeletonCard}>
    <div className={`${styles.skeletonLine} ${styles.skeletonTitle}`} />
    <div className={styles.skeletonLine} />
    <div className={`${styles.skeletonLine} ${styles.skeletonShort}`} />
    <div className={styles.skeletonFooter}>
      <div className={`${styles.skeletonLine} ${styles.skeletonXs}`} />
    </div>
  </div>
);

// ─── Empty State ──────────────────────────
const EmptyState = ({ filter, onNew, searchTerm = '' }) => {
  const map = {
    all: { icon: StickyNote, title: 'No notes yet', sub: 'Create your first note to get started.' },
    pinned: { icon: Pin, title: 'No pinned notes', sub: 'Pin important notes to find them quickly.' },
    archived: { icon: Archive, title: 'No archived notes', sub: 'Archived notes will appear here.' },
  };

  let Icon = StickyNote;
  let title = 'No notes yet';
  let sub = 'Create your first note to get started.';

  if (searchTerm) {
    Icon = Filter;
    title = 'No results found';
    sub = `No notes found for '${searchTerm}'.`;
  } else {
    const config = map[filter] || map.all;
    Icon = config.icon;
    title = config.title;
    sub = config.sub;
  }

  return (
    <motion.div
      className={styles.emptyState}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className={styles.emptyIcon}>
        <Icon size={28} strokeWidth={1.5} />
      </div>
      <h3>{title}</h3>
      <p>{sub}</p>
      {filter === 'all' && !searchTerm && (
        <motion.button
          className={styles.emptyBtn}
          onClick={onNew}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <Plus size={16} />
          Create Note
        </motion.button>
      )}
    </motion.div>
  );
};

// ─── Stats Bar ────────────────────────────
const StatsBar = ({ notes }) => {
  const total = notes.length;
  const pinned = notes.filter(n => n.is_pinned).length;
  const archived = notes.filter(n => n.is_archived).length;
  const tags = [...new Set(notes.flatMap(n => n.tags || []))].length;

  const stats = [
    { label: 'Total Notes', value: total, icon: FileText, color: '#6366F1' },
    { label: 'Pinned', value: pinned, icon: Pin, color: '#F59E0B' },
    { label: 'Archived', value: archived, icon: Archive, color: '#10B981' },
    { label: 'Tags Used', value: tags, icon: Filter, color: '#8B5CF6' },
  ];

  return (
    <div className={styles.statsBar}>
      {stats.map(({ label, value, icon: Icon, color }, i) => (
        <motion.div
          key={label}
          className={styles.statCard}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
        >
          <div className={styles.statIcon} style={{ background: `${color}18`, color }}>
            <Icon size={16} strokeWidth={1.8} />
          </div>
          <div>
            <p className={styles.statValue}>{value}</p>
            <p className={styles.statLabel}>{label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const FilterBar = ({
  active,
  onChange,
  viewMode,
  onViewMode,
  counts = { all: 0, pinned: 0, archived: 0 },
  allUniqueTags = [],
  selectedTags = [],
  onTagToggle,
  onClearFilters,
  sortBy = 'newest',
  onSortChange,
}) => {
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);

  const filters = [
    { key: 'all', label: 'All Notes' },
    { key: 'pinned', label: 'Pinned' },
    { key: 'archived', label: 'Archived' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'title-asc', label: 'A → Z (Title)' },
    { value: 'title-desc', label: 'Z → A (Title)' },
    { value: 'updated', label: 'Last Updated' },
  ];

  const currentSortLabel = sortOptions.find(o => o.value === sortBy)?.label || 'Newest First';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSortSelect = (val) => {
    onSortChange(val);
    setSortOpen(false);
  };

  return (
    <div className={styles.filterSectionContainer}>
      <div className={styles.filterBar}>
        <div className={styles.filterTabs}>
          {filters.map(({ key, label }) => {
            const count = counts[key] || 0;
            return (
              <button
                key={key}
                className={`${styles.filterTab} ${active === key ? styles.filterActive : ''}`}
                onClick={() => onChange(key)}
              >
                <span className={styles.tabLabelText}>{label}</span>
                {/* Count Badge */}
                <motion.span
                  key={count}
                  className={`${styles.filterBadge} ${active === key ? styles.badgeActive : ''}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  {count}
                </motion.span>
                {active === key && (
                  <motion.div
                    className={styles.filterIndicator}
                    layoutId="filterIndicator"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Side: Custom Sort dropdown & View Mode Toggle */}
        <div className={styles.filterBarRight}>
          <div className={styles.sortDropdownContainer} ref={sortRef}>
            <motion.button
              className={styles.sortTriggerBtn}
              onClick={() => setSortOpen(!sortOpen)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              title="Sort Notes"
            >
              <SlidersHorizontal size={14} className={styles.sortIcon} />
              <span className={styles.sortLabelVal}>{currentSortLabel}</span>
              <ChevronDown size={12} className={`${styles.sortChevron} ${sortOpen ? styles.chevronRotated : ''}`} />
            </motion.button>

            <AnimatePresence>
              {sortOpen && (
                <motion.div
                  className={styles.customSortDropdown}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      className={`${styles.customSortItem} ${sortBy === opt.value ? styles.sortItemActive : ''}`}
                      onClick={() => handleSortSelect(opt.value)}
                    >
                      <span className={styles.sortItemText}>{opt.label}</span>
                      {sortBy === opt.value && (
                        <span className={styles.activeSortDot} />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewActive : ''}`}
              onClick={() => onViewMode('grid')}
              title="Grid view"
            >
              <Grid3X3 size={15} strokeWidth={1.8} />
            </button>
            <button
              className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewActive : ''}`}
              onClick={() => onViewMode('list')}
              title="List view"
            >
              <List size={15} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </div>

      {/* Tags Section below Tabs */}
      {allUniqueTags.length > 0 && (
        <div className={styles.tagsContainer}>
          <div className={styles.tagsRow}>
            <span className={styles.tagsLabel}>Tags:</span>
            <div className={styles.tagsScrollList}>
              {allUniqueTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    className={`${styles.tagFilterPill} ${isSelected ? styles.tagFilterPillActive : ''}`}
                    onClick={() => onTagToggle(tag)}
                  >
                    <Tag size={10} className={styles.tagPillIcon} />
                    {tag}
                  </button>
                );
              })}
            </div>
            {selectedTags.length > 0 && (
              <button
                className={styles.clearFiltersBtn}
                onClick={onClearFilters}
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Dashboard ───────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [allNotes, setAllNotes] = useState([]);
  const [archivedNotes, setArchivedNotes] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('newest');

  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  const socket = useSocket();

  // Click outside to close export dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setExportDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ─── Fetch Notes ──────────────────────
  const fetchNotes = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);

      // Fetch non-archived notes (active search applied)
      const resNormal = await NotesService.getAll({
        search: search || undefined,
        is_archived: false,
      });
      const normalNotes = resNormal.data || [];

      // Fetch archived notes (active search applied)
      const resArchived = await NotesService.getAll({
        search: search || undefined,
        is_archived: true,
      });
      const archivedNotes = resArchived.data || [];

      setAllNotes(normalNotes);
      setArchivedNotes(archivedNotes);
    } catch {
      toast.error('Failed to load notes');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [search]);

  // Memoized Tag Collection logic: collect all unique tags from notes array
  const allUniqueTags = useMemo(() => {
    const tagsSet = new Set();
    allNotes.forEach(n => n.tags?.forEach(t => tagsSet.add(t)));
    archivedNotes.forEach(n => n.tags?.forEach(t => tagsSet.add(t)));
    return Array.from(tagsSet).sort();
  }, [allNotes, archivedNotes]);

  // Filter logic: filters notes by selected filter tab
  const filteredNotes = useMemo(() => {
    if (filter === 'all') {
      return allNotes;
    }
    if (filter === 'pinned') {
      return allNotes.filter(n => n.is_pinned);
    }
    if (filter === 'archived') {
      return archivedNotes;
    }
    return [];
  }, [filter, allNotes, archivedNotes]);

  // Tag filter logic: filters notes that include ALL selected tags
  const tagFilteredNotes = useMemo(() => {
    if (selectedTags.length === 0) return filteredNotes;
    return filteredNotes.filter(note =>
      selectedTags.every(tag => note.tags?.includes(tag))
    );
  }, [filteredNotes, selectedTags]);

  // Sort logic: sorts notes array based on sortBy value
  const sortedNotes = useMemo(() => {
    const list = [...tagFilteredNotes];
    if (sortBy === 'newest') {
      return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    if (sortBy === 'oldest') {
      return list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }
    if (sortBy === 'title-asc') {
      return list.sort((a, b) => (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' }));
    }
    if (sortBy === 'title-desc') {
      return list.sort((a, b) => (b.title || '').localeCompare(a.title || '', undefined, { sensitivity: 'base' }));
    }
    if (sortBy === 'updated') {
      return list.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    }
    return list;
  }, [tagFilteredNotes, sortBy]);

  // Maintain backward compatibility for standard rendering elements
  const notes = sortedNotes;

  // Counts calculations for filter tabs
  const filterCounts = useMemo(() => {
    return {
      all: allNotes.length,
      pinned: allNotes.filter(n => n.is_pinned).length,
      archived: archivedNotes.length,
    };
  }, [allNotes, archivedNotes]);

  // Tag toggler
  const handleTagToggle = useCallback((tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  // Clear tags
  const handleClearFilters = useCallback(() => {
    setSelectedTags([]);
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchNotes, search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [fetchNotes]);

  // Real-time synchronization via Socket.IO
  useEffect(() => {
    if (!socket) return;

    const handleRealTimeUpdate = () => {
      fetchNotes(true); // Silent background refresh
    };

    socket.on('note:created', handleRealTimeUpdate);
    socket.on('note:updated', handleRealTimeUpdate);
    socket.on('note:deleted', handleRealTimeUpdate);
    socket.on('notes:imported', handleRealTimeUpdate);

    return () => {
      socket.off('note:created', handleRealTimeUpdate);
      socket.off('note:updated', handleRealTimeUpdate);
      socket.off('note:deleted', handleRealTimeUpdate);
      socket.off('notes:imported', handleRealTimeUpdate);
    };
  }, [socket, fetchNotes]);

  // ─── Actions ──────────────────────────
  const handlePin = async (id) => {
    try {
      await NotesService.togglePin(id);
      await fetchNotes();
      toast.success('Note pin updated');
    } catch { toast.error('Failed to update pin'); }
  };

  const handleArchive = async (id) => {
    try {
      await NotesService.toggleArchive(id);
      await fetchNotes();
      toast.success('Note archive updated');
    } catch { toast.error('Failed to update archive'); }
  };

  const handleDelete = async (id) => {
    try {
      await NotesService.delete(id);
      await fetchNotes(true);
      toast.success('Note deleted');
    } catch { toast.error('Failed to delete note'); }
  };

  const handleExport = async (type) => {
    setExportDropdownOpen(false);
    setExporting(true);

    try {
      if (type === 'pdf') {
        await NotesService.exportPDF();
        toast.success('PDF exported successfully');
        return;
      }

      const res = await NotesService.exportNotes(type);
      
      let mimeType = 'application/json';
      if (type === 'csv') mimeType = 'text/csv';
      if (type === 'txt') mimeType = 'text/plain';

      const blob = new Blob([res.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `notes_export_${new Date().toISOString().slice(0, 10)}.${type}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`${type.toUpperCase()} exported successfully`);
    } catch (err) {
      toast.error(err.message || `Failed to export ${type.toUpperCase()}`);
    } finally {
      setExporting(false);
    }
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const extension = file.name.split('.').pop().toLowerCase();
    if (extension !== 'json' && extension !== 'csv') {
      toast.error('Only .json and .csv files are supported for import');
      e.target.value = '';
      return;
    }

    setImporting(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const fileContent = evt.target.result;
        let response;
        if (extension === 'json') {
          response = await NotesService.importNotes(fileContent, 'json');
        } else {
          response = await NotesService.importNotes(fileContent, 'csv');
        }
        
        toast.success(response.message || 'Notes imported successfully');
        await fetchNotes();
      } catch (err) {
        toast.error(err.response?.data?.message || err.message || 'Failed to import notes');
      } finally {
        setImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.onerror = () => {
      toast.error('Failed to read backup file');
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    reader.readAsText(file);
  };

  // ─── Pinned vs Regular ────────────────
  const pinnedNotes = notes.filter(n => n.is_pinned);
  const regularNotes = notes.filter(n => !n.is_pinned);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 22) return 'Good evening';
    return 'Working late? Good evening';
  };

  return (
    <div className={styles.wrapper}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={styles.mainContent}>
        <Navbar
          onMenuToggle={() => setSidebarOpen(p => !p)}
          onSearch={setSearch}
        />

        <main className={styles.content}>

          {/* ── Welcome Header ── */}
          <motion.div
            className={styles.welcomeHeader}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div>
              <h2 className={styles.greeting}>
                {greeting()}, <span className={styles.gradientName}>{user?.name?.split(' ')[0] || 'there'}</span> 👋
              </h2>
              <p className={styles.greetingSub}>
                {notes.length > 0
                  ? `You have ${notes.length} note${notes.length !== 1 ? 's' : ''} — keep writing!`
                  : 'Start capturing your ideas below.'
                }
              </p>
            </div>

            <div className={styles.headerActions}>
              {/* File Input for Import (Hidden) */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json,.csv"
                style={{ display: 'none' }}
              />

              {/* Import Button */}
              <motion.button
                className={styles.secondaryBtn}
                onClick={handleImportClick}
                disabled={importing}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                title="Import Notes (.json, .csv)"
              >
                {importing ? (
                  <Loader2 size={16} className={styles.spinner} />
                ) : (
                  <Upload size={16} strokeWidth={2} />
                )}
                <span className={styles.btnText}>Import</span>
              </motion.button>

              {/* Export Dropdown Wrapper */}
              <div className={styles.dropdownContainer} ref={dropdownRef}>
                <motion.button
                  className={styles.secondaryBtn}
                  onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                  disabled={exporting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  title="Export Notes"
                >
                  {exporting ? (
                    <Loader2 size={16} className={styles.spinner} />
                  ) : (
                    <Download size={16} strokeWidth={2} />
                  )}
                  <span className={styles.btnText}>Export</span>
                  <ChevronDown size={14} className={styles.chevron} />
                </motion.button>

                {/* Dropdown Card */}
                <AnimatePresence>
                  {exportDropdownOpen && (
                    <motion.div
                      className={styles.exportDropdown}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                    >
                      <button
                        className={styles.dropdownItem}
                        onClick={() => handleExport('json')}
                      >
                        <div className={`${styles.itemIcon} ${styles.iconJson}`}>
                          <FileCode size={18} />
                        </div>
                        <div className={styles.itemInfo}>
                          <p className={styles.itemTitle}>JSON Backup</p>
                          <p className={styles.itemSubtitle}>Full backup with colors & tags</p>
                        </div>
                      </button>

                      <button
                        className={styles.dropdownItem}
                        onClick={() => handleExport('csv')}
                      >
                        <div className={`${styles.itemIcon} ${styles.iconCsv}`}>
                          <Table size={18} />
                        </div>
                        <div className={styles.itemInfo}>
                          <p className={styles.itemTitle}>CSV Spreadsheet</p>
                          <p className={styles.itemSubtitle}>Best for Excel & Google Sheets</p>
                        </div>
                      </button>

                      <button
                        className={styles.dropdownItem}
                        onClick={() => handleExport('txt')}
                      >
                        <div className={`${styles.itemIcon} ${styles.iconTxt}`}>
                          <FileText size={18} />
                        </div>
                        <div className={styles.itemInfo}>
                          <p className={styles.itemTitle}>Plain Text</p>
                          <p className={styles.itemSubtitle}>Human readable text document</p>
                        </div>
                      </button>

                      <button
                        className={styles.dropdownItem}
                        onClick={() => handleExport('pdf')}
                      >
                        <div className={`${styles.itemIcon} ${styles.iconPdf}`}>
                          <File size={18} />
                        </div>
                        <div className={styles.itemInfo}>
                          <p className={styles.itemTitle}>PDF Document</p>
                          <p className={styles.itemSubtitle}>Premium clean printable document</p>
                        </div>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* New Note Button */}
              <motion.button
                className={styles.heroNewBtn}
                onClick={() => navigate('/notes/new')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <Plus size={18} strokeWidth={2.5} />
                <span className={styles.btnText}>New Note</span>
              </motion.button>
            </div>
          </motion.div>

          {/* ── Stats Bar ── */}
          {!loading && notes.length > 0 && (
            <StatsBar notes={notes} />
          )}

          {/* ── Search Results Info Bar ── */}
          <AnimatePresence>
            {search && (
              <motion.div
                className={styles.searchResultsBar}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <Filter size={14} className={styles.searchResultsIcon} />
                <span>
                  <strong>{notes.length}</strong> result{notes.length !== 1 ? 's' : ''} for <em>&ldquo;{search}&rdquo;</em>
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Filter Bar ── */}
          <FilterBar
            active={filter}
            onChange={setFilter}
            viewMode={viewMode}
            onViewMode={setViewMode}
            counts={filterCounts}
            allUniqueTags={allUniqueTags}
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
            onClearFilters={handleClearFilters}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {/* ── Notes Grid ── */}
          {loading ? (
            <div className={`${styles.grid} ${viewMode === 'list' ? styles.listView : ''}`}>
              {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : notes.length === 0 ? (
            <EmptyState filter={filter} onNew={() => navigate('/notes/new')} searchTerm={search} />
          ) : (
            <>
              {filter === 'all' ? (
                <>
                  {/* Pinned Section */}
                  {pinnedNotes.length > 0 && (
                    <div className={styles.section}>
                      <div className={styles.sectionHeader}>
                        <Pin size={14} strokeWidth={2} />
                        <span>Pinned</span>
                      </div>
                      <motion.div
                        className={`${styles.grid} ${viewMode === 'list' ? styles.listView : ''}`}
                        layout
                      >
                        <AnimatePresence mode="popLayout">
                          {pinnedNotes.map((note, i) => (
                            <NoteCard
                              key={note.id}
                              note={note}
                              index={i}
                              onPin={handlePin}
                              onArchive={handleArchive}
                              onDelete={handleDelete}
                            />
                          ))}
                        </AnimatePresence>
                      </motion.div>
                    </div>
                  )}

                  {/* Regular Notes Section */}
                  {regularNotes.length > 0 && (
                    <div className={styles.section}>
                      {pinnedNotes.length > 0 && (
                        <div className={styles.sectionHeader}>
                          <FileText size={14} strokeWidth={2} />
                          <span>Others</span>
                        </div>
                      )}
                      <motion.div
                        className={`${styles.grid} ${viewMode === 'list' ? styles.listView : ''}`}
                        layout
                      >
                        <AnimatePresence mode="popLayout">
                          {regularNotes.map((note, i) => (
                            <NoteCard
                              key={note.id}
                              note={note}
                              index={i}
                              onPin={handlePin}
                              onArchive={handleArchive}
                              onDelete={handleDelete}
                            />
                          ))}
                        </AnimatePresence>
                      </motion.div>
                    </div>
                  )}
                </>
              ) : (
                /* Filtered tab view (Pinned tab or Archived tab) */
                <div className={styles.section}>
                  <motion.div
                    className={`${styles.grid} ${viewMode === 'list' ? styles.listView : ''}`}
                    layout
                  >
                    <AnimatePresence mode="popLayout">
                      {notes.map((note, i) => (
                        <NoteCard
                          key={note.id}
                          note={note}
                          index={i}
                          onPin={handlePin}
                          onArchive={handleArchive}
                          onDelete={handleDelete}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                </div>
              )}
            </>
          )}

        </main>
      </div>
    </div>
  );
};

export default Dashboard;