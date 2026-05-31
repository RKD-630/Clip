// State
const state = {
  clips: [],
  activeIndex: 0,
  adj: { brightness: 0, contrast: 0, hue: 0, filter: 'none', ratio: 'free' },
  exporting: false
};

// DOM
const els = {
  file: document.getElementById('fileInput'),
  add: document.getElementById('addClipBtn'),
  video: document.getElementById('previewVideo'),
  canvas: document.getElementById('exportCanvas'),
  timeline: document.getElementById('timelineStrip'),
  filters: document.getElementById('filterGrid'),
  aspects: document.querySelector('.aspect-grid'),
  exportVideo: document.getElementById('exportVideoBtn'),
  exportGif: document.getElementById('exportGifBtn'),
  loading: document.getElementById('loadingOverlay'),
  loadText: document.getElementById('loadingText'),
  progress: document.getElementById('exportProgress'),
  sliders: {
    brightness: document.getElementById('brightness'),
    contrast: document.getElementById('contrast'),
    hue: document.getElementById('hue')
  }
};

// Events
els.add.onclick = () => els.file.click();
els.file.onchange = (e) => {
  Array.from(e.target.files).forEach(f => {
    state.clips.push({ url: URL.createObjectURL(f), name: f.name });
  });
  renderTimeline();
  if (state.clips.length === e.target.files.length) loadClip(0);
};

Object.values(els.sliders).forEach(s => {
  s.oninput = (e) => {
    state.adj[s.id] = parseFloat(e.target.value);
    applyPreview();
  };
});

els.filters.onclick = (e) => {
  if (!e.target.classList.contains('filter-btn')) return;
  els.filters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  e.target.classList.add('active');
  state.adj.filter = e.target.dataset.filter;
  applyPreview();
};

els.aspects.onclick = (e) => {
  if (!e.target.classList.contains('aspect-btn')) return;
  els.aspects.querySelectorAll('.aspect-btn').forEach(b => b.classList.remove('active'));
  e.target.classList.add('active');
  state.adj.ratio = e.target.dataset.ratio;
  applyCrop();
};

els.exportVideo.onclick = () => exportMedia('mp4');
els.exportGif.onclick = () => exportMedia('gif');

// Core
function renderTimeline() {
  els.timeline.innerHTML = '';
  state.clips.forEach((c, i) => {
    const thumb = document.createElement('div');
    thumb.className = `clip-thumb ${i === state.activeIndex ? 'active' : ''}`;
    thumb.innerHTML = `<video src="${c.url}" muted preload="metadata"></video>`;
    thumb.onclick = () => loadClip(i);
    const vid = thumb.querySelector('video');
    vid.onloadedmetadata = () => { vid.currentTime = 0.5; };
    vid.onseeked = () => { thumb.style.background = `url(${snapThumb(vid)}) center/cover`; vid.remove(); };
    els.timeline.appendChild(thumb);
  });
}

function snapThumb(vid) {
  const c = document.createElement('canvas'); c.width = 200; c.height = 120;
  c.getContext('2d').drawImage(vid, 0, 0, 200, 120);
  return c.toDataURL();
}

function loadClip(i) {
  state.activeIndex = i;
  els.video.src = state.clips[i].url;
  els.video.load(); els.video.play();
  applyPreview();
  document.querySelectorAll('.clip-thumb').forEach((t,idx) => t.classList.toggle('active', idx === i));
}

function applyPreview() {
  const { brightness, contrast, hue, filter } = state.adj;
  const f = filter === 'none' ? '' : `${filter}(100%) `;
  els.video.style.filter = `${f}brightness(${100+brightness}%) contrast(${100+contrast}%) hue-rotate(${180+hue}deg)`;
}

function applyCrop() {
  const overlay = document.getElementById('cropOverlay');
  if (state.adj.ratio === 'free') {
    overlay.style = '';
  } else {
    const [w,h] = state.adj.ratio.split(':').map(Number);
    overlay.style.aspectRatio = `${w}/${h}`;
    overlay.style.width = Math.min(100, (w/h)*100) + '%';
    overlay.style.height = 'auto';
    overlay.style.top = '50%'; overlay.style.left = '50%';
    overlay.style.transform = 'translate(-50%, -50%)';
  }
}

async function exportMedia(type) {
  if (state.exporting || !state.clips.length) return;
  state.exporting = true;
  showLoading(`Exporting ${type.toUpperCase()}...`);

  try {
    type === 'mp4' ? await exportMP4() : await exportGIF();
  } catch (err) {
    alert('Export failed: ' + err.message);
  } finally {
    state.exporting = false; hideLoading();
  }
}

async function exportMP4() {
  const ctx = els.canvas.getContext('2d');
  els.canvas.width = 720; els.canvas.height = 1280; // 9:16 HD
  const stream = els.canvas.captureStream(30);
  const rec = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 8000000 });
  const chunks = [];
  rec.ondataavailable = e => chunks.push(e.data);
  rec.onstop = () => download(new Blob(chunks, { type: 'video/webm' }), 'clip_edit.webm');

  rec.start();
  for (const clip of state.clips) {
    els.video.src = clip.url;
    await new Promise(r => els.video.onplay = r);
    await new Promise(r => els.video.onended = r);
    drawFrame(ctx, els.video);
    updateProgress(10 + (state.clips.indexOf(clip) * 30));
  }
  rec.stop();
}

function drawFrame(ctx, vid) {
  ctx.filter = els.video.style.filter || 'none';
  ctx.drawImage(vid, 0, 0, 720, 1280);
  requestAnimationFrame(() => drawFrame(ctx, vid));
}

async function exportGIF() {
  // Production: integrate gif.js + Web Worker
  showLoading('GIF export requires gif.js worker. See README.');
  await new Promise(r => setTimeout(r, 1000));
  const mock = new Blob(['GIF89a'], { type: 'image/gif' });
  download(mock, 'clip_edit.gif');
}

function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  a.click(); URL.revokeObjectURL(a.href);
}

function showLoading(t) { els.loadText.textContent = t; els.loading.classList.remove('hidden'); }
function hideLoading() { els.loading.classList.add('hidden'); }
function updateProgress(v) { els.progress.value = Math.min(v, 100); }

applyCrop();