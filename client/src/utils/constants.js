// =============================================
// Constants: App-wide constants
// =============================================

export const APP_NAME = 'NoteFlow';

export const API_ROUTES = {
  // Auth
  SIGNUP:         '/auth/signup',
  LOGIN:          '/auth/login',
  LOGOUT:         '/auth/logout',
  PROFILE:        '/auth/profile',

  // Notes
  NOTES:          '/notes',
  NOTE_BY_ID:     (id) => `/notes/${id}`,
  NOTE_PIN:       (id) => `/notes/${id}/pin`,
  NOTE_ARCHIVE:   (id) => `/notes/${id}/archive`,

  // Export/Import
  EXPORT:         '/notes/export/download',
  IMPORT:         '/notes/import/upload',
  EXPORT_HISTORY: '/notes/export/history',
};

export const ROUTES = {
  HOME:      '/',
  LOGIN:     '/login',
  SIGNUP:    '/signup',
  DASHBOARD: '/dashboard',
  NOTE_EDIT: '/notes/:id/edit',
  NOTE_NEW:  '/notes/new',
  PROFILE:   '/profile',
};

// ─── Note Color Palette ──────────────────────────────────────────
// DB stores the KEY (e.g. 'amber'), never the raw hex.
// CSS variables (--note-*) handle light/dark automatically.
// Accent colors are purposeful accent-bar hues per theme color.

export const NOTE_COLORS = [
  { key: 'default', label: 'Default', cssVar: '--note-white',  accent: '#6366F1' },
  { key: 'amber',   label: 'Amber',   cssVar: '--note-amber',  accent: '#D97706' },
  { key: 'mint',    label: 'Mint',    cssVar: '--note-mint',   accent: '#059669' },
  { key: 'sky',     label: 'Sky',     cssVar: '--note-sky',    accent: '#2563EB' },
  { key: 'violet',  label: 'Violet',  cssVar: '--note-violet', accent: '#7C3AED' },
  { key: 'rose',    label: 'Rose',    cssVar: '--note-rose',   accent: '#E11D48' },
];

// ─── Fast key lookup by key string ───────────────────────────────
export const NOTE_COLOR_MAP = Object.fromEntries(
  NOTE_COLORS.map(c => [c.key, c])
);

// ─── Backward compatibility: old records stored hex values ────────
// Maps legacy hex → new key so old notes render correctly.
export const HEX_TO_KEY = {
  '#FFFFFF': 'default',
  '#FEF9EE': 'amber',
  '#FFFBEB': 'amber',
  '#F0FDF4': 'mint',
  '#EFF6FF': 'sky',
  '#FDF4FF': 'violet',
  '#FFF1F2': 'rose',
};

// Helper: resolve a stored value (key or legacy hex) → color config
export const resolveNoteColor = (stored) => {
  if (!stored) return NOTE_COLOR_MAP['default'];
  // Already a valid key
  if (NOTE_COLOR_MAP[stored]) return NOTE_COLOR_MAP[stored];
  // Legacy hex → map to key
  const key = HEX_TO_KEY[stored] || 'default';
  return NOTE_COLOR_MAP[key];
};

export const EXPORT_TYPES = [
  { label: 'JSON', value: 'json' },
  { label: 'CSV',  value: 'csv'  },
  { label: 'TXT',  value: 'txt'  },
];

export const LOCAL_STORAGE_KEYS = {
  TOKEN: 'notes_app_token',
  THEME: 'notes_app_theme',
  USER:  'notes_app_user',
};
