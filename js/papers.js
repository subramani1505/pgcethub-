// ── js/papers.js ──
// Handles: loading papers.json, rendering cards on
// both index.html and branch.html dynamically

// ════════════════════════════════════════
// 1. BRANCH CONFIG
// name, icon, description for each branch
// ════════════════════════════════════════
const BRANCH_CONFIG = {
  cs: {
    name: 'Computer Science',
    icon: '💻',
    desc: 'Previous year PGCET question papers for Computer Science & Engineering'
  },
  civil: {
    name: 'Civil Engineering',
    icon: '🏗️',
    desc: 'Previous year PGCET question papers for Civil Engineering'
  },
  mech: {
    name: 'Mechanical Engineering',
    icon: '⚙️',
    desc: 'Previous year PGCET question papers for Mechanical Engineering'
  },
  ece: {
    name: 'Electronics & Communication',
    icon: '📡',
    desc: 'Previous year PGCET question papers for ECE'
  },
  eee: {
    name: 'Electrical Engineering',
    icon: '⚡',
    desc: 'Previous year PGCET question papers for EEE'
  },
  chemical: {
    name: 'Chemical Engineering',
    icon: '🧪',
    desc: 'Previous year PGCET question papers for Chemical Engineering'
  },
  biotech: {
    name: 'Biotechnology',
    icon: '🧬',
    desc: 'Previous year PGCET question papers for Biotechnology'
  },
  env: {
    name: 'Environmental Engineering',
    icon: '🌿',
    desc: 'Previous year PGCET question papers for Environmental Engineering'
  }
};

// ════════════════════════════════════════
// 2. FETCH papers.json
// ════════════════════════════════════════
async function loadPapers() {
  try {
    // Add cache-buster so browser always gets the latest papers list
    const response = await fetch('data/papers.json?v=' + new Date().getTime());
    if (!response.ok) throw new Error('Failed to load papers.json');
    const data = await response.json();
    return data.papers;
  } catch (err) {
    console.error('Error loading papers:', err);
    return [];
  }
}

// ════════════════════════════════════════
// 2b. PREMIUM STATUS HELPER
// ════════════════════════════════════════
function isPremiumUnlocked() {
  return localStorage.getItem('pgcet_premium') === 'true';
}

// ════════════════════════════════════════
// 3. BUILD paper card — index.html (compact)
// ════════════════════════════════════════
function buildCompactCard(paper) {
  const isPremium = paper.isPremium;
  const iconBg = isPremium ? 'background: var(--amber-bg);' : 'background: var(--green-bg);';

  const actionBtn = isPremium && !isPremiumUnlocked()
    ? `<button class="btn btn-premium" onclick="event.stopPropagation(); openModal()">
               🔒 Premium
             </button>`
    : `<button class="btn btn-free" onclick="event.stopPropagation(); openPdfPreview('${paper.filePath}', '${paper.title}')">
               👁 Preview
             </button>`;

  return `
    <div
      class="paper-card"
      data-branch="${paper.branch}"
      data-year="${paper.year}"
      data-premium="${isPremium}"
      onclick="${isPremium && !isPremiumUnlocked() ? 'openModal()' : `openPdfPreview('${paper.filePath}', '${paper.title}')`}"
    >
      <div class="paper-icon" style="${iconBg}">
        📄
      </div>

      <div class="paper-info">
        <div class="paper-title">${paper.title}</div>
        <div class="paper-meta">
          <span>📅 ${paper.year}</span>
          <span>❓ ${paper.questions} questions</span>
          <span>📦 ${paper.fileSize}</span>
          ${paper.hasAnswerKey
      ? '<span class="tag tag-amber">Answer key</span>'
      : ''}
        </div>
      </div>

      <div>
        ${actionBtn}
      </div>
    </div>
  `;
}

