/**
 * 云笔记 - 编辑器核心
 */
App.prototype.createNewNote = function(templateData) {
  if (templateData === undefined) templateData = null;
  const noteData = {};

  if (this.currentView.type === 'notebook') {
    noteData.notebookId = this.currentView.notebookId;
  }

  if (templateData) {
    noteData.title = templateData.name;
    noteData.content = templateData.content;
    noteData.type = templateData.type;
    noteData.plainText = Utils.stripHtml(templateData.content);
  }

  const note = this.store.addNote(noteData);
  this.renderNoteList();
  this.updateStats();
  this.renderSidebar();
  this.openNote(note.id);
  this.showToast('笔记已创建', 'success');
};

App.prototype.openNote = function(noteId) {
  this.saveCurrentNote();

  const note = this.store.getNote(noteId);
  if (!note) return;

  this.currentNoteId = noteId;
  this.currentEditorType = note.type || 'richtext';

  document.getElementById('editorEmpty').style.display = 'none';
  document.getElementById('editorActive').style.display = '';

  document.getElementById('noteTitle').value = note.title || '';

  document.getElementById('noteMeta').textContent =
    `创建: ${Utils.formatFullDate(note.createdAt)} | 修改: ${Utils.formatFullDate(note.updatedAt)}`;

  if (this.currentEditorType === 'markdown') {
    document.getElementById('richtextEditor').style.display = 'none';
    document.getElementById('markdownEditor').style.display = '';
    document.getElementById('richToolbar').style.display = 'none';
    document.getElementById('mdToolbar').style.display = '';
    document.getElementById('mdInput').value = note.content || '';
    this.renderMarkdownPreview();
  } else {
    document.getElementById('richtextEditor').style.display = '';
    document.getElementById('markdownEditor').style.display = 'none';
    document.getElementById('richToolbar').style.display = '';
    document.getElementById('mdToolbar').style.display = 'none';
    document.getElementById('editorContent').innerHTML = note.content || '';
  }

  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === this.currentEditorType);
  });

  document.getElementById('btnStar').innerHTML = note.starred ? '&#9733;' : '&#9734;';
  document.getElementById('btnStar').title = note.starred ? '取消收藏' : '收藏';
  document.getElementById('btnPin').style.opacity = note.pinned ? '1' : '0.5';

  this.renderNoteTags(note.tags || []);

  this.updateWordCount();

  document.querySelectorAll('.note-card').forEach(card => {
    card.classList.toggle('active', card.dataset.id === noteId);
  });

  document.getElementById('saveStatus').textContent = '已保存';
};

App.prototype.saveCurrentNote = function() {
  if (!this.currentNoteId) return;

  let content, plainText;
  if (this.currentEditorType === 'markdown') {
    content = document.getElementById('mdInput').value;
    plainText = content;
  } else {
    content = document.getElementById('editorContent').innerHTML;
    plainText = Utils.stripHtml(content);
  }

  this.store.updateNote(this.currentNoteId, { content, plainText });
};

App.prototype.onContentChange = function() {
  if (!this.currentNoteId) return;

  document.getElementById('saveStatus').textContent = '保存中...';

  clearTimeout(this.saveTimer);
  this.saveTimer = setTimeout(() => {
    this.saveCurrentNote();
    this.renderNoteList();
    this.updateStats();
    document.getElementById('saveStatus').textContent = '已保存';
  }, 300);

  this.updateWordCount();
};

App.prototype.updateWordCount = function() {
  let text;
  if (this.currentEditorType === 'markdown') {
    text = document.getElementById('mdInput').value;
  } else {
    text = document.getElementById('editorContent').innerText;
  }
  const count = Utils.countWords(text);
  document.getElementById('wordCount').textContent = `${count} 字`;
};

// 检测光标所在位置的标题层级，更新工具栏下拉框
App.prototype.updateHeadingSelect = function() {
  if (this.currentEditorType !== 'richtext') return;
  const sel = window.getSelection();
  if (!sel.rangeCount) return;

  let node = sel.anchorNode;
  if (!node) return;

  // 向上查找最近的块级元素
  if (node.nodeType === 3) node = node.parentElement;
  const editorEl = document.getElementById('editorContent');
  let blockTag = '';
  while (node && node !== editorEl) {
    const tag = node.tagName;
    if (tag && /^H[1-6]$/.test(tag)) {
      blockTag = tag.toLowerCase();
      break;
    }
    if (tag && /^(P|DIV|BLOCKQUOTE|PRE|LI)$/.test(tag)) {
      break;
    }
    node = node.parentElement;
  }

  const headingSelect = document.getElementById('headingSelect');
  if (headingSelect) {
    headingSelect.value = blockTag;
  }
};

App.prototype.switchEditorType = function(type) {
  if (type === this.currentEditorType) return;
  if (!this.currentNoteId) return;

  const note = this.store.getNote(this.currentNoteId);
  if (!note) return;

  this.saveCurrentNote();

  let content = note.content || '';
  if (type === 'markdown' && this.currentEditorType === 'richtext') {
    content = this.htmlToMarkdown(content);
  } else if (type === 'richtext' && this.currentEditorType === 'markdown') {
    if (typeof marked !== 'undefined') {
      content = marked.parse(content);
    }
  }

  this.currentEditorType = type;
  this.store.updateNote(this.currentNoteId, { type, content });

  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === type);
  });

  if (type === 'markdown') {
    document.getElementById('richtextEditor').style.display = 'none';
    document.getElementById('markdownEditor').style.display = '';
    document.getElementById('richToolbar').style.display = 'none';
    document.getElementById('mdToolbar').style.display = '';
    document.getElementById('mdInput').value = content;
    this.renderMarkdownPreview();
  } else {
    document.getElementById('richtextEditor').style.display = '';
    document.getElementById('markdownEditor').style.display = 'none';
    document.getElementById('richToolbar').style.display = '';
    document.getElementById('mdToolbar').style.display = 'none';
    document.getElementById('editorContent').innerHTML = content;
  }
};

App.prototype.htmlToMarkdown = function(html) {
  if (!html) return '';
  let md = html;
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
  md = md.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n');
  md = md.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n');
  md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
  md = md.replace(/<u[^>]*>(.*?)<\/u>/gi, '$1');
  md = md.replace(/<s[^>]*>(.*?)<\/s>/gi, '~~$1~~');
  md = md.replace(/<del[^>]*>(.*?)<\/del>/gi, '~~$1~~');
  md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
  md = md.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n');
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, '![]($1)');
  md = md.replace(/<hr[^>]*>/gi, '\n---\n');
  md = md.replace(/<br[^>]*>/gi, '\n');
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<\/?(ul|ol|p|div|span|table|tr|td|th|thead|tbody)[^>]*>/gi, '\n');
  md = md.replace(/<[^>]+>/g, '');
  md = md.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  md = md.replace(/\n{3,}/g, '\n\n');
  return md.trim();
};

App.prototype.renderMarkdownPreview = function() {
  if (typeof marked === 'undefined') return;
  const input = document.getElementById('mdInput').value;
  const html = marked.parse(input);
  document.getElementById('mdPreview').innerHTML = html;

  if (typeof hljs !== 'undefined') {
    document.querySelectorAll('#mdPreview pre code').forEach(block => {
      hljs.highlightElement(block);
    });
  }
};
