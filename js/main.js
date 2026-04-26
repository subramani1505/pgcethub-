// ── js/main.js ──
// Handles: navbar, search, filter tabs, mobile menu, modal

// ════════════════════════════════════════
// 1. NAVBAR — mobile hamburger toggle
// ════════════════════════════════════════
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('nav-open');
        hamburger.classList.toggle('is-open');
    });
}

// Close nav when a link is clicked (mobile)
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('nav-open');
        hamburger.classList.remove('is-open');
    });
});

// ════════════════════════════════════════
// 2. NAVBAR — hide on scroll down, show on scroll up
// ════════════════════════════════════════
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const current = window.scrollY;

    if (current <= 0) {
        navbar.classList.remove('nav-hidden');
        return;
    }

    if (current > lastScroll && current > 80) {
        // Scrolling down — hide navbar
        navbar.classList.add('nav-hidden');
        navLinks.classList.remove('nav-open');
    } else {
        // Scrolling up — show navbar
        navbar.classList.remove('nav-hidden');
    }

    lastScroll = current;
});

// ════════════════════════════════════════
// 3. SEARCH — hero search bar (index.html)
// ════════════════════════════════════════
function handleSearch() {
    const input = document.getElementById('hero-search');
    if (!input) return;

    const query = input.value.trim().toLowerCase();
    if (!query) return;

    // Scroll to papers section and filter
    const papersSection = document.getElementById('papers');
    if (papersSection) {
        papersSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Wait for scroll then filter
    setTimeout(() => {
        filterPapersBySearch(query);
    }, 500);
}

// Allow pressing Enter in search bar
const heroSearch = document.getElementById('hero-search');
if (heroSearch) {
    heroSearch.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
}

// Filter paper cards by search query text
function filterPapersBySearch(query) {
    const cards = document.querySelectorAll('.paper-card');
    let found = 0;

    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(query)) {
            card.style.display = 'flex';
            found++;
        } else {
            card.style.display = 'none';
        }
    });

    // Update count if element exists
    const countEl = document.getElementById('papers-count');
    if (countEl) countEl.textContent = found;
}

// ════════════════════════════════════════
// 4. FILTER TABS — homepage papers section
// ════════════════════════════════════════
const filterBtns = document.querySelectorAll('.filter-btn');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {

        // Update active button style
        filterBtns.forEach(b => {
            b.classList.remove('btn-primary');
            b.classList.add('btn-outline');
        });
        btn.classList.remove('btn-outline');
        btn.classList.add('btn-primary');

        const filter = btn.dataset.filter;
        const cards = document.querySelectorAll('.paper-card');

        cards.forEach(card => {
            if (filter === 'all') {
                card.style.display = 'flex';
            } else {
                const branch = card.dataset.branch;
                card.style.display = branch === filter ? 'flex' : 'none';
            }
        });

    });
});

// ════════════════════════════════════════
// 5. FILTERS — branch page dropdowns
// ════════════════════════════════════════
function applyFilters() {
    const yearFilter = document.getElementById('year-filter');
    const typeFilter = document.getElementById('type-filter');

    if (!yearFilter || !typeFilter) return;

    const selectedYear = yearFilter.value;
    const selectedType = typeFilter.value;

    const cards = document.querySelectorAll('.paper-card-full');
    const emptyEl = document.getElementById('empty-state');
    const countEl = document.getElementById('papers-count');

    let visible = 0;

    cards.forEach(card => {
        const cardYear = card.dataset.year;
        const cardPremium = card.dataset.premium;

        const yearMatch = selectedYear === 'all' || cardYear === selectedYear;

        let typeMatch = true;
        if (selectedType === 'free') typeMatch = cardPremium === 'false';
        if (selectedType === 'premium') typeMatch = cardPremium === 'true';

        if (yearMatch && typeMatch) {
            card.style.display = 'block';
            visible++;
        } else {
            card.style.display = 'none';
        }
    });

    // Update count
    if (countEl) countEl.textContent = visible;

    // Show/hide empty state
    if (emptyEl) {
        emptyEl.classList.toggle('hidden', visible > 0);
    }
}

// ════════════════════════════════════════
// 6. MODAL — premium payment flow
// ════════════════════════════════════════

// ── Your PhonePe / UPI ID — update this! ──
const UPI_ID = '8494950336@ibl';