// ════════════════════════════════════════
// 4. BUILD paper card — branch.html (full)
// ════════════════════════════════════════
function buildFullCard(paper) {
  const isPremium = paper.isPremium;
  const iconClass = isPremium ? 'paper-card-icon premium-icon' : 'paper-card-icon';

  return `
    <div
      class="paper-card-full"
      data-branch="${paper.branch}"
      data-year="${paper.year}"
      data-premium="${isPremium}"
      onclick="${isPremium && !isPremiumUnlocked() ? 'openModal()' : `openPdfPreview('${paper.filePath}', '${paper.title}')`}"
    >
      <!-- Top row -->
      <div class="paper-card-top">
        <div class="${iconClass}">📄</div>

        <div class="paper-card-info">
          <div class="paper-card-title">${paper.title}</div>
          <div class="paper-card-meta">
            <span>📅 Year: ${paper.year}</span>
            <span>❓ ${paper.questions} questions</span>
            <span>📦 ${paper.fileSize}</span>
          </div>
        </div>

        ${isPremium
      ? '<span class="tag tag-amber" style="flex-shrink:0;">Premium</span>'
      : '<span class="tag tag-green" style="flex-shrink:0;">Free</span>'
    }
      </div>

      <!-- Bottom row -->
      <div class="paper-card-bottom">
        <div class="paper-tags">
          <span class="tag tag-gray">${paper.branchName}</span>
          <span class="tag tag-gray">${paper.year}</span>
          ${paper.hasAnswerKey
      ? '<span class="tag tag-amber">Answer key included</span>'
      : ''}
        </div>

        <div class="paper-actions">
          ${isPremium && !isPremiumUnlocked()
      ? `<button class="btn btn-premium" onclick="event.stopPropagation(); openModal()">
                 🔒 Unlock — Premium
               </button>`
      : `<button class="btn btn-free" onclick="event.stopPropagation(); openPdfPreview('${paper.filePath}', '${paper.title}')">
                 👁 Preview & Download
               </button>`
    }
        </div>
      </div>
    </div>
  `;
}

// ════════════════════════════════════════
// 5. RENDER — index.html homepage papers
// ════════════════════════════════════════
async function renderHomePapers() {
  const container = document.getElementById('papers-list');
  if (!container) return;

  const papers = await loadPapers();

  if (papers.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div style="font-size:3rem; margin-bottom:16px;">📭</div>
        <h3>No papers found</h3>
        <p>Check back soon — we are adding more papers.</p>
      </div>
    `;
    return;
  }

  // Show latest 6 papers on homepage
  const latest = papers.slice(0, 6);
  container.innerHTML = latest.map(buildCompactCard).join('');

  // Re-observe new cards for fade-in animation
  observeFadeIn();
}

// ════════════════════════════════════════
// 6. RENDER — branch.html page papers
// ════════════════════════════════════════
async function renderBranchPapers() {
  const container = document.getElementById('branch-papers-list');
  if (!container) return;

  // Get branch from URL — e.g. branch.html?branch=cs
  const params = new URLSearchParams(window.location.search);
  const branch = params.get('branch') || 'cs';
  const config = BRANCH_CONFIG[branch];

  // ── Update page title + meta ──
  if (config) {
    document.title = `${config.name} Papers — PGCETHub`;

    const heroTitle = document.getElementById('branch-hero-title');
    const heroDesc = document.getElementById('branch-hero-desc');
    const heroIcon = document.getElementById('branch-hero-icon');
    const breadcrumb = document.getElementById('breadcrumb-branch');

    if (heroTitle) heroTitle.textContent = config.name + ' Papers';
    if (heroDesc) heroDesc.textContent = config.desc;
    if (heroIcon) heroIcon.textContent = config.icon;
    if (breadcrumb) breadcrumb.textContent = config.name;
  }

  // ── Load and filter papers ──
  const allPapers = await loadPapers();
  const branchPapers = allPapers.filter(p => p.branch === branch);

  // ── Update sidebar stats ──
  const sidebarTotal = document.getElementById('sidebar-total');
  const sidebarFree = document.getElementById('sidebar-free');
  const countEl = document.getElementById('papers-count');

  const freeCount = branchPapers.filter(p => !p.isPremium).length;

  if (sidebarTotal) sidebarTotal.textContent = branchPapers.length;
  if (sidebarFree) sidebarFree.textContent = freeCount + ' free';
  if (countEl) countEl.textContent = branchPapers.length;

  // ── Render cards ──
  if (branchPapers.length === 0) {
    container.innerHTML = '';
    const emptyEl = document.getElementById('empty-state');
    if (emptyEl) emptyEl.classList.remove('hidden');
    return;
  }

  // Sort by year descending (newest first)
  branchPapers.sort((a, b) => b.year - a.year);

  container.innerHTML = branchPapers.map(buildFullCard).join('');

  // Highlight current branch in sidebar other-branches list
  document.querySelectorAll('.other-branch-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.includes(`branch=${branch}`)) {
      link.style.color = 'var(--green-main)';
      link.style.fontWeight = '500';
      link.style.background = 'var(--green-bg)';
    }
  });

  // Re-observe new cards for fade-in
  observeFadeIn();
}

// ════════════════════════════════════════
// 7. FADE-IN observer helper
// ════════════════════════════════════════
function observeFadeIn() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05 });

  document.querySelectorAll(
    '.paper-card, .paper-card-full, .branch-card'
  ).forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
  });
}

// ════════════════════════════════════════
// 8. INIT — detect which page we are on
//    and run the right render function
// ════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  const page = window.location.pathname.split('/').pop();

  if (page === 'index.html' || page === '' || page === '/') {
    renderHomePapers();
  }

  if (page === 'branch.html') {
    renderBranchPapers();
  }
});