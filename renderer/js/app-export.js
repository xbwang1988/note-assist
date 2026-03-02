/**
 * 云笔记 - 导出功能
 */
App.prototype.showExportModal = function() {
  if (!this.currentNoteId) return;
  document.getElementById('exportModal').style.display = '';
};

App.prototype.exportNote = function(format) {
  const note = this.store.getNote(this.currentNoteId);
  if (!note) return;

  const title = note.title || '无标题笔记';

  const pdfStyle = `body{font-family:"Microsoft YaHei","PingFang SC",-apple-system,sans-serif;max-width:700px;margin:0 auto;padding:20px;line-height:1.8;color:#333;font-size:14px}
h1{font-size:22px;border-bottom:2px solid #4f6ef7;padding-bottom:8px}h2{font-size:18px}h3{font-size:16px}
h1,h2,h3{margin-top:24px}code{background:#f4f4f4;padding:2px 6px;border-radius:4px;font-size:13px}
pre{background:#f4f4f4;padding:16px;border-radius:8px;overflow-x:auto}
blockquote{border-left:4px solid #4f6ef7;padding:8px 16px;margin:8px 0;background:#f7f8fa}
table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px 12px}th{background:#f4f4f4}
img{max-width:100%}ul,ol{padding-left:24px}`;

  switch (format) {
    case 'pdf': {
      if (window.electronAPI && window.electronAPI.exportPDF) {
        const htmlContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${pdfStyle}</style></head><body>
<h1>${Utils.escapeHtml(title)}</h1>${note.type === 'markdown' ? marked.parse(note.content) : note.content}
</body></html>`;
        document.getElementById('exportModal').style.display = 'none';
        this.showToast('正在生成 PDF ...', 'info');
        const self = this;
        window.electronAPI.exportPDF(htmlContent, title).then(result => {
          if (result.success) {
            self.showToast('PDF 导出成功', 'success');
          } else if (result.error) {
            self.showToast('导出失败: ' + result.error, 'error');
          }
        });
        return;
      } else {
        this.showToast('PDF 导出仅支持桌面客户端', 'error');
        return;
      }
    }
    case 'html': {
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${Utils.escapeHtml(title)}</title>
<style>body{font-family:-apple-system,sans-serif;max-width:800px;margin:40px auto;padding:20px;line-height:1.8;color:#333}
h1,h2,h3{margin-top:24px}code{background:#f4f4f4;padding:2px 6px;border-radius:4px}
pre{background:#f4f4f4;padding:16px;border-radius:8px;overflow-x:auto}
blockquote{border-left:4px solid #4f6ef7;padding:8px 16px;margin:8px 0;background:#f7f8fa}
table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px 12px}th{background:#f4f4f4}
img{max-width:100%}</style></head><body>
<h1>${Utils.escapeHtml(title)}</h1>${note.type === 'markdown' ? marked.parse(note.content) : note.content}
</body></html>`;
      Utils.downloadFile(html, `${title}.html`, 'text/html');
      break;
    }
    case 'markdown': {
      let md = note.type === 'markdown' ? note.content : this.htmlToMarkdown(note.content);
      md = `# ${title}\n\n${md}`;
      Utils.downloadFile(md, `${title}.md`, 'text/markdown');
      break;
    }
    case 'txt': {
      const text = `${title}\n${'='.repeat(title.length)}\n\n${note.plainText || Utils.stripHtml(note.content)}`;
      Utils.downloadFile(text, `${title}.txt`, 'text/plain');
      break;
    }
    case 'json': {
      const json = JSON.stringify(note, null, 2);
      Utils.downloadFile(json, `${title}.json`, 'application/json');
      break;
    }
  }

  document.getElementById('exportModal').style.display = 'none';
  this.showToast(`已导出为 ${format.toUpperCase()} 格式`, 'success');
};
