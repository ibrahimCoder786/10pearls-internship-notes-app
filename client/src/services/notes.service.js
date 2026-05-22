// =============================================
// Service: Notes API Calls
// =============================================

import api from './api';
import { API_ROUTES } from '../utils/constants';

const NotesService = {

  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.tags) params.append('tags', filters.tags.join(','));
    if (filters.is_pinned !== undefined) params.append('is_pinned', filters.is_pinned);
    if (filters.is_archived !== undefined) params.append('is_archived', filters.is_archived);
    const response = await api.get(`${API_ROUTES.NOTES}?${params}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(API_ROUTES.NOTE_BY_ID(id));
    return response.data;
  },

  create: async (data) => {
    const response = await api.post(API_ROUTES.NOTES, data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(API_ROUTES.NOTE_BY_ID(id), data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(API_ROUTES.NOTE_BY_ID(id));
    return response.data;
  },

  togglePin: async (id) => {
    const response = await api.patch(API_ROUTES.NOTE_PIN(id));
    return response.data;
  },

  toggleArchive: async (id) => {
    const response = await api.patch(API_ROUTES.NOTE_ARCHIVE(id));
    return response.data;
  },

  exportNotes: async (type = 'json') => {
    const response = await api.get(`${API_ROUTES.EXPORT}?type=${type}`, {
      responseType: 'blob',
    });
    return response;
  },

  importNotes: async (fileContent, type = 'json') => {
    const response = await api.post(
      `${API_ROUTES.IMPORT}?type=${type}`,
      { fileContent }
    );
    return response.data;
  },

  exportPDF: async () => {
    // Fetch both active and archived notes for a complete export
    const [resActive, resArchived] = await Promise.all([
      NotesService.getAll({ is_archived: false }),
      NotesService.getAll({ is_archived: true }),
    ]);
    const notes = [...(resActive.data || []), ...(resArchived.data || [])];
    if (notes.length === 0) {
      throw new Error('No notes found to export');
    }

    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    doc.setFont('Helvetica', 'normal');

    // Add Title
    doc.setFontSize(22);
    doc.setFont('Helvetica', 'bold');
    doc.text('NoteFlow — My Notes', 14, 20);

    // Add Date
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Exported on: ${new Date().toLocaleString()}`, 14, 28);

    // Draw header underline
    doc.setDrawColor(200);
    doc.line(14, 32, 196, 32);

    // Loop through notes
    let y = 40;
    const pageHeight = doc.internal.pageSize.height;

    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];
      const title = note.title || 'Untitled';
      const rawContent = note.content || '';
      const content = rawContent.replace(/<[^>]*>/g, ''); // strip HTML
      const tagsStr = note.tags && note.tags.length > 0 ? `Tags: ${note.tags.join(', ')}` : '';
      const dateStr = note.created_at ? `Created: ${new Date(note.created_at).toLocaleDateString()}` : '';

      // Check page overflow before drawing
      const splitContent = doc.splitTextToSize(content, 180);
      const noteHeight = 10 + (splitContent.length * 6) + 12;

      if (y + noteHeight > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }

      // Draw Title
      doc.setFontSize(14);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(0);
      doc.text(title, 14, y);
      y += 7;

      // Draw Content
      doc.setFontSize(11);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(60);
      for (const line of splitContent) {
        if (y > pageHeight - 15) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, 14, y);
        y += 6;
      }

      y += 2;

      // Draw Tags & Date
      doc.setFontSize(9);
      doc.setFont('Helvetica', 'oblique');
      doc.setTextColor(120);
      
      let footerStr = dateStr;
      if (tagsStr) footerStr += `   |   ${tagsStr}`;
      
      if (y > pageHeight - 15) {
        doc.addPage();
        y = 20;
      }
      doc.text(footerStr, 14, y);
      y += 8;

      // Draw note separator line
      if (i < notes.length - 1) {
        if (y > pageHeight - 15) {
          doc.addPage();
          y = 20;
        }
        doc.setDrawColor(230);
        doc.line(14, y, 196, y);
        y += 10;
      }
    }

    doc.save(`notes_export_${new Date().toISOString().slice(0, 10)}.pdf`);
    return { success: true };
  },

};

export default NotesService;