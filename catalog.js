// ══════════════════════════════════════
// MULTI-PAGE NAVIGATION SYSTEM
// showPage: navigates between pages using real URLs
// Sub-page views (indian-marble-detail, handicraft-detail) stay in-page
// ══════════════════════════════════════

const PAGE_URLS = {
  'home':                    'index.html',
  'range':                   'collection.html?view=range',
  'colour':                  'collection.html?view=colour',
  'gallery':                 'gallery.html',
  'onyx':                    'onyx.html',
  'carving':                 'stone-carvings.html',
  'handicraft':              'stone-handicrafts.html',
};

// Sub-pages that live inside a parent page (SPA-style within that file)
const SUBPAGES = new Set(['indian-marble-detail','handicraft-detail']);

function showPage(pageId, scrollTo) {
  // If this is an in-page sub-view, show it SPA-style (used on collection/handicraft pages)
  if (SUBPAGES.has(pageId)) {
    const target = document.getElementById('page-' + pageId);
    if (!target) return;
    // Only toggle siblings within the same page-group, not all .page elements
    const group = target.closest('.page-group');
    if (group) {
      group.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    } else {
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    }
    target.classList.add('active');
    const nav = document.getElementById('mainNav');
    if (nav) nav.classList.add('solid');
    window.scrollTo(0, 0);
    return;
  }
  let url = PAGE_URLS[pageId] || 'index.html';
  if (scrollTo && pageId === 'home') url = 'index.html#' + scrollTo;
  window.location.href = url;
}

function showCollPage(type, filter, subFilter) {
  if (type === 'range') {
    if (filter === 'onyx') { window.location.href = 'onyx.html'; return; }
    let url = 'collection.html?view=range&filter=' + (filter || 'all');
    if (subFilter) url += '&sub=' + subFilter;
    window.location.href = url;
  } else {
    window.location.href = 'collection.html?view=colour&filter=' + (filter || 'all');
  }
}

function filterRangeSub(range, subFilter) {
  // First show all cards in this range
  filterRange(range, document.querySelector('[data-range-filter="' + range + '"]'));

  // Sub-filter label map
  const subLabels = {
    'italian-look':    'Italian Look',
    'banswara-purple': 'Banswara Purple',
    'banswara-white':  'Banswara White',
  };
  const subLabel = subLabels[subFilter] || subFilter;
  const subLower = subLabel.toLowerCase();

  // Hide cards that don't belong to this sub-category
  // Matches against data-sub-category (set by buildRangeGrid from stone.subCategory)
  const cards = document.querySelectorAll('#range-grid .stone-card');
  let visible = 0;
  cards.forEach(card => {
    if (card.dataset.range !== range) return; // already hidden by filterRange
    const cardSub = (card.dataset.subCategory || '').toLowerCase();
    const show = cardSub === subLower;
    card.style.display = show ? '' : 'none';
    if (show) visible++;
  });

  // Update page title to reflect sub-category
  document.getElementById('range-page-title').textContent = subLabel;
  document.getElementById('range-breadcrumb').textContent = subLabel;
  document.getElementById('range-count').textContent = 'Showing ' + visible + ' ' + subLabel + ' stones';
}

// ══════════════════════════════════════
// NAV SCROLL BEHAVIOUR
// ══════════════════════════════════════
const nav = document.getElementById('mainNav');
(function initNav() {
  if (!nav) return;
  const isHome = !document.getElementById('page-range') &&
                 !document.getElementById('onyx-photo-grid') &&
                 !document.getElementById('gallery-grid') &&
                 !document.getElementById('carving-grid') &&
                 !document.getElementById('handicraft-grid');
  if (!isHome) {
    nav.classList.add('solid');
  } else {
    // Home: transparent until scrolled
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 80);
    });
  }
})();

// ══════════════════════════════════════
// SCROLL REVEAL
// ══════════════════════════════════════
function setupReveal() {
  const reveals = document.querySelectorAll('.reveal:not(.visible)');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach(el => obs.observe(el));
}
setupReveal();

// ══════════════════════════════════════
// RANGE PAGE FILTER
// ══════════════════════════════════════
function filterRange(value, btn) {
  // Update active pill
  document.querySelectorAll('#page-range .coll-pill').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  else {
    const found = document.querySelector('[data-range-filter="' + value + '"]');
    if (found) found.classList.add('active');
  }

  const cards = document.querySelectorAll('#range-grid .stone-card');
  let visible = 0;
  cards.forEach(card => {
    const show = value === 'all' || card.dataset.range === value;
    card.style.display = show ? '' : 'none';
    if (show) visible++;
  });

  // Update page title + breadcrumb + count
  const labels = {
    'all': ['Stone Range', 'Browse our complete collection by stone type.'],
    'granite': ['Granite Collection', 'Explore our full range of granite — from classic blacks to exotic speckled varieties.'],
    'indian-marble': ['Indian Marble', 'Discover the finest Indian marbles — rooted in Kishangarh and Rajasthan.'],
    'italian-marble': ['Italian Marble', 'Premium imported Italian marble — the world standard for luxury stone.'],
    'premium-luxury-marble': ['Premium Luxury Marble', 'An exclusive selection of the world\'s finest luxury marbles — rare, extraordinary, and unmatched in beauty.'],
    'satwario': ['Statuario Marble', 'The sculptural elegance of Statuario — the gold standard of luxury marble.'],
    'vietnam': ['Vietnam Stone', 'Refined natural stones sourced from the quarries of Vietnam.'],
    'travertine': ['Travertine', 'Warm, characterful travertine for timeless indoor and outdoor spaces. Available in a refined chemical polish or a raw, natural finish.'],
    'limestone': ['Limestone', 'Understated, elegant limestone for contemporary interiors and facades.'],
    'onyx': ['Onyx', 'Rare and luminous onyx — translucent luxury for extraordinary spaces.'],
  };
  const info = labels[value] || labels['all'];
  document.getElementById('range-page-title').textContent = info[0];
  document.getElementById('range-page-desc').textContent = info[1];
  document.getElementById('range-breadcrumb').textContent = value === 'all' ? 'Stone Range' : info[0];
  document.getElementById('range-count').textContent = value === 'all'
    ? 'Showing all ' + visible + ' stones'
    : 'Showing ' + visible + ' ' + info[0] + ' stones';
}

// ══════════════════════════════════════
// COLOUR PAGE FILTER
// ══════════════════════════════════════
// ══════════════════════════════════════
// SMOOTH SCROLL (home page)
// ══════════════════════════════════════
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (a) {
    e.preventDefault();
    const t = document.querySelector(a.getAttribute('href'));
    if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

// ══════════════════════════════════════
// CONTACT FORM
// ══════════════════════════════════════
document.getElementById('contactForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const form  = e.target;
  const btn   = form.querySelector('.form-submit');

  // Collect field values
  const name    = form.querySelector('input[type="text"]').value.trim();
  const phone   = form.querySelector('input[type="tel"]').value.trim();
  const email   = form.querySelector('input[type="email"]').value.trim();
  const stone   = form.querySelector('select').value;
  const details = form.querySelector('textarea').value.trim();

  // ── 1. Send via EmailJS (email to hargobindmarbles@gmail.com) ──
  // Uses mailto: fallback — opens user's mail client pre-filled
  const subject = encodeURIComponent('New Enquiry from Website — ' + name);
  const body    = encodeURIComponent(
    'Name: ' + name + '\n' +
    'Phone: ' + phone + '\n' +
    'Email: ' + (email || 'Not provided') + '\n' +
    'Stone of Interest: ' + (stone || 'Not specified') + '\n\n' +
    'Project Details:\n' + (details || 'Not provided')
  );
  const mailtoLink = 'mailto:hargobindmarbles@gmail.com?subject=' + subject + '&body=' + body;

  // ── 2. Send via WhatsApp to +91 96539 98344 ──
  const waText = encodeURIComponent(
    '🪨 *New Website Enquiry*\n\n' +
    '*Name:* ' + name + '\n' +
    '*Phone:* ' + phone + '\n' +
    '*Email:* ' + (email || 'Not provided') + '\n' +
    '*Stone:* ' + (stone || 'Not specified') + '\n\n' +
    '*Project Details:*\n' + (details || 'Not provided')
  );
  const waLink = 'https://wa.me/919653998344?text=' + waText;

  // Open WhatsApp first, then email
  window.open(waLink, '_blank');
  setTimeout(() => { window.location.href = mailtoLink; }, 800);

  // Show confirmation
  btn.textContent = '✓ Opening WhatsApp & Email…';
  btn.style.background = '#1B3A2D'; btn.style.color = '#E8D49A';
  setTimeout(() => {
    btn.textContent = 'Send Enquiry →';
    btn.style.background = ''; btn.style.color = '';
    form.reset();
  }, 5000);
});

// ══════════════════════════════════════
// HAMBURGER
// ══════════════════════════════════════
const _hamburger = document.getElementById('hamburger');
if (_hamburger) {
  _hamburger.addEventListener('click', () => {
    const links  = document.querySelector('.nav-links');
    const burger = document.getElementById('hamburger');
    const isOpen = links.classList.contains('mobile-open');
    if (isOpen) {
      links.classList.remove('mobile-open');
      burger.classList.remove('open');
    } else {
      links.classList.add('mobile-open');
      burger.classList.add('open');
    }
  });
}

// Close mobile menu when a nav link is clicked
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => {
    document.querySelector('.nav-links')?.classList.remove('mobile-open');
    document.getElementById('hamburger')?.classList.remove('open');
  });
});

// ══════════════════════════════════════════════════════════════
// CATALOG-DRIVEN GALLERY ENGINE  v2
//
// HOW TO ADD A NEW STONE (zero HTML/JS changes needed):
//   1. Create a subfolder:  images/<stone-type>/<colour-name>/
//   2. Drop images in:      <name>.jpg   <name>.1.jpg   <name>.2.jpg …
//   3. Run:                 node scan.js
//   4. Refresh the website. Done.
//
// The website reads catalog.json which scan.js builds from your
// folder structure automatically. You never touch this file.
// ══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════
// CATALOG ENGINE — reads catalog.json generated by scan.js
// ═══════════════════════════════════════════════════
let CATALOG = [];         // all stones from catalog.json
let modalStone = null;
let modalIdx   = 0;

// Colour dot colours
const COLOUR_DOTS = {
  'Green':'#2D6A4F','White':'#F5F0E8','Honey':'#C9A84C','Gold':'#C9A84C',
  'Blue':'#4A6FA5','Grey':'#8A8880','Pink':'#E8A0B0','Yellow':'#D4AC0D',
  'Red':'#C0392B','Brown':'#7B4F2E','Black':'#1C1C1C','Purple':'#7B5EA7',
  'Orange':'#E07B39','Beige':'#D4B896','Cream':'#F5F0E8','Multi':'#888'
};