// ── Valid access codes — add new ones after each payment ──
// Keep these secret. Share individually with each paying user.
const VALID_CODES = [
    'PGCET-2025-A1',
    'PGCET-2025-B2',
    'PGCET-2025-C3',
    // Add more codes here as people pay
];

// Check premium on every page load
(function checkPremiumStatus() {
    if (localStorage.getItem('pgcet_premium') === 'true') {
        document.body.classList.add('is-premium');
    }
})();

function openModal() {
    const overlay = document.getElementById('modal-overlay');
    if (!overlay) return;

    // If already premium, open PDF directly (shouldn't reach here, but safety)
    if (localStorage.getItem('pgcet_premium') === 'true') return;

    // Reset to step 1
    payStep(1);
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

function payStep(step) {
    // Hide all steps
    ['pay-step-1', 'pay-step-2', 'pay-step-code', 'pay-step-success'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });

    // Show the requested step
    const target = step === 'code' ? 'pay-step-code' : `pay-step-${step}`;
    const el = document.getElementById(target);
    if (el) el.classList.remove('hidden');

    // Fill in the UPI ID on step 2
    if (step === 2) {
        const upiEl = document.getElementById('upi-id-text');
        if (upiEl) upiEl.textContent = UPI_ID;
    }

    // Clear any previous code error when going to code step
    if (step === 'code') {
        const input = document.getElementById('access-code-input');
        const err = document.getElementById('code-error');
        if (input) input.value = '';
        if (err) err.classList.add('hidden');
    }
}

function copyUpi() {
    navigator.clipboard.writeText(UPI_ID).then(() => {
        const btn = document.getElementById('copy-upi-btn');
        if (btn) {
            btn.textContent = 'Copied!';
            btn.style.background = 'var(--green-main)';
            btn.style.color = '#fff';
            setTimeout(() => {
                btn.textContent = 'Copy';
                btn.style.background = '';
                btn.style.color = '';
            }, 2000);
        }
    });
}

function submitAccessCode() {
    const input = document.getElementById('access-code-input');
    const err = document.getElementById('code-error');
    if (!input) return;

    const entered = input.value.trim().toUpperCase();
    const validList = VALID_CODES.map(c => c.toUpperCase());

    if (validList.includes(entered)) {
        // ✅ Valid — grant premium access
        localStorage.setItem('pgcet_premium', 'true');
        localStorage.setItem('pgcet_code_used', entered);
        document.body.classList.add('is-premium');
        payStep('success');
    } else {
        // ❌ Invalid
        if (err) err.classList.remove('hidden');
        input.style.borderColor = '#e55';
        setTimeout(() => { input.style.borderColor = ''; }, 2000);
    }
}

// ════════════════════════════════════════
// 6b. PDF PREVIEW MODAL
// ════════════════════════════════════════
function openPdfPreview(filePath, title) {
    const overlay = document.getElementById('pdf-preview-overlay');
    const frame = document.getElementById('pdf-preview-frame');
    const titleEl = document.getElementById('pdf-modal-title');
    const dlBtn = document.getElementById('pdf-download-btn');

    if (!overlay || !frame) return;

    // Set title
    if (titleEl) titleEl.textContent = title || 'Question Paper';

    // Set iframe src — browser renders the PDF inline
    frame.src = filePath;

    // Set download button href
    if (dlBtn) {
        dlBtn.href = filePath;
        dlBtn.setAttribute('download', '');
    }

    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closePdfPreview() {
    const overlay = document.getElementById('pdf-preview-overlay');
    const frame = document.getElementById('pdf-preview-frame');

    if (overlay) overlay.classList.add('hidden');
    if (frame) frame.src = '';   // stop loading / free memory
    document.body.style.overflow = '';
}

// Close modals with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        closePdfPreview();
    }
});

// ════════════════════════════════════════
// 7. ACTIVE NAV LINK — highlight current page
// ════════════════════════════════════════
const currentPage = window.location.pathname.split('/').pop() || 'index.html';

document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
        link.classList.add('active');
    }
});

// ════════════════════════════════════════
// 8. SMOOTH SCROLL — for all anchor links
// ════════════════════════════════════════
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ════════════════════════════════════════
// 9. SCROLL ANIMATION — fade in on scroll
// ════════════════════════════════════════
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.branch-card, .paper-card, .paper-card-full, .sidebar-card').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
});