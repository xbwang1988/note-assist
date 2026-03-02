/**
 * 云笔记 - 数据存储层
 */
class Store {
  constructor() {
    this.DB_KEY = 'cloud_notes_db';
    this.data = this.load();
  }

  getDefaults() {
    return {
      notebooks: [
        { id: 'nb_default', name: '默认笔记本', parentId: null, order: 0, pinned: false, createdAt: Date.now() }
      ],
      notes: [],
      settings: {
        theme: 'light',
        defaultEditor: 'richtext',
        listView: 'list',
        sortBy: 'updatedAt-desc'
      }
    };
  }

  load() {
    try {
      const raw = localStorage.getItem(this.DB_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const defaults = this.getDefaults();
        return {
          notebooks: parsed.notebooks || defaults.notebooks,
          notes: parsed.notes || defaults.notes,
          settings: { ...defaults.settings, ...(parsed.settings || {}) }
        };
      }
    } catch (e) {
      console.error('Failed to load data:', e);
    }
    return this.getDefaults();
  }

  save() {
    try {
      localStorage.setItem(this.DB_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Failed to save data:', e);
    }
  }

  // --- Notebooks ---
  getNotebooks() { return this.data.notebooks; }

  addNotebook(name, parentId = null) {
    const nb = {
      id: 'nb_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      name, parentId,
      order: this.data.notebooks.length,
      pinned: false,
      createdAt: Date.now()
    };
    this.data.notebooks.push(nb);
    this.save();
    return nb;
  }

  updateNotebook(id, updates) {
    const nb = this.data.notebooks.find(n => n.id === id);
    if (nb) { Object.assign(nb, updates); this.save(); }
    return nb;
  }

  deleteNotebook(id) {
    this.data.notes.forEach(n => {
      if (n.notebookId === id) n.notebookId = 'nb_default';
    });
    const removeChildren = (parentId) => {
      const children = this.data.notebooks.filter(nb => nb.parentId === parentId);
      children.forEach(child => {
        this.data.notes.forEach(n => {
          if (n.notebookId === child.id) n.notebookId = 'nb_default';
        });
        removeChildren(child.id);
      });
      this.data.notebooks = this.data.notebooks.filter(nb => nb.parentId !== parentId);
    };
    removeChildren(id);
    this.data.notebooks = this.data.notebooks.filter(nb => nb.id !== id);
    this.save();
  }

  getNotebookNoteCount(nbId) {
    return this.data.notes.filter(n => n.notebookId === nbId && !n.deleted).length;
  }

  // --- Notes ---
  getNotes(filter = {}) {
    let notes = [...this.data.notes];

    if (filter.view === 'all') {
      notes = notes.filter(n => !n.deleted);
    } else if (filter.view === 'starred') {
      notes = notes.filter(n => n.starred && !n.deleted);
    } else if (filter.view === 'recent') {
      notes = notes.filter(n => !n.deleted);
    } else if (filter.view === 'todo') {
      notes = notes.filter(n => !n.deleted && n.hasTodo);
    } else if (filter.view === 'trash') {
      notes = notes.filter(n => n.deleted);
    } else if (filter.notebookId) {
      notes = notes.filter(n => n.notebookId === filter.notebookId && !n.deleted);
    } else if (filter.tag) {
      notes = notes.filter(n => n.tags && n.tags.includes(filter.tag) && !n.deleted);
    } else {
      notes = notes.filter(n => !n.deleted);
    }

    if (filter.search) {
      const q = filter.search.toLowerCase();
      notes = notes.filter(n =>
        (n.title && n.title.toLowerCase().includes(q)) ||
        (n.plainText && n.plainText.toLowerCase().includes(q)) ||
        (n.tags && n.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    const [sortField, sortDir] = (filter.sort || 'updatedAt-desc').split('-');
    notes.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      let va = a[sortField], vb = b[sortField];
      if (sortField === 'title') {
        va = (va || '').toLowerCase();
        vb = (vb || '').toLowerCase();
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      return sortDir === 'asc' ? (va || 0) - (vb || 0) : (vb || 0) - (va || 0);
    });

    return notes;
  }

  getNote(id) {
    return this.data.notes.find(n => n.id === id);
  }

  addNote(noteData = {}) {
    const note = {
      id: 'note_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      title: '',
      content: '',
      plainText: '',
      type: noteData.type || this.data.settings.defaultEditor,
      notebookId: noteData.notebookId || 'nb_default',
      tags: [],
      pinned: false,
      starred: false,
      deleted: false,
      hasTodo: false,
      versions: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...noteData
    };
    this.data.notes.push(note);
    this.save();
    return note;
  }

  updateNote(id, updates) {
    const note = this.data.notes.find(n => n.id === id);
    if (!note) return null;

    if (updates.content !== undefined && note.content && updates.content !== note.content) {
      if (!note.versions) note.versions = [];
      const lastVersion = note.versions[note.versions.length - 1];
      if (!lastVersion || (Date.now() - lastVersion.timestamp > 5 * 60 * 1000)) {
        note.versions.push({
          content: note.content,
          title: note.title,
          timestamp: Date.now()
        });
        if (note.versions.length > 50) {
          note.versions = note.versions.slice(-50);
        }
      }
    }

    updates.updatedAt = Date.now();
    Object.assign(note, updates);

    if (updates.content !== undefined) {
      note.hasTodo = note.content.includes('type="checkbox"') ||
                     note.content.includes('- [ ]') ||
                     note.content.includes('- [x]');
    }

    this.save();
    return note;
  }

  deleteNote(id, permanent = false) {
    if (permanent) {
      this.data.notes = this.data.notes.filter(n => n.id !== id);
    } else {
      const note = this.data.notes.find(n => n.id === id);
      if (note) {
        note.deleted = true;
        note.deletedAt = Date.now();
      }
    }
    this.save();
  }

  restoreNote(id) {
    const note = this.data.notes.find(n => n.id === id);
    if (note) {
      note.deleted = false;
      delete note.deletedAt;
      this.save();
    }
    return note;
  }

  emptyTrash() {
    this.data.notes = this.data.notes.filter(n => !n.deleted);
    this.save();
  }

  duplicateNote(id) {
    const original = this.getNote(id);
    if (!original) return null;
    const copy = { ...original };
    copy.id = 'note_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    copy.title = (original.title || '无标题') + ' (副本)';
    copy.createdAt = Date.now();
    copy.updatedAt = Date.now();
    copy.versions = [];
    copy.pinned = false;
    this.data.notes.push(copy);
    this.save();
    return copy;
  }

  // --- Tags ---
  getAllTags() {
    const tagMap = {};
    this.data.notes.filter(n => !n.deleted).forEach(n => {
      (n.tags || []).forEach(t => {
        tagMap[t] = (tagMap[t] || 0) + 1;
      });
    });
    return Object.entries(tagMap).sort((a, b) => b[1] - a[1]);
  }

  // --- Stats ---
  getStats() {
    const notes = this.data.notes;
    return {
      all: notes.filter(n => !n.deleted).length,
      starred: notes.filter(n => n.starred && !n.deleted).length,
      todo: notes.filter(n => n.hasTodo && !n.deleted).length,
      trash: notes.filter(n => n.deleted).length
    };
  }

  // --- Settings ---
  getSetting(key) { return this.data.settings[key]; }
  setSetting(key, value) {
    this.data.settings[key] = value;
    this.save();
  }

  // --- Import/Export ---
  exportAll() {
    return JSON.stringify(this.data, null, 2);
  }

  importAll(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (data.notebooks && data.notes) {
        this.data = data;
        this.save();
        return true;
      }
    } catch (e) {
      console.error('Import failed:', e);
    }
    return false;
  }
}