// ── Catalog is embedded inline by scan.js (no fetch/server needed) ──
// scan.js rewrites the block below every time you run it.
// DO NOT edit between the CATALOG_START and CATALOG_END markers.
/* CATALOG_START */
window.__CATALOG = {
  "generated": "2026-07-06T18:30:44.691Z",
  "stones": [
    {
      "id": "granite__black__BLACK-PARADIZO",
      "name": "BLACK PARADIZO",
      "range": "granite",
      "rangeLabel": "Granite",
      "colour": "Black",
      "slab": "images/granite/black/BLACK PARADIZO.png",
      "images": [
        {
          "src": "images/granite/black/BLACK PARADIZO.png",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "granite__black__KOTDA-LAPATRO",
      "name": "KOTDA LAPATRO",
      "range": "granite",
      "rangeLabel": "Granite",
      "colour": "Black",
      "slab": "images/granite/black/KOTDA LAPATRO.jpeg",
      "images": [
        {
          "src": "images/granite/black/KOTDA LAPATRO.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "granite__black__PEARL-BLACK",
      "name": "PEARL BLACK",
      "range": "granite",
      "rangeLabel": "Granite",
      "colour": "Black",
      "slab": "images/granite/black/PEARL BLACK.png",
      "images": [
        {
          "src": "images/granite/black/PEARL BLACK.png",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "granite__black__RIVER-BLACK-BLUE-DOT",
      "name": "RIVER BLACK BLUE DOT",
      "range": "granite",
      "rangeLabel": "Granite",
      "colour": "Black",
      "slab": "images/granite/black/RIVER BLACK BLUE DOT.png",
      "images": [
        {
          "src": "images/granite/black/RIVER BLACK BLUE DOT.png",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "granite__black__SNAKE-BLACK",
      "name": "SNAKE BLACK",
      "range": "granite",
      "rangeLabel": "Granite",
      "colour": "Black",
      "slab": "images/granite/black/SNAKE BLACK.png",
      "images": [
        {
          "src": "images/granite/black/SNAKE BLACK.png",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "granite__black__SOUTH-BLACK",
      "name": "SOUTH BLACK",
      "range": "granite",
      "rangeLabel": "Granite",
      "colour": "Black",
      "slab": "images/granite/black/SOUTH BLACK.jpeg",
      "images": [
        {
          "src": "images/granite/black/SOUTH BLACK.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "granite__black__STAR-BLACK",
      "name": "STAR BLACK",
      "range": "granite",
      "rangeLabel": "Granite",
      "colour": "Black",
      "slab": "images/granite/black/STAR BLACK.png",
      "images": [
        {
          "src": "images/granite/black/STAR BLACK.png",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "granite__black__Z-BLACK",
      "name": "Z BLACK",
      "range": "granite",
      "rangeLabel": "Granite",
      "colour": "Black",
      "slab": "images/granite/black/Z BLACK.png",
      "images": [
        {
          "src": "images/granite/black/Z BLACK.png",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "granite__blue__BLUE-PEARL",
      "name": "BLUE PEARL",
      "range": "granite",
      "rangeLabel": "Granite",
      "colour": "Blue",
      "slab": "images/granite/blue/BLUE PEARL.png",
      "images": [
        {
          "src": "images/granite/blue/BLUE PEARL.png",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "granite__blue__LAVENDER-BLUE",
      "name": "LAVENDER BLUE",
      "range": "granite",
      "rangeLabel": "Granite",
      "colour": "Blue",
      "slab": "images/granite/blue/LAVENDER BLUE.jpeg",
      "images": [
        {
          "src": "images/granite/blue/LAVENDER BLUE.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "granite__blue__ORIGINAL-BLUE-DOT",
      "name": "ORIGINAL BLUE DOT",
      "range": "granite",
      "rangeLabel": "Granite",
      "colour": "Blue",
      "slab": "images/granite/blue/ORIGINAL BLUE DOT.jpeg",
      "images": [
        {
          "src": "images/granite/blue/ORIGINAL BLUE DOT.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "granite__blue__SOUTH-VIZAD-BLUE",
      "name": "SOUTH VIZAD BLUE",
      "range": "granite",
      "rangeLabel": "Granite",
      "colour": "Blue",
      "slab": "images/granite/blue/SOUTH VIZAD BLUE.jpeg",
      "images": [
        {
          "src": "images/granite/blue/SOUTH VIZAD BLUE.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "granite__brown__BBG",
      "name": "BBG",
      "range": "granite",
      "rangeLabel": "Granite",
      "colour": "Brown",
      "slab": "images/granite/brown/BBG.jpeg",
      "images": [
        {
          "src": "images/granite/brown/BBG.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "granite__brown__Bagera",
      "name": "Bagera",
      "range": "granite",
      "rangeLabel": "Granite",
      "colour": "Brown",
      "slab": "images/granite/brown/Bagera.jpeg",
      "images": [
        {
          "src": "images/granite/brown/Bagera.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "granite__brown__Brazil-Brown",
      "name": "Brazil Brown",
      "range": "granite",
      "rangeLabel": "Granite",
      "colour": "Brown",
      "slab": "images/granite/brown/Brazil Brown.jpeg",
      "images": [
        {
          "src": "images/granite/brown/Brazil Brown.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "granite__brown__Brown-Markino",
      "name": "Brown Markino",
      "range": "granite",
      "rangeLabel": "Granite",
      "colour": "Brown",
      "slab": "images/granite/brown/Brown Markino.jpeg",
      "images": [
        {
          "src": "images/granite/brown/Brown Markino.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "granite__brown__Brownie",
      "name": "Brownie",
      "range": "granite",
      "rangeLabel": "Granite",
      "colour": "Brown",
      "slab": "images/granite/brown/Brownie.jpeg",
      "images": [
        {
          "src": "images/granite/brown/Brownie.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "granite__brown__HIMALAYN-BROWN",
      "name": "HIMALAYN BROWN",
      "range": "granite",
      "rangeLabel": "Granite",
      "colour": "Brown",
      "slab": "images/granite/brown/HIMALAYN BROWN.png",
      "images": [
        {
          "src": "images/granite/brown/HIMALAYN BROWN.png",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "granite__brown__MUDAPPLE-BROWN",
      "name": "MUDAPPLE BROWN",
      "range": "granite",
      "rangeLabel": "Granite",
      "colour": "Brown",
      "slab": "images/granite/brown/MUDAPPLE BROWN.png",
      "images": [
        {
          "src": "images/granite/brown/MUDAPPLE BROWN.png",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "granite__brown__NATURAL-DUNES",
      "name": "NATURAL DUNES",
      "range": "granite",
      "rangeLabel": "Granite",
      "colour": "Brown",
      "slab": "images/granite/brown/NATURAL DUNES.png",
      "images": [
        {
          "src": "images/granite/brown/NATURAL DUNES.png",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "granite__brown__Panda-Brown",
      "name": "Panda Brown",
      "range": "granite",
      "rangeLabel": "Granite",
      "colour": "Brown",
      "slab": "images/granite/brown/Panda Brown.jpeg",
      "images": [
        {
          "src": "images/granite/brown/Panda Brown.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "granite__brown__Paradizo-River",
      "name": "Paradizo River",
      "range": "granite",
      "rangeLabel": "Granite",
      "colour": "Brown",
      "slab": "images/granite/brown/Paradizo River.jpeg",
      "images": [
        {
          "src": "images/granite/brown/Paradizo River.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "granite__brown__SILKY-BROWN",
      "name": "SILKY BROWN",
      "range": "granite",
      "rangeLabel": "Granite",
      "colour": "Brown",
      "slab": "images/granite/brown/SILKY BROWN.png",
      "images": [
        {
          "src": "images/granite/brown/SILKY BROWN.png",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "granite__brown__Smoke-Brown-I",
      "name": "Smoke Brown I",
      "range": "granite",
      "rangeLabel": "Granite",
      "colour": "Brown",
      "slab": "images/granite/brown/Smoke Brown I.jpeg",
      "images": [
        {
          "src": "images/granite/brown/Smoke Brown I.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "granite__brown__Smoke-Brown-II",
      "name": "Smoke Brown II",
      "range": "granite",
      "rangeLabel": "Granite",
      "colour": "Brown",
      "slab": "images/granite/brown/Smoke Brown II.jpeg",
      "images": [
        {
          "src": "images/granite/brown/Smoke Brown II.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "granite__brown__TAN-BROWN",
      "name": "TAN BROWN",
      "range": "granite",
      "rangeLabel": "Granite",
      "colour": "Brown",
      "slab": "images/granite/brown/TAN BROWN.jpeg",
      "images": [
        {
          "src": "images/granite/brown/TAN BROWN.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "granite__brown__Tiger-Brown",
      "name": "Tiger Brown",
      "range": "granite",
      "rangeLabel": "Granite",
      "colour": "Brown",
      "slab": "images/granite/brown/Tiger Brown.jpeg",
      "images": [
        {
          "src": "images/granite/brown/Tiger Brown.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "granite__brown__Wave-Brown",
      "name": "Wave Brown",
      "range": "granite",
      "rangeLabel": "Granite",
      "colour": "Brown",
      "slab": "images/granite/brown/Wave Brown.jpeg",
      "images": [
        {
          "src": "images/granite/brown/Wave Brown.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "granite__gold__Titanium-Gold",
      "name": "Titanium Gold",
      "range": "granite",
      "rangeLabel": "Granite",
      "colour": "Gold",
      "slab": "images/granite/gold/Titanium Gold.jpeg",
      "images": [
        {
          "src": "images/granite/gold/Titanium Gold.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "granite__grey__3D-GREY",
      "name": "3D GREY",
      "range": "granite",
      "rangeLabel": "Granite",
      "colour": "Grey",
      "slab": "images/granite/grey/3D GREY.jpeg",
      "images": [
        {
          "src": "images/granite/grey/3D GREY.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "granite__grey__OCEAN-PEARL",
      "name": "OCEAN PEARL",
      "range": "granite",
      "rangeLabel": "Granite",
      "colour": "Grey",
      "slab": "images/granite/grey/OCEAN PEARL.png",
      "images": [
        {
          "src": "images/granite/grey/OCEAN PEARL.png",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "granite__grey__STEEL-GREY-LAPATRO",
      "name": "STEEL GREY LAPATRO",
      "range": "granite",
      "rangeLabel": "Granite",
      "colour": "Grey",
      "slab": "images/granite/grey/STEEL GREY LAPATRO.jpeg",
      "images": [
        {
          "src": "images/granite/grey/STEEL GREY LAPATRO.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "granite__grey__STEEL-GREY",
      "name": "STEEL GREY",
      "range": "granite",
      "rangeLabel": "Granite",
      "colour": "Grey",
      "slab": "images/granite/grey/STEEL GREY.jpeg",
      "images": [
        {
          "src": "images/granite/grey/STEEL GREY.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "granite__pink__CHEEMA-PINK",
      "name": "CHEEMA PINK",
      "range": "granite",
      "rangeLabel": "Granite",
      "colour": "Pink",
      "slab": "images/granite/pink/CHEEMA PINK.png",
      "images": [
        {
          "src": "images/granite/pink/CHEEMA PINK.png",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "granite__red__HIMALAYA-RED",
      "name": "HIMALAYA RED",
      "range": "granite",
      "rangeLabel": "Granite",
      "colour": "Red",
      "slab": "images/granite/red/HIMALAYA RED.jpeg",
      "images": [
        {
          "src": "images/granite/red/HIMALAYA RED.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "granite__red__Khalda-Red",
      "name": "Khalda Red",
      "range": "granite",
      "rangeLabel": "Granite",
      "colour": "Red",
      "slab": "images/granite/red/Khalda Red.jpeg",
      "images": [
        {
          "src": "images/granite/red/Khalda Red.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "granite__white__KG",
      "name": "KG",
      "range": "granite",
      "rangeLabel": "Granite",
      "colour": "White",
      "slab": "images/granite/white/KG.jpeg",
      "images": [
        {
          "src": "images/granite/white/KG.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "granite__white__KUPAM-WHITE",
      "name": "KUPAM WHITE",
      "range": "granite",
      "rangeLabel": "Granite",
      "colour": "White",
      "slab": "images/granite/white/KUPAM WHITE.jpeg",
      "images": [
        {
          "src": "images/granite/white/KUPAM WHITE.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "granite__white__KWG",
      "name": "KWG",
      "range": "granite",
      "rangeLabel": "Granite",
      "colour": "White",
      "slab": "images/granite/white/KWG.jpeg",
      "images": [
        {
          "src": "images/granite/white/KWG.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "granite__white__MWG",
      "name": "MWG",
      "range": "granite",
      "rangeLabel": "Granite",
      "colour": "White",
      "slab": "images/granite/white/MWG.jpeg",
      "images": [
        {
          "src": "images/granite/white/MWG.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "granite__white__SOUTH-MARIUM-WHITE",
      "name": "SOUTH MARIUM WHITE",
      "range": "granite",
      "rangeLabel": "Granite",
      "colour": "White",
      "slab": "images/granite/white/SOUTH MARIUM WHITE.jpeg",
      "images": [
        {
          "src": "images/granite/white/SOUTH MARIUM WHITE.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "indian-marble__Multi__Italian-Look",
      "name": "Italian Look Indian Marble",
      "range": "indian-marble",
      "rangeLabel": "Indian Marble",
      "colour": "Multi",
      "slab": "images/indian-marble/Multi/Italian Look/Italian Look I.jpeg",
      "images": [
        {
          "src": "images/indian-marble/Multi/Italian Look/Italian Look I.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/indian-marble/Multi/Italian Look/Italian Look II.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Multi/Italian Look/Italian Look III.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Multi/Italian Look/Italian Look IV.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Multi/Italian Look/Italian Look IX.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Multi/Italian Look/Italian Look V.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Multi/Italian Look/Italian Look VI.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Multi/Italian Look/Italian Look VII.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Multi/Italian Look/Italian Look VIII.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Multi/Italian Look/Italian Look X.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Multi/Italian Look/Italian Look XI.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Multi/Italian Look/Italian Look XII.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Multi/Italian Look/Italian Look XIII.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Multi/Italian Look/Italian Look XIV.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Multi/Italian Look/Italian Look XIX.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Multi/Italian Look/Italian Look XV.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Multi/Italian Look/Italian Look XVI.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Multi/Italian Look/Italian Look XVII.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Multi/Italian Look/Italian Look XVIII.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Multi/Italian Look/Italian Look XX.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Multi/Italian Look/Italian Look XXI.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Multi/Italian Look/Italian Look XXII.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Multi/Italian Look/Italian Look XXIII.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Multi/Italian Look/Italian Look XXIV.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Multi/Italian Look/Italian Look XXIX.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Multi/Italian Look/Italian Look XXV.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Multi/Italian Look/Italian Look XXVI.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Multi/Italian Look/Italian Look XXVII.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Multi/Italian Look/Italian Look XXVIII.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Multi/Italian Look/Italian Look XXX.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Multi/Italian Look/Italian Look XXXI.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Multi/Italian Look/Italian Look XXXII.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Multi/Italian Look/Italian Look XXXIII.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Multi/Italian Look/Italian Look XXXIV.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Multi/Italian Look/Italian Look XXXV.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Multi/Italian Look/Italian Look XXXVI.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Multi/Italian Look/Italian Look XXXVII.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Multi/Italian Look/Italian Look XXXVIII.jpeg",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "indian-marble__Purple__Banswara-Premium-Purple",
      "name": "Banswara Premium Purple Indian Marble",
      "range": "indian-marble",
      "rangeLabel": "Indian Marble",
      "colour": "Purple",
      "slab": "images/indian-marble/Purple/Banswara Premium Purple/Banswara Purple Premium I.jpeg",
      "images": [
        {
          "src": "images/indian-marble/Purple/Banswara Premium Purple/Banswara Purple Premium I.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "indian-marble__Purple__Banswara-Purple",
      "name": "Banswara Purple Indian Marble",
      "range": "indian-marble",
      "rangeLabel": "Indian Marble",
      "colour": "Purple",
      "slab": "images/indian-marble/Purple/Banswara Purple/Banswara Purple I.jpeg",
      "images": [
        {
          "src": "images/indian-marble/Purple/Banswara Purple/Banswara Purple I.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/indian-marble/Purple/Banswara Purple/Banswara Purple II.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Purple/Banswara Purple/Banswara Purple III.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Purple/Banswara Purple/Banswara Purple IV.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Purple/Banswara Purple/Banswara Purple IX.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Purple/Banswara Purple/Banswara Purple V.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Purple/Banswara Purple/Banswara Purple VI.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Purple/Banswara Purple/Banswara Purple VII.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Purple/Banswara Purple/Banswara Purple VIII.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Purple/Banswara Purple/Banswara Purple X.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/Purple/Banswara Purple/Banswara Purple XI.jpeg",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "indian-marble__White__Banswara-White",
      "name": "Banswara White Indian Marble",
      "range": "indian-marble",
      "rangeLabel": "Indian Marble",
      "colour": "White",
      "slab": "images/indian-marble/White/Banswara White/Banswara White  III.jpeg",
      "images": [
        {
          "src": "images/indian-marble/White/Banswara White/Banswara White  III.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/indian-marble/White/Banswara White/Banswara White  IX.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/White/Banswara White/Banswara White  VI.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/White/Banswara White/Banswara White  VII.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/White/Banswara White/Banswara White  VIII.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/White/Banswara White/Banswara White I.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/White/Banswara White/Banswara White II.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/White/Banswara White/Banswara White IV.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/White/Banswara White/Banswara White V.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/White/Banswara White/Banswara White X.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/White/Banswara White/Banswara White XI.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/White/Banswara White/Banswara White XII.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/White/Banswara White/Banswara White XIII.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/White/Banswara White/Banswara White XIV.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/White/Banswara White/Banswara White XV.jpeg",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "indian-marble__White__Morwad",
      "name": "Morwad Indian Marble",
      "range": "indian-marble",
      "rangeLabel": "Indian Marble",
      "colour": "White",
      "slab": "images/indian-marble/White/Morwad/Morwad I.jpeg",
      "images": [
        {
          "src": "images/indian-marble/White/Morwad/Morwad I.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/indian-marble/White/Morwad/Morwad II.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/White/Morwad/Morwad III.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/White/Morwad/Morwad IV.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/White/Morwad/Morwad IX.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/White/Morwad/Morwad V.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/White/Morwad/Morwad VI.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/White/Morwad/Morwad VII.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/indian-marble/White/Morwad/Morwad VIII.jpeg",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "italian-marble__Black__Black",
      "name": "Black Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Black",
      "slab": "images/italian-marble/Black/Black/Black Markino Iren.png",
      "images": [
        {
          "src": "images/italian-marble/Black/Black/Black Markino Iren.png",
          "tag": "Slab"
        },
        {
          "src": "images/italian-marble/Black/Black/Black1.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/italian-marble/Black/Black/Black2.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/italian-marble/Black/Black/Black3.jpeg",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "italian-marble__Black__Black-&-Gold",
      "name": "Black & Gold Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Black",
      "slab": "images/italian-marble/Black/Black & Gold/Armani Black.png",
      "images": [
        {
          "src": "images/italian-marble/Black/Black & Gold/Armani Black.png",
          "tag": "Slab"
        },
        {
          "src": "images/italian-marble/Black/Black & Gold/Black & Gold1.jpeg",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "italian-marble__Black__Black-Margino",
      "name": "Black Margino Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Black",
      "slab": "images/italian-marble/Black/Black Margino/Black Markino.png",
      "images": [
        {
          "src": "images/italian-marble/Black/Black Margino/Black Markino.png",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "italian-marble__Black__Golden-Portoro",
      "name": "Golden Portoro Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Black",
      "slab": "images/italian-marble/Black/Golden Portoro/G Portono.png",
      "images": [
        {
          "src": "images/italian-marble/Black/Golden Portoro/G Portono.png",
          "tag": "Slab"
        },
        {
          "src": "images/italian-marble/Black/Golden Portoro/Golden Portono.png",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "italian-marble__Black__Metal-Vst",
      "name": "Metal Vst Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Black",
      "slab": "images/italian-marble/Black/Metal Vst/Metal Vst1.jpeg",
      "images": [
        {
          "src": "images/italian-marble/Black/Metal Vst/Metal Vst1.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/italian-marble/Black/Metal Vst/SLAB.png",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "italian-marble__Black__Phantom-Black",
      "name": "Phantom Black Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Black",
      "slab": "images/italian-marble/Black/Phantom Black/Phantom Black1.jpeg",
      "images": [
        {
          "src": "images/italian-marble/Black/Phantom Black/Phantom Black1.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/italian-marble/Black/Phantom Black/Phantom Black2.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/italian-marble/Black/Phantom Black/Slab.png",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "italian-marble__Black__Rosso-Martin",
      "name": "Rosso Martin Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Black",
      "slab": "images/italian-marble/Black/Rosso Martin/Rosso Martin Slab.png",
      "images": [
        {
          "src": "images/italian-marble/Black/Rosso Martin/Rosso Martin Slab.png",
          "tag": "Slab"
        },
        {
          "src": "images/italian-marble/Black/Rosso Martin/Rosso Martin1.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/italian-marble/Black/Rosso Martin/Rosso Martin2.jpeg",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "italian-marble__Brown__Armani-Brown",
      "name": "Armani Brown Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Brown",
      "slab": "images/italian-marble/Brown/Armani Brown/Armani Brown1.jpeg",
      "images": [
        {
          "src": "images/italian-marble/Brown/Armani Brown/Armani Brown1.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "italian-marble__Brown__Autumn-Brown",
      "name": "Autumn Brown Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Brown",
      "slab": "images/italian-marble/Brown/Autumn Brown/Autumn Brown1.jpeg",
      "images": [
        {
          "src": "images/italian-marble/Brown/Autumn Brown/Autumn Brown1.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/italian-marble/Brown/Autumn Brown/Autumn Brown2.jpeg",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "italian-marble__Brown__Beige",
      "name": "Beige Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Brown",
      "slab": "images/italian-marble/Brown/Beige/Beige1.jpeg",
      "images": [
        {
          "src": "images/italian-marble/Brown/Beige/Beige1.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/italian-marble/Brown/Beige/Beige2.jpeg",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "italian-marble__Brown__Coffe-Brown",
      "name": "Coffe Brown Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Brown",
      "slab": "images/italian-marble/Brown/Coffe Brown/Coffee Brown.jpeg",
      "images": [
        {
          "src": "images/italian-marble/Brown/Coffe Brown/Coffee Brown.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "italian-marble__Brown__Dark-Emperador",
      "name": "Dark Emperador Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Brown",
      "slab": "images/italian-marble/Brown/Dark Emperador/Dark Emperador1.jpeg",
      "images": [
        {
          "src": "images/italian-marble/Brown/Dark Emperador/Dark Emperador1.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/italian-marble/Brown/Dark Emperador/Dark Emperador2.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/italian-marble/Brown/Dark Emperador/Dark Emperador3.jpeg",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "italian-marble__Brown__Ombra-Di-Caravaggio",
      "name": "Ombra Di Caravaggio Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Brown",
      "slab": "images/italian-marble/Brown/Ombra Di Caravaggio/Ombra Di Caravaggio.jpeg",
      "images": [
        {
          "src": "images/italian-marble/Brown/Ombra Di Caravaggio/Ombra Di Caravaggio.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "italian-marble__Brown__Tabacco-Brown",
      "name": "Tabacco Brown Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Brown",
      "slab": "images/italian-marble/Brown/Tabacco Brown/Tabacco Brown1.jpeg",
      "images": [
        {
          "src": "images/italian-marble/Brown/Tabacco Brown/Tabacco Brown1.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/italian-marble/Brown/Tabacco Brown/Tabacco Brown2.jpeg",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "italian-marble__Brown__Versace-Beige",
      "name": "Versace Beige Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Brown",
      "slab": "images/italian-marble/Brown/Versace Beige/Versace Beige1.jpeg",
      "images": [
        {
          "src": "images/italian-marble/Brown/Versace Beige/Versace Beige1.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "italian-marble__Cream__Bianco",
      "name": "Bianco Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Cream",
      "slab": "images/italian-marble/Cream/Bianco/Bianco1.jpeg",
      "images": [
        {
          "src": "images/italian-marble/Cream/Bianco/Bianco1.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "italian-marble__Gold__Gold-Granite-with-Prominent-Dark",
      "name": "Gold Granite With Prominent Dark Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Gold",
      "slab": "images/italian-marble/Gold/Gold Granite with Prominent Dark/Front.jpeg",
      "images": [
        {
          "src": "images/italian-marble/Gold/Gold Granite with Prominent Dark/Front.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/italian-marble/Gold/Gold Granite with Prominent Dark/Gold Granite with Prominent Dark.jpeg",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "italian-marble__Grey__Albert-Grey",
      "name": "Albert Grey Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Grey",
      "slab": "images/italian-marble/Grey/Albert Grey/Albert Grey.jpeg",
      "images": [
        {
          "src": "images/italian-marble/Grey/Albert Grey/Albert Grey.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "italian-marble__Grey__Alexander-Grey",
      "name": "Alexander Grey Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Grey",
      "slab": "images/italian-marble/Grey/Alexander Grey/Alexander Grey.png",
      "images": [
        {
          "src": "images/italian-marble/Grey/Alexander Grey/Alexander Grey.png",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "italian-marble__Grey__Armani",
      "name": "Armani Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Grey",
      "slab": "images/italian-marble/Grey/Armani/Armani1.jpeg",
      "images": [
        {
          "src": "images/italian-marble/Grey/Armani/Armani1.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "italian-marble__Grey__Camouflage-Marble",
      "name": "Camouflage Marble Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Grey",
      "slab": "images/italian-marble/Grey/Camouflage Marble/Camouflage Marble.png",
      "images": [
        {
          "src": "images/italian-marble/Grey/Camouflage Marble/Camouflage Marble.png",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "italian-marble__Grey__Caraman-Grey",
      "name": "Caraman Grey Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Grey",
      "slab": "images/italian-marble/Grey/Caraman Grey/Caraman Grey1.jpeg",
      "images": [
        {
          "src": "images/italian-marble/Grey/Caraman Grey/Caraman Grey1.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/italian-marble/Grey/Caraman Grey/Caraman Grey2.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/italian-marble/Grey/Caraman Grey/Caraman Grey3.jpeg",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "italian-marble__Grey__Cinderella",
      "name": "Cinderella Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Grey",
      "slab": "images/italian-marble/Grey/Cinderella/Cinderella1.jpeg",
      "images": [
        {
          "src": "images/italian-marble/Grey/Cinderella/Cinderella1.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "italian-marble__Grey__Cristano-Grey",
      "name": "Cristano Grey Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Grey",
      "slab": "images/italian-marble/Grey/Cristano Grey/Cristano Grey1.jpeg",
      "images": [
        {
          "src": "images/italian-marble/Grey/Cristano Grey/Cristano Grey1.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "italian-marble__Grey__Era-grey",
      "name": "Era Grey Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Grey",
      "slab": "images/italian-marble/Grey/Era grey/Era Grey.jpeg",
      "images": [
        {
          "src": "images/italian-marble/Grey/Era grey/Era Grey.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "italian-marble__Grey__Fossil-Grey",
      "name": "Fossil Grey Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Grey",
      "slab": "images/italian-marble/Grey/Fossil Grey/FOSSIL GREY.png",
      "images": [
        {
          "src": "images/italian-marble/Grey/Fossil Grey/FOSSIL GREY.png",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "italian-marble__Grey__Glacier-Grey",
      "name": "Glacier Grey Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Grey",
      "slab": "images/italian-marble/Grey/Glacier Grey/Glacier Grey1.jpeg",
      "images": [
        {
          "src": "images/italian-marble/Grey/Glacier Grey/Glacier Grey1.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "italian-marble__Grey__Glalio-Grey",
      "name": "Glalio Grey Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Grey",
      "slab": "images/italian-marble/Grey/Glalio Grey/Glalio Grey1.jpeg",
      "images": [
        {
          "src": "images/italian-marble/Grey/Glalio Grey/Glalio Grey1.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "italian-marble__Grey__Golden-Brownz",
      "name": "Golden Brownz Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Grey",
      "slab": "images/italian-marble/Grey/Golden Brownz/Golden Brown.png",
      "images": [
        {
          "src": "images/italian-marble/Grey/Golden Brownz/Golden Brown.png",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "italian-marble__Grey__Gracy-Stone",
      "name": "Gracy Stone Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Grey",
      "slab": "images/italian-marble/Grey/Gracy Stone/Gracy Stone1.jpeg",
      "images": [
        {
          "src": "images/italian-marble/Grey/Gracy Stone/Gracy Stone1.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "italian-marble__Grey__Grey",
      "name": "Grey Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Grey",
      "slab": "images/italian-marble/Grey/Grey/Grey1.jpeg",
      "images": [
        {
          "src": "images/italian-marble/Grey/Grey/Grey1.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "italian-marble__Grey__Grey-William",
      "name": "Grey William Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Grey",
      "slab": "images/italian-marble/Grey/Grey William/Grey William1.jpeg",
      "images": [
        {
          "src": "images/italian-marble/Grey/Grey William/Grey William1.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/italian-marble/Grey/Grey William/William Slab.png",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "italian-marble__Grey__Ice-Berg-Grey",
      "name": "Ice Berg Grey Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Grey",
      "slab": "images/italian-marble/Grey/Ice Berg Grey/Ice Berg Grey.jpeg",
      "images": [
        {
          "src": "images/italian-marble/Grey/Ice Berg Grey/Ice Berg Grey.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/italian-marble/Grey/Ice Berg Grey/Ice Berg.png",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "italian-marble__Grey__Karaman-Grey",
      "name": "Karaman Grey Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Grey",
      "slab": "images/italian-marble/Grey/Karaman Grey/Karaman Grey1.jpeg",
      "images": [
        {
          "src": "images/italian-marble/Grey/Karaman Grey/Karaman Grey1.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/italian-marble/Grey/Karaman Grey/karaman.png",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "italian-marble__Grey__Lady-Grey",
      "name": "Lady Grey Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Grey",
      "slab": "images/italian-marble/Grey/Lady Grey/Lady G.png",
      "images": [
        {
          "src": "images/italian-marble/Grey/Lady Grey/Lady G.png",
          "tag": "Slab"
        },
        {
          "src": "images/italian-marble/Grey/Lady Grey/Lady Grey1.jpeg",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "italian-marble__Grey__Metallic-Grey",
      "name": "Metallic Grey Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Grey",
      "slab": "images/italian-marble/Grey/Metallic Grey/Metallic Grey1.jpeg",
      "images": [
        {
          "src": "images/italian-marble/Grey/Metallic Grey/Metallic Grey1.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "italian-marble__Grey__Olivia",
      "name": "Olivia Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Grey",
      "slab": "images/italian-marble/Grey/Olivia/Olivia1.jpeg",
      "images": [
        {
          "src": "images/italian-marble/Grey/Olivia/Olivia1.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "italian-marble__Grey__Repsodhy-Grey",
      "name": "Repsodhy Grey Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Grey",
      "slab": "images/italian-marble/Grey/Repsodhy Grey/Repsodhy Grey1.jpeg",
      "images": [
        {
          "src": "images/italian-marble/Grey/Repsodhy Grey/Repsodhy Grey1.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/italian-marble/Grey/Repsodhy Grey/Repsodhy Grey2.jpeg",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "italian-marble__Grey__Sand-Grey",
      "name": "Sand Grey Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Grey",
      "slab": "images/italian-marble/Grey/Sand Grey/Sand Grey1.jpeg",
      "images": [
        {
          "src": "images/italian-marble/Grey/Sand Grey/Sand Grey1.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/italian-marble/Grey/Sand Grey/Sand Grey2.jpeg",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "italian-marble__Grey__Silk-Grey",
      "name": "Silk Grey Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Grey",
      "slab": "images/italian-marble/Grey/Silk Grey/Silk Grey1.jpeg",
      "images": [
        {
          "src": "images/italian-marble/Grey/Silk Grey/Silk Grey1.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/italian-marble/Grey/Silk Grey/Silk Grey2.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/italian-marble/Grey/Silk Grey/Silk Grey3.jpeg",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "italian-marble__Grey__Silver-Grey",
      "name": "Silver Grey Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Grey",
      "slab": "images/italian-marble/Grey/Silver Grey/Silver Grey1.jpeg",
      "images": [
        {
          "src": "images/italian-marble/Grey/Silver Grey/Silver Grey1.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "italian-marble__Grey__Single-Grey",
      "name": "Single Grey Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Grey",
      "slab": "images/italian-marble/Grey/Single Grey/Single Grey1.jpeg",
      "images": [
        {
          "src": "images/italian-marble/Grey/Single Grey/Single Grey1.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "italian-marble__Grey__Sonata-Grey",
      "name": "Sonata Grey Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Grey",
      "slab": "images/italian-marble/Grey/Sonata Grey/Sonata Grey1.jpeg",
      "images": [
        {
          "src": "images/italian-marble/Grey/Sonata Grey/Sonata Grey1.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "italian-marble__Grey__Sonata-Grey-Gold",
      "name": "Sonata Grey Gold Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Grey",
      "slab": "images/italian-marble/Grey/Sonata Grey Gold/Drawing Room.jpeg",
      "images": [
        {
          "src": "images/italian-marble/Grey/Sonata Grey Gold/Drawing Room.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/italian-marble/Grey/Sonata Grey Gold/Living Room.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/italian-marble/Grey/Sonata Grey Gold/Sonata Grey Gold Marble.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/italian-marble/Grey/Sonata Grey Gold/View.jpeg",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "italian-marble__Grey__Spanish-Grey",
      "name": "Spanish Grey Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Grey",
      "slab": "images/italian-marble/Grey/Spanish Grey/Spanish Grey.jpeg",
      "images": [
        {
          "src": "images/italian-marble/Grey/Spanish Grey/Spanish Grey.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "italian-marble__Grey__Sphiny-Grey",
      "name": "Sphiny Grey Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Grey",
      "slab": "images/italian-marble/Grey/Sphiny Grey/Sphiny Grey1.jpeg",
      "images": [
        {
          "src": "images/italian-marble/Grey/Sphiny Grey/Sphiny Grey1.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/italian-marble/Grey/Sphiny Grey/Sphiny Grey2.jpeg",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "italian-marble__Grey__Spider-Grey",
      "name": "Spider Grey Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Grey",
      "slab": "images/italian-marble/Grey/Spider Grey/Spider Grey1.jpeg",
      "images": [
        {
          "src": "images/italian-marble/Grey/Spider Grey/Spider Grey1.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/italian-marble/Grey/Spider Grey/Spider Grey2.jpeg",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "italian-marble__Grey__Tundra-Grey",
      "name": "Tundra Grey Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Grey",
      "slab": "images/italian-marble/Grey/Tundra Grey/Tundra Grey.jpeg",
      "images": [
        {
          "src": "images/italian-marble/Grey/Tundra Grey/Tundra Grey.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "italian-marble__Orange__Alicant",
      "name": "Alicant Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Orange",
      "slab": "images/italian-marble/Orange/Alicant/ALICANT.png",
      "images": [
        {
          "src": "images/italian-marble/Orange/Alicant/ALICANT.png",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "italian-marble__Orange__Saran-Coli",
      "name": "Saran Coli Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Orange",
      "slab": "images/italian-marble/Orange/Saran Coli/SARAN COLI.png",
      "images": [
        {
          "src": "images/italian-marble/Orange/Saran Coli/SARAN COLI.png",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "italian-marble__Pink__Rosalia-Beige",
      "name": "Rosalia Beige Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Pink",
      "slab": "images/italian-marble/Pink/Rosalia Beige/Rosalia Beige2.jpeg",
      "images": [
        {
          "src": "images/italian-marble/Pink/Rosalia Beige/Rosalia Beige2.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/italian-marble/Pink/Rosalia Beige/Rosalia Slab.png",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "italian-marble__Pink__Rose-Breccia",
      "name": "Rose Breccia Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Pink",
      "slab": "images/italian-marble/Pink/Rose Breccia/Indian House Flooring.jpeg",
      "images": [
        {
          "src": "images/italian-marble/Pink/Rose Breccia/Indian House Flooring.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/italian-marble/Pink/Rose Breccia/Living Room.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/italian-marble/Pink/Rose Breccia/Rest Room Area.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/italian-marble/Pink/Rose Breccia/Rose Breccia.jpeg",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "italian-marble__Silver__Bohemia-Silver",
      "name": "Bohemia Silver Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "Multi",
      "slab": "images/italian-marble/Silver/Bohemia Silver/Bohemia Silver.png",
      "images": [
        {
          "src": "images/italian-marble/Silver/Bohemia Silver/Bohemia Silver.png",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "italian-marble__White__Camouflage-White",
      "name": "Camouflage White Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "White",
      "slab": "images/italian-marble/White/Camouflage White/Camouflage White1.jpeg",
      "images": [
        {
          "src": "images/italian-marble/White/Camouflage White/Camouflage White1.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "italian-marble__White__Cristano-White",
      "name": "Cristano White Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "White",
      "slab": "images/italian-marble/White/Cristano White/Cristano White1.jpeg",
      "images": [
        {
          "src": "images/italian-marble/White/Cristano White/Cristano White1.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "italian-marble__White__Lilac-White",
      "name": "Lilac White Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "White",
      "slab": "images/italian-marble/White/Lilac White/Lilac White2.jpeg",
      "images": [
        {
          "src": "images/italian-marble/White/Lilac White/Lilac White2.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/italian-marble/White/Lilac White/Lilac Whte.jpeg",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "italian-marble__White__Malisha-Beg",
      "name": "Malisha Beg Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "White",
      "slab": "images/italian-marble/White/Malisha Beg/Malisha Beg1.jpeg",
      "images": [
        {
          "src": "images/italian-marble/White/Malisha Beg/Malisha Beg1.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/italian-marble/White/Malisha Beg/Malisha Beg2.jpeg",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "italian-marble__White__Marfil-Beige",
      "name": "Marfil Beige Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "White",
      "slab": "images/italian-marble/White/Marfil Beige/Marfil Beige1.jpeg",
      "images": [
        {
          "src": "images/italian-marble/White/Marfil Beige/Marfil Beige1.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "italian-marble__White__Masti-White",
      "name": "Masti White Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "White",
      "slab": "images/italian-marble/White/Masti White/masti white.jpeg",
      "images": [
        {
          "src": "images/italian-marble/White/Masti White/masti white.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "italian-marble__White__Mugla-White",
      "name": "Mugla White Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "White",
      "slab": "images/italian-marble/White/Mugla White/Mugla White1.jpeg",
      "images": [
        {
          "src": "images/italian-marble/White/Mugla White/Mugla White1.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "italian-marble__White__Opal-Gold-White",
      "name": "Opal Gold White Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "White",
      "slab": "images/italian-marble/White/Opal Gold White/Opal Gold white1.jpeg",
      "images": [
        {
          "src": "images/italian-marble/White/Opal Gold White/Opal Gold white1.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "italian-marble__White__Precia",
      "name": "Precia Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "White",
      "slab": "images/italian-marble/White/Precia/Precia1.jpeg",
      "images": [
        {
          "src": "images/italian-marble/White/Precia/Precia1.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "italian-marble__White__Silver-River",
      "name": "Silver River Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "White",
      "slab": "images/italian-marble/White/Silver River/Silver River1.jpeg",
      "images": [
        {
          "src": "images/italian-marble/White/Silver River/Silver River1.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "italian-marble__White__Sofita-Beige",
      "name": "Sofita Beige Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "White",
      "slab": "images/italian-marble/White/Sofita Beige/Sofita Beige1.jpeg",
      "images": [
        {
          "src": "images/italian-marble/White/Sofita Beige/Sofita Beige1.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "italian-marble__White__Spider-Beige",
      "name": "Spider Beige Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "White",
      "slab": "images/italian-marble/White/Spider Beige/Spider Beige1.jpeg",
      "images": [
        {
          "src": "images/italian-marble/White/Spider Beige/Spider Beige1.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/italian-marble/White/Spider Beige/Spider Beige2.jpeg",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "italian-marble__White__Vanila-Beg",
      "name": "Vanila Beg Italian Marble",
      "range": "italian-marble",
      "rangeLabel": "Italian Marble",
      "colour": "White",
      "slab": "images/italian-marble/White/Vanila Beg/Vanila Beg1.jpeg",
      "images": [
        {
          "src": "images/italian-marble/White/Vanila Beg/Vanila Beg1.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "marble-carvings__Concave",
      "name": "Concave",
      "range": "marble-carvings",
      "rangeLabel": "Stone Carving",
      "colour": "Multi",
      "slab": "images/marble-carvings/Concave/slab6.jpeg",
      "images": [
        {
          "src": "images/marble-carvings/Concave/design1.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Concave/design10.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Concave/design11.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Concave/design12.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Concave/design2.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Concave/design3.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Concave/design4.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Concave/design5.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Concave/design6.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Concave/design7.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Concave/design8.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Concave/design9.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Concave/slab6.jpeg",
          "tag": "Slab"
        }
      ],
      "isCarving": true
    },
    {
      "id": "marble-carvings__Concrete",
      "name": "Concrete",
      "range": "marble-carvings",
      "rangeLabel": "Stone Carving",
      "colour": "Multi",
      "slab": "images/marble-carvings/Concrete/slab1.jpeg",
      "images": [
        {
          "src": "images/marble-carvings/Concrete/design1.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Concrete/design10.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Concrete/design11.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Concrete/design12.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Concrete/design13.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Concrete/design14.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Concrete/design15.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Concrete/design16.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Concrete/design2.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Concrete/design3.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Concrete/design4.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Concrete/design5.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Concrete/design6.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Concrete/design7.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Concrete/design8.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Concrete/design9.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Concrete/slab1.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/marble-carvings/Concrete/slab2.jpeg",
          "tag": "Slab"
        }
      ],
      "isCarving": true
    },
    {
      "id": "marble-carvings__Decor-Wall-Designs",
      "name": "Decor Wall Designs",
      "range": "marble-carvings",
      "rangeLabel": "Stone Carving",
      "colour": "Multi",
      "slab": "images/marble-carvings/Decor Wall Designs/3D Sculptural Wall Art Trends That Elevate Modern Homes.jpg",
      "images": [
        {
          "src": "images/marble-carvings/Decor Wall Designs/3D Sculptural Wall Art Trends That Elevate Modern Homes.jpg",
          "tag": "Slab"
        },
        {
          "src": "images/marble-carvings/Decor Wall Designs/3D Sculptural Wall Art.jpg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Decor Wall Designs/3D Simple Art.jpg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Decor Wall Designs/3D Wall Zigzag.jpg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Decor Wall Designs/3D Wall decor.jpg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Decor Wall Designs/3D Zigzag Wall.jpg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Decor Wall Designs/Birds, Flowers Art Decore.jpg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Decor Wall Designs/Cow & Lotus Design.jpg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Decor Wall Designs/Cow & Tree.jpg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Decor Wall Designs/Cross Decor.jpg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Decor Wall Designs/Flowers & Leaf.jpg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Decor Wall Designs/Flowers Wall Decor.jpg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Decor Wall Designs/Hand Lotus With Sawastic.jpg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Decor Wall Designs/Handmade 3D Bas-Relief Artwork by Mak Artworks Studio.jpg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Decor Wall Designs/House Decorate.jpg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Decor Wall Designs/Leaf Artworks.jpg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Decor Wall Designs/Leaf, Lotus Wall design.jpg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Decor Wall Designs/Lotus Wall decor.jpg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Decor Wall Designs/Palm Leaf, Banana Leaf Design.jpg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Decor Wall Designs/Round Shape Lotus & Some Flowers.jpg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Decor Wall Designs/Round Shape Wall Art.jpg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Decor Wall Designs/Rounded Shape Lotus.jpg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Decor Wall Designs/Sand Dunes Wall.jpg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Decor Wall Designs/Simple Design.jpg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Decor Wall Designs/Swaan Wall Art.jpg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Decor Wall Designs/Up & Down Figure.jpg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Decor Wall Designs/Wall Artwork.jpg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Decor Wall Designs/Wave Decor.jpg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Decor Wall Designs/Zen Garden Wall Art Sculpted.jpg",
          "tag": "Design"
        }
      ],
      "isCarving": true
    },
    {
      "id": "marble-carvings__Elevation",
      "name": "Elevation",
      "range": "marble-carvings",
      "rangeLabel": "Stone Carving",
      "colour": "Multi",
      "slab": "images/marble-carvings/Elevation/design1.jpeg",
      "images": [
        {
          "src": "images/marble-carvings/Elevation/design1.jpeg",
          "tag": "Slab"
        }
      ],
      "isCarving": true
    },
    {
      "id": "marble-carvings__Flute",
      "name": "Flute",
      "range": "marble-carvings",
      "rangeLabel": "Stone Carving",
      "colour": "Multi",
      "slab": "images/marble-carvings/Flute/slab5.jpeg",
      "images": [
        {
          "src": "images/marble-carvings/Flute/design1.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Flute/design2.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Flute/design3.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Flute/design4.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Flute/design5.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Flute/design6.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Flute/slab5.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/marble-carvings/Flute/slab6.jpeg",
          "tag": "Slab"
        }
      ],
      "isCarving": true
    },
    {
      "id": "marble-carvings__Marble-Wall-Designs",
      "name": "Marble Wall Designs",
      "range": "marble-carvings",
      "rangeLabel": "Stone Carving",
      "colour": "Multi",
      "slab": "images/marble-carvings/Marble Wall Designs/design1.jpeg",
      "images": [
        {
          "src": "images/marble-carvings/Marble Wall Designs/design1.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/marble-carvings/Marble Wall Designs/design10.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Marble Wall Designs/design11.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Marble Wall Designs/design12.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Marble Wall Designs/design2.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Marble Wall Designs/design3.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Marble Wall Designs/design4.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Marble Wall Designs/design5.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Marble Wall Designs/design6.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Marble Wall Designs/design7.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Marble Wall Designs/design8.jpeg",
          "tag": "Design"
        },
        {
          "src": "images/marble-carvings/Marble Wall Designs/design9.jpeg",
          "tag": "Design"
        }
      ],
      "isCarving": true
    },
    {
      "id": "marble-handicrafts__bathroom-accessories",
      "name": "Bathroom Accessories",
      "range": "marble-handicrafts",
      "rangeLabel": "Marble Handicraft",
      "colour": "Multi",
      "slab": "images/marble-handicrafts/bathroom-accessories/Banswara Basin.jpeg",
      "images": [
        {
          "src": "images/marble-handicrafts/bathroom-accessories/Banswara Basin.jpeg",
          "tag": "Banswara Basin"
        },
        {
          "src": "images/marble-handicrafts/bathroom-accessories/Black Markino WashBasin.jpeg",
          "tag": "Black Markino WashBasin"
        },
        {
          "src": "images/marble-handicrafts/bathroom-accessories/Italian Basin.jpeg",
          "tag": "Italian Basin"
        },
        {
          "src": "images/marble-handicrafts/bathroom-accessories/Satuario Basin.jpeg",
          "tag": "Satuario Basin"
        },
        {
          "src": "images/marble-handicrafts/bathroom-accessories/Satuario White Basin.jpeg",
          "tag": "Satuario White Basin"
        },
        {
          "src": "images/marble-handicrafts/bathroom-accessories/Tooth Brush Set.jpeg",
          "tag": "Tooth Brush Set"
        },
        {
          "src": "images/marble-handicrafts/bathroom-accessories/Vietname Basin.jpeg",
          "tag": "Vietname Basin"
        }
      ],
      "isHandicraft": true
    },
    {
      "id": "marble-handicrafts__diya",
      "name": "Diya",
      "range": "marble-handicrafts",
      "rangeLabel": "Marble Handicraft",
      "colour": "Multi",
      "slab": "images/marble-handicrafts/diya/I.jpeg",
      "images": [
        {
          "src": "images/marble-handicrafts/diya/I.jpeg",
          "tag": "I"
        },
        {
          "src": "images/marble-handicrafts/diya/II.jpeg",
          "tag": "II"
        },
        {
          "src": "images/marble-handicrafts/diya/III.jpeg",
          "tag": "III"
        },
        {
          "src": "images/marble-handicrafts/diya/IV.jpeg",
          "tag": "IV"
        },
        {
          "src": "images/marble-handicrafts/diya/V.jpeg",
          "tag": "V"
        },
        {
          "src": "images/marble-handicrafts/diya/VI.jpeg",
          "tag": "VI"
        }
      ],
      "isHandicraft": true
    },
    {
      "id": "marble-handicrafts__Inlay-marble-Vase",
      "name": "Inlay Marble Vase",
      "range": "marble-handicrafts",
      "rangeLabel": "Marble Handicraft",
      "colour": "Multi",
      "slab": "images/marble-handicrafts/Inlay marble Vase/24_ Marble Flower Vase Gemstone Inlay.jpg",
      "images": [
        {
          "src": "images/marble-handicrafts/Inlay marble Vase/24_ Marble Flower Vase Gemstone Inlay.jpg",
          "tag": "24  Marble Flower Vase Gemstone Inlay"
        },
        {
          "src": "images/marble-handicrafts/Inlay marble Vase/I.jpeg",
          "tag": "I"
        },
        {
          "src": "images/marble-handicrafts/Inlay marble Vase/II.jpeg",
          "tag": "II"
        },
        {
          "src": "images/marble-handicrafts/Inlay marble Vase/III.jpeg",
          "tag": "III"
        },
        {
          "src": "images/marble-handicrafts/Inlay marble Vase/IV.jpeg",
          "tag": "IV"
        },
        {
          "src": "images/marble-handicrafts/Inlay marble Vase/Luxury White Marble Flower Vase Gemstone Inlay.jpg",
          "tag": "Luxury White Marble Flower Vase Gemstone Inlay"
        },
        {
          "src": "images/marble-handicrafts/Inlay marble Vase/Marble Flower Vase Lapis Floral Marquetry Inlay.jpg",
          "tag": "Marble Flower Vase Lapis Floral Marquetry Inlay"
        },
        {
          "src": "images/marble-handicrafts/Inlay marble Vase/White Marble Flower Vase, Jali Carving Pietradura Inlay.jpg",
          "tag": "White Marble Flower Vase, Jali Carving Pietradura Inlay"
        },
        {
          "src": "images/marble-handicrafts/Inlay marble Vase/White Marble Flower Vase, Jali Carving.jpg",
          "tag": "White Marble Flower Vase, Jali Carving"
        },
        {
          "src": "images/marble-handicrafts/Inlay marble Vase/White Marble Vase.jpg",
          "tag": "White Marble Vase"
        },
        {
          "src": "images/marble-handicrafts/Inlay marble Vase/White Marble.jpg",
          "tag": "White Marble"
        }
      ],
      "isHandicraft": true
    },
    {
      "id": "marble-handicrafts__modern-art",
      "name": "Modern Art",
      "range": "marble-handicrafts",
      "rangeLabel": "Marble Handicraft",
      "colour": "Multi",
      "slab": "images/marble-handicrafts/modern-art/banswara marble2.jpeg",
      "images": [
        {
          "src": "images/marble-handicrafts/modern-art/banswara marble2.jpeg",
          "tag": "Banswara Marble2"
        },
        {
          "src": "images/marble-handicrafts/modern-art/basnwara marble1.jpeg",
          "tag": "Basnwara Marble1"
        },
        {
          "src": "images/marble-handicrafts/modern-art/vietnam marble1.jpeg",
          "tag": "Vietnam Marble1"
        },
        {
          "src": "images/marble-handicrafts/modern-art/vietnam marble2.jpeg",
          "tag": "Vietnam Marble2"
        }
      ],
      "isHandicraft": true
    },
    {
      "id": "marble-handicrafts__Onyx-Vase",
      "name": "Onyx Vase",
      "range": "marble-handicrafts",
      "rangeLabel": "Marble Handicraft",
      "colour": "Multi",
      "slab": "images/marble-handicrafts/Onyx Vase/Hand-Carved Natural Onyx Vase.jpg",
      "images": [
        {
          "src": "images/marble-handicrafts/Onyx Vase/Hand-Carved Natural Onyx Vase.jpg",
          "tag": "Hand Carved Natural Onyx Vase"
        },
        {
          "src": "images/marble-handicrafts/Onyx Vase/Handcrafted Onyx Marble Vase.jpg",
          "tag": "Handcrafted Onyx Marble Vase"
        }
      ],
      "isHandicraft": true
    },
    {
      "id": "marble-handicrafts__table-top",
      "name": "Table Top",
      "range": "marble-handicrafts",
      "rangeLabel": "Marble Handicraft",
      "colour": "Multi",
      "slab": "images/marble-handicrafts/table-top/I.jpeg",
      "images": [
        {
          "src": "images/marble-handicrafts/table-top/I.jpeg",
          "tag": "I"
        },
        {
          "src": "images/marble-handicrafts/table-top/II.jpeg",
          "tag": "II"
        },
        {
          "src": "images/marble-handicrafts/table-top/III.jpeg",
          "tag": "III"
        },
        {
          "src": "images/marble-handicrafts/table-top/IV.jpeg",
          "tag": "IV"
        },
        {
          "src": "images/marble-handicrafts/table-top/V.jpeg",
          "tag": "V"
        }
      ],
      "isHandicraft": true
    },
    {
      "id": "onyx__blue__Blue-Onyx",
      "name": "Blue Onyx",
      "range": "onyx",
      "rangeLabel": "Onyx",
      "colour": "Blue",
      "slab": "images/onyx/blue/Blue Onyx.png",
      "images": [
        {
          "src": "images/onyx/blue/Blue Onyx.png",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "onyx__golden__Gold-Pattern-Onyx",
      "name": "Gold Pattern Onyx",
      "range": "onyx",
      "rangeLabel": "Onyx",
      "colour": "Gold",
      "slab": "images/onyx/golden/Gold Pattern Onyx.png",
      "images": [
        {
          "src": "images/onyx/golden/Gold Pattern Onyx.png",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "onyx__golden__Golden-Onyx",
      "name": "Golden Onyx",
      "range": "onyx",
      "rangeLabel": "Onyx",
      "colour": "Gold",
      "slab": "images/onyx/golden/Golden Onyx.png",
      "images": [
        {
          "src": "images/onyx/golden/Golden Onyx.png",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "onyx__green__Green-Onyx",
      "name": "Green Onyx",
      "range": "onyx",
      "rangeLabel": "Onyx",
      "colour": "Green",
      "slab": "images/onyx/green/Green Onyx.png",
      "images": [
        {
          "src": "images/onyx/green/Green Onyx.png",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "onyx__green__green1",
      "name": "Green Onyx I",
      "range": "onyx",
      "rangeLabel": "Onyx",
      "colour": "Green",
      "slab": "images/onyx/green/green1.jpeg",
      "images": [
        {
          "src": "images/onyx/green/green1.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/onyx/green/green1.1.jpeg",
          "tag": "Backlit"
        }
      ]
    },
    {
      "id": "onyx__green__green4",
      "name": "Green Onyx IV",
      "range": "onyx",
      "rangeLabel": "Onyx",
      "colour": "Green",
      "slab": "images/onyx/green/green4.jpeg",
      "images": [
        {
          "src": "images/onyx/green/green4.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "onyx__green__green5",
      "name": "Green Onyx V",
      "range": "onyx",
      "rangeLabel": "Onyx",
      "colour": "Green",
      "slab": "images/onyx/green/green5.jpeg",
      "images": [
        {
          "src": "images/onyx/green/green5.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "onyx__grey__grey1",
      "name": "Grey Onyx I",
      "range": "onyx",
      "rangeLabel": "Onyx",
      "colour": "Grey",
      "slab": "images/onyx/grey/grey1.jpeg",
      "images": [
        {
          "src": "images/onyx/grey/grey1.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "onyx__honey__Black-Spot-Onyx",
      "name": "Black Spot Onyx",
      "range": "onyx",
      "rangeLabel": "Onyx",
      "colour": "Honey",
      "slab": "images/onyx/honey/Black Spot Onyx.png",
      "images": [
        {
          "src": "images/onyx/honey/Black Spot Onyx.png",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "onyx__honey__honey1",
      "name": "Honey Onyx I",
      "range": "onyx",
      "rangeLabel": "Onyx",
      "colour": "Honey",
      "slab": "images/onyx/honey/honey1.1.jpeg",
      "images": [
        {
          "src": "images/onyx/honey/honey1.1.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "onyx__pink__Line-Pink-Onyx",
      "name": "Line Pink Onyx",
      "range": "onyx",
      "rangeLabel": "Onyx",
      "colour": "Pink",
      "slab": "images/onyx/pink/Line Pink Onyx.png",
      "images": [
        {
          "src": "images/onyx/pink/Line Pink Onyx.png",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "onyx__pink__Pink-Onyx",
      "name": "Pink Onyx",
      "range": "onyx",
      "rangeLabel": "Onyx",
      "colour": "Pink",
      "slab": "images/onyx/pink/Pink Onyx.png",
      "images": [
        {
          "src": "images/onyx/pink/Pink Onyx.png",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "onyx__pink__pink2",
      "name": "Pink Onyx II",
      "range": "onyx",
      "rangeLabel": "Onyx",
      "colour": "Pink",
      "slab": "images/onyx/pink/pink2.jpeg",
      "images": [
        {
          "src": "images/onyx/pink/pink2.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/onyx/pink/pink2.1.jpeg",
          "tag": "Backlit"
        }
      ]
    },
    {
      "id": "onyx__white__white1",
      "name": "White Onyx I",
      "range": "onyx",
      "rangeLabel": "Onyx",
      "colour": "White",
      "slab": "images/onyx/white/white1.jpeg",
      "images": [
        {
          "src": "images/onyx/white/white1.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/onyx/white/white1.1.jpeg",
          "tag": "Backlit"
        }
      ]
    },
    {
      "id": "onyx__yellow__Yellow-Onyx",
      "name": "Yellow Onyx",
      "range": "onyx",
      "rangeLabel": "Onyx",
      "colour": "Yellow",
      "slab": "images/onyx/yellow/Yellow Onyx.png",
      "images": [
        {
          "src": "images/onyx/yellow/Yellow Onyx.png",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "onyx__yellow__yellow1",
      "name": "Yellow Onyx I",
      "range": "onyx",
      "rangeLabel": "Onyx",
      "colour": "Yellow",
      "slab": "images/onyx/yellow/yellow1.jpeg",
      "images": [
        {
          "src": "images/onyx/yellow/yellow1.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/onyx/yellow/yellow1.1.jpeg",
          "tag": "Backlit"
        },
        {
          "src": "images/onyx/yellow/yellow1.2.jpeg",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "onyx__yellow__yellow2",
      "name": "Yellow Onyx II",
      "range": "onyx",
      "rangeLabel": "Onyx",
      "colour": "Yellow",
      "slab": "images/onyx/yellow/yellow2.jpeg",
      "images": [
        {
          "src": "images/onyx/yellow/yellow2.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/onyx/yellow/yellow2.1.jpeg",
          "tag": "Backlit"
        },
        {
          "src": "images/onyx/yellow/yellow2.2.jpeg",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "onyx__yellow__yellow3",
      "name": "Yellow Onyx III",
      "range": "onyx",
      "rangeLabel": "Onyx",
      "colour": "Yellow",
      "slab": "images/onyx/yellow/yellow3.jpeg",
      "images": [
        {
          "src": "images/onyx/yellow/yellow3.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/onyx/yellow/yellow3.1.jpeg",
          "tag": "Backlit"
        }
      ]
    },
    {
      "id": "onyx__yellow__yellow4",
      "name": "Yellow Onyx IV",
      "range": "onyx",
      "rangeLabel": "Onyx",
      "colour": "Yellow",
      "slab": "images/onyx/yellow/yellow4.jpeg",
      "images": [
        {
          "src": "images/onyx/yellow/yellow4.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "onyx__yellow__yellow5",
      "name": "Yellow Onyx V",
      "range": "onyx",
      "rangeLabel": "Onyx",
      "colour": "Yellow",
      "slab": "images/onyx/yellow/yellow5.1.jpeg",
      "images": [
        {
          "src": "images/onyx/yellow/yellow5.1.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__Black__belgium-black",
      "name": "Belgium Black",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "Black",
      "slab": "images/premium luxury marble/Black/belgium black.jpeg",
      "images": [
        {
          "src": "images/premium luxury marble/Black/belgium black.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__Black__black-diamond",
      "name": "Black Diamond",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "Black",
      "slab": "images/premium luxury marble/Black/black diamond.jpeg",
      "images": [
        {
          "src": "images/premium luxury marble/Black/black diamond.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__Black__bronze",
      "name": "Bronze",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "Black",
      "slab": "images/premium luxury marble/Black/bronze.jpeg",
      "images": [
        {
          "src": "images/premium luxury marble/Black/bronze.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__Black__bruno-perla-II",
      "name": "Bruno Perla II",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "Black",
      "slab": "images/premium luxury marble/Black/bruno perla II.jpeg",
      "images": [
        {
          "src": "images/premium luxury marble/Black/bruno perla II.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__Black__bruno-perla",
      "name": "Bruno Perla",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "Black",
      "slab": "images/premium luxury marble/Black/bruno perla.jpeg",
      "images": [
        {
          "src": "images/premium luxury marble/Black/bruno perla.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__Brown__deep-river-I",
      "name": "Deep River I",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "Brown",
      "slab": "images/premium luxury marble/Brown/deep river I.jpeg",
      "images": [
        {
          "src": "images/premium luxury marble/Brown/deep river I.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__Brown__deep-river-II",
      "name": "Deep River II",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "Brown",
      "slab": "images/premium luxury marble/Brown/deep river II.jpeg",
      "images": [
        {
          "src": "images/premium luxury marble/Brown/deep river II.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__Brown__deep-river-III",
      "name": "Deep River III",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "Brown",
      "slab": "images/premium luxury marble/Brown/deep river III.jpeg",
      "images": [
        {
          "src": "images/premium luxury marble/Brown/deep river III.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__Brown__deep-river-marble-IV",
      "name": "Deep River Marble IV",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "Brown",
      "slab": "images/premium luxury marble/Brown/deep river marble IV.jpeg",
      "images": [
        {
          "src": "images/premium luxury marble/Brown/deep river marble IV.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__Brown__rosso-statuario",
      "name": "Rosso Statuario",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "Brown",
      "slab": "images/premium luxury marble/Brown/rosso statuario.jpeg",
      "images": [
        {
          "src": "images/premium luxury marble/Brown/rosso statuario.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__Exotic-Collection__EXOTIC-COLLECTION",
      "name": "Exotic Collection Premium Luxury Marble I",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "Multi",
      "slab": "images/premium luxury marble/Exotic Collection/EXOTIC COLLECTION.png",
      "images": [
        {
          "src": "images/premium luxury marble/Exotic Collection/EXOTIC COLLECTION.png",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__Exotic-Collection__Exotic-Marble",
      "name": "Exotic Marble",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "Multi",
      "slab": "images/premium luxury marble/Exotic Collection/Exotic Marble.jpeg",
      "images": [
        {
          "src": "images/premium luxury marble/Exotic Collection/Exotic Marble.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__Gold__santorini",
      "name": "Santorini",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "Gold",
      "slab": "images/premium luxury marble/Gold/santorini.jpeg",
      "images": [
        {
          "src": "images/premium luxury marble/Gold/santorini.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__Grey__Sky-Gold-II",
      "name": "Sky Gold II",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "Grey",
      "slab": "images/premium luxury marble/Grey/Sky Gold II.jpeg",
      "images": [
        {
          "src": "images/premium luxury marble/Grey/Sky Gold II.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__Grey__Sky-Gold-III",
      "name": "Sky Gold III",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "Grey",
      "slab": "images/premium luxury marble/Grey/Sky Gold III.jpeg",
      "images": [
        {
          "src": "images/premium luxury marble/Grey/Sky Gold III.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__Grey__ash-grey",
      "name": "Ash Grey",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "Grey",
      "slab": "images/premium luxury marble/Grey/ash grey.jpeg",
      "images": [
        {
          "src": "images/premium luxury marble/Grey/ash grey.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__Grey__aurora-blue",
      "name": "Aurora Blue",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "Grey",
      "slab": "images/premium luxury marble/Grey/aurora blue.jpeg",
      "images": [
        {
          "src": "images/premium luxury marble/Grey/aurora blue.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__Grey__baltic-grey",
      "name": "Baltic Grey",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "Grey",
      "slab": "images/premium luxury marble/Grey/baltic grey.jpeg",
      "images": [
        {
          "src": "images/premium luxury marble/Grey/baltic grey.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__Grey__bardiglio-I",
      "name": "Bardiglio I",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "Grey",
      "slab": "images/premium luxury marble/Grey/bardiglio I.jpeg",
      "images": [
        {
          "src": "images/premium luxury marble/Grey/bardiglio I.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__Grey__bardiglio-II",
      "name": "Bardiglio II",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "Grey",
      "slab": "images/premium luxury marble/Grey/bardiglio II.jpeg",
      "images": [
        {
          "src": "images/premium luxury marble/Grey/bardiglio II.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__Grey__caviar-gold-",
      "name": "Caviar Gold ",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "Grey",
      "slab": "images/premium luxury marble/Grey/caviar gold .jpeg",
      "images": [
        {
          "src": "images/premium luxury marble/Grey/caviar gold .jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__Grey__galapagos-I",
      "name": "Galapagos I",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "Grey",
      "slab": "images/premium luxury marble/Grey/galapagos I.jpeg",
      "images": [
        {
          "src": "images/premium luxury marble/Grey/galapagos I.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__Purple__purple-patch",
      "name": "Purple Patch",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "Purple",
      "slab": "images/premium luxury marble/Purple/purple patch.jpeg",
      "images": [
        {
          "src": "images/premium luxury marble/Purple/purple patch.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__Red__rosso-anatolia-I",
      "name": "Rosso Anatolia I",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "Red",
      "slab": "images/premium luxury marble/Red/rosso anatolia I.jpeg",
      "images": [
        {
          "src": "images/premium luxury marble/Red/rosso anatolia I.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__Red__rosso-anatolia-II",
      "name": "Rosso Anatolia II",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "Red",
      "slab": "images/premium luxury marble/Red/rosso anatolia II.jpeg",
      "images": [
        {
          "src": "images/premium luxury marble/Red/rosso anatolia II.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__Red__rosso-levanto-I",
      "name": "Rosso Levanto I",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "Red",
      "slab": "images/premium luxury marble/Red/rosso levanto I.jpeg",
      "images": [
        {
          "src": "images/premium luxury marble/Red/rosso levanto I.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__Red__rosso-levanto-II",
      "name": "Rosso Levanto II",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "Red",
      "slab": "images/premium luxury marble/Red/rosso levanto II.jpeg",
      "images": [
        {
          "src": "images/premium luxury marble/Red/rosso levanto II.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__White__Exotic-Marble",
      "name": "Exotic Marble",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "White",
      "slab": "images/premium luxury marble/White/Exotic Marble.jpeg",
      "images": [
        {
          "src": "images/premium luxury marble/White/Exotic Marble.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__White__Galapagos-Marble",
      "name": "Galapagos Marble",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "White",
      "slab": "images/premium luxury marble/White/Galapagos Marble.jpg",
      "images": [
        {
          "src": "images/premium luxury marble/White/Galapagos Marble.jpg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__White__Lembo-Beige-II",
      "name": "Lembo Beige II",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "White",
      "slab": "images/premium luxury marble/White/Lembo Beige II.jpeg",
      "images": [
        {
          "src": "images/premium luxury marble/White/Lembo Beige II.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__White__Lembo-Beige-III",
      "name": "Lembo Beige III",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "White",
      "slab": "images/premium luxury marble/White/Lembo Beige III.jpeg",
      "images": [
        {
          "src": "images/premium luxury marble/White/Lembo Beige III.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__White__apollo-white",
      "name": "Apollo White",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "White",
      "slab": "images/premium luxury marble/White/apollo white.jpeg",
      "images": [
        {
          "src": "images/premium luxury marble/White/apollo white.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__White__bardiglio",
      "name": "Bardiglio",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "White",
      "slab": "images/premium luxury marble/White/bardiglio.jpeg",
      "images": [
        {
          "src": "images/premium luxury marble/White/bardiglio.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__White__bianco-fusion-wow",
      "name": "Bianco Fusion Wow",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "White",
      "slab": "images/premium luxury marble/White/bianco fusion wow.jpeg",
      "images": [
        {
          "src": "images/premium luxury marble/White/bianco fusion wow.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__White__fendi-blue-I",
      "name": "Fendi Blue I",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "White",
      "slab": "images/premium luxury marble/White/fendi blue I.jpeg",
      "images": [
        {
          "src": "images/premium luxury marble/White/fendi blue I.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__White__fendi-blue-II",
      "name": "Fendi Blue II",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "White",
      "slab": "images/premium luxury marble/White/fendi blue II.jpeg",
      "images": [
        {
          "src": "images/premium luxury marble/White/fendi blue II.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__White__palissandro-white-I",
      "name": "Palissandro White I",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "White",
      "slab": "images/premium luxury marble/White/palissandro white I.jpeg",
      "images": [
        {
          "src": "images/premium luxury marble/White/palissandro white I.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__White__palissandro-white-II",
      "name": "Palissandro White II",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "White",
      "slab": "images/premium luxury marble/White/palissandro white II.jpeg",
      "images": [
        {
          "src": "images/premium luxury marble/White/palissandro white II.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__White__sofita-beige",
      "name": "Sofita Beige",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "White",
      "slab": "images/premium luxury marble/White/sofita beige.jpeg",
      "images": [
        {
          "src": "images/premium luxury marble/White/sofita beige.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__Yellow__Blue-Aazur-I",
      "name": "Blue Aazur I",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "Yellow",
      "slab": "images/premium luxury marble/Yellow/Blue Aazur I.jpeg",
      "images": [
        {
          "src": "images/premium luxury marble/Yellow/Blue Aazur I.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__Yellow__Blue-Aazur-II",
      "name": "Blue Aazur II",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "Yellow",
      "slab": "images/premium luxury marble/Yellow/Blue Aazur II.jpeg",
      "images": [
        {
          "src": "images/premium luxury marble/Yellow/Blue Aazur II.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__Yellow__galapagos-II",
      "name": "Galapagos II",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "Yellow",
      "slab": "images/premium luxury marble/Yellow/galapagos II.jpeg",
      "images": [
        {
          "src": "images/premium luxury marble/Yellow/galapagos II.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "premium-luxury-marble__Yellow__terra-vesta",
      "name": "Terra Vesta",
      "range": "premium-luxury-marble",
      "rangeLabel": "Premium Luxury Marble",
      "colour": "Yellow",
      "slab": "images/premium luxury marble/Yellow/terra vesta.jpeg",
      "images": [
        {
          "src": "images/premium luxury marble/Yellow/terra vesta.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "satwario__Beige__Beige",
      "name": "Beige Statuario",
      "range": "satwario",
      "rangeLabel": "Statuario",
      "colour": "Beige",
      "slab": "images/satwario/Beige/Beige/Beige1.jpeg",
      "images": [
        {
          "src": "images/satwario/Beige/Beige/Beige1.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "satwario__Black__Nsl-Black",
      "name": "Nsl Black Statuario",
      "range": "satwario",
      "rangeLabel": "Statuario",
      "colour": "Black",
      "slab": "images/satwario/Black/Nsl Black/Nsl Black1.jpeg",
      "images": [
        {
          "src": "images/satwario/Black/Nsl Black/Nsl Black1.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/satwario/Black/Nsl Black/Nsl Black2.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/satwario/Black/Nsl Black/Nsl Black3.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/satwario/Black/Nsl Black/Nsl Black4.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/satwario/Black/Nsl Black/Nsl Black5.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/satwario/Black/Nsl Black/Nsl Black6.jpeg",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "satwario__Brown__Metal-Rust",
      "name": "Metal Rust Statuario",
      "range": "satwario",
      "rangeLabel": "Statuario",
      "colour": "Brown",
      "slab": "images/satwario/Brown/Metal Rust/Metal Rust1.jpeg",
      "images": [
        {
          "src": "images/satwario/Brown/Metal Rust/Metal Rust1.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/satwario/Brown/Metal Rust/Metal Rust2.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/satwario/Brown/Metal Rust/Metal Rust3.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/satwario/Brown/Metal Rust/Metal Rust4.jpeg",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "satwario__Brown__Premium",
      "name": "Premium Statuario",
      "range": "satwario",
      "rangeLabel": "Statuario",
      "colour": "Brown",
      "slab": "images/satwario/Brown/Premium/Satwario Premium11.jpeg",
      "images": [
        {
          "src": "images/satwario/Brown/Premium/Satwario Premium11.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/satwario/Brown/Premium/Satwario Premium12.jpeg",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "satwario__Purple__Purple",
      "name": "Purple Statuario",
      "range": "satwario",
      "rangeLabel": "Statuario",
      "colour": "Purple",
      "slab": "images/satwario/Purple/Purple/Purple1.jpeg",
      "images": [
        {
          "src": "images/satwario/Purple/Purple/Purple1.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/satwario/Purple/Purple/Purple2.jpeg",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "satwario__White__Alexander",
      "name": "Alexander Statuario",
      "range": "satwario",
      "rangeLabel": "Statuario",
      "colour": "White",
      "slab": "images/satwario/White/Alexander/Alexander1.jpeg",
      "images": [
        {
          "src": "images/satwario/White/Alexander/Alexander1.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "satwario__White__Angelo-Golden-Line",
      "name": "Angelo Golden Line Statuario",
      "range": "satwario",
      "rangeLabel": "Statuario",
      "colour": "White",
      "slab": "images/satwario/White/Angelo Golden Line/Angelo White.jpeg",
      "images": [
        {
          "src": "images/satwario/White/Angelo Golden Line/Angelo White.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "satwario__White__Angelo-White",
      "name": "Angelo White Statuario",
      "range": "satwario",
      "rangeLabel": "Statuario",
      "colour": "White",
      "slab": "images/satwario/White/Angelo White/Angelo White1.jpeg",
      "images": [
        {
          "src": "images/satwario/White/Angelo White/Angelo White1.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/satwario/White/Angelo White/Angelo White2.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/satwario/White/Angelo White/Angelo White3.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/satwario/White/Angelo White/Angelo White4.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/satwario/White/Angelo White/Angelo White5.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/satwario/White/Angelo White/Angelo White6.jpeg",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "satwario__White__Calcutta-Gold",
      "name": "Calcutta Gold Statuario",
      "range": "satwario",
      "rangeLabel": "Statuario",
      "colour": "White",
      "slab": "images/satwario/White/Calcutta Gold/Calacatta Gold2.jpeg",
      "images": [
        {
          "src": "images/satwario/White/Calcutta Gold/Calacatta Gold2.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/satwario/White/Calcutta Gold/Calcutta Gold1.jpeg",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "satwario__White__Crystal",
      "name": "Crystal Statuario",
      "range": "satwario",
      "rangeLabel": "Statuario",
      "colour": "White",
      "slab": "images/satwario/White/Crystal/Crystal1.jpeg",
      "images": [
        {
          "src": "images/satwario/White/Crystal/Crystal1.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "satwario__White__Diamond",
      "name": "Diamond Statuario",
      "range": "satwario",
      "rangeLabel": "Statuario",
      "colour": "White",
      "slab": "images/satwario/White/Diamond/Satwario Diamond1.jpeg",
      "images": [
        {
          "src": "images/satwario/White/Diamond/Satwario Diamond1.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "satwario__White__Exotic-Grey",
      "name": "Exotic Grey Statuario",
      "range": "satwario",
      "rangeLabel": "Statuario",
      "colour": "White",
      "slab": "images/satwario/White/Exotic Grey/Exotic Grey1.jpeg",
      "images": [
        {
          "src": "images/satwario/White/Exotic Grey/Exotic Grey1.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/satwario/White/Exotic Grey/Exotic Grey2.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/satwario/White/Exotic Grey/Exotic Grey3.jpeg",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "satwario__White__Exotic-Grey-Premium",
      "name": "Exotic Grey Premium Statuario",
      "range": "satwario",
      "rangeLabel": "Statuario",
      "colour": "White",
      "slab": "images/satwario/White/Exotic Grey Premium/Exotic Grey Pemium1.jpeg",
      "images": [
        {
          "src": "images/satwario/White/Exotic Grey Premium/Exotic Grey Pemium1.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "satwario__White__Extra",
      "name": "Extra Statuario",
      "range": "satwario",
      "rangeLabel": "Statuario",
      "colour": "White",
      "slab": "images/satwario/White/Extra/Satwario Extra1.jpeg",
      "images": [
        {
          "src": "images/satwario/White/Extra/Satwario Extra1.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/satwario/White/Extra/Satwario Extra2.jpeg",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "satwario__White__Golden-Line",
      "name": "Golden Line Statuario",
      "range": "satwario",
      "rangeLabel": "Statuario",
      "colour": "White",
      "slab": "images/satwario/White/Golden Line/Satwario Golden Line1.jpeg",
      "images": [
        {
          "src": "images/satwario/White/Golden Line/Satwario Golden Line1.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "satwario__White__Greece-White",
      "name": "Greece White Statuario",
      "range": "satwario",
      "rangeLabel": "Statuario",
      "colour": "White",
      "slab": "images/satwario/White/Greece White/Greece White1.jpeg",
      "images": [
        {
          "src": "images/satwario/White/Greece White/Greece White1.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "satwario__White__Premium",
      "name": "Premium Statuario",
      "range": "satwario",
      "rangeLabel": "Statuario",
      "colour": "White",
      "slab": "images/satwario/White/Premium/PREMIUM STATUARIO.png",
      "images": [
        {
          "src": "images/satwario/White/Premium/PREMIUM STATUARIO.png",
          "tag": "Slab"
        },
        {
          "src": "images/satwario/White/Premium/Premium.png",
          "tag": "Installed"
        },
        {
          "src": "images/satwario/White/Premium/Satwario Premium1.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/satwario/White/Premium/Satwario Premium10.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/satwario/White/Premium/Satwario Premium2.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/satwario/White/Premium/Satwario Premium3.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/satwario/White/Premium/Satwario Premium4.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/satwario/White/Premium/Satwario Premium5.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/satwario/White/Premium/Satwario Premium7.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/satwario/White/Premium/Satwario Premium8.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/satwario/White/Premium/Satwario Premium9.jpeg",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "satwario__White__Satwario",
      "name": "Satwario Statuario",
      "range": "satwario",
      "rangeLabel": "Statuario",
      "colour": "White",
      "slab": "images/satwario/White/Satwario/Satwario1.jpeg",
      "images": [
        {
          "src": "images/satwario/White/Satwario/Satwario1.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/satwario/White/Satwario/Satwario2.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/satwario/White/Satwario/Satwario3.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/satwario/White/Satwario/Satwario4.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/satwario/White/Satwario/Satwario5.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/satwario/White/Satwario/Satwario6.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/satwario/White/Satwario/Satwario7.jpeg",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "satwario__White__Volakas",
      "name": "Volakas Statuario",
      "range": "satwario",
      "rangeLabel": "Statuario",
      "colour": "White",
      "slab": "images/satwario/White/Volakas/Volakas1.jpeg",
      "images": [
        {
          "src": "images/satwario/White/Volakas/Volakas1.jpeg",
          "tag": "Slab"
        },
        {
          "src": "images/satwario/White/Volakas/Volakas2.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/satwario/White/Volakas/Volakas3.jpeg",
          "tag": "Installed"
        },
        {
          "src": "images/satwario/White/Volakas/Volakas4.jpeg",
          "tag": "Installed"
        }
      ]
    },
    {
      "id": "travertine__Beige",
      "name": "Beige — Travertine",
      "range": "travertine",
      "rangeLabel": "Travertine",
      "colour": "Multi",
      "slab": "images/travertine/Beige.jpeg",
      "images": [
        {
          "src": "images/travertine/Beige.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "travertine__Navona",
      "name": "Navona — Travertine",
      "range": "travertine",
      "rangeLabel": "Travertine",
      "colour": "Multi",
      "slab": "images/travertine/Navona.jpeg",
      "images": [
        {
          "src": "images/travertine/Navona.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "travertine__Roman",
      "name": "Roman — Travertine",
      "range": "travertine",
      "rangeLabel": "Travertine",
      "colour": "Multi",
      "slab": "images/travertine/Roman.jpeg",
      "images": [
        {
          "src": "images/travertine/Roman.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "travertine__Silver-I",
      "name": "Silver I — Travertine",
      "range": "travertine",
      "rangeLabel": "Travertine",
      "colour": "Multi",
      "slab": "images/travertine/Silver I.jpeg",
      "images": [
        {
          "src": "images/travertine/Silver I.jpeg",
          "tag": "Slab"
        }
      ]
    },
    {
      "id": "travertine__White",
      "name": "White — Travertine",
      "range": "travertine",
      "rangeLabel": "Travertine",
      "colour": "Multi",
      "slab": "images/travertine/White.jpeg",
      "images": [
        {
          "src": "images/travertine/White.jpeg",
          "tag": "Slab"
        }
      ]
    }
  ]
};
/* CATALOG_END */

function loadCatalog() {
  CATALOG = (window.__CATALOG && window.__CATALOG.stones) || [];
  if (CATALOG.length === 0) {
    console.warn('Catalog is empty — run: node scan.js');
    // Show a helpful message in the grids
    ['onyx-photo-grid','range-grid','colour-grid'].forEach(id => {
      const el = document.getElementById(id);
      if (el && el.children.length === 0) {
        el.innerHTML = `<div class="no-results">
          <p>No stones in catalog yet</p>
          <span>Run <code style="font-family:monospace;color:var(--gold)">node scan.js</code> in your HM_website folder to scan your images</span>
        </div>`;
      }
    });
  }
  // Only build grids that exist on this page
  if (document.getElementById('onyx-photo-grid'))  buildOnyxPage();
  if (document.getElementById('range-grid'))        buildRangeGrid();
  if (document.getElementById('colour-grid'))       buildColourGrid();
  if (document.getElementById('carving-grid'))      buildCarvingGrid();
  if (document.getElementById('handicraft-grid'))   buildHandicraftGrid();
  if (document.getElementById('gallery-grid'))      buildGallery();

  // On collection.html: activate the correct view based on URL params
  if (document.getElementById('page-range') || document.getElementById('page-colour')) {
    initCollectionPage();
  }
}

// ── ONYX PAGE ──────────────────────────────────────
function showOnyxPage() {
  showPage('onyx');
}

function buildOnyxPage() {
  const stones = CATALOG.filter(s => s.range === 'onyx');
  buildColourPills('onyx-colour-pills', 'filterOnyxColour', stones);
  renderPhotoGrid('onyx-photo-grid', 'onyx-photo-count', stones, 'all');
}

function filterOnyxColour(value, btn) {
  document.querySelectorAll('#page-onyx .coll-pill').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const stones = CATALOG.filter(s => s.range === 'onyx');
  renderPhotoGrid('onyx-photo-grid', 'onyx-photo-count', stones, value);
}

// ── RANGE PAGE ─────────────────────────────────────
// Groups catalog stones by colour+range — one card per colour per range.
// Clicking opens a lightbox with ALL images from every stone in that colour group.
function buildRangeGrid() {
  const grid = document.getElementById('range-grid');
  if (!grid) return;

  // Remove any previously injected catalog cards (clean rebuild)
  grid.querySelectorAll('.stone-card[data-catalog-id]').forEach(c => c.remove());

  // Build groups:
  // - VARIETY stones (3-level id: range__colour__variety) → one tile each, no merging
  // - STANDARD stones (2-level id: range__colour__base)  → merge by range+colour
  const groups = new Map();

  CATALOG.forEach(stone => {
    if (stone.range === 'onyx') return;          // onyx has its own page
    if (stone.range === 'marble-carvings') return; // carvings have their own page

    // Determine whether this stone gets its OWN tile or is merged into a colour-group tile.
    //
    // Merge into colour-group ONLY when the stone has a purely generic name:
    //   third part = colour + optional digits only  e.g. "black", "black1", "yellow2"
    // Every stone with a real proper name gets its own tile:
    //   "Black-Fish", "Green-Apple", "Angelo-White", "Bagera-Black" → own tile
    //
    const idParts     = stone.id.split('__');
    const thirdPart   = idParts[2] || '';
    const colourLower = stone.colour.toLowerCase();
    // Generic = third part is exactly the colour word followed by nothing or digits only
    const isGenericName = /^[a-z]+\d*$/.test(thirdPart.toLowerCase()) &&
                          thirdPart.toLowerCase().replace(/\d+$/, '') === colourLower;
    const isVariety = !isGenericName;

    // Travertine stones use the full stone id as key so each tile is individual
    const isRomanNumeralRange = stone.range === 'travertine';

    // Individual-tile stones (e.g. indian-marble) have 4-part IDs and each get their own tile
    const isIndividualTile = stone.individualTile === true || idParts.length >= 4;

    let key;
    if (isVariety || isRomanNumeralRange || isIndividualTile) {
      key = stone.id;
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          name:        stone.name,
          colour:      stone.colour,
          rangeLabel:  stone.rangeLabel,
          range:       stone.range,
          slab:        stone.slab,
          allImages:   [],
          isVariety:   true,
          subCategory: stone.subCategory || '',
        });
      }
    } else {
      // Standard stone — merge all of same colour+range into one tile
      key = stone.range + '__colour__' + stone.colour.toLowerCase();
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          name:       stone.colour + ' ' + stone.rangeLabel,
          colour:     stone.colour,
          rangeLabel: stone.rangeLabel,
          range:      stone.range,
          slab:       stone.slab,
          allImages:  [],
          isVariety:  false,
        });
      }
    }

    const g = groups.get(key);
    stone.images.forEach(img => {
      g.allImages.push({ src: img.src, tag: stone.name + (img.tag !== 'Slab' ? ' · ' + img.tag : '') });
    });
  });

  // Store groups for openGroupModal
  grid._colourGroups = Object.fromEntries(groups);

  groups.forEach(g => {
    const dot   = COLOUR_DOTS[g.colour] || '#888';
    const extra = g.allImages.length - 1;
    const card  = document.createElement('div');
    card.className = 'stone-card';
    card.dataset.range       = g.range;
    card.dataset.colour      = g.colour.toLowerCase();
    card.dataset.catalogId   = g.key;
    card.dataset.subCategory = (g.subCategory || '').toLowerCase();
    card.innerHTML = `
      <div class="stone-card-img-wrap" style="aspect-ratio:3/4;overflow:hidden;position:relative;">
        <img src="${g.slab}" alt="${g.name}" loading="lazy"
             style="width:100%;height:100%;object-fit:cover;display:block;transition:transform .7s ease"
             onerror="this.parentElement.innerHTML='<div class=\'stone-swatch sw-onyx\'></div>'">
        ${extra > 0 ? `<div class="onyx-card-count" style="position:absolute;bottom:8px;right:8px;">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
          </svg>+${extra} photo${extra>1?'s':''}
        </div>` : ''}
      </div>
      <div class="stone-badge">${g.rangeLabel}</div>
      <div class="stone-card-info">
        <div class="stone-name">${g.name}</div>
        <div class="stone-meta">
          <span class="stone-colour-dot" style="background:${dot}"></span>
          ${g.colour} · ${g.rangeLabel}
        </div>
      </div>
      <div class="stone-card-overlay">
        <div class="stone-overlay-name">${g.name}</div>
        <div class="stone-overlay-desc">${g.colour} · ${g.rangeLabel}</div>
        <button class="stone-overlay-btn" onclick="${g.range === 'indian-marble' ? `openIndianMarbleDetail('${g.key}')` : `openGroupModal('${g.key}')`}">View Gallery</button>
      </div>`;
    if (g.range === 'indian-marble') {
      card.addEventListener('click', () => openIndianMarbleDetail(g.key));
    } else {
      card.addEventListener('click', () => openGroupModal(g.key));
    }
    grid.appendChild(card);
  });

  buildRangePills();
}

function buildRangePills() {
  const bar = document.querySelector('#page-range .coll-filter-bar-inner');
  if (!bar) return;

  const catalogRanges = [...new Set(CATALOG.filter(s=>s.range!=='onyx').map(s=>s.range))];
  catalogRanges.forEach(range => {
    const label = CATALOG.find(s=>s.range===range)?.rangeLabel || range;
    if (bar.querySelector(`[data-range-filter="${range}"]`)) return; // already exists
    const btn = document.createElement('button');
    btn.className = 'coll-pill';
    btn.dataset.rangeFilter = range;
    btn.textContent = label;
    btn.onclick = () => filterRange(range, btn);
    // Insert before the count span
    const count = bar.querySelector('.coll-results-count');
    bar.insertBefore(btn, count);
  });
}

// ── COLOUR PAGE ────────────────────────────────────
// Variety stones (3-level): one tile each
// Standard stones (2-level): one tile per colour+range combo
function buildColourGrid() {
  const grid = document.getElementById('colour-grid');
  if (!grid) return;

  const COLOUR_DOT_STYLES = {
    'Green':'#2D6A4F','White':'#F5F0E8','Honey':'#C9A84C','Gold':'#C9A84C',
    'Blue':'#4A6FA5','Grey':'#8A8880','Pink':'#E8A0B0','Yellow':'#D4AC0D',
    'Red':'#C0392B','Brown':'#7B4F2E','Black':'#1C1C1C','Purple':'#7B5EA7',
    'Orange':'#E07B39','Beige':'#D4B896','Cream':'#F5F0E8','Multi':'linear-gradient(135deg,#e74c3c,#3498db,#2ecc71)'
  };

  grid.querySelectorAll('.stone-card[data-catalog-id]').forEach(c => c.remove());

  const groups = new Map();
  CATALOG.forEach(stone => {
    if (stone.range === 'marble-carvings') return; // carvings have their own page
    const idParts     = stone.id.split('__');
    const thirdPart   = idParts[2] || '';
    const colourLower = stone.colour.toLowerCase();
    const isGenericName = /^[a-z]+\d*$/.test(thirdPart.toLowerCase()) &&
                          thirdPart.toLowerCase().replace(/\d+$/, '') === colourLower;
    const isVariety  = !isGenericName;
    const isRomanNumeralRange = stone.range === 'travertine';
    const isIndividualTile = stone.individualTile === true || idParts.length >= 4;

    let key, name;
    if (isVariety || isRomanNumeralRange || isIndividualTile) {
      key  = stone.id;
      name = stone.name;
    } else {
      key  = stone.colour.toLowerCase() + '__' + stone.range;
      name = stone.colour + ' ' + stone.rangeLabel;
    }

    if (!groups.has(key)) {
      groups.set(key, { key, name, colour: stone.colour, range: stone.range, rangeLabel: stone.rangeLabel, slab: stone.slab, allImages: [] });
    }
    const g = groups.get(key);
    stone.images.forEach(img => {
      g.allImages.push({ src: img.src, tag: stone.name + (img.tag !== 'Slab' ? ' · ' + img.tag : '') });
    });
  });

  grid._colourGroups = Object.fromEntries(groups);

  groups.forEach(g => {
    const dot   = COLOUR_DOT_STYLES[g.colour] || '#888';
    const extra = g.allImages.length - 1;
    const card  = document.createElement('div');
    card.className = 'stone-card';
    card.dataset.range     = g.range;
    card.dataset.colour    = g.colour.toLowerCase();
    card.dataset.catalogId = g.key;
    card.style.cursor = 'pointer';
    card.setAttribute('onclick', `openGroupModal('${g.key}')`);
    card.innerHTML = `
      <div class="stone-card-img-wrap" style="aspect-ratio:3/4;overflow:hidden;position:relative;">
        <img src="${g.slab}" alt="${g.name}" loading="lazy"
             style="width:100%;height:100%;object-fit:cover;display:block;transition:transform .7s ease"
             onerror="this.parentElement.innerHTML='<div class=\'stone-swatch sw-onyx\'></div>'">
        ${extra > 0 ? `<div class="onyx-card-count" style="position:absolute;bottom:8px;right:8px;">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
          </svg>+${extra} photo${extra>1?'s':''}
        </div>` : ''}
      </div>
      <div class="stone-badge">${g.colour}</div>
      <div class="stone-card-info">
        <div class="stone-name">${g.name}</div>
        <div class="stone-meta">
          <span class="stone-colour-dot" style="background:${dot}"></span>
          ${g.rangeLabel}
        </div>
      </div>
      <div class="stone-card-overlay">
        <div class="stone-overlay-name">${g.name}</div>
        <div class="stone-overlay-desc">${g.colour} · ${g.rangeLabel}</div>
        <button class="stone-overlay-btn" onclick="openGroupModal('${g.key}')">View Gallery</button>
      </div>`;
    grid.appendChild(card);
  });

  buildColourPagePills();
  const countEl = document.getElementById('colour-count');
  if (countEl) countEl.textContent = 'Showing all ' + groups.size + ' collections';
}

// ══════════════════════════════════════
// STONE CARVING PAGE
// ══════════════════════════════════════
let carvingBuilt = false;

function buildCarvingGrid() {
  const grid  = document.getElementById('carving-grid');
  const empty = document.getElementById('carving-empty');
  if (!grid) return;

  const carvings = CATALOG.filter(s => s.range === 'marble-carvings');

  if (!carvings.length) {
    grid.style.display  = 'none';
    empty.style.display = 'block';
    return;
  }

  grid.style.display  = '';
  empty.style.display = 'none';

  // Store for modal lookup (always refresh)
  grid._carvings = Object.fromEntries(carvings.map(s => [s.id, s]));

  grid.innerHTML = carvings.map(stone => {
    const slabImgs   = stone.images.filter(i => i.tag === 'Slab');
    const designImgs = stone.images.filter(i => i.tag === 'Design');
    const totalExtra = stone.images.length - 1;

    const countBadge = totalExtra > 0
      ? `<div class="onyx-card-count" style="position:absolute;bottom:8px;right:8px;">
           <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
           </svg>+${totalExtra} photo${totalExtra>1?'s':''}
         </div>` : '';

    // e.g. "2 Slabs · 3 Designs"
    const tagSummary = [
      slabImgs.length   ? slabImgs.length   + ' Slab'   + (slabImgs.length   > 1 ? 's' : '') : '',
      designImgs.length ? designImgs.length + ' Design' + (designImgs.length > 1 ? 's' : '') : '',
    ].filter(Boolean).join(' · ');

    return `
      <div class="stone-card" style="cursor:pointer" onclick="openCarvingModal('${stone.id}')">
        <div class="stone-card-img-wrap" style="aspect-ratio:3/4;overflow:hidden;position:relative;">
          <img src="${stone.slab}" alt="${stone.name}" loading="lazy"
               style="width:100%;height:100%;object-fit:cover;display:block;transition:transform .7s ease"
               onerror="this.parentElement.innerHTML='<div style=\'width:100%;height:100%;background:#1a1a1a\'></div>'">
          <div class="onyx-card-badge" style="
            position:absolute;top:10px;left:10px;
            background:rgba(0,0,0,.62);padding:.25rem .65rem;
            font-size:.55rem;letter-spacing:.15em;text-transform:uppercase;color:var(--gold);">
            Stone Carving
          </div>
          ${countBadge}
        </div>
        <div class="stone-card-info">
          <div class="stone-name" style="
            font-family:'Cormorant Garamond',serif;
            font-size:1.35rem;font-weight:300;letter-spacing:.06em;">
            ${stone.name}
          </div>
          <div class="stone-meta" style="
            font-size:.62rem;letter-spacing:.15em;
            color:rgba(245,240,232,.4);text-transform:uppercase;margin-top:.3rem;">
            ${tagSummary}
          </div>
        </div>
        <div class="stone-card-overlay">
          <div class="stone-overlay-name">${stone.name}</div>
          <div class="stone-overlay-desc">${tagSummary}</div>
          <button class="stone-overlay-btn"
            onclick="event.stopPropagation();openCarvingModal('${stone.id}')">
            View Gallery
          </button>
        </div>
      </div>`;
  }).join('');
}

// ── Carving lightbox (reuses onyx-modal) ──
function openCarvingModal(stoneId) {
  const grid   = document.getElementById('carving-grid');
  const stone  = (grid && grid._carvings && grid._carvings[stoneId])
               || CATALOG.find(s => s.id === stoneId)
               || null;
  if (!stone) return;

  modalStone = stone;
  modalIdx   = 0;

  document.getElementById('modal-stone-name').textContent = stone.name;
  document.getElementById('modal-stone-sub').textContent  =
    'Stone Carving · Hargobind Marble';

  const strip = document.getElementById('modal-thumb-strip');
  strip.innerHTML = stone.images.map((img, i) => `
    <div class="modal-thumb ${i===0?'active':''}" onclick="setModalImage(${i})" id="thumb-${i}">
      <img src="${img.src}" alt="${img.tag}" loading="lazy">
      <div class="modal-thumb-tag">${img.tag}</div>
    </div>`).join('');

  setModalImage(0);
  document.getElementById('onyx-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

// Build carving grid when page is shown
// (handled inside showPage — see "if (pageId === 'gallery')" pattern)

// ══════════════════════════════════════
// INDIAN MARBLE DETAIL PAGE
// Opens a full-page photo grid for one Indian Marble variety
// ══════════════════════════════════════
function openIndianMarbleDetail(stoneId) {
  const stone = CATALOG.find(s => s.id === stoneId);
  if (!stone) return;

  // Roman numeral converter
  function toRoman(n) {
    const v = [50,40,10,9,5,4,1], s = ['L','XL','X','IX','V','IV','I'];
    let r = '';
    for (let i = 0; i < v.length; i++) while (n >= v[i]) { r += s[i]; n -= v[i]; }
    return r;
  }

  document.getElementById('im-detail-title').textContent      = stone.name;
  document.getElementById('im-detail-breadcrumb').textContent = stone.name;

  const grid = document.getElementById('im-photo-grid');
  grid.innerHTML = stone.images.map((img, i) => `
    <div class="im-photo-item" onclick="openIMDetailLightbox('${stoneId}', ${i})">
      <img src="${img.src}" alt="${img.tag}" loading="lazy">
      <div class="im-photo-tag">${toRoman(i + 1)}</div>
    </div>`).join('');

  grid._stone = stone;
  showPage('indian-marble-detail');
}

// Lightbox for detail page — reuses the onyx-modal
function openIMDetailLightbox(stoneId, idx) {
  const stone = CATALOG.find(s => s.id === stoneId);
  if (!stone) return;
  modalStone = stone;
  modalIdx   = idx;
  document.getElementById('modal-stone-name').textContent = stone.name;
  document.getElementById('modal-stone-sub').textContent  = 'Indian Marble · Hargobind Marble';
  renderThumbStrip(stone.images, idx);
  setModalImage(idx);
  document.getElementById('onyx-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

// Build colour filter pills dynamically from whatever is actually in the grid
function buildColourPagePills() {
  const container = document.getElementById('colour-pills-container');
  if (!container) return;

  const COLOUR_DOT_STYLES = {
    'green':'#2D6A4F','white':'#F5F0E8','honey':'#C9A84C','gold':'#C9A84C',
    'blue':'#4A6FA5','grey':'#8A8880','pink':'#E8A0B0','yellow':'#D4AC0D',
    'red':'#C0392B','brown':'#7B4F2E','black':'#1C1C1C','purple':'#7B5EA7',
    'orange':'#E07B39','beige':'#D4B896','cream':'#F5F0E8',
    'multi':'linear-gradient(135deg,#e74c3c,#3498db,#2ecc71)'
  };

  // Collect all unique colours from every card in the grid
  const grid = document.getElementById('colour-grid');
  const colours = [...new Set(
    [...grid.querySelectorAll('.stone-card')].map(c => c.dataset.colour).filter(Boolean)
  )].sort();

  container.innerHTML =
    `<button class="coll-pill active" onclick="filterColour('all',this)">All</button>` +
    colours.map(c => {
      const dot = COLOUR_DOT_STYLES[c] || '#888';
      const isGradient = dot.startsWith('linear');
      const dotHtml = `<span class="cpip" style="background:${dot};${isGradient?'border:none':''}"></span>`;
      return `<button class="coll-pill" onclick="filterColour('${c}',this)">${dotHtml}${c.charAt(0).toUpperCase()+c.slice(1)}</button>`;
    }).join('');
}

function filterColour(value, btn) {
  document.querySelectorAll('#page-colour .coll-pill').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const cards = document.querySelectorAll('#colour-grid .stone-card');
  let visible = 0;
  cards.forEach(card => {
    const show = value === 'all' || card.dataset.colour === value.toLowerCase();
    card.style.display = show ? '' : 'none';
    if (show) visible++;
  });

  const label = value === 'all' ? 'all colours' : value.charAt(0).toUpperCase() + value.slice(1);
  const title = value === 'all' ? 'Stones by Colour' : label + ' Stones';
  document.getElementById('colour-page-title').textContent = title;
  document.getElementById('colour-breadcrumb').textContent = title;
  document.getElementById('colour-count').textContent = value === 'all'
    ? 'Showing all ' + visible + ' collections'
    : 'Showing ' + visible + ' ' + label + ' collections';
}

// ── GENERIC PHOTO GRID RENDERER (grouped by colour) ───────────────────
// One tile per colour group; lightbox shows ALL images from every stone in that colour.
function renderPhotoGrid(gridId, countId, stones, colourFilter) {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  const filtered = (!colourFilter || colourFilter === 'all')
    ? stones
    : stones.filter(s => s.colour.toLowerCase() === colourFilter.toLowerCase());

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="no-results"><p>No stones found</p><span>Try a different filter</span></div>`;
    const cnt = document.getElementById(countId);
    if (cnt) cnt.textContent = '0 colours';
    return;
  }

  // Group stones by colour (within the same range — they share range already)
  const groups = new Map(); // colour → { colour, rangeLabel, range, slab, allImages[] }
  filtered.forEach(stone => {
    const key = stone.colour;
    if (!groups.has(key)) {
      groups.set(key, {
        colour: stone.colour,
        rangeLabel: stone.rangeLabel,
        range: stone.range,
        slab: stone.slab,
        allImages: []
      });
    }
    const g = groups.get(key);
    // Add all images of this stone, tagging each with the stone name
    stone.images.forEach(img => {
      g.allImages.push({ src: img.src, tag: stone.name + (img.tag !== 'Slab' ? ' · ' + img.tag : '') });
    });
  });

  grid.innerHTML = [...groups.values()].map(g => {
    const groupKey = g.range + '__colour__' + g.colour.toLowerCase();
    const extra = g.allImages.length - 1;
    const countBadge = extra > 0
      ? `<div class="onyx-card-count">
           <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
           </svg>+${extra} photo${extra>1?'s':''}
         </div>` : '';
    return `
      <div class="onyx-card" onclick="openGroupModal('${groupKey}')">
        <div class="onyx-card-img-wrap">
          <img src="${g.slab}" alt="${g.colour} ${g.rangeLabel}" loading="lazy"
               onerror="this.closest('.onyx-card-img-wrap').style.background='#1a1a1a';this.style.display='none'">
          <div class="onyx-card-badge">${g.colour} ${g.rangeLabel}</div>
          ${countBadge}
        </div>
        <div class="onyx-card-info">
          <div class="onyx-card-name">${g.colour} ${g.rangeLabel}</div>
          <div class="onyx-card-meta">${g.colour} · ${g.rangeLabel}</div>
        </div>
        <div class="onyx-card-hover-layer">
          <button class="onyx-hover-btn">View Gallery</button>
        </div>
      </div>`;
  }).join('');

  // Store groups so openGroupModal can find them
  grid._colourGroups = Object.fromEntries(
    [...groups.entries()].map(([colour, g]) => [g.range + '__colour__' + colour.toLowerCase(), g])
  );

  const cnt = document.getElementById(countId);
  if (cnt) cnt.textContent = groups.size + ' colour' + (groups.size !== 1 ? 's' : '');
}

// ── Colour filter pills (built from actual loaded stones) ──
function buildColourPills(containerId, filterFn, stones) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const colours = [...new Set(stones.map(s=>s.colour))].sort();
  container.innerHTML =
    `<button class="coll-pill active" onclick="${filterFn}('all',this)">All</button>` +
    colours.map(c =>
      `<button class="coll-pill" onclick="${filterFn}('${c}',this)">${c}</button>`
    ).join('');
}

// ── UNIVERSAL STONE MODAL ─────────────────────────
function openStoneModal(stoneId) {
  modalStone = CATALOG.find(s => s.id === stoneId);
  if (!modalStone) return;
  modalIdx = 0;

  document.getElementById('modal-stone-name').textContent = modalStone.name;
  document.getElementById('modal-stone-sub').textContent =
    modalStone.colour + ' · ' + modalStone.rangeLabel + ' · Hargobind Marble';

  const strip = document.getElementById('modal-thumb-strip');
  strip.innerHTML = modalStone.images.map((img,i) => `
    <div class="modal-thumb ${i===0?'active':''}" onclick="setModalImage(${i})" id="thumb-${i}">
      <img src="${img.src}" alt="${img.tag}" loading="lazy">
      <div class="modal-thumb-tag">${img.tag}</div>
    </div>`).join('');

  setModalImage(0);
  document.getElementById('onyx-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

// ── GROUP MODAL — opens a lightbox for a colour group ─
// Used by renderPhotoGrid tiles (one tile per colour, all images combined)
function openGroupModal(groupKey) {
  // Search all grids that store _colourGroups
  let group = null;
  const gridsToSearch = [
    ...document.querySelectorAll('[id$="-photo-grid"]'),
    document.getElementById('range-grid'),
    document.getElementById('colour-grid')
  ];
  for (const grid of gridsToSearch) {
    if (grid && grid._colourGroups && grid._colourGroups[groupKey]) {
      group = grid._colourGroups[groupKey];
      break;
    }
  }
  if (!group) return;

  modalStone = { name: group.colour + ' ' + group.rangeLabel, colour: group.colour, rangeLabel: group.rangeLabel, images: group.allImages };
  modalIdx = 0;

  document.getElementById('modal-stone-name').textContent = group.colour + ' ' + group.rangeLabel;
  document.getElementById('modal-stone-sub').textContent =
    group.colour + ' · ' + group.rangeLabel + ' · Hargobind Marble';

  const strip = document.getElementById('modal-thumb-strip');
  strip.innerHTML = group.allImages.map((img, i) => `
    <div class="modal-thumb ${i===0?'active':''}" onclick="setModalImage(${i})" id="thumb-${i}">
      <img src="${img.src}" alt="${img.tag}" loading="lazy">
      <div class="modal-thumb-tag">${img.tag}</div>
    </div>`).join('');

  setModalImage(0);
  document.getElementById('onyx-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

// Keep old name as alias for backward compat with any inline onclick
function openOnyxModal(id) { openStoneModal(id); }

function closeOnyxModal() {
  document.getElementById('onyx-modal').classList.remove('open');
  document.body.style.overflow = '';
}

function setModalImage(index) {
  if (!modalStone) return;
  const imgs = modalStone.images;
  if (index < 0) index = imgs.length - 1;
  if (index >= imgs.length) index = 0;
  modalIdx = index;

  const mainImg = document.getElementById('modal-main-img');
  const label   = document.getElementById('modal-img-label');
  mainImg.classList.add('fade');
  setTimeout(() => {
    mainImg.src = imgs[index].src;
    mainImg.alt = imgs[index].tag;
    label.textContent = imgs[index].tag + ' — ' + modalStone.name;
    mainImg.classList.remove('fade');
  }, 200);

  document.querySelectorAll('.modal-thumb').forEach((t,i) => t.classList.toggle('active', i===index));
  const t = document.getElementById('thumb-'+index);
  if (t) t.scrollIntoView({ block:'nearest', behavior:'smooth' });
}

document.addEventListener('keydown', e => {
  if (!document.getElementById('onyx-modal').classList.contains('open')) return;
  if (e.key==='ArrowRight') setModalImage(modalIdx+1);
  if (e.key==='ArrowLeft')  setModalImage(modalIdx-1);
  if (e.key==='Escape')     closeOnyxModal();
});

// Loader animation
const _ls = document.createElement('style');
_ls.textContent = `@keyframes loader-pulse{0%,100%{opacity:.3;transform:scaleX(.6)}50%{opacity:1;transform:scaleX(1)}}`;
document.head.appendChild(_ls);

// ── Boot ──────────────────────────────────────────
loadCatalog();

// ── Mobile touch: tapping a stone card opens the modal (no hover needed) ──
function addMobileTapHandlers() {
  if (window.matchMedia('(hover:none)').matches) {
    document.querySelectorAll('.stone-card-overlay').forEach(overlay => {
      overlay.style.opacity = '0';
    });
  }
}
document.addEventListener('DOMContentLoaded', addMobileTapHandlers);


// ══════════════════════════════════════
// GALLERY PAGE ENGINE
// Images are probed from supporting_pics/gallery/
// Name them: 01.jpg, 02.jpg, 03.jpg … (up to 99)
// Drop images in, refresh — they appear automatically.
// ══════════════════════════════════════
const GALLERY_EXTS = ['jpg','jpeg','JPG','JPEG','png','PNG','webp','WEBP'];
let galleryImages = [];
let galleryIdx    = 0;

function probeGalleryImage(basePath) {
  return new Promise(resolve => {
    let i = 0;
    function tryNext() {
      if (i >= GALLERY_EXTS.length) { resolve(null); return; }
      const url = basePath + '.' + GALLERY_EXTS[i++];
      const img = new Image();
      img.onload  = () => resolve(url);
      img.onerror = tryNext;
      img.src = url;
    }
    tryNext();
  });
}

async function buildGallery() {
  const grid  = document.getElementById('gallery-grid');
  const empty = document.getElementById('gallery-empty');
  if (!grid) return;

  galleryImages = [];

  // Probe up to 99 images: supporting_pics/gallery/01, 02, 03 …
  const probes = [];
  for (let n = 1; n <= 99; n++) {
    const pad  = n < 10 ? '0' + n : '' + n;
    probes.push(probeGalleryImage('supporting_pics/gallery/' + pad));
  }
  const results = await Promise.all(probes);
  galleryImages = results.filter(Boolean);

  if (galleryImages.length === 0) {
    grid.style.display   = 'none';
    empty.style.display  = 'block';
    return;
  }

  grid.style.display   = '';
  empty.style.display  = 'none';

  grid.innerHTML = galleryImages.map((src, i) => `
    <div onclick="openGalleryModal(${i})" style="
      overflow:hidden; cursor:pointer; position:relative;
      background:#111; aspect-ratio:4/3;
    ">
      <img src="${src}" loading="lazy" alt="Installation photo ${i+1}" style="
        width:100%; height:100%; object-fit:cover; display:block;
        transition:transform .7s ease, filter .4s ease;
      " onmouseover="this.style.transform='scale(1.06)';this.style.filter='brightness(1.08)'"
         onmouseout="this.style.transform='';this.style.filter=''">
      <div style="
        position:absolute; inset:0;
        background:linear-gradient(to top, rgba(0,0,0,.45) 0%, transparent 45%);
        pointer-events:none;
      "></div>
      <div style="
        position:absolute; bottom:.7rem; right:.8rem;
        font-size:.58rem; letter-spacing:.15em; color:rgba(245,240,232,.5);
        text-transform:uppercase;
      ">${i+1} / ${galleryImages.length}</div>
    </div>`).join('');
}

function openGalleryModal(idx) {
  galleryIdx = idx;
  const modal = document.getElementById('gallery-modal');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  updateGalleryModal();
}

function closeGalleryModal() {
  document.getElementById('gallery-modal').style.display = 'none';
  document.body.style.overflow = '';
}

function shiftGallery(dir) {
  galleryIdx = (galleryIdx + dir + galleryImages.length) % galleryImages.length;
  updateGalleryModal();
}

function updateGalleryModal() {
  const img     = document.getElementById('gallery-modal-img');
  const counter = document.getElementById('gallery-modal-counter');
  img.style.opacity = '0';
  img.style.transition = 'opacity .25s';
  setTimeout(() => {
    img.src = galleryImages[galleryIdx];
    img.style.opacity = '1';
  }, 150);
  counter.textContent = (galleryIdx + 1) + ' / ' + galleryImages.length;
}

// Keyboard nav for gallery modal
document.addEventListener('keydown', e => {
  const modal = document.getElementById('gallery-modal');
  if (!modal || modal.style.display === 'none') return;
  if (e.key === 'ArrowRight') shiftGallery(1);
  if (e.key === 'ArrowLeft')  shiftGallery(-1);
  if (e.key === 'Escape')     closeGalleryModal();
});

// Build gallery when page is shown — handled inside showPage above

// ══════════════════════════════════════
// MARBLE HANDICRAFTS PAGE ENGINE
// Reads stones with range === 'marble-handicrafts' from CATALOG.
// Each unique sub-folder (category) becomes one tile on the listing page.
// Clicking a tile opens a full photo-grid detail page.
// ══════════════════════════════════════

let handicraftBuilt = false;

function buildHandicraftGrid() {
  const grid  = document.getElementById('handicraft-grid');
  const empty = document.getElementById('handicraft-empty');
  if (!grid) return;

  // All handicraft stones — each stone IS one category tile
  const items = CATALOG.filter(s => s.range === 'marble-handicrafts');

  if (!items.length) {
    grid.style.display  = 'none';
    empty.style.display = 'block';
    return;
  }

  grid.style.display  = '';
  if (empty) empty.style.display = 'none';

  grid.innerHTML = items.map(item => {
    const count = item.images.length;
    const countBadge = count > 1
      ? `<div class="onyx-card-count" style="position:absolute;bottom:8px;right:8px;">
           <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
           </svg>${count} photo${count > 1 ? 's' : ''}
         </div>` : '';

    return `
      <div class="stone-card" style="cursor:pointer" onclick="openHandicraftCategory('${item.id}')">
        <div style="aspect-ratio:3/4;overflow:hidden;position:relative;">
          <img src="${item.slab}" alt="${item.name}" loading="lazy"
               style="width:100%;height:100%;object-fit:cover;display:block;transition:transform .7s ease"
               onerror="this.parentElement.innerHTML='<div style=\'width:100%;height:100%;background:#1a1a1a\'></div>'">
          <div style="position:absolute;top:10px;left:10px;background:rgba(0,0,0,.62);padding:.25rem .65rem;font-size:.55rem;letter-spacing:.15em;text-transform:uppercase;color:var(--gold);">
            Handicraft
          </div>
          ${countBadge}
        </div>
        <div class="stone-card-info">
          <div class="stone-name" style="font-family:'Cormorant Garamond',serif;font-size:1.35rem;font-weight:300;letter-spacing:.06em;">
            ${item.name}
          </div>
          <div class="stone-meta" style="font-size:.62rem;letter-spacing:.15em;color:rgba(245,240,232,.4);text-transform:uppercase;margin-top:.3rem;">
            ${count} piece${count !== 1 ? 's' : ''} · Marble Handicraft
          </div>
        </div>
        <div class="stone-card-overlay">
          <div class="stone-overlay-name">${item.name}</div>
          <div class="stone-overlay-desc">${count} piece${count !== 1 ? 's' : ''} in this collection</div>
          <button class="stone-overlay-btn" onclick="event.stopPropagation();openHandicraftCategory('${item.id}')">
            View Collection
          </button>
        </div>
      </div>`;
  }).join('');
}

function openHandicraftCategory(itemId) {
  const item = CATALOG.find(s => s.id === itemId);
  if (!item) return;

  document.getElementById('hd-detail-title').textContent      = item.name;
  document.getElementById('hd-detail-breadcrumb').textContent = item.name;
  document.getElementById('hd-detail-subtitle').textContent   =
    item.images.length + ' piece' + (item.images.length !== 1 ? 's' : '') + ' · Marble Handicraft · Hargobind Marble';

  // Roman numeral helper
  function toRoman(n) {
    const v = [50,40,10,9,5,4,1], s = ['L','XL','X','IX','V','IV','I'];
    let r = ''; for (let i=0;i<v.length;i++) while(n>=v[i]){r+=s[i];n-=v[i];} return r;
  }

  const grid = document.getElementById('hd-photo-grid');
  grid.innerHTML = item.images.map((img, i) => `
    <div class="im-photo-item" onclick="openHandicraftLightbox('${itemId}', ${i})">
      <img src="${img.src}" alt="${img.tag}" loading="lazy">
      <div class="im-photo-tag">${toRoman(i + 1)}</div>
    </div>`).join('');

  grid._item = item;
  showPage('handicraft-detail');
}

function openHandicraftLightbox(itemId, idx) {
  const item = CATALOG.find(s => s.id === itemId);
  if (!item) return;

  modalStone = item;
  modalIdx   = idx;

  document.getElementById('modal-stone-name').textContent = item.name;
  document.getElementById('modal-stone-sub').textContent  =
    'Marble Handicraft · Hargobind Marble';

  const strip = document.getElementById('modal-thumb-strip');
  strip.innerHTML = item.images.map((img, i) => `
    <div class="modal-thumb ${i===idx?'active':''}" onclick="setModalImage(${i})" id="thumb-${i}">
      <img src="${img.src}" alt="${img.tag}" loading="lazy">
      <div class="modal-thumb-tag">${img.tag}</div>
    </div>`).join('');

  setModalImage(idx);
  document.getElementById('onyx-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}



// ══════════════════════════════════════
// COLLECTION PAGE URL INIT
// Reads ?view=range|colour&filter=X from URL and activates the right tab
// ══════════════════════════════════════
function initCollectionPage() {
  const params = new URLSearchParams(window.location.search);
  const view   = params.get('view')   || 'range';
  const filter = params.get('filter') || 'all';
  const sub    = params.get('sub');
  const stoneId= params.get('stone');

  const rangeSection  = document.getElementById('page-range');
  const colourSection = document.getElementById('page-colour');
  const imDetail      = document.getElementById('page-indian-marble-detail');

  // Helper: scope page toggling to the page-group container
  const pageGroup = document.querySelector('.page-group');
  function activatePage(el) {
    if (!el) return;
    if (pageGroup) {
      pageGroup.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    }
    el.classList.add('active');
  }

  if (stoneId && imDetail) {
    activatePage(imDetail);
    if (document.getElementById('mainNav')) document.getElementById('mainNav').classList.add('solid');
    setTimeout(() => openIndianMarbleDetail(stoneId), 200);
    return;
  }

  if (view === 'colour') {
    activatePage(colourSection);
    if (colourSection) {
      buildColourGrid();
      if (filter !== 'all') {
        setTimeout(() => filterColour(filter, document.querySelector('[data-colour-filter="'+filter+'"]')), 150);
      }
    }
  } else {
    activatePage(rangeSection);
    if (rangeSection) {
      if (sub) {
        setTimeout(() => filterRangeSub(filter, sub), 150);
      } else if (filter !== 'all') {
        setTimeout(() => filterRange(filter, document.querySelector('[data-range-filter="'+filter+'"]')), 150);
      }
    }
  }
}

