// =============================================
// Test: Notes Service
// Description: Unit tests for notes business logic
// =============================================

const { expect } = require('chai');
const sinon = require('sinon');

const NotesService = require('../../src/services/notes.service');
const NoteModel = require('../../src/models/note.model');
const { mockNote, mockNoteInput } = require('../helpers/mockData');

describe('NotesService Unit Tests', () => {

  afterEach(() => {
    sinon.restore();
  });

  // --- Get All Notes ---
  describe('getAllNotes()', () => {
    it('should return all notes for a user', async () => {
      sinon.stub(NoteModel, 'findAllByUser').resolves([mockNote]);

      const result = await NotesService.getAllNotes(1);

      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(1);
      expect(result[0].title).to.equal(mockNote.title);
    });
  });

  // --- Create Note ---
  describe('createNote()', () => {
    it('should create and return new note', async () => {
      sinon.stub(NoteModel, 'create').resolves(mockNote);

      const result = await NotesService.createNote(1, mockNoteInput);

      expect(result).to.have.property('id');
      expect(result.title).to.equal(mockNote.title);
    });

    it('should throw 400 if title is missing', async () => {
      try {
        await NotesService.createNote(1, { content: 'test' });
        expect.fail('Should have thrown 400');
      } catch (error) {
        expect(error.statusCode).to.equal(400);
        expect(error.message).to.equal('Note title is required');
      }
    });
  });

  // --- Toggle Pin ---
  describe('togglePin()', () => {
    it('should toggle pin status successfully', async () => {
      sinon.stub(NoteModel, 'findById').resolves(mockNote);
      sinon.stub(NoteModel, 'togglePin').resolves({ ...mockNote, is_pinned: true });

      const result = await NotesService.togglePin(1, 1);

      expect(result.is_pinned).to.equal(true);
    });
  });
});
