/**
 * 云笔记 - 图片缩放
 * 点击编辑器中的图片后显示缩放手柄，拖拽可调整大小
 */
App.prototype.initImageResize = function() {
  var self = this;
  var editorContent = document.getElementById('editorContent');

  editorContent.addEventListener('click', function(e) {
    var img = e.target.closest('img');
    if (!img) {
      self.deactivateImageResize();
      return;
    }
    var existingWrapper = img.closest('.img-resize-wrapper');
    if (existingWrapper && existingWrapper.classList.contains('active')) return;

    self.deactivateImageResize();
    self.activateImageResize(img);
  });
};

App.prototype.activateImageResize = function(img) {
  var self = this;
  var wrapper = img.closest('.img-resize-wrapper');
  if (!wrapper) {
    wrapper = document.createElement('span');
    wrapper.className = 'img-resize-wrapper';
    wrapper.contentEditable = 'false';
    img.parentNode.insertBefore(wrapper, img);
    wrapper.appendChild(img);

    var handleSE = document.createElement('span');
    handleSE.className = 'img-resize-handle img-resize-handle-se';
    wrapper.appendChild(handleSE);

    var handleSW = document.createElement('span');
    handleSW.className = 'img-resize-handle img-resize-handle-sw';
    wrapper.appendChild(handleSW);

    var sizeLabel = document.createElement('span');
    sizeLabel.className = 'img-resize-size-label';
    wrapper.appendChild(sizeLabel);
  }

  wrapper.classList.add('active');

  // 绑定拖拽缩放
  var handles = wrapper.querySelectorAll('.img-resize-handle');
  handles.forEach(function(handle) {
    handle.addEventListener('mousedown', function(e) {
      e.preventDefault();
      e.stopPropagation();
      self._startImageDrag(e, img, wrapper, handle);
    });
  });
};

App.prototype._startImageDrag = function(e, img, wrapper, handle) {
  var self = this;
  var startX = e.clientX;
  var startY = e.clientY;
  var startW = img.offsetWidth;
  var startH = img.offsetHeight;
  var ratio = startH / startW;
  var isSE = handle.classList.contains('img-resize-handle-se');
  var sizeLabel = wrapper.querySelector('.img-resize-size-label');

  wrapper.classList.add('resizing');
  document.body.style.cursor = isSE ? 'nwse-resize' : 'nesw-resize';
  document.body.style.userSelect = 'none';

  function onMouseMove(ev) {
    var dx = ev.clientX - startX;
    if (!isSE) dx = -dx;
    var newW = Math.max(50, startW + dx);
    var newH = Math.round(newW * ratio);
    img.style.width = newW + 'px';
    img.style.height = newH + 'px';
    if (sizeLabel) {
      sizeLabel.textContent = newW + ' × ' + newH;
    }
  }

  function onMouseUp() {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    wrapper.classList.remove('resizing');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    self.onContentChange();
  }

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
};

App.prototype.deactivateImageResize = function() {
  document.querySelectorAll('.img-resize-wrapper.active').forEach(function(w) {
    w.classList.remove('active', 'resizing');
  });
};
