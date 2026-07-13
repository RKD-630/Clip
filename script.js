// Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    themeIcon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
  }
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    if (current === 'light') {
      document.documentElement.removeAttribute('data-theme');
      themeIcon.innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      themeIcon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
      localStorage.setItem('theme', 'light');
    }
  });

  // View switching
  const views = { home: 'homeView', editor: 'editorView', templates: 'templatesView' };
  const navItems = document.querySelectorAll('.nav-item[data-view]');
  const homeView = document.getElementById('homeView');
  const editorView = document.getElementById('editorView');
  const templatesView = document.getElementById('templatesView');
  const profileView = document.getElementById('profileView');
  const projectsView = document.getElementById('projectsView');

  function switchView(viewName) {
    if (homeView) homeView.classList.toggle('active', viewName === 'home');
    if (editorView) editorView.classList.toggle('active', viewName === 'editor');
    if (templatesView) templatesView.classList.toggle('active', viewName === 'templates');
    if (profileView) profileView.classList.toggle('active', viewName === 'profile');
    if (projectsView) projectsView.classList.toggle('active', viewName === 'projects');
    
    const fabAi = document.querySelector('.fab-ai');
    if (fabAi) fabAi.style.display = (viewName === 'home' || viewName === 'templates') ? 'flex' : 'none';
    
    navItems.forEach(n => n.classList.toggle('active', n.dataset.view === viewName));
  }

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const view = item.dataset.view;
      if (view === 'home' || view === 'templates' || view === 'profile' || view === 'projects') {
        switchView(view);
      } else {
        showToast(`Opening ${view}...`);
      }
    });
  });

  // Open editor from projects
  document.querySelectorAll('.project').forEach(p => {
    p.addEventListener('click', () => switchView('editor'));
  });

  // Back button
  document.getElementById('backBtn').addEventListener('click', () => switchView('home'));

  // Create button (Import Media)
  document.getElementById('createBtn').addEventListener('click', (e) => {
    e.preventDefault();
    let fileInput = document.getElementById('mediaImportInput');
    if (!fileInput) {
      fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.id = 'mediaImportInput';
      fileInput.accept = 'audio/*,video/*,image/*';
      fileInput.multiple = true;
      fileInput.style.display = 'none';
      document.body.appendChild(fileInput);
      
      fileInput.addEventListener('change', (ev) => {
        const files = Array.from(ev.target.files);
        if (files.length > 0) {
          const toolsGrid = document.querySelector('.tools-grid');
          if (toolsGrid) {
            files.forEach(file => {
              let type = 'image';
              if (file.type.startsWith('video/')) type = 'video';
              else if (file.type.startsWith('audio/')) type = 'audio';
              
              const item = document.createElement('div');
              item.className = 'tool-item media-draggable';
              item.draggable = true;
              item.dataset.type = type;
              item.dataset.bg = type === 'video' ? 'linear-gradient(90deg, #7c5cff, #a78bfa)' :
                                type === 'audio' ? 'linear-gradient(90deg, #ffb547, #ff5c6e)' :
                                'linear-gradient(90deg, #30cfd0, #330867)'; // Use cool gradient for images
                                
              item.innerHTML = `
                <div class="tool-item-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <span style="font-size:9px; overflow:hidden; text-overflow:ellipsis; max-width:100%; display:block; white-space:nowrap;" title="${file.name}">${file.name}</span>
              `;
              
              // Event delegation handles dragstart now
              toolsGrid.prepend(item);
            });
            showToast(`Imported ${files.length} file(s) to Editor Tools!`);
            setTimeout(() => switchView('editor'), 800);
          }
        }
        fileInput.value = ''; // Reset
      });
    }
    fileInput.click();
  });

  // FAB
  document.getElementById('fabAi').addEventListener('click', () => {
    showToast('🤖 AI Assistant ready');
  });

  // Quick actions
  document.querySelectorAll('.quick-action').forEach(a => {
    a.addEventListener('click', () => {
      showToast(`Creating ${a.querySelector('span').textContent}...`);
      setTimeout(() => switchView('editor'), 800);
    });
  });

  const toolsGrid = document.querySelector('.tools-grid');
  
  let mediaRecorder = null;
  let audioChunks = [];
  let recordTimer = null;
  let recordSeconds = 0;
  
  const filtersHtml = `
    <button class="tool-item filter-tool" data-filter="none">
      <div class="tool-item-icon" style="background: linear-gradient(135deg, #444, #666);">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
      </div>
      <span>Original</span>
    </button>
    <button class="tool-item filter-tool" data-filter="sepia(1) contrast(1.2)">
      <div class="tool-item-icon" style="background: linear-gradient(135deg, #d4a373, #faedcd);">
        <svg viewBox="0 0 24 24" fill="none" stroke="#603813" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>
      </div>
      <span>Vintage</span>
    </button>
    <button class="tool-item filter-tool" data-filter="grayscale(1) contrast(1.5)">
      <div class="tool-item-icon" style="background: linear-gradient(135deg, #000, #fff);">
        <svg viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>
      </div>
      <span>B & W</span>
    </button>
    <button class="tool-item filter-tool" data-filter="saturate(2) hue-rotate(90deg)">
      <div class="tool-item-icon" style="background: linear-gradient(135deg, #00f2ea, #ff0055);">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>
      </div>
      <span>Cyberpunk</span>
    </button>
    <button class="tool-item filter-tool" data-filter="contrast(1.3) brightness(0.9) saturate(0.8)">
      <div class="tool-item-icon" style="background: linear-gradient(135deg, #1c3144, #596f62);">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>
      </div>
      <span>Cinematic</span>
    </button>
    <button class="tool-item filter-tool" data-filter="hue-rotate(-45deg) saturate(1.5)">
      <div class="tool-item-icon" style="background: linear-gradient(135deg, #ff7e5f, #feb47b);">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>
      </div>
      <span>Warmth</span>
    </button>
  `;

  const textTemplatesHtml = `
    <button class="tool-item" id="addCustomTextBtn" style="grid-column: 1/-1; padding: 12px; display: flex; align-items: center; justify-content: center; gap: 8px; background: rgba(255,255,255,0.05); border: 1px dashed rgba(255,255,255,0.2); border-radius: 8px; cursor: pointer; color: white; margin-bottom: 10px;">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
      <span style="font-size: 16px; font-weight: bold;">A</span> Add Custom Text
    </button>
    <button class="tool-item media-draggable" draggable="true" data-type="text" data-bg="linear-gradient(90deg, #ff0055, #ffb547)" data-font="Impact, sans-serif">
      <div class="tool-item-icon" style="background: linear-gradient(135deg, #ff0055, #ffb547);">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
      </div>
      <span>Title</span>
    </button>
    <button class="tool-item media-draggable" draggable="true" data-type="text" data-bg="linear-gradient(90deg, #00f2ea, #4facfe)" data-font="Arial, sans-serif">
      <div class="tool-item-icon" style="background: linear-gradient(135deg, #00f2ea, #4facfe);">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
      </div>
      <span>Subtitle</span>
    </button>
    <button class="tool-item media-draggable" draggable="true" data-type="text" data-bg="linear-gradient(90deg, #b02e0c, #ff7e5f)" data-font="'Comic Sans MS', cursive">
      <div class="tool-item-icon" style="background: linear-gradient(135deg, #b02e0c, #ff7e5f);">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
      </div>
      <span>Fun Text</span>
    </button>
    <button class="tool-item media-draggable" draggable="true" data-type="text" data-bg="linear-gradient(90deg, #1c3144, #596f62)" data-font="Georgia, serif">
      <div class="tool-item-icon" style="background: linear-gradient(135deg, #1c3144, #596f62);">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
      </div>
      <span>Quote</span>
    </button>
    <button class="tool-item media-draggable" draggable="true" data-type="text" data-bg="linear-gradient(90deg, #30cfd0, #330867)" data-font="'Courier New', monospace">
      <div class="tool-item-icon" style="background: linear-gradient(135deg, #30cfd0, #330867);">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
      </div>
      <span>Code</span>
    </button>
    <button class="tool-item media-draggable" draggable="true" data-type="text" data-bg="linear-gradient(90deg, #f093fb, #f5576c)" data-font="'Brush Script MT', cursive">
      <div class="tool-item-icon" style="background: linear-gradient(135deg, #f093fb, #f5576c);">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
      </div>
      <span>Neon</span>
    </button>
  `;

  const transitionsHtml = `
    <button class="tool-item transition-tool" data-transition="fade">
      <div class="tool-item-icon" style="background: linear-gradient(135deg, #111, #444);">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12H2 M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
      </div>
      <span>Fade</span>
    </button>
    <button class="tool-item transition-tool" data-transition="crossfade">
      <div class="tool-item-icon" style="background: linear-gradient(135deg, #30cfd0, #330867);">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2 M15 2l-3 3 3 3 M9 22l3-3-3-3"/></svg>
      </div>
      <span>Crossfade</span>
    </button>
    <button class="tool-item transition-tool" data-transition="wipe">
      <div class="tool-item-icon" style="background: linear-gradient(135deg, #00f2ea, #4facfe);">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="12" x2="21" y2="12"/></svg>
      </div>
      <span>Wipe</span>
    </button>
    <button class="tool-item transition-tool" data-transition="slide">
      <div class="tool-item-icon" style="background: linear-gradient(135deg, #ff7e5f, #feb47b);">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><polyline points="11 8 15 12 11 16"/><line x1="8" y1="12" x2="15" y2="12"/></svg>
      </div>
      <span>Slide</span>
    </button>
    <button class="tool-item transition-tool" data-transition="zoom">
      <div class="tool-item-icon" style="background: linear-gradient(135deg, #ff0055, #ffb547);">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
      </div>
      <span>Zoom</span>
    </button>
    <button class="tool-item transition-tool" data-transition="dissolve">
      <div class="tool-item-icon" style="background: linear-gradient(135deg, #7c5cff, #a78bfa);">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4 M12 18v4 M4.93 4.93l2.83 2.83 M16.24 16.24l2.83 2.83 M2 12h4 M18 12h4 M4.93 19.07l2.83-2.83 M16.24 7.76l2.83-2.83"/></svg>
      </div>
      <span>Dissolve</span>
    </button>
  `;

  const stickersHtml = `
    <button class="tool-item media-draggable" draggable="true" data-type="sticker" data-bg="linear-gradient(90deg, #ff9a9e, #fecfef)" data-font="Arial">
      <div class="tool-item-icon" style="background: linear-gradient(135deg, #ff9a9e, #fecfef); font-size: 24px;">🔥</div>
      <span>Fire</span>
    </button>
    <button class="tool-item media-draggable" draggable="true" data-type="sticker" data-bg="linear-gradient(90deg, #ff0844, #ffb199)" data-font="Arial">
      <div class="tool-item-icon" style="background: linear-gradient(135deg, #ff0844, #ffb199); font-size: 24px;">❤️</div>
      <span>Heart</span>
    </button>
    <button class="tool-item media-draggable" draggable="true" data-type="sticker" data-bg="linear-gradient(90deg, #f6d365, #fda085)" data-font="Arial">
      <div class="tool-item-icon" style="background: linear-gradient(135deg, #f6d365, #fda085); font-size: 24px;">✨</div>
      <span>Sparkles</span>
    </button>
    <button class="tool-item media-draggable" draggable="true" data-type="sticker" data-bg="linear-gradient(90deg, #84fab0, #8fd3f4)" data-font="Arial">
      <div class="tool-item-icon" style="background: linear-gradient(135deg, #84fab0, #8fd3f4); font-size: 24px;">😂</div>
      <span>Laugh</span>
    </button>
    <button class="tool-item media-draggable" draggable="true" data-type="sticker" data-bg="linear-gradient(90deg, #a18cd1, #fbc2eb)" data-font="Arial">
      <div class="tool-item-icon" style="background: linear-gradient(135deg, #a18cd1, #fbc2eb); font-size: 24px;">😲</div>
      <span>Wow</span>
    </button>
    <button class="tool-item media-draggable" draggable="true" data-type="sticker" data-bg="linear-gradient(90deg, #fccb90, #d57eeb)" data-font="Arial">
      <div class="tool-item-icon" style="background: linear-gradient(135deg, #fccb90, #d57eeb); font-size: 24px;">⭐</div>
      <span>Star</span>
    </button>
  `;

  const effectsHtml = `
    <button class="tool-item effect-tool" data-effect="glitch">
      <div class="tool-item-icon" style="background: linear-gradient(135deg, #f093fb, #f5576c);">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4 M2 14h20 M2 10h20 M6 18h4"/></svg>
      </div>
      <span>Glitch</span>
    </button>
    <button class="tool-item effect-tool" data-effect="vhs">
      <div class="tool-item-icon" style="background: linear-gradient(135deg, #1c3144, #596f62);">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
      </div>
      <span>VHS</span>
    </button>
    <button class="tool-item effect-tool" data-effect="shake">
      <div class="tool-item-icon" style="background: linear-gradient(135deg, #ff0844, #ffb199);">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
      </div>
      <span>Shake</span>
    </button>
    <button class="tool-item effect-tool" data-effect="neon">
      <div class="tool-item-icon" style="background: linear-gradient(135deg, #30cfd0, #330867);">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4 M12 18v4 M4.93 4.93l2.83 2.83 M16.24 16.24l2.83 2.83 M2 12h4 M18 12h4 M4.93 19.07l2.83-2.83 M16.24 7.76l2.83-2.83"/></svg>
      </div>
      <span>Neon Glow</span>
    </button>
    <button class="tool-item effect-tool" data-effect="pixelate">
      <div class="tool-item-icon" style="background: linear-gradient(135deg, #00f2ea, #4facfe);">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
      </div>
      <span>Pixelate</span>
    </button>
    <button class="tool-item effect-tool" data-effect="rainbow">
      <div class="tool-item-icon" style="background: linear-gradient(135deg, #f6d365, #fda085);">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 17a10 10 0 0 0-20 0 M17 17a5 5 0 0 0-10 0 M12 17v-8"/></svg>
      </div>
      <span>Rainbow</span>
    </button>
  `;

  const audioHtml = `
    <div style="grid-column: 1/-1; display: flex; flex-direction: column; gap: 10px; background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; border: 1px dashed rgba(255,255,255,0.2); margin-bottom: 5px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="color: white; font-size: 14px; font-weight: 500;">Voiceover</span>
        <div id="micTime" style="color: #ff5c6e; font-size: 12px; font-variant-numeric: tabular-nums;">00:00</div>
      </div>
      <div style="display: flex; gap: 10px; justify-content: center;">
        <button id="micRecordBtn" style="width: 40px; height: 40px; border-radius: 50%; background: #ff5c6e; border: none; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center;">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>
        </button>
        <button id="micPauseBtn" disabled style="width: 40px; height: 40px; border-radius: 50%; background: #444; border: none; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0.5;">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        </button>
        <button id="micStopBtn" disabled style="width: 40px; height: 40px; border-radius: 50%; background: #444; border: none; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0.5;">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" stroke="none"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
        </button>
      </div>
    </div>
    <button class="tool-item" id="audioImportBtn" style="grid-column: 1/-1; margin-bottom: 15px; padding: 15px; display: flex; align-items: center; justify-content: center; gap: 10px; background: rgba(255,255,255,0.05); border: 1px dashed rgba(255,255,255,0.2); border-radius: 12px; cursor: pointer; color: white;">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
      Import Audio File
    </button>
    <button class="tool-item media-draggable" draggable="true" data-type="audio" data-bg="linear-gradient(90deg, #ffb547, #ff5c6e)">
      <div class="tool-item-icon" style="background: linear-gradient(135deg, #ffb547, #ff5c6e);">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
      </div>
      <span>Lo-Fi Beat</span>
    </button>
    <button class="tool-item media-draggable" draggable="true" data-type="audio" data-bg="linear-gradient(90deg, #ffb547, #ff5c6e)">
      <div class="tool-item-icon" style="background: linear-gradient(135deg, #ffb547, #ff5c6e);">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
      </div>
      <span>Pop Track</span>
    </button>
  `;

  // Tool tabs
  document.querySelectorAll('.tool-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tool-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const tabName = tab.textContent;
      
      if (toolsGrid) {
        if (tabName === 'Filters') {
          toolsGrid.innerHTML = filtersHtml;
        } else if (tabName === 'Text') {
          toolsGrid.innerHTML = textTemplatesHtml;
          const addCustomTextBtn = document.getElementById('addCustomTextBtn');
          if (addCustomTextBtn) {
            addCustomTextBtn.addEventListener('click', (ev) => {
              ev.stopPropagation();
              let textModal = document.getElementById('customTextModal');
              if (!textModal) {
                 textModal = document.createElement('div');
                 textModal.id = 'customTextModal';
                 textModal.style.position = 'fixed';
                 textModal.style.top = '0';
                 textModal.style.left = '0';
                 textModal.style.width = '100vw';
                 textModal.style.height = '100vh';
                 textModal.style.backgroundColor = 'rgba(0,0,0,0.8)';
                 textModal.style.zIndex = '9999';
                 textModal.style.display = 'flex';
                 textModal.style.alignItems = 'center';
                 textModal.style.justifyContent = 'center';
                 
                 const modalContent = document.createElement('div');
                 modalContent.style.background = '#1a1a2e';
                 modalContent.style.padding = '20px';
                 modalContent.style.borderRadius = '12px';
                 modalContent.style.width = '80%';
                 modalContent.style.maxWidth = '400px';
                 modalContent.style.display = 'flex';
                 modalContent.style.flexDirection = 'column';
                 modalContent.style.gap = '15px';
                 
                 const title = document.createElement('h3');
                 title.textContent = 'Add Text';
                 title.style.margin = '0';
                 title.style.color = '#fff';
                 
                 const textInput = document.createElement('textarea');
                 textInput.placeholder = 'Enter your text...';
                 textInput.style.width = '100%';
                 textInput.style.height = '80px';
                 textInput.style.padding = '10px';
                 textInput.style.borderRadius = '8px';
                 textInput.style.border = '1px solid rgba(255,255,255,0.2)';
                 textInput.style.background = 'rgba(0,0,0,0.5)';
                 textInput.style.color = '#fff';
                 
                 const fontSelect = document.createElement('select');
                 fontSelect.style.width = '100%';
                 fontSelect.style.padding = '10px';
                 fontSelect.style.borderRadius = '8px';
                 fontSelect.style.border = '1px solid rgba(255,255,255,0.2)';
                 fontSelect.style.background = 'rgba(0,0,0,0.5)';
                 fontSelect.style.color = '#fff';
                 const fonts = ['Arial, sans-serif', 'Impact, sans-serif', 'Georgia, serif', 'Courier New, monospace', 'Comic Sans MS, cursive', 'Verdana, sans-serif'];
                 fonts.forEach(f => {
                   const opt = document.createElement('option');
                   opt.value = f;
                   opt.textContent = f.split(',')[0];
                   fontSelect.appendChild(opt);
                 });
                 
                 const btnRow = document.createElement('div');
                 btnRow.style.display = 'flex';
                 btnRow.style.justifyContent = 'flex-end';
                 btnRow.style.gap = '10px';
                 
                 const cancelBtn = document.createElement('button');
                 cancelBtn.textContent = 'Cancel';
                 cancelBtn.style.padding = '8px 15px';
                 cancelBtn.style.background = 'transparent';
                 cancelBtn.style.border = '1px solid rgba(255,255,255,0.3)';
                 cancelBtn.style.color = 'white';
                 cancelBtn.style.borderRadius = '6px';
                 
                 const addBtn = document.createElement('button');
                 addBtn.textContent = 'Add to Canvas';
                 addBtn.style.padding = '8px 15px';
                 addBtn.style.background = '#3ddc97';
                 addBtn.style.border = 'none';
                 addBtn.style.color = 'white';
                 addBtn.style.borderRadius = '6px';
                 
                 cancelBtn.onclick = () => textModal.style.display = 'none';
                 addBtn.onclick = () => {
                   const val = textInput.value.trim();
                   if (val) {
                      const timelineTracks = document.querySelector('.timeline-tracks');
                      if (timelineTracks) {
                         const tracks = timelineTracks.querySelectorAll('.track');
                         const targetTrack = tracks[2]; // Text track
                         if (targetTrack) {
                           const clip = document.createElement('div');
                           clip.className = 'track-clip';
                           clip.style.left = (typeof playheadPos !== 'undefined' ? playheadPos : 0) + '%';
                           clip.style.width = '20%';
                           clip.style.background = 'linear-gradient(90deg, #ff0055, #ffb547)';
                           clip.dataset.type = 'text';
                           clip.dataset.font = fontSelect.value;
                           clip.textContent = val;
                           targetTrack.appendChild(clip);
                           clip.addEventListener('click', (ev2) => {
                              if (typeof selectClip === 'function') selectClip(ev2.currentTarget);
                           });
                           clip.addEventListener('dblclick', (e) => {
                             e.stopPropagation();
                             const newText = prompt('Edit Text Template:', clip.textContent.replace(/^(Text:\s*|🎵\s*)/i, ''));
                             if (newText !== null && newText.trim() !== '') {
                               clip.textContent = newText;
                               if (typeof updateVisuals === 'function') updateVisuals();
                               if (typeof saveState === 'function') saveState();
                             }
                           });
                           if (typeof selectClip === 'function') selectClip(clip);
                           if (typeof makeClipDraggable === 'function') makeClipDraggable(clip);
                           if (typeof updateVisuals === 'function') updateVisuals();
                           if (typeof saveState === 'function') saveState();
                           showToast('Text added to canvas');
                         }
                      }
                      textModal.style.display = 'none';
                      textInput.value = '';
                   }
                 };
                 
                 btnRow.appendChild(cancelBtn);
                 btnRow.appendChild(addBtn);
                 
                 modalContent.appendChild(title);
                 modalContent.appendChild(textInput);
                 modalContent.appendChild(fontSelect);
                 modalContent.appendChild(btnRow);
                 textModal.appendChild(modalContent);
                 document.body.appendChild(textModal);
              }
              textModal.style.display = 'flex';
            });
          }
        } else if (tabName === 'Transitions') {
          toolsGrid.innerHTML = transitionsHtml;
        } else if (tabName === 'Stickers') {
          toolsGrid.innerHTML = stickersHtml;
        } else if (tabName === 'Effects') {
          toolsGrid.innerHTML = effectsHtml;
        } else if (tabName === 'Audio') {
          toolsGrid.innerHTML = audioHtml;
          const importBtn = document.getElementById('audioImportBtn');
          if (importBtn) {
            importBtn.addEventListener('click', (ev) => {
               ev.stopPropagation(); // Prevent toolsGrid click listener from firing
               let audioInput = document.getElementById('audioImportInput');
               if (!audioInput) {
                 audioInput = document.createElement('input');
                 audioInput.type = 'file';
                 audioInput.id = 'audioImportInput';
                 audioInput.accept = 'audio/*';
                 audioInput.multiple = true;
                 audioInput.style.display = 'none';
                 document.body.appendChild(audioInput);
                 audioInput.addEventListener('change', (e) => {
                   const files = Array.from(e.target.files);
                   if (files.length > 0) {
                     files.forEach(file => {
                       const item = document.createElement('button');
                       item.className = 'tool-item media-draggable';
                       item.draggable = true;
                       item.dataset.type = 'audio';
                       item.dataset.bg = 'linear-gradient(90deg, #ffb547, #ff5c6e)';
                       item.innerHTML = `
                         <div class="tool-item-icon" style="background: linear-gradient(135deg, #ffb547, #ff5c6e);">
                           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                         </div>
                         <span style="font-size:9px; overflow:hidden; text-overflow:ellipsis; max-width:100%; display:block; white-space:nowrap;" title="${file.name}">${file.name}</span>
                       `;
                       importBtn.insertAdjacentElement('afterend', item);
                     });
                     showToast(`Imported ${files.length} audio file(s)!`);
                   }
                   audioInput.value = '';
                 });
               }
               audioInput.click();
            });
          }

          const recordBtn = document.getElementById('micRecordBtn');
          const pauseBtn = document.getElementById('micPauseBtn');
          const stopBtn = document.getElementById('micStopBtn');
          const timeDisplay = document.getElementById('micTime');
          
          if (recordBtn && pauseBtn && stopBtn) {
            const updateTimer = () => {
               recordSeconds++;
               const mins = Math.floor(recordSeconds / 60).toString().padStart(2, '0');
               const secs = (recordSeconds % 60).toString().padStart(2, '0');
               if (timeDisplay) timeDisplay.textContent = `${mins}:${secs}`;
            };

            recordBtn.addEventListener('click', async (ev) => {
               ev.stopPropagation();
               if (!mediaRecorder || mediaRecorder.state === 'inactive') {
                  try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    mediaRecorder = new MediaRecorder(stream);
                    audioChunks = [];
                    
                    mediaRecorder.ondataavailable = e => {
                      if (e.data.size > 0) audioChunks.push(e.data);
                    };
                    
                    mediaRecorder.onstop = () => {
                      clearInterval(recordTimer);
                      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                      
                      const timelineTracks = document.querySelector('.timeline-tracks');
                      if (timelineTracks) {
                         const tracks = timelineTracks.querySelectorAll('.track');
                         const targetTrack = tracks[1]; 
                         if (targetTrack) {
                           const clip = document.createElement('div');
                           clip.className = 'track-clip';
                           clip.style.left = (typeof playheadPos !== 'undefined' ? playheadPos : 0) + '%';
                           clip.style.width = '20%';
                           clip.style.background = 'linear-gradient(90deg, #ffb547, #ff5c6e)';
                           clip.dataset.type = 'audio';
                           clip.textContent = '🎵 Voiceover ' + Math.floor(Math.random() * 100);
                           targetTrack.appendChild(clip);
                           clip.addEventListener('click', (ev2) => {
                              if (typeof selectClip === 'function') selectClip(ev2.currentTarget);
                           });
                           if (typeof selectClip === 'function') selectClip(clip);
                           if (typeof makeClipDraggable === 'function') makeClipDraggable(clip);
                           showToast('Voiceover added to timeline');
                         }
                      }
                      
                      recordBtn.style.background = '#ff5c6e';
                      recordBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>';
                      pauseBtn.disabled = true;
                      pauseBtn.style.opacity = '0.5';
                      pauseBtn.style.background = '#444';
                      pauseBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
                      stopBtn.disabled = true;
                      stopBtn.style.opacity = '0.5';
                      if (timeDisplay) timeDisplay.textContent = '00:00';
                      recordSeconds = 0;
                    };
                    
                    mediaRecorder.start();
                    recordSeconds = 0;
                    recordTimer = setInterval(updateTimer, 1000);
                    
                    recordBtn.style.background = '#3ddc97';
                    recordBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>';
                    pauseBtn.disabled = false;
                    pauseBtn.style.opacity = '1';
                    stopBtn.disabled = false;
                    stopBtn.style.opacity = '1';
                    
                  } catch (err) {
                    showToast('Microphone access denied');
                    console.error(err);
                  }
               }
            });
            
            pauseBtn.addEventListener('click', (ev) => {
               ev.stopPropagation();
               if (mediaRecorder && mediaRecorder.state === 'recording') {
                  mediaRecorder.pause();
                  clearInterval(recordTimer);
                  pauseBtn.style.background = '#ffb547'; 
                  pauseBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
               } else if (mediaRecorder && mediaRecorder.state === 'paused') {
                  mediaRecorder.resume();
                  recordTimer = setInterval(updateTimer, 1000);
                  pauseBtn.style.background = '#444';
                  pauseBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
               }
            });
            
            stopBtn.addEventListener('click', (ev) => {
               ev.stopPropagation();
               if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                  mediaRecorder.stop();
                  mediaRecorder.stream.getTracks().forEach(track => track.stop());
               }
            });
          }

        } else {
          toolsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 20px; color: var(--text-muted); font-size: 13px;">${tabName} coming soon!</div>`;
        }
      }
    });
  });

  // Initialize active tab
  const activeTab = document.querySelector('.tool-tab.active');
  if (activeTab) {
    activeTab.click();
  }

  // Tool items (Click to insert)
  if (toolsGrid) {
    toolsGrid.addEventListener('click', (e) => {
      const item = e.target.closest('.tool-item');
      if (!item) return;

      if (item.classList.contains('media-draggable')) {
        const type = item.dataset.type;
        const bg = item.dataset.bg;
        const text = item.querySelector('span').textContent;
        
        const timelineTracks = document.querySelector('.timeline-tracks');
        if (!timelineTracks) return;
        
        const tracks = timelineTracks.querySelectorAll('.track');
        let trackIndex = (type === 'text' || type === 'sticker') ? 2 : type === 'audio' ? 1 : 0;
        if (trackIndex >= tracks.length) trackIndex = tracks.length - 1;
        
        const targetTrack = tracks[trackIndex];
        const clipWidth = 20; // Default width percentage
        
        // Ensure playheadPos is defined (fallback to 0)
        const currentPlayhead = typeof playheadPos !== 'undefined' ? playheadPos : 0;
        const leftPercent = currentPlayhead;
        
        // Check for overlaps
        let hasOverlap = false;
        const existingClips = targetTrack.querySelectorAll('.track-clip');
        existingClips.forEach(c => {
          const cLeft = parseFloat(c.style.left || '0');
          const cWidth = parseFloat(c.style.width || '10');
          if (leftPercent < cLeft + cWidth && leftPercent + clipWidth > cLeft) {
            hasOverlap = true;
          }
        });
        
        if (hasOverlap) {
          showToast('Cannot insert here: Space occupied');
          return;
        }
        
        const clip = document.createElement('div');
        clip.className = 'track-clip';
        clip.style.left = leftPercent + '%';
        clip.style.width = clipWidth + '%';
        clip.style.background = bg || 'linear-gradient(90deg, #10b981, #3ddc97)';
        clip.dataset.type = type;
        if (item.dataset.font) {
          clip.dataset.font = item.dataset.font;
        }
        
        if (type === 'audio') {
          clip.textContent = '🎵 ' + text;
        } else if (type === 'text') {
          clip.textContent = text;
        } else if (type === 'sticker') {
          const iconEl = item.querySelector('.tool-item-icon');
          clip.textContent = iconEl ? iconEl.textContent.trim() : '✨';
          clip.style.fontSize = '24px';
          clip.style.textAlign = 'center';
          clip.style.lineHeight = '28px';
        } else {
          clip.textContent = text;
        }
        
        targetTrack.appendChild(clip);
        
        clip.addEventListener('click', (ev) => {
          selectClip(ev.currentTarget);
        });
        selectClip(clip);
        if (typeof makeClipDraggable === 'function') makeClipDraggable(clip);
        
        if (typeof saveState === 'function') saveState();
        if (typeof updateVisuals === 'function') updateVisuals();
        showToast(`Added ${text}`);
      } else {
        const toolName = item.querySelector('span').textContent;
        if (item.classList.contains('filter-tool')) {
           const filterStr = item.dataset.filter;
           const previewCanvas = document.querySelector('.preview-canvas');
           if (previewCanvas) {
             previewCanvas.style.transition = 'filter 0.4s ease';
             previewCanvas.style.filter = filterStr;
           }
           showToast(`Applied ${toolName}`);
        } else if (item.classList.contains('transition-tool')) {
           showToast(`Added ${toolName} Transition`);
           
           const previewCanvas = document.querySelector('.preview-canvas');
           if (previewCanvas) {
             previewCanvas.style.animation = 'none';
             void previewCanvas.offsetWidth; // Force reflow
             
             if (toolName === 'Fade') {
                previewCanvas.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1000 });
             } else if (toolName === 'Wipe') {
                previewCanvas.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 800 });
             } else if (toolName === 'Slide') {
                previewCanvas.animate([{ transform: 'translateX(100%)' }, { transform: 'translateX(0)' }], { duration: 800 });
             } else if (toolName === 'Zoom') {
                previewCanvas.animate([{ transform: 'scale(0.5)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 800 });
             } else if (toolName === 'Dissolve') {
                previewCanvas.animate([{ filter: 'blur(10px)', opacity: 0 }, { filter: 'blur(0)', opacity: 1 }], { duration: 1000 });
             } else if (toolName === 'Crossfade') {
                previewCanvas.animate([{ opacity: 0.5, filter: 'contrast(0.5)' }, { opacity: 1, filter: 'contrast(1)' }], { duration: 1000 });
              }
           }
        } else if (item.classList.contains('effect-tool')) {
           showToast(`Applying ${toolName} Effect`);
           
           const previewCanvas = document.querySelector('.preview-canvas');
           if (previewCanvas) {
             previewCanvas.style.animation = 'none';
             void previewCanvas.offsetWidth; // Force reflow
             
             if (toolName === 'Glitch') {
                previewCanvas.animate([
                  { transform: 'translate(0)', filter: 'hue-rotate(0deg)' },
                  { transform: 'translate(-5px, 5px)', filter: 'hue-rotate(90deg)' },
                  { transform: 'translate(5px, -5px)', filter: 'hue-rotate(-90deg)' },
                  { transform: 'translate(0)', filter: 'hue-rotate(0deg)' }
                ], { duration: 300, iterations: 3 });
             } else if (toolName === 'VHS') {
                previewCanvas.animate([
                  { filter: 'contrast(1.5) saturate(0.5) hue-rotate(10deg)', transform: 'skewX(0deg)' },
                  { filter: 'contrast(1.5) saturate(0.5) hue-rotate(10deg)', transform: 'skewX(2deg)' },
                  { filter: 'contrast(1.5) saturate(0.5) hue-rotate(10deg)', transform: 'skewX(-2deg)' },
                  { filter: 'contrast(1.5) saturate(0.5) hue-rotate(10deg)', transform: 'skewX(0deg)' }
                ], { duration: 200, iterations: 10 });
             } else if (toolName === 'Shake') {
                previewCanvas.animate([
                  { transform: 'translate(0)' },
                  { transform: 'translate(-10px, -10px)' },
                  { transform: 'translate(10px, 10px)' },
                  { transform: 'translate(-10px, 10px)' },
                  { transform: 'translate(10px, -10px)' },
                  { transform: 'translate(0)' }
                ], { duration: 400, iterations: 2 });
             } else if (toolName === 'Neon Glow') {
                previewCanvas.animate([
                  { filter: 'drop-shadow(0 0 10px #f093fb) brightness(1.2)' },
                  { filter: 'drop-shadow(0 0 20px #f093fb) brightness(1.5)' },
                  { filter: 'drop-shadow(0 0 10px #f093fb) brightness(1.2)' }
                ], { duration: 1000, iterations: 2 });
             } else if (toolName === 'Pixelate') {
                previewCanvas.animate([
                  { filter: 'blur(0px)' },
                  { filter: 'blur(10px)' },
                  { filter: 'blur(5px)' }
                ], { duration: 1000, iterations: 1 });
             } else if (toolName === 'Rainbow') {
                previewCanvas.animate([
                  { filter: 'hue-rotate(0deg)' },
                  { filter: 'hue-rotate(360deg)' }
                ], { duration: 2000, iterations: 2 });
             }
           }
        } else {
           showToast(`Applying ${toolName}...`);
        }
      }
    });
  }

  // Templates
  document.querySelectorAll('.template').forEach(t => {
    t.addEventListener('click', () => {
      const name = t.querySelector('.template-name').textContent;
      showToast(`Loading template: ${name}`);
      setTimeout(() => switchView('editor'), 800);
    });
  });

  // Section links
  document.querySelectorAll('.section-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Opening all items...');
    });
  });

  // Header buttons (Notifications, Profile)
  document.querySelectorAll('.header .icon-btn:not(#themeToggle)').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast(`Opening ${btn.title || 'menu'}...`);
    });
  });

  // Export Modal Logic
  const exportBtn = document.getElementById('exportBtn');
  const exportModal = document.getElementById('exportModal');
  const closeExportBtn = document.getElementById('closeExportBtn');
  const confirmExportBtn = document.getElementById('confirmExportBtn');
  const exportQuality = document.getElementById('exportQuality');
  const qualityVal = document.getElementById('qualityVal');

  if (exportBtn && exportModal) {
    exportBtn.addEventListener('click', () => {
      exportModal.classList.add('show');
    });

    closeExportBtn.addEventListener('click', () => {
      exportModal.classList.remove('show');
    });

    exportModal.addEventListener('click', (e) => {
      if (e.target === exportModal) {
        exportModal.classList.remove('show');
      }
    });

    if (exportQuality && qualityVal) {
      exportQuality.addEventListener('input', (e) => {
        qualityVal.textContent = `${e.target.value}%`;
      });
    }

    if (confirmExportBtn) {
      confirmExportBtn.addEventListener('click', () => {
        const format = document.getElementById('exportFormat').value;
        const res = document.getElementById('exportResolution').value;
        const fps = document.getElementById('exportFps').value;
        const qual = exportQuality.value;
        
        exportModal.classList.remove('show');
        showToast(`Exporting ${res} ${fps}FPS ${format.toUpperCase()} at ${qual}% Quality...`);
        
        setTimeout(() => {
          showToast('✅ Export Complete! Video saved.');
          
          // Generate a dummy file blob and trigger download
          const dummyVideoContent = `Simulated video content for Project Export\nResolution: ${res}\nFrame Rate: ${fps}fps\nQuality: ${qual}%\nFormat: ${format.toUpperCase()}`;
          const blob = new Blob([dummyVideoContent], { type: format === 'gif' ? 'image/gif' : `video/${format}` });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `Project_Export_${res}_${fps}fps.${format}`;
          document.body.appendChild(a);
          a.click();
          
          // Cleanup
          setTimeout(() => {
             document.body.removeChild(a);
             window.URL.revokeObjectURL(url);
          }, 100);
          
        }, 2000); // Fast export
      });
    }
  }

  // Project more options
  document.querySelectorAll('.project-more').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      showToast('Opening project options...');
    });
  });

  // Timeline tools
  document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast(`${btn.title} action applied`);
    });
  });
  
  let selectedClip = null;
  // Track clip selection
  function selectClip(clip) {
    document.querySelectorAll('.track-clip').forEach(c => c.style.outline = 'none');
    if (clip) {
      clip.style.outline = '2px solid #fff';
      clip.style.outlineOffset = '1px';
      selectedClip = clip;
    } else {
      selectedClip = null;
    }
  }

  function makeClipDraggable(clip) {
    const startClipDrag = (e) => {
      e.stopPropagation();
      selectClip(clip);
      
      const track = clip.parentElement;
      const trackRect = track.getBoundingClientRect();
      const clipRect = clip.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const startX = clientX;
      
      const offsetX = clientX - clipRect.left;
      const handleWidth = 15;
      const isResizingLeft = offsetX <= handleWidth;
      const isResizingRight = offsetX >= clipRect.width - handleWidth;
      
      const initialLeftPct = parseFloat(clip.style.left || '0');
      const initialWidthPct = parseFloat(clip.style.width || '10');

      // Calculate boundaries to prevent overlap
      let minLeft = 0;
      let maxRight = 100;
      
      const siblingClips = Array.from(track.querySelectorAll('.track-clip')).filter(c => c !== clip);
      siblingClips.forEach(sibling => {
        const sLeft = parseFloat(sibling.style.left || '0');
        const sWidth = parseFloat(sibling.style.width || '10');
        const sRight = sLeft + sWidth;
        
        if (sLeft < initialLeftPct) {
          if (sRight > minLeft) minLeft = sRight;
        } else {
          if (sLeft < maxRight) maxRight = sLeft;
        }
      });

      const onMove = (moveEvent) => {
        moveEvent.stopPropagation();
        const moveClientX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
        const deltaX = moveClientX - startX;
        const deltaPct = (deltaX / trackRect.width) * 100;
        
        if (isResizingLeft) {
          let newLeftPct = initialLeftPct + deltaPct;
          newLeftPct = Math.max(minLeft, Math.min(initialLeftPct + initialWidthPct - 2, newLeftPct)); // Min width 2%
          const newWidthPct = (initialLeftPct + initialWidthPct) - newLeftPct;
          clip.style.left = newLeftPct + '%';
          clip.style.width = newWidthPct + '%';
        } else if (isResizingRight) {
          let newWidthPct = initialWidthPct + deltaPct;
          newWidthPct = Math.max(2, Math.min(maxRight - initialLeftPct, newWidthPct)); // Min width 2%
          clip.style.width = newWidthPct + '%';
        } else {
          // Moving
          let newLeftPct = initialLeftPct + deltaPct;
          newLeftPct = Math.max(minLeft, Math.min(maxRight - initialWidthPct, newLeftPct));
          clip.style.left = newLeftPct + '%';
        }
        
        if (typeof updateVisuals === 'function') updateVisuals();
      };

      const onUp = (upEvent) => {
        if(upEvent) upEvent.stopPropagation();
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onUp);
        if (typeof saveState === 'function') saveState();
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onUp);
    };

    clip.addEventListener('mousedown', startClipDrag);
    clip.addEventListener('touchstart', startClipDrag, { passive: false });
    
    // Double click to edit text
    clip.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      const content = clip.textContent.toLowerCase();
      if (clip.dataset.type === 'text' || content.includes('text') || content.includes('title') || content.includes('cta')) {
        const currentText = clip.textContent.replace(/^(Text:\s*|🎵\s*)/i, '');
        const newText = prompt('Edit Text Template:', currentText);
        if (newText !== null && newText.trim() !== '') {
          clip.textContent = newText;
          if (typeof updateVisuals === 'function') updateVisuals();
          if (typeof saveState === 'function') saveState();
        }
      }
    });
  }

  document.querySelectorAll('.track-clip').forEach(clip => {
    clip.addEventListener('click', (e) => selectClip(e.currentTarget));
    makeClipDraggable(clip);
  });

  // Delete clip functionality
  const deleteClipBtn = document.getElementById('deleteClipBtn');
  if (deleteClipBtn) {
    deleteClipBtn.addEventListener('click', () => {
      if (selectedClip) {
        selectedClip.remove();
        selectClip(null); // Clear selection
        if (typeof saveState === 'function') saveState();
        updateVisuals();
        showToast('Clip deleted');
      } else {
        showToast('Select a clip to delete');
      }
    });
  }

  // Keyboard delete support
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedClip) {
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        selectedClip.remove();
        selectClip(null);
        if (typeof saveState === 'function') saveState();
        updateVisuals();
        showToast('Clip deleted');
      }
    }
    // Undo / Redo Shortcuts
    if (e.ctrlKey && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (typeof undo === 'function') undo();
    }
    if (e.ctrlKey && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      if (typeof redo === 'function') redo();
    }
  });

  // Toast
  const toast = document.getElementById('toast');
  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
  }

  // Playhead animation and Video Preview Sync
  const playhead = document.querySelector('.timeline-playhead');
  const timelinePlayBtn = document.querySelector('.play-btn');
  const previewPlayBtn = document.querySelector('.preview-controls');
  const previewCanvas = document.querySelector('.preview-canvas');
  const timelineTracks = document.querySelector('.timeline-tracks');
  const timeDisplay = document.querySelector('.time-display');
  
  let playheadPos = 0; // Start at 0
  let playing = false;
  const totalDuration = 45; // seconds

  if (previewCanvas) {
    previewCanvas.style.backgroundSize = '200% 200%';
    previewCanvas.style.transition = 'none'; // Controlled by JS
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  let activeTextClipElement = null;

  function updateVisuals() {
    playhead.style.left = playheadPos + '%';
    if (timeDisplay) {
      const currentSeconds = (playheadPos / 100) * totalDuration;
      timeDisplay.textContent = `${formatTime(currentSeconds)} / ${formatTime(totalDuration)}`;
    }
    
    if (previewCanvas) {
      let activeVideoBg = '#0f0f14'; // Default empty background
      let activeTextHtml = '';
      let hasVideo = false;
      let newActiveTextClip = null;

      const tracks = document.querySelectorAll('.timeline-tracks .track');
      tracks.forEach((track, trackIdx) => {
        const clips = track.querySelectorAll('.track-clip');
        clips.forEach(clip => {
          const leftStr = clip.style.left || '0%';
          const widthStr = clip.style.width || '100%';
          const left = parseFloat(leftStr);
          const width = parseFloat(widthStr);
          
          if (playheadPos >= left && playheadPos <= left + width) {
            const content = clip.textContent.toLowerCase();
            const isVideo = content.includes('clip') || content.includes('video') || content.includes('image') || trackIdx === 0;
            const isText = content.includes('text') || content.includes('title') || clip.dataset.type === 'sticker' || trackIdx === 2;
            
            if (isVideo && !hasVideo) {
              activeVideoBg = clip.style.background || clip.style.backgroundColor;
              hasVideo = true;
            } else if (isText) {
              activeTextHtml = clip.textContent.replace(/^(Text:\s*|🎵\s*)/i, '');
              newActiveTextClip = clip;
            }
          }
        });
      });

      activeTextClipElement = newActiveTextClip;
      previewCanvas.style.background = activeVideoBg;
      
      const canvasTextEditor = document.getElementById('canvasTextEditor');
      const textEl = previewCanvas.querySelector('.preview-text');
      const fontTool = document.getElementById('fontTool');
      const fontSelect = document.getElementById('fontFamilySelect');
      
      if (canvasTextEditor && document.activeElement !== canvasTextEditor) {
        if (activeTextHtml) {
          canvasTextEditor.innerText = activeTextHtml;
          canvasTextEditor.style.fontFamily = activeTextClipElement.dataset.font || 'Inter';
          if (fontSelect) fontSelect.value = activeTextClipElement.dataset.font || 'Inter';
        }
      }
      
      if (textEl) {
        textEl.style.display = activeTextHtml ? 'block' : 'none';
        if (activeTextClipElement && activeTextClipElement.dataset.posX) {
           textEl.style.position = 'absolute';
           textEl.style.left = activeTextClipElement.dataset.posX + 'px';
           textEl.style.top = activeTextClipElement.dataset.posY + 'px';
           textEl.style.margin = '0';
           textEl.style.bottom = 'auto';
        } else {
           textEl.style.position = 'relative';
           textEl.style.left = 'auto';
           textEl.style.top = 'auto';
        }
      }
      if (fontTool) {
        fontTool.style.display = activeTextHtml ? 'flex' : 'none';
      }
    }
  }

  // Setup text editor events
  const canvasTextEditor = document.getElementById('canvasTextEditor');
  if (canvasTextEditor) {
    canvasTextEditor.addEventListener('input', (e) => {
      if (activeTextClipElement) {
        activeTextClipElement.textContent = e.target.innerText;
      }
    });
    canvasTextEditor.addEventListener('blur', () => {
      if (typeof saveState === 'function') saveState();
    });
  }

  const fontFamilySelect = document.getElementById('fontFamilySelect');
  if (fontFamilySelect) {
    fontFamilySelect.addEventListener('change', (e) => {
      if (activeTextClipElement) {
        activeTextClipElement.dataset.font = e.target.value;
        if (canvasTextEditor) canvasTextEditor.style.fontFamily = e.target.value;
        if (typeof saveState === 'function') saveState();
      }
    });
  }

  // Draggable text on canvas
  const previewTextElement = document.querySelector('.preview-text');
  const canvasElement = document.querySelector('.preview-canvas');
  if (previewTextElement && canvasElement) {
    let isDraggingText = false;
    let textDragStartX = 0;
    let textDragStartY = 0;
    let textInitialLeft = 0;
    let textInitialTop = 0;

    const startTextDrag = (e) => {
      if (e.target.tagName === 'H2' && document.activeElement === e.target) return; // Allow typing
      
      e.preventDefault();
      isDraggingText = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      textDragStartX = clientX;
      textDragStartY = clientY;

      if (window.getComputedStyle(previewTextElement).position !== 'absolute') {
         const rect = previewTextElement.getBoundingClientRect();
         const canvasRect = canvasElement.getBoundingClientRect();
         previewTextElement.style.position = 'absolute';
         previewTextElement.style.margin = '0';
         previewTextElement.style.left = (rect.left - canvasRect.left) + 'px';
         previewTextElement.style.top = (rect.top - canvasRect.top) + 'px';
         previewTextElement.style.bottom = 'auto';
      }
      
      textInitialLeft = parseFloat(previewTextElement.style.left || 0);
      textInitialTop = parseFloat(previewTextElement.style.top || 0);
      previewTextElement.style.cursor = 'grabbing';
    };

    const moveTextDrag = (e) => {
      if (!isDraggingText) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      
      const deltaX = clientX - textDragStartX;
      const deltaY = clientY - textDragStartY;
      
      let newLeft = textInitialLeft + deltaX;
      let newTop = textInitialTop + deltaY;
      
      const canvasRect = canvasElement.getBoundingClientRect();
      const textRect = previewTextElement.getBoundingClientRect();
      
      newLeft = Math.max(0, Math.min(canvasRect.width - textRect.width, newLeft));
      newTop = Math.max(0, Math.min(canvasRect.height - textRect.height, newTop));
      
      previewTextElement.style.left = newLeft + 'px';
      previewTextElement.style.top = newTop + 'px';
      
      if (activeTextClipElement) {
         activeTextClipElement.dataset.posX = newLeft;
         activeTextClipElement.dataset.posY = newTop;
      }
    };

    const endTextDrag = () => {
      if (isDraggingText) {
        isDraggingText = false;
        previewTextElement.style.cursor = 'grab';
        if (typeof saveState === 'function') saveState();
      }
    };

    previewTextElement.style.cursor = 'grab';
    previewTextElement.addEventListener('mousedown', startTextDrag);
    previewTextElement.addEventListener('touchstart', startTextDrag, { passive: false });
    
    document.addEventListener('mousemove', moveTextDrag);
    document.addEventListener('touchmove', moveTextDrag, { passive: false });
    
    document.addEventListener('mouseup', endTextDrag);
    document.addEventListener('touchend', endTextDrag);
  }

  function togglePlayback() {
    if (!playing && playheadPos >= 100) {
      playheadPos = 0; // Reset to start if playing from the end
    }
    
    playing = !playing;
    
    // Update timeline play button icon
    if (timelinePlayBtn) {
      timelinePlayBtn.querySelector('svg').innerHTML = playing
        ? '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>'
        : '<polygon points="5 3 19 12 5 21 5 3"/>';
    }
      
    // Update preview canvas play button icon
    if (previewPlayBtn) {
      previewPlayBtn.style.opacity = playing ? '0' : '1';
      previewPlayBtn.style.pointerEvents = playing ? 'none' : 'auto';
    }
    
    if (playing) {
      lastFrameTime = performance.now();
      requestAnimationFrame(animatePlayhead);
    }
  }
  
  let lastFrameTime = 0;
  function animatePlayhead(now) {
    if (!playing) return;
    
    const deltaMs = now - lastFrameTime;
    lastFrameTime = now;
    
    // Calculate percentage to move based on real time elapsed
    // 100% in 45 seconds -> (100 / 45000) % per millisecond
    const movePercent = (100 / (totalDuration * 1000)) * deltaMs;
    playheadPos += movePercent;
    
    if (playheadPos >= 100) {
      playheadPos = 100;
      updateVisuals();
      togglePlayback(); // Auto pause at end
      return;
    }
    
    updateVisuals();
    requestAnimationFrame(animatePlayhead);
  }

  // Scrubbing via clicking timeline or dragging playhead
  if (timelineTracks) {
    const handleScrubStart = (e) => {
      // Don't scrub if clicking on a tool or track clip (unless it's the playhead)
      if (e.target.classList.contains('track-clip') && e.target !== playhead) return;
      
      const rect = timelineTracks.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      let clickX = clientX - rect.left;
      playheadPos = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
      updateVisuals();
      
      const onMove = (moveEvent) => {
        const moveClientX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
        let moveX = moveClientX - rect.left;
        playheadPos = Math.max(0, Math.min(100, (moveX / rect.width) * 100));
        updateVisuals();
      };
      
      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onUp);
      };
      
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onUp);
    };

    timelineTracks.addEventListener('mousedown', handleScrubStart);
    timelineTracks.addEventListener('touchstart', handleScrubStart, { passive: false });
    
    // Explicitly allow dragging the playhead itself
    if (playhead) {
      playhead.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        handleScrubStart(e);
      });
      playhead.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        handleScrubStart(e);
      }, { passive: false });
    }
  }

  // Initial render
  updateVisuals();

  if (timelinePlayBtn) timelinePlayBtn.addEventListener('click', togglePlayback);
  if (previewPlayBtn) previewPlayBtn.addEventListener('click', togglePlayback);
  if (previewCanvas) previewCanvas.addEventListener('click', (e) => {
    if (e.target === previewCanvas || e.target.classList.contains('preview-overlay') || e.target.classList.contains('preview-text')) {
      togglePlayback();
    }
  });

  // Drag and Drop Logic with Event Delegation
  document.addEventListener('dragstart', (e) => {
    const item = e.target.closest('.media-draggable');
    if (!item) return;
    
    e.dataTransfer.setData('type', item.dataset.type);
    e.dataTransfer.setData('bg', item.dataset.bg);
    e.dataTransfer.setData('text', item.querySelector('span').textContent);
    
    if (item.dataset.type === 'sticker') {
      const iconEl = item.querySelector('.tool-item-icon');
      if (iconEl) e.dataTransfer.setData('emoji', iconEl.textContent.trim());
    }
    
    if (item.dataset.font) {
      e.dataTransfer.setData('font', item.dataset.font);
    }
  });

  if (timelineTracks) {
    timelineTracks.addEventListener('dragover', (e) => {
      e.preventDefault(); // Allow drop
    });

    timelineTracks.addEventListener('drop', (e) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('type');
      if (!type) return;

      const bg = e.dataTransfer.getData('bg');
      const text = e.dataTransfer.getData('text');
      const font = e.dataTransfer.getData('font');
      
      const rect = timelineTracks.getBoundingClientRect();
      const leftPercent = ((e.clientX - rect.left) / rect.width) * 100;
      
      const clip = document.createElement('div');
      clip.className = 'track-clip';
      clip.style.left = leftPercent + '%';
      clip.style.width = '20%'; // Default duration
      clip.style.background = bg || 'linear-gradient(90deg, #10b981, #3ddc97)';
      
      clip.dataset.type = type;
      if (font) {
        clip.dataset.font = font;
      }
      
      if (type === 'audio') {
        clip.textContent = '🎵 ' + text;
      } else if (type === 'text') {
        clip.textContent = text;
      } else if (type === 'sticker') {
        const emoji = e.dataTransfer.getData('emoji');
        clip.textContent = emoji || '✨';
        clip.style.fontSize = '24px';
        clip.style.textAlign = 'center';
        clip.style.lineHeight = '28px';
      } else {
        clip.textContent = text;
      }
      
      // Determine which track to append to
      const tracks = timelineTracks.querySelectorAll('.track');
      const trackHeight = rect.height / tracks.length;
      let trackIndex = Math.floor((e.clientY - rect.top) / trackHeight);
      if (trackIndex < 0) trackIndex = 0;
      if (trackIndex >= tracks.length) trackIndex = tracks.length - 1;
      
      const targetTrack = tracks[trackIndex];
      const clipWidth = 20; // Default width percentage
      
      // Check for overlaps
      let hasOverlap = false;
      const existingClips = targetTrack.querySelectorAll('.track-clip');
      existingClips.forEach(c => {
        const cLeft = parseFloat(c.style.left || '0');
        const cWidth = parseFloat(c.style.width || '10');
        
        if (leftPercent < cLeft + cWidth && leftPercent + clipWidth > cLeft) {
          hasOverlap = true;
        }
      });
      
      if (hasOverlap) {
        showToast('Cannot drop here: Space occupied');
        return;
      }
      
      targetTrack.appendChild(clip);
      
      // Select newly dropped clip
      clip.addEventListener('click', (ev) => {
        selectClip(ev.currentTarget);
      });
      selectClip(clip);
      makeClipDraggable(clip);
      
      if (typeof saveState === 'function') saveState();
      updateVisuals();
    });
  }

  // --- Undo / Redo / Split Logic ---
  let history = [];
  let historyIndex = -1;

  function saveState() {
    if (!timelineTracks) return;
    const state = Array.from(timelineTracks.querySelectorAll('.track')).map(t => t.innerHTML);
    if (historyIndex < history.length - 1) {
      history = history.slice(0, historyIndex + 1);
    }
    history.push(state);
    historyIndex++;
  }

  function restoreState(state) {
    if (!timelineTracks) return;
    const tracks = timelineTracks.querySelectorAll('.track');
    tracks.forEach((track, idx) => {
      if (state[idx] !== undefined) track.innerHTML = state[idx];
    });
    
    // Reattach listeners to new clips
    timelineTracks.querySelectorAll('.track-clip').forEach(clip => {
      clip.addEventListener('click', (e) => selectClip(e.currentTarget));
      makeClipDraggable(clip);
    });
    selectClip(null);
    updateVisuals();
  }

  function undo() {
    if (historyIndex > 0) {
      historyIndex--;
      restoreState(history[historyIndex]);
      showToast('Undo applied');
    } else {
      showToast('Nothing to undo');
    }
  }

  function redo() {
    if (historyIndex < history.length - 1) {
      historyIndex++;
      restoreState(history[historyIndex]);
      showToast('Redo applied');
    } else {
      showToast('Nothing to redo');
    }
  }

  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');
  const splitBtn = document.getElementById('splitBtn');

  if (undoBtn) undoBtn.addEventListener('click', undo);
  if (redoBtn) redoBtn.addEventListener('click', redo);

  if (splitBtn) {
    splitBtn.addEventListener('click', () => {
      if (!selectedClip) {
        showToast('Select a clip to split');
        return;
      }
      
      const left = parseFloat(selectedClip.style.left || '0');
      const width = parseFloat(selectedClip.style.width || '100');
      
      if (playheadPos <= left || playheadPos >= left + width) {
        showToast('Playhead must be over the selected clip to split');
        return;
      }
      
      // Calculate widths
      const newWidth1 = playheadPos - left;
      const newWidth2 = (left + width) - playheadPos;
      
      // Update original clip
      selectedClip.style.width = newWidth1 + '%';
      
      // Create second clip
      const clone = selectedClip.cloneNode(true);
      clone.style.left = playheadPos + '%';
      clone.style.width = newWidth2 + '%';
      clone.style.outline = 'none'; // Ensure no active outline on clone initially
      
      clone.addEventListener('click', (e) => selectClip(e.currentTarget));
      makeClipDraggable(clone);
      selectedClip.parentElement.appendChild(clone);
      
      saveState();
      updateVisuals();
      showToast('Clip split');
    });
  }

  // Initialize first state
  if (timelineTracks) {
    saveState();
  }

  // Profile Logic
  const themeToggleProfile = document.getElementById('themeToggleProfile');
  if (themeToggleProfile) {
    themeToggleProfile.addEventListener('click', () => {
      const mainThemeToggle = document.getElementById('themeToggle');
      if (mainThemeToggle) mainThemeToggle.click(); // Reuse existing toggle logic
    });
  }

  const profileNameInput = document.getElementById('profileNameInput');
  const saveProfileBtn = document.getElementById('saveProfileBtn');
  
  if (profileNameInput && saveProfileBtn) {
    // Load existing
    const savedName = localStorage.getItem('profileName');
    if (savedName) profileNameInput.value = savedName;

    saveProfileBtn.addEventListener('click', () => {
      const val = profileNameInput.value.trim();
      if (val) {
        localStorage.setItem('profileName', val);
        showToast('Profile name saved!');
      } else {
        showToast('Please enter a name');
      }
    });
  }

  const notificationToggleBtn = document.getElementById('notificationToggleBtn');
  const notificationToggleCircle = document.getElementById('notificationToggleCircle');
  
  if (notificationToggleBtn && notificationToggleCircle) {
    let notifsEnabled = localStorage.getItem('notifications') !== 'false'; // Default to true
    
    const updateNotifUI = () => {
      if (notifsEnabled) {
        notificationToggleBtn.style.background = 'var(--primary)';
        notificationToggleCircle.style.left = '26px';
      } else {
        notificationToggleBtn.style.background = 'var(--border)';
        notificationToggleCircle.style.left = '2px';
      }
    };
    updateNotifUI();

    notificationToggleBtn.addEventListener('click', () => {
      notifsEnabled = !notifsEnabled;
      localStorage.setItem('notifications', notifsEnabled);
      updateNotifUI();
      showToast(notifsEnabled ? 'Notifications enabled' : 'Notifications disabled');
    });
  }

  // Projects Logic
  const saveProjectBtn = document.getElementById('saveProjectBtn');
  const savedProjectsList = document.getElementById('savedProjectsList');
  const noProjectsMsg = document.getElementById('noProjectsMsg');

  function renderProjects() {
    if (!savedProjectsList) return;
    const projects = JSON.parse(localStorage.getItem('clipforgeProjects') || '[]');
    if (projects.length === 0) {
      if (noProjectsMsg) noProjectsMsg.style.display = 'block';
      Array.from(savedProjectsList.children).forEach(child => {
        if (child !== noProjectsMsg) child.remove();
      });
      return;
    }
    
    if (noProjectsMsg) noProjectsMsg.style.display = 'none';
    
    Array.from(savedProjectsList.children).forEach(child => {
      if (child !== noProjectsMsg) child.remove();
    });

    projects.reverse().forEach((p) => {
      const card = document.createElement('div');
      card.style.background = 'var(--bg-card)';
      card.style.border = '1px solid var(--border)';
      card.style.borderRadius = '12px';
      card.style.padding = '15px';
      card.style.display = 'flex';
      card.style.justifyContent = 'space-between';
      card.style.alignItems = 'center';
      card.style.cursor = 'pointer';

      card.innerHTML = `
        <div>
          <h3 style="margin: 0; font-size: 16px;">${p.name}</h3>
          <span style="font-size: 12px; color: var(--text-muted);">${p.date}</span>
        </div>
        <button class="btn-primary-export" style="padding: 6px 12px; border-radius: 6px; border: none; font-size: 12px; cursor: pointer;">Open</button>
      `;

      card.addEventListener('click', () => {
        showToast('Opening project ' + p.name);
        const timelineTracks = document.querySelector('.timeline-tracks');
        if (timelineTracks && p.state) {
          timelineTracks.innerHTML = p.state;
          document.querySelectorAll('.track-clip').forEach(clip => {
            clip.addEventListener('click', (e) => selectClip(e.currentTarget));
            if (typeof makeClipDraggable === 'function') makeClipDraggable(clip);
          });
        }
        switchView('editor');
      });

      savedProjectsList.appendChild(card);
    });
  }

  if (saveProjectBtn) {
    saveProjectBtn.addEventListener('click', () => {
      const timelineTracks = document.querySelector('.timeline-tracks');
      if (!timelineTracks) return;

      const currentState = timelineTracks.innerHTML;
      const projects = JSON.parse(localStorage.getItem('clipforgeProjects') || '[]');
      const projectName = prompt('Enter project name:', 'My Video Project ' + (projects.length + 1));
      
      if (projectName !== null && projectName.trim() !== '') {
        projects.push({
          id: Date.now(),
          name: projectName,
          state: currentState,
          date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString()
        });
        localStorage.setItem('clipforgeProjects', JSON.stringify(projects));
        showToast('Project saved successfully!');
        renderProjects();
      }
    });
  }

  renderProjects();