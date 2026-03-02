/**
 * 云笔记 - 工具栏命令
 */
App.prototype.handleToolbarCommand = function(cmd) {
  if (!cmd) return;

  switch (cmd) {
    case 'highlight':
      document.execCommand('hiliteColor', false, '#fef08a');
      break;
    case 'blockquote':
      document.execCommand('formatBlock', false, 'blockquote');
      break;
    case 'code': {
      const sel = window.getSelection();
      if (sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const code = document.createElement('code');
        try {
          range.surroundContents(code);
        } catch (e) {
          code.textContent = sel.toString();
          range.deleteContents();
          range.insertNode(code);
        }
      }
      break;
    }
    case 'codeBlock': {
      const pre = document.createElement('pre');
      const codeEl = document.createElement('code');
      codeEl.textContent = window.getSelection().toString() || '// 在此输入代码';
      pre.appendChild(codeEl);
      const selObj = window.getSelection();
      if (selObj.rangeCount > 0) {
        const r = selObj.getRangeAt(0);
        r.deleteContents();
        r.insertNode(pre);
      }
      break;
    }
    case 'todoList': {
      const todoDiv = document.createElement('div');
      todoDiv.className = 'todo-item';
      todoDiv.innerHTML = '<input type="checkbox"><span class="todo-text">待办事项</span>';
      const selObj = window.getSelection();
      if (selObj.rangeCount > 0) {
        const r = selObj.getRangeAt(0);
        r.deleteContents();
        r.insertNode(todoDiv);
        const br = document.createElement('br');
        todoDiv.after(br);
      }
      break;
    }
    case 'createLink':
      document.getElementById('linkModal').style.display = '';
      document.getElementById('linkText').value = window.getSelection().toString();
      document.getElementById('linkUrl').value = '';
      document.getElementById('linkUrl').focus();
      break;
    case 'insertImage':
      document.getElementById('imageModal').style.display = '';
      document.getElementById('imageUrl').value = '';
      document.getElementById('imageUrl').focus();
      break;
    case 'insertTable':
      document.getElementById('tableModal').style.display = '';
      break;
    default:
      document.execCommand(cmd, false, null);
  }

  setTimeout(() => this.onContentChange(), 100);
};

App.prototype.confirmInsertLink = function() {
  const text = document.getElementById('linkText').value || 'link';
  const url = document.getElementById('linkUrl').value;
  if (!url) return;

  const editorContent = document.getElementById('editorContent');
  editorContent.focus();
  document.execCommand('insertHTML', false, `<a href="${Utils.escapeHtml(url)}" target="_blank">${Utils.escapeHtml(text)}</a>`);
  document.getElementById('linkModal').style.display = 'none';
  this.onContentChange();
};

App.prototype.confirmInsertImage = function() {
  const url = document.getElementById('imageUrl').value;
  if (!url) return;

  const editorContent = document.getElementById('editorContent');
  editorContent.focus();
  document.execCommand('insertHTML', false, `<img src="${Utils.escapeHtml(url)}" alt="image" style="max-width:100%">`);
  document.getElementById('imageModal').style.display = 'none';
  this.onContentChange();
};

App.prototype.handleImageFile = function(file) {
  const self = this;
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    if (self.currentEditorType === 'markdown') {
      const mdInput = document.getElementById('mdInput');
      const pos = mdInput.selectionStart;
      const before = mdInput.value.substring(0, pos);
      const after = mdInput.value.substring(pos);
      mdInput.value = before + `![${file.name}](${dataUrl})` + after;
      mdInput.dispatchEvent(new Event('input'));
    } else {
      const editorContent = document.getElementById('editorContent');
      editorContent.focus();
      document.execCommand('insertHTML', false, `<img src="${dataUrl}" alt="${Utils.escapeHtml(file.name)}" style="max-width:100%">`);
      self.onContentChange();
    }
    document.getElementById('imageModal').style.display = 'none';
  };
  reader.readAsDataURL(file);
};

App.prototype.confirmInsertTable = function() {
  const rows = parseInt(document.getElementById('tableRows').value) || 3;
  const cols = parseInt(document.getElementById('tableCols').value) || 3;

  if (this.currentEditorType === 'markdown') {
    let md = '\n';
    md += '| ' + Array(cols).fill('标题').map((h, i) => h + (i + 1)).join(' | ') + ' |\n';
    md += '| ' + Array(cols).fill('---').join(' | ') + ' |\n';
    for (let i = 0; i < rows - 1; i++) {
      md += '| ' + Array(cols).fill('  ').join(' | ') + ' |\n';
    }
    md += '\n';

    const mdInput = document.getElementById('mdInput');
    const pos = mdInput.selectionStart;
    mdInput.value = mdInput.value.substring(0, pos) + md + mdInput.value.substring(pos);
    mdInput.dispatchEvent(new Event('input'));
  } else {
    let html = '<table>';
    html += '<tr>' + Array(cols).fill(0).map((_, i) => `<th>标题${i + 1}</th>`).join('') + '</tr>';
    for (let i = 0; i < rows - 1; i++) {
      html += '<tr>' + Array(cols).fill('<td>&nbsp;</td>').join('') + '</tr>';
    }
    html += '</table><p></p>';

    const editorContent = document.getElementById('editorContent');
    editorContent.focus();
    document.execCommand('insertHTML', false, html);
    this.onContentChange();
  }

  document.getElementById('tableModal').style.display = 'none';
};

App.prototype.handleMdCommand = function(cmd) {
  const textarea = document.getElementById('mdInput');
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = textarea.value.substring(start, end);
  let insertion = '';

  switch (cmd) {
    case 'heading': insertion = `### ${selectedText || '标题'}`; break;
    case 'bold': insertion = `**${selectedText || '粗体文字'}**`; break;
    case 'italic': insertion = `*${selectedText || '斜体文字'}*`; break;
    case 'strike': insertion = `~~${selectedText || '删除线文字'}~~`; break;
    case 'code': insertion = `\`${selectedText || '代码'}\``; break;
    case 'ul': insertion = `\n- ${selectedText || '列表项'}\n`; break;
    case 'ol': insertion = `\n1. ${selectedText || '列表项'}\n`; break;
    case 'todo': insertion = `\n- [ ] ${selectedText || '待办事项'}\n`; break;
    case 'quote': insertion = `\n> ${selectedText || '引用内容'}\n`; break;
    case 'codeblock': insertion = `\n\`\`\`\n${selectedText || '// 代码'}\n\`\`\`\n`; break;
    case 'table':
      document.getElementById('tableModal').style.display = '';
      return;
    case 'link': insertion = `[${selectedText || '链接文字'}](url)`; break;
    case 'image': insertion = `![${selectedText || '图片描述'}](url)`; break;
    case 'hr': insertion = '\n---\n'; break;
    case 'math': insertion = `\n$$\n${selectedText || 'E = mc^2'}\n$$\n`; break;
    case 'preview': {
      const split = document.querySelector('.md-split');
      const btn = document.querySelector('[data-md="preview"]');
      split.classList.toggle('no-preview');
      btn.classList.toggle('active');
      return;
    }
  }

  textarea.value = textarea.value.substring(0, start) + insertion + textarea.value.substring(end);
  textarea.focus();
  textarea.selectionStart = start;
  textarea.selectionEnd = start + insertion.length;
  textarea.dispatchEvent(new Event('input'));
};
