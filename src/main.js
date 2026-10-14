import './styles.css';
import {
  SITE, navigation, photos, leaders, parks, wildlife, birds, sanctuaries, gameReserves,
  conservationAreas, mapPages, documents, adpProjects, psdpProjects, frfProjects,
  projectPages, updates, team, sourcePages, sourceGaps,
} from './data.js';

const root = document.getElementById('app');
const official = SITE.officialUrl;
let listingPage = 1;
let selectedMapIndex = 0;
let mapZoom = 1;
let mapOffset = { x: 0, y: 0 };
let mapDragging = false;
let mapDragStart = { x: 0, y: 0 };
let activeGalleryCategory = 'All';
let galleryImages = [];
let searchDialogPreviousFocus = null;

const esc = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const attr = esc;
const slugify = (value = '') => String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const normalizedPath = (path = '/') => {
  const decoded = decodeURIComponent(path.split('?')[0].split('#')[0] || '/');
  const clean = decoded.replace(/\/{2,}/g, '/');
  return clean === '/' ? '/' : `${clean.replace(/\/$/, '')}/`;
};
const isExternal = (href = '') => /^https?:\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:');
const icon = (name, size = 18) => {
  const paths = {
    arrow: '<path d="M4 12h15M13 5l7 7-7 7"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"/>',
    search: '<circle cx="10.8" cy="10.8" r="6.4"/><path d="m16 16 4.5 4.5"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    download: '<path d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5M5 21h14"/>',
    file: '<path d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    forest: '<path d="M12 3 6 12h4l-4 6h12l-4-6h4L12 3Z"/><path d="M12 18v3"/>',
    mountain: '<path d="m3 19 6.5-10 3.2 4.5 2.2-3.2L21 19H3Z"/><path d="m8.5 11 1.7 2.2 1.3-1.6"/>',
    leaf: '<path d="M20 4c-7 0-13 2-13 9a6 6 0 0 0 6 6c7 0 7-8 7-15Z"/><path d="M4 21c3-5 7-8 12-11"/>',
    shield: '<path d="M12 3 19 6v5c0 4.8-2.8 8-7 10-4.2-2-7-5.2-7-10V6l7-3Z"/><path d="m9 12 2 2 4-4"/>',
    map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/><path d="M9 3v15m6-12v15"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
    phone: '<path d="M7 3h3l1.4 4-2 1.4a14 14 0 0 0 6.2 6.2l1.4-2L21 14v3c0 1.1-.9 2-2 2A16 16 0 0 1 5 5c0-1.1.9-2 2-2Z"/>',
    pin: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.2"/>',
    paw: '<circle cx="7" cy="7" r="1.8"/><circle cx="12" cy="5" r="1.8"/><circle cx="17" cy="7" r="1.8"/><circle cx="19" cy="12" r="1.7"/><path d="M12 11c-3 0-6 3-6 5.4 0 1.3 1.1 2.1 2.4 1.8 1-.2 1.9-.8 3.6-.8s2.6.6 3.6.8c1.3.3 2.4-.5 2.4-1.8 0-2.4-3-5.4-6-5.4Z"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z"/><path d="M4 17a2.5 2.5 0 0 1 2.5-2.5H20M8 7h7"/>',
    eye: '<path d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    expand: '<path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    people: '<path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM17 11a4 4 0 0 0 0-8M21 21v-2a4 4 0 0 0-3-3.9"/>',
    play: '<path d="m8 5 11 7-11 7V5Z"/>',
  };
  return `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.arrow}</svg>`;
};

function canonicalRoute(path) {
  let route = normalizedPath(path);
  const aliases = {
    '/home/': '/', '/contact-us/': '/contact-us-2/', '/contact-us-2': '/contact-us-2/',
    '/environment/': '/environment/', '/environment-2/': '/environment-2/',
    '/category/notifications/': '/notifications/', '/category/tenders/': '/tender/',
    '/category/top-stories/': '/press-release/', '/category/trophy-hunting/': '/trophy-hunting/',
    '/category/forest-species/': '/forest/', '/category/uncategorized/': '/press-release/',
    '/tenders/': '/tender/', '/careers/': '/career/', '/press-releases/': '/press-release/',
    '/maps-and-data/': '/maps/', '/wildlife/': '/parks-and-widlife/',
    '/handrap-national-park/': '/handrap-national-park/', '/hundrap-national-park/': '/handrap-national-park/',
  };
  return aliases[route] || route;
}

function findTopLevel(path) {
  const route = normalizedPath(path);
  let active = '';
  const walk = (items, top = '') => {
    for (const item of items) {
      const rootLabel = top || item.label;
      if (item.href && item.href !== '/' && (route === normalizedPath(item.href) || route.startsWith(normalizedPath(item.href)))) active = rootLabel;
      if (item.children?.length) walk(item.children, rootLabel);
    }
  };
  walk(navigation);
  if (route === '/') return 'Home';
  if (/^\/(\d{4})\//.test(route) || route.startsWith('/news/') || route.startsWith('/tenders/')) return 'Advertisements';
  if (route.startsWith('/project/')) return 'Development Portfolio';
  if (route.startsWith('/resource/')) return 'Publications';
  if (route.startsWith('/birds/')) return 'Attached Departments';
  return active;
}

function navTree(items, depth = 0, parentKey = 'root') {
  return `<ul class="nav-list nav-level-${depth}">${items.map((item, index) => {
    const key = `${parentKey}-${index}-${slugify(item.label)}`;
    const route = canonicalRoute(location.pathname);
    const activeTop = findTopLevel(route) === (depth === 0 ? item.label : findTopLevel(route));
    const exact = route === canonicalRoute(item.href || '');
    const hasChildren = Boolean(item.children?.length);
    return `<li class="nav-item ${hasChildren ? 'has-children' : ''} ${activeTop && depth === 0 ? 'top-active' : ''}" data-nav-item="${attr(key)}">
      <div class="nav-entry">
        <a class="nav-link ${exact ? 'current' : ''}" href="${attr(item.href)}" ${exact ? 'aria-current="page"' : ''}>${esc(item.label)}</a>
        ${hasChildren ? `<button type="button" class="nav-caret" aria-label="Show ${attr(item.label)} submenu" aria-expanded="false" data-action="menu-toggle" data-menu-id="${attr(key)}">${icon('chevron', 14)}</button>` : ''}
      </div>
      ${hasChildren ? `<div class="submenu" id="submenu-${attr(key)}">${navTree(item.children, depth + 1, key)}</div>` : ''}
    </li>`;
  }).join('')}</ul>`;
}

function renderHeader() {
  return `<header class="site-header">
    <div class="topbar">
      <div class="container topbar-inner">
        <a href="/" class="topbar-gov">${icon('shield', 13)} <span>${esc(SITE.government)}</span></a>
        <div class="topbar-links">
          <a href="mailto:${attr(SITE.email)}">${icon('mail', 12)} ${esc(SITE.email)}</a>
          <span class="topbar-divider" aria-hidden="true"></span>
          <a href="${official}/" target="_blank" rel="noopener noreferrer">Official source ${icon('external', 11)}</a>
        </div>
      </div>
    </div>
    <div class="brand-row container">
      <a class="brand-lockup" href="/" aria-label="Forest, Wildlife & Environment Department home">
        <img class="brand-emblem" src="/assets/gb-emblem.png" alt="Gilgit-Baltistan government emblem" width="54" height="54" />
        <span class="brand-copy"><span class="brand-kicker">GOVERNMENT OF GILGIT-BALTISTAN</span><span class="brand-name">Forest, Wildlife &amp; Environment Department</span><span class="brand-caption">Gilgit-Baltistan, Pakistan</span></span>
      </a>
      <div class="brand-aside">
        <span>Conserving today,<br />for generations to come.</span>
        <span class="brand-aside-mark">${icon('leaf', 24)}<b>GB<br />NATURE</b></span>
      </div>
    </div>
    <div class="nav-bar" id="nav-bar">
      <div class="container nav-container">
        <button type="button" class="mobile-menu-toggle" aria-expanded="false" aria-controls="primary-navigation" data-action="mobile-menu">${icon('menu', 20)} <span>Menu</span></button>
        <nav id="primary-navigation" class="primary-navigation" aria-label="Main navigation">${navTree(navigation)}</nav>
        <button type="button" class="header-search" aria-label="Open search" data-action="open-search">${icon('search', 18)}<span class="visually-hidden">Search</span></button>
      </div>
    </div>
  </header>`;
}

function searchDialogMarkup() {
  return `<div class="search-overlay" id="search-overlay" hidden>
    <div class="search-scrim" data-action="close-search" aria-hidden="true"></div>
    <section class="search-panel" role="dialog" aria-modal="true" aria-labelledby="search-title">
      <div class="search-panel-head"><div><span class="eyebrow">SEARCH THE DEPARTMENT</span><h2 id="search-title">What are you looking for?</h2></div><button type="button" class="icon-button" aria-label="Close search" data-action="close-search">${icon('close', 19)}</button></div>
      <form class="search-form" id="global-search-form"><label class="visually-hidden" for="global-search-input">Search content</label><div class="search-input-wrap">${icon('search', 19)}<input id="global-search-input" type="search" autocomplete="off" placeholder="Try “national parks”, “forest act”, or “tender”…" /><button type="submit" class="btn btn-primary">Search</button></div></form>
      <div class="search-suggestions" id="global-search-results" aria-live="polite"><p class="muted">Search projects, wildlife, official notices, reports and maps.</p></div>
      <div class="search-foot">Search covers the local content index. External documents open at their official source.</div>
    </section>
  </div>`;
}

function renderFooter() {
  return `<section class="contact-strip"><div class="container contact-strip-inner"><span class="contact-strip-icon">${icon('mail', 20)}</span><div><span class="eyebrow">LET'S WORK TOGETHER</span><h2>Conservation starts with a conversation.</h2><p>For information, assistance or departmental enquiries, get in touch.</p></div><a href="/contact-us-2/" class="btn btn-dark">Contact the department ${icon('arrow', 15)}</a></div></section>
  <footer class="site-footer">
    <div class="container footer-main">
      <div class="footer-brand"><a href="/" class="footer-brand-lockup"><img src="/assets/gb-emblem.png" alt="" width="42" height="42" /><span><b>Forest, Wildlife &amp;<br />Environment Department</b><small>Government of Gilgit-Baltistan</small></span></a><p>Conserving our high mountain forests, wildlife and environment through sustainable management and community partnership.</p><a href="${official}/" class="footer-official" target="_blank" rel="noopener noreferrer">Official department website ${icon('external', 12)}</a></div>
      <div class="footer-column"><h2>Explore</h2><a href="/about-us/">About the department</a><a href="/forest/">Our areas of work</a><a href="/projects/">Development portfolio</a><a href="/maps/">Maps &amp; protected areas</a></div>
      <div class="footer-column"><h2>Information &amp; resources</h2><a href="/tender/">Tenders &amp; notices</a><a href="/reports/">Reports</a><a href="/publications/">Publications</a><a href="/acts/">Acts, rules &amp; policies</a></div>
      <div class="footer-column footer-contact"><h2>Get in touch</h2><p>${icon('pin', 14)} <span>${esc(SITE.address)}</span></p><p>${icon('phone', 14)} <a href="tel:+925811920146">${esc(SITE.phone)}</a></p><p>${icon('mail', 14)} <a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a></p><a href="/contact-us-2/" class="footer-contact-link">Department directory ${icon('arrow', 13)}</a></div>
    </div>
    <div class="container footer-bottom"><span>© ${new Date().getFullYear()} Forest, Wildlife &amp; Environment Department, Gilgit-Baltistan</span><div><a href="/resources/">Resources &amp; image credits</a><a href="/developers/">Accessibility</a><a href="#main" class="to-top" aria-label="Back to top">↑</a></div></div>
  </footer>`;
}

function dateLabel(date) {
  if (!date) return 'Date not stated';
  const parsed = new Date(`${date}T12:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? date : new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(parsed);
}

function btnLink(href, label, type = 'primary', external = false) {
  return `<a class="btn btn-${attr(type)}" href="${attr(href)}" ${external ? 'target="_blank" rel="noopener noreferrer"' : ''}>${esc(label)} ${icon(external ? 'external' : 'arrow', 14)}</a>`;
}

function eyebrow(text) { return `<span class="eyebrow">${esc(text)}</span>`; }

function updateCard(item, compact = false) {
  const hasDownload = Boolean(item.attachment);
  return `<article class="update-card ${compact ? 'compact' : ''}">
    <div class="update-card-top"><span class="tag">${esc(item.category)}</span><time datetime="${attr(item.date)}">${esc(dateLabel(item.date))}</time></div>
    <h3><a href="${attr(item.route)}">${esc(item.title)}</a></h3>
    <p>${esc(item.summary || 'Open the department source record for this notice and any related information.')}</p>
    <div class="update-card-bottom"><a href="${attr(item.route)}" class="text-link">Read full update ${icon('arrow', 13)}</a>${hasDownload ? `<a href="${attr(item.attachment)}" class="small-icon-link" target="_blank" rel="noopener noreferrer" aria-label="Open official attachment for ${attr(item.title)}">${icon('download', 14)}</a>` : ''}</div>
  </article>`;
}

function latestItemsForTab(tab) {
  if (tab === 'Tenders') return updates.filter(item => item.category === 'Tenders').slice(0, 3);
  if (tab === 'Public Notices') return updates.filter(item => item.category === 'Public Notices').slice(0, 3);
  if (tab === 'Jobs') return [];
  return updates.filter(item => item.category === 'News' || item.category === 'Trophy Hunting').slice(0, 3);
}

function renderHome() {
  const vision = 'Protecting, conserving, managing and developing the forestry, wildlife and allied resources of Gilgit-Baltistan through sustainable integrated natural resource management, with a vision to develop the region as a biodiversity pool and a hub for eco-tourism.';
  const quickLinks = [
    ['Forest', 'About our green heritage', '/forest/', 'forest'],
    ['Parks & Wildlife', 'Protecting life in the wild', '/parks-and-widlife/', 'mountain'],
    ['Environment', 'A healthier, greener region', '/environment/', 'leaf'],
    ['Public resources', 'Information & publications', '/resources/', 'file'],
  ];
  const work = [
    { num: '01', label: 'FORESTS & NATURE', title: 'Forest', desc: 'Conserving natural forests, restoring landscapes and supporting sustainable forestry with local communities.', href: '/forest/', photo: photos.valley.src, photoAlt: 'Astore Valley landscape, used as regional illustrative imagery', photoCredit: photos.valley.credit, photoSource: photos.valley.source, icon: 'forest' },
    { num: '02', label: 'PROTECT & CONSERVE', title: 'Parks & Wildlife', desc: 'Safeguarding wildlife and their habitats through protected areas and community-led conservation.', href: '/parks-and-widlife/', photo: photos.hero.src, photoAlt: 'Sheosar Lake landscape in Deosai National Park', photoCredit: photos.hero.credit, photoSource: photos.hero.source, icon: 'mountain' },
    { num: '03', label: 'SAFEGUARD & MONITOR', title: 'Environment', desc: 'Protecting our environment, preventing pollution and promoting sustainable development across the region.', href: '/environment/', photo: photos.flowers.src, photoAlt: 'Yellow and orange poppies in Deosai National Park', photoCredit: photos.flowers.credit, photoSource: photos.flowers.source, icon: 'leaf' },
  ];
  return `<div class="home-page">
    <section class="hero" aria-labelledby="home-title" style="--hero-image:url('/assets/hero-lake.jpg')">
      <div class="container hero-inner"><div class="hero-copy">${eyebrow('NATURE IS OUR LEGACY')}<h1 id="home-title">Protecting nature.<br /> <span>Preserving our future.</span></h1><p>Working together to conserve the forests, wildlife and extraordinary landscapes of Gilgit-Baltistan.</p><div class="hero-actions">${btnLink('/forest/', 'Explore our work', 'primary')}${btnLink('/about-us/', 'About the department', 'outline-light')}</div><div class="hero-meta"><span>${icon('shield', 13)} Conservation. Communities. A sustainable tomorrow.</span><span class="hero-location">${icon('pin', 13)} Gilgit-Baltistan, Pakistan</span><a class="hero-photo-credit" href="${attr(photos.hero.source)}" target="_blank" rel="noopener noreferrer">Photo: Imran Shah · CC BY-SA 2.0 ${icon('external', 10)}</a></div></div></div>
    </section>
    <div class="container quick-links-wrap"><div class="quick-links">${quickLinks.map(([title, sub, href, ico]) => `<a class="quick-link" href="${attr(href)}"><span class="quick-icon">${icon(ico, 17)}</span><span><b>${esc(title)}</b><small>${esc(sub)}</small></span><span class="quick-arrow">${icon('arrow', 14)}</span></a>`).join('')}</div></div>
    <section class="section vision-section"><div class="container vision-grid"><div class="vision-heading"><span class="section-mark"></span>${eyebrow('OUR VISION & MANDATE')}<h2>A remarkable landscape.<br />A shared responsibility.</h2></div><div class="vision-copy"><p>${esc(vision)}</p><p>From mountain forests to high-altitude wetlands, we protect, conserve and sustainably manage the natural heritage of Gilgit-Baltistan.</p><p>Our work brings communities and conservation together—safeguarding biodiversity, strengthening livelihoods and supporting responsible eco-tourism.</p><a class="text-link" href="/about-us/">Discover our vision &amp; mandate ${icon('arrow', 14)}</a></div></div></section>
    <section class="section work-section"><div class="container"><div class="section-heading-row"><div><span class="section-mark"></span>${eyebrow('ONE VISION. CONNECTED EFFORTS.')}<h2>Our areas of work</h2></div><p>Protecting what makes<br />Gilgit-Baltistan extraordinary.</p></div><div class="work-grid">${work.map(item => `<article class="work-card"><div class="work-image-frame"><a href="${attr(item.href)}" class="work-image-link" aria-label="Explore ${attr(item.title)}"><img src="${attr(item.photo)}" alt="${attr(item.photoAlt)}" loading="lazy" /><span class="work-number">${esc(item.num)}</span></a><a class="work-image-credit" href="${attr(item.photoSource)}" target="_blank" rel="noopener noreferrer" aria-label="Photo credit: ${attr(item.photoCredit)}">${esc(item.photoCredit)} ${icon('external', 10)}</a></div><span class="work-badge">${icon(item.icon, 17)}</span><div class="work-content"><span class="eyebrow tiny">${esc(item.label)}</span><h3>${esc(item.title)}</h3><p>${esc(item.desc)}</p><a class="work-card-link" href="${attr(item.href)}">Explore ${item.title === 'Environment' ? 'the agency' : 'department'} ${icon('arrow', 13)}</a></div></article>`).join('')}</div><div class="work-foot"><span>${icon('shield', 13)} Rooted in conservation. Strengthened by community.</span><a href="/forest/">About our attached departments ${icon('arrow', 13)}</a></div></div></section>
    <section class="section updates-section"><div class="container"><div class="section-heading-row"><div><span class="section-mark"></span>${eyebrow('FROM THE DEPARTMENT')}<h2>Latest updates</h2></div><a href="/press-release/" class="text-link">View all updates ${icon('arrow', 14)}</a></div><div class="tabs" role="tablist" aria-label="Latest updates categories">${['News', 'Public Notices', 'Tenders', 'Jobs'].map((tab, i) => `<button type="button" role="tab" id="home-tab-${i}" aria-controls="home-update-list" tabindex="${i === 0 ? '0' : '-1'}" aria-selected="${i === 0}" class="tab-button ${i === 0 ? 'selected' : ''}" data-action="home-tab" data-tab="${attr(tab)}">${esc(tab)}</button>`).join('')}</div><div id="home-update-list" class="update-grid" role="tabpanel" aria-labelledby="home-tab-0" tabindex="0" aria-live="polite">${renderHomeUpdateCards('News')}</div><p class="source-note">${icon('shield', 12)} Updates are reproduced from the official department website. Publication dates are shown as supplied in source records.</p></div></section>
    <section class="landscape-cta" style="--cta-image:url('/assets/alpine-flowers.jpg')"><div class="container landscape-inner"><div class="landscape-copy">${eyebrow('EXPLORE. UNDERSTAND. PROTECT.')}<h2>A world worth<br />looking after.</h2><p>Discover the protected areas and natural habitats<br />at the heart of Gilgit-Baltistan.</p>${btnLink('/national-parks/', 'Discover our protected areas', 'light')}</div><a href="/maps/" class="landscape-feature"><span class="landscape-feature-icon">${icon('map', 21)}</span><span><small>VIEW YOUR LANDSCAPE</small><b>Explore the maps</b><em>Forests, parks, lakes &amp; more</em></span>${icon('arrow', 16)}</a><a class="photo-credit" href="${attr(photos.flowers.source)}" target="_blank" rel="noopener noreferrer">Photo: Hamid Baltistani · CC BY-SA 3.0 ${icon('external', 10)}</a></div></section>
    <section class="section resources-section"><div class="container"><div class="section-heading-row"><div><span class="section-mark"></span>${eyebrow('KNOWLEDGE FOR EVERYONE')}<h2>Resources &amp; downloads</h2></div><a href="/resources/" class="text-link">Browse resource library ${icon('arrow', 14)}</a></div><div class="tabs resource-tabs" role="tablist" aria-label="Resource categories">${['Reports & Publications', 'Guidelines', 'Acts & Rules'].map((tab, i) => `<button type="button" role="tab" id="home-resource-tab-${i}" aria-controls="home-resource-list" tabindex="${i === 0 ? '0' : '-1'}" aria-selected="${i === 0}" class="tab-button ${i === 0 ? 'selected' : ''}" data-action="home-resource-tab" data-tab="${attr(tab)}">${esc(tab)}</button>`).join('')}</div><div id="home-resource-list" class="resource-list" role="tabpanel" aria-labelledby="home-resource-tab-0" tabindex="0" aria-live="polite">${renderHomeResourceRows('Reports & Publications')}</div><p class="source-note">Documents are served from the official department website. Use PDF / DOC source links to view or download.</p></div></section>
  </div>`;
}

function renderHomeUpdateCards(tab) {
  const items = latestItemsForTab(tab);
  if (!items.length) return `<div class="empty-state compact-empty"><span class="empty-icon">${icon('calendar', 22)}</span><h3>No current job openings</h3><p>The department source currently lists no active jobs. Archived notices are available on the Careers page.</p><a class="text-link" href="/career/">Visit careers ${icon('arrow', 13)}</a></div>`;
  return items.map((item, index) => updateCard(item, index === 0)).join('');
}

function renderHomeResourceRows(tab) {
  const categoryMap = { 'Reports & Publications': ['Reports', 'Publications'], 'Guidelines': ['Guidelines'], 'Acts & Rules': ['Acts & Rules'] };
  const items = documents.filter(doc => categoryMap[tab].includes(doc.category)).slice(0, 3);
  return items.map(doc => resourceRow(doc)).join('');
}

function resourceRow(doc) {
  return `<article class="resource-row"><span class="resource-file-icon">${icon('file', 18)}</span><div class="resource-row-copy"><a href="/resource/${attr(doc.id)}/">${esc(doc.title)}</a><small>${esc(doc.category)}${doc.year && doc.year !== 'Source date not stated' ? ` · ${esc(doc.year)}` : ''}</small></div><span class="file-type">${esc(doc.format === 'Source file not linked' ? 'Unavailable' : doc.format)}</span>${doc.sourceUrl ? `<a href="${attr(doc.sourceUrl)}" target="_blank" rel="noopener noreferrer" class="resource-download" aria-label="View or download ${attr(doc.title)} from official source">${icon('download', 15)}</a>` : `<span class="resource-download disabled" title="Source file is not linked">${icon('download', 15)}</span>`}</article>`;
}

function searchRecords() {
  const records = [];
  for (const [slug, title, kind] of sourcePages) records.push({ title, href: `/${slug}/`, type: kind.replaceAll('-', ' '), text: `${title} ${kind}` });
  records.push(...parks.map(item => ({ title: item.name, href: item.route, type: 'National park', text: `${item.summary} ${item.wildlife} ${item.description}` })));
  records.push(...wildlife.map(item => ({ title: item.name, href: item.route, type: 'Wildlife profile', text: `${item.summary} ${item.detail} ${item.scientific}` })));
  records.push(...birds.map(item => ({ title: item.name, href: `/birds/${item.id}/`, type: 'Bird profile', text: `${item.scientific} Gilgit Baltistan` })));
  records.push(...documents.map(item => ({ title: item.title, href: `/resource/${item.id}/`, type: item.category, text: `${item.category} ${item.year} ${item.summary || ''}` })));
  records.push(...updates.map(item => ({ title: item.title, href: item.route, type: item.category, text: `${item.date} ${item.category} ${item.summary}` })));
  records.push(...projectPages.map(item => ({ title: item.title, href: item.route, type: 'Project', text: `${item.summary} ${item.kind}` })));
  return records;
}
const contentIndex = searchRecords();

function searchMatches(query, limit = 10) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);
  return contentIndex.map((item, idx) => {
    const haystack = `${item.title} ${item.type} ${item.text} ${item.href}`.toLowerCase();
    const score = terms.reduce((total, term) => total + (item.title.toLowerCase().includes(term) ? 6 : 0) + (item.type.toLowerCase().includes(term) ? 2 : 0) + (item.text.toLowerCase().includes(term) ? 1 : 0) + (item.href.toLowerCase().includes(term) ? 1 : 0), 0);
    return { ...item, score, idx };
  }).filter(item => item.score >= Math.max(1, terms.length)).sort((a, b) => b.score - a.score || a.idx - b.idx).slice(0, limit);
}

function renderSearchResults(query, limit = 8) {
  if (!query.trim()) return '<p class="muted">Search projects, wildlife, official notices, reports and maps.</p>';
  const items = searchMatches(query, limit);
  if (!items.length) return `<div class="empty-state compact-empty"><span class="empty-icon">${icon('search', 21)}</span><h3>No matching results</h3><p>Try a broader term, such as “forest”, “wildlife”, “map” or “report”.</p></div>`;
  return `<div class="search-result-list">${items.map(item => `<a class="search-result" href="${attr(item.href)}"><span class="search-result-icon">${icon('arrow', 15)}</span><span><b>${esc(item.title)}</b><small>${esc(item.type)}</small></span>${icon('arrow', 14)}</a>`).join('')}</div>`;
}

function findNavChain(path) {
  const route = canonicalRoute(path);
  let match = null;
  const walk = (items, stack = []) => {
    for (const item of items) {
      const next = [...stack, { label: item.label, href: item.href }];
      if (item.href && canonicalRoute(item.href) === route && item.href !== '/') match = next;
      if (item.children?.length) walk(item.children, next);
    }
  };
  walk(navigation);
  return match || [];
}

function pageIntro(route, title, description, kicker = 'DEPARTMENT INFORMATION', customCrumbs = null) {
  const crumbs = customCrumbs || [{ label: 'Home', href: '/' }, ...findNavChain(route).filter(item => item.href !== '/').slice(-3)];
  const unique = [];
  for (const crumb of crumbs) if (!unique.some(item => item.href === crumb.href && item.label === crumb.label)) unique.push(crumb);
  if (!unique.length || unique[0].href !== '/') unique.unshift({ label: 'Home', href: '/' });
  if (!unique.some(item => item.label === title && item.href === route)) unique.push({ label: title, href: route });
  return `<div class="page-intro"><div class="container"><nav class="breadcrumbs" aria-label="Breadcrumb"><ol>${unique.map((item, i) => `<li>${i < unique.length - 1 ? `<a href="${attr(item.href)}">${esc(item.label)}</a>${icon('arrow', 11)}` : `<span aria-current="page">${esc(item.label)}</span>`}</li>`).join('')}</ol></nav><div class="page-intro-copy"><span class="section-mark"></span>${eyebrow(kicker)}<h1>${esc(title)}</h1><p>${esc(description || '')}</p></div></div></div>`;
}

function pageLayout(route, title, description, body, kicker = 'DEPARTMENT INFORMATION', crumbs = null) {
  return `${pageIntro(route, title, description, kicker, crumbs)}<div class="container interior-body">${body}</div>`;
}

function photoFigure(src, alt, caption = '') {
  if (!src) return `<div class="image-unavailable"><span>${icon('mountain', 28)}</span><p>Supporting photograph not available in the local source copy.</p></div>`;
  return `<figure class="article-figure"><img src="${attr(src)}" alt="${attr(alt)}" loading="lazy" /><figcaption>${esc(caption || alt)}</figcaption></figure>`;
}

function noteBox(title, body, type = 'info') {
  return `<aside class="notice-box notice-${attr(type)}"><span class="notice-symbol">${icon(type === 'warning' ? 'eye' : 'shield', 17)}</span><div><b>${esc(title)}</b><p>${esc(body)}</p></div></aside>`;
}

function sectionHeading(kicker, title, description = '') {
  return `<div class="content-heading">${eyebrow(kicker)}<h2>${esc(title)}</h2>${description ? `<p>${esc(description)}</p>` : ''}</div>`;
}

function cardLink(item, kind = 'default') {
  if (kind === 'park') return `<article class="directory-card"><a class="directory-card-image" href="${attr(item.route)}">${item.image ? `<img src="${attr(item.image)}" alt="${attr(item.name)} landscape photo" loading="lazy" />${item.imageCredit ? `<span class="image-credit-tag">Photo: ${esc(item.imageCredit)}</span>` : ''}` : `<span class="directory-image-placeholder">${icon('mountain', 28)}<b>Park-specific photo unavailable</b><small>See the department source page for current imagery.</small></span>`}<span class="image-tag">National Park</span></a><div class="directory-card-content"><span class="eyebrow tiny">${esc(item.short || 'PROTECTED AREA')}</span><h3><a href="${attr(item.route)}">${esc(item.name)}</a></h3><p>${esc(item.summary)}</p><a class="text-link" href="${attr(item.route)}">Explore park ${icon('arrow', 13)}</a></div></article>`;
  if (kind === 'wildlife') return `<article class="directory-card wildlife-card"><div class="animal-card-art">${item.image ? `<img src="${attr(item.image)}" alt="${attr(item.name)}" loading="lazy" />` : `<span class="animal-placeholder">${icon('paw', 30)}<small>Verified species photo unavailable</small></span>`}</div><div class="directory-card-content"><span class="eyebrow tiny">${esc(item.status === 'Source page does not state a status category' ? 'SPECIES PROFILE' : item.status.toUpperCase())}</span><h3><a href="${attr(item.route)}">${esc(item.name)}</a></h3><p>${esc(item.summary)}</p><a class="text-link" href="${attr(item.route)}">Read species profile ${icon('arrow', 13)}</a></div></article>`;
  if (kind === 'profile') return `<article class="profile-card"><a class="profile-photo" href="${attr(item.route)}">${item.image ? `<img src="${attr(item.image)}" alt="Portrait of ${attr(item.name)}" loading="lazy" />` : `<span class="initials-avatar" aria-label="Portrait not available">${esc(item.name.split(' ').filter(Boolean).slice(-2).map(word => word[0]).join('').toUpperCase())}</span>`}</a><div class="profile-card-copy"><span class="eyebrow tiny">${esc(item.title)}</span><h3><a href="${attr(item.route)}">${esc(item.name)}</a></h3><p>${esc(item.department)}</p><a class="text-link" href="${attr(item.route)}">View profile ${icon('arrow', 13)}</a></div></article>`;
  return `<article class="directory-card text-directory-card"><span class="directory-card-icon">${icon('file', 20)}</span><div><h3><a href="${attr(item.href)}">${esc(item.title)}</a></h3><p>${esc(item.summary || '')}</p><a href="${attr(item.href)}" class="text-link">Explore ${icon('arrow', 13)}</a></div></article>`;
}

function renderAboutPage(route = '/about-us/') {
  const title = route === '/about-us/' ? 'About Department' : 'About the Department';
  const intro = 'A public department safeguarding the forests, wildlife, biodiversity and environment of Gilgit-Baltistan.';
  const body = `<div class="two-column-layout about-layout"><article class="prose"><h2>The Department</h2><p>The Gilgit-Baltistan Forest, Wildlife &amp; Environment Department (GBFWE) was created as an independent department in 2010 after promulgation of the Gilgit-Baltistan Governance Order 2009, in accordance with the Rules of Business 2009. It has two attached departments: Forest, Parks &amp; Wildlife and the Environmental Protection Agency.</p><p>The Secretariat is headed by the Secretary Forest, Wildlife &amp; Environment. The attached Forest, Parks &amp; Wildlife Department is headed by the Chief Conservator of Forests, Parks &amp; Wildlife GB; the Environmental Protection Agency is headed by its Director.</p><p>The Forest Department in Gilgit-Baltistan was established in 1953, initially with a Conservator of Forests and Forest Divisions in Gilgit and Diamer. Baltistan Forest Division followed in 1957. The department’s historical account records the first forest ranger in Gilgit in 1936 and Raja Mehboob Wali Khan as the first local Range Forest Officer in 1940.</p><p>Today the department is custodian of forests, wildlife, biodiversity, rangelands, watersheds, glaciers, wastelands, climate-change work, environmental protection and allied natural resources. Its responsibilities include day-to-day care and protection of forest resources and biodiversity across the region.</p><div class="article-actions">${btnLink('/leadership/', 'Meet the leadership', 'primary')}${btnLink('/organogram/', 'Organizational structure', 'outline')}</div></article><aside class="about-aside">${photoFigure(photos.valley.src, 'Mountain valley landscape in Gilgit-Baltistan', 'Astore Valley · Imran Shah, CC BY-SA 2.0 (resized for this site)')}<div class="fact-stack"><div><b>2010</b><span>Department established as an independent department</span></div><div><b>2</b><span>Attached departments: Forest, Parks &amp; Wildlife and GBEPA</span></div><div><b>1953</b><span>Forest Department established in Gilgit-Baltistan</span></div></div></aside></div><section class="vision-panel"><div>${eyebrow('OUR VISION & MANDATE')}<h2>Protecting and developing the natural heritage of Gilgit-Baltistan.</h2></div><p>“${esc('Protecting, conserving, managing and developing the forestry, wildlife and allied resources of Gilgit-Baltistan through sustainable integrated natural resource management with a vision to develop the region as a biodiversity pool and a hub for eco-tourism.')}”</p></section><section class="section-inline">${sectionHeading('HOW WE WORK', 'A connected conservation mandate')}<div class="three-column-cards"><article class="info-card"><span>${icon('forest', 21)}</span><h3>Collaborative management</h3><p>Work with communities to manage protected forests, protected areas and biodiversity hotspots, and support community-based management of private forests.</p></article><article class="info-card"><span>${icon('map', 21)}</span><h3>Evidence and planning</h3><p>Use management plans, valley conservation plans, monitoring and sectoral consultation to guide natural resource decisions.</p></article><article class="info-card"><span>${icon('people', 21)}</span><h3>Community partnership</h3><p>Strengthen local participation, sustainable livelihoods, skills and eco-tourism while conserving natural resources.</p></article></div></section><section class="section-inline">${sectionHeading('ATTACHED DEPARTMENTS', 'The work is shared across two agencies')}<div class="department-links"><a href="/forest/">${icon('forest', 23)}<span><b>Forest, Parks &amp; Wildlife</b><small>Forest ecosystems, wildlife and protected areas</small></span>${icon('arrow', 14)}</a><a href="/environment/">${icon('leaf', 23)}<span><b>Environmental Protection Agency</b><small>Environmental monitoring and sustainable development</small></span>${icon('arrow', 14)}</a></div></section>`;
  return pageLayout(route, title, intro, body, 'ABOUT THE DEPARTMENT');
}

function renderForestPage() {
  const desc = 'Forest ecosystems, forest management and nursery development across a high-mountain region shaped by the Himalaya, Karakoram, Hindukush and Pamir.';
  const body = `<div class="two-column-layout"><article class="prose"><h2>About the forests</h2><p>Gilgit-Baltistan lies in the far north of Pakistan, beyond the effective reach of the monsoon. The department’s forest page describes an area of 7.04 million hectares, dominated by mountains and natural rangelands, with natural forest covering about 3.58% of the region.</p><p>Five broad forest types are identified: Mountain Sub-Tropical Scrub, Mountain Dry Temperate Coniferous, Mountain Dry Temperate Broadleaved, Sub-Alpine and Northern Dry Scrub. The landscape includes dry alpine and permanent snowfield zones, Himalayan alpine habitats and dry temperate coniferous forest.</p><h3>Forest resources and communities</h3><p>The department source estimates natural forests at 2,492.05 km² and divides them broadly into private forests and state-owned protected forests. It states that private forests make up around 71% of forest wealth and are managed under applicable law; all forests in Diamer District are described as private forests. State-owned protected forests occur across Gilgit-Baltistan except Diamer, with community rights and concessions recognized under law.</p><p>Farm forestry and community planting have long supported household fuel and timber needs. The source page records 66 government plantations and 56 nurseries across the region.</p><h3>Biodiversity and forest types</h3><p>Different elevations, climates and slope exposures support diverse flora and fauna. The department identifies snow leopard, Himalayan brown bear, Marco Polo sheep, Ladakh urial, markhor, musk deer and woolly flying squirrel among significant mammals, alongside economically valuable plants such as wild cumin, thyme and pine nut species.</p><div class="article-actions">${btnLink('/forest-land-use-maps/', 'View forest maps', 'primary')}${btnLink('/plantations-nurseries/', 'Plantations & nurseries', 'outline')}</div></article><aside class="forest-aside">${photoFigure(photos.valley.src, 'Mountain valley in Gilgit-Baltistan', 'Astore Valley · Imran Shah, CC BY-SA 2.0 (resized for this site)')}<div class="stat-grid stat-grid-two"><div class="stat-card"><strong>7.04m</strong><span>hectares total area, as cited on the department page</span></div><div class="stat-card"><strong>3.58%</strong><span>natural forest share, as cited on the department page</span></div><div class="stat-card"><strong>66</strong><span>government plantations listed</span></div><div class="stat-card"><strong>56</strong><span>nurseries listed across the region</span></div></div></aside></div>${noteBox('Source figures have different reference years', 'Statistics are reproduced from the department’s published forest page. The original page cites different reports and years; verify the underlying inventory before using figures for planning.', 'warning')}<section class="section-inline">${sectionHeading('EXPLORE THE FOREST LANDSCAPE', 'Maps, boundaries and planting')}<div class="three-column-cards"><a class="info-card link-card" href="/forest-land-use-maps/"><span>${icon('map', 22)}</span><h3>Forest land-use map</h3><p>Explore the department’s map of land cover and district boundaries.</p><b class="text-link">Open map ${icon('arrow', 13)}</b></a><a class="info-card link-card" href="/hierarchical-boundaries-forest/"><span>${icon('map', 22)}</span><h3>Forest boundaries</h3><p>Open the published forest hierarchy map page and view its source notes.</p><b class="text-link">View boundaries ${icon('arrow', 13)}</b></a><a class="info-card link-card" href="/plantations-nurseries/"><span>${icon('forest', 22)}</span><h3>Plantations &amp; nurseries</h3><p>See official maps for Green Pakistan and Forest Department plantations.</p><b class="text-link">View maps ${icon('arrow', 13)}</b></a></div></section>`;
  return pageLayout('/forest/', 'Forests', desc, body, 'FOREST, PARKS & WILDLIFE');
}

function renderWildlifeOverview() {
  const desc = 'The Parks & Wildlife Circle works with communities and conservation partners to protect wildlife, habitats and the protected-area network.';
  const body = `<div class="feature-banner"><div class="feature-image-gap" role="note"><span class="feature-image-gap-icon">${icon('paw', 30)}</span><b>Wildlife photo gap</b><p>No locally stored, rights-verified wildlife photograph is available for this overview.</p></div><div><span class="eyebrow">PARKS &amp; WILDLIFE CIRCLE</span><h2>Conserving wildlife.<br />Working with communities.</h2><p>The circle is the line department responsible for the custody and management of wildlife and habitat, with a mandate to improve local economic benefits while maintaining ecological services.</p><a href="/trophy-hunting/" class="text-link">Learn about community conservation ${icon('arrow', 14)}</a></div></div><section class="section-inline">${sectionHeading('PROTECTED AREAS', 'A connected network of landscapes', 'The department groups national parks, game reserves, wildlife sanctuaries and community-managed conservation areas as protected areas.') }<div class="directory-grid">${parks.map(item => cardLink(item, 'park')).join('')}</div></section><section class="section-inline">${sectionHeading('SPECIES & HABITATS', 'Explore wildlife in Gilgit-Baltistan')}<div class="three-column-cards"><a class="info-card link-card" href="/fauna/"><span>${icon('paw', 22)}</span><h3>Fauna</h3><p>Species profiles and the department’s summary of regional mammals.</p><b class="text-link">Explore fauna ${icon('arrow', 13)}</b></a><a class="info-card link-card" href="/birds-of-gilgit-baltistan/"><span>${icon('leaf', 22)}</span><h3>Birds</h3><p>Eight bird species named and illustrated in the official source gallery.</p><b class="text-link">View birds ${icon('arrow', 13)}</b></a><a class="info-card link-card" href="/trophy-hunting/"><span>${icon('shield', 22)}</span><h3>Community conservation</h3><p>Department information on trophy hunting and community-managed areas.</p><b class="text-link">Read programme details ${icon('arrow', 13)}</b></a></div></section><section class="section-inline">${sectionHeading('PUBLIC DATA', 'Protected-area maps')}<div class="map-shortcut-grid"><a href="/wildlife-maps/">${icon('map', 18)} Protected areas &amp; wildlife distribution ${icon('arrow', 14)}</a><a href="/national-parks-map/">${icon('map', 18)} National parks map ${icon('arrow', 14)}</a><a href="/cmcas/">${icon('people', 18)} Community-managed conservation areas ${icon('arrow', 14)}</a></div></section>`;
  return pageLayout('/parks-and-widlife/', 'Parks & Wildlife', desc, body, 'ATTACHED DEPARTMENT');
}

function renderEnvironmentPage(route = '/environment/') {
  const desc = 'The Environmental Protection Agency works to protect, conserve, rehabilitate and improve the environment and promote sustainable development.';
  const reportDocs = documents.filter(doc => ['Reports', 'Publications'].includes(doc.category) && /environment|air|water|solid|climate/i.test(doc.title)).slice(0, 6);
  const body = `<div class="two-column-layout"><article class="prose"><h2>Environmental Protection Agency, Gilgit-Baltistan</h2><p>The department source describes the Environment wing as a separate Directorate with divisional offices. The Gilgit-Baltistan Environmental Protection Agency (GBEPA) was established under Section 5 of the GBEPA Act, 2014.</p><p>Its stated objective is “to provide for the protection, conservation, rehabilitation and improvement of the environment, prevention and control of pollution, and promotion of sustainable development.” The source page refers to national and international commitments and describes the agency’s role in supporting sustainable development in Gilgit-Baltistan.</p><h3>Work areas listed by the department</h3><ul class="check-list"><li>Environmental protection and pollution prevention</li><li>Environmental assessment review and approval procedures</li><li>Environmental monitoring and research</li><li>Environmental laboratory and GIS / remote-sensing capability</li></ul><div class="article-actions"><a class="btn btn-primary" href="/environment-maps/">Explore environment maps ${icon('arrow', 14)}</a><a class="btn btn-outline" href="https://gbepa.gog.pk/" target="_blank" rel="noopener noreferrer">Open GBEPA site ${icon('external', 14)}</a></div></article><aside class="env-highlight"><div class="env-highlight-mark">${icon('leaf', 34)}</div><span class="eyebrow">THE AGENCY'S OBJECTIVE</span><h2>Protect. Restore.<br />Sustain.</h2><p>Environmental health and resilient communities are essential to a thriving mountain region.</p><a href="/acts/" class="text-link">Environmental legislation ${icon('arrow', 14)}</a></aside></div><section class="section-inline">${sectionHeading('ENVIRONMENTAL SERVICES', 'Labs and monitoring')}<div class="three-column-cards"><article class="info-card"><span>${icon('eye', 22)}</span><h3>Environmental Laboratory</h3><p>Listed by the source page as an agency capability. Current service details and operating hours are not published in the accessible source text.</p></article><article class="info-card"><span>${icon('map', 22)}</span><h3>GIS &amp; Remote Sensing</h3><p>A GIS and remote-sensing laboratory is listed by the department as part of its environmental work.</p></article><article class="info-card"><span>${icon('file', 22)}</span><h3>Research &amp; Development</h3><p>Department reports include air quality, water quality, solid waste and climate-awareness topics.</p></article></div></section><section class="section-inline">${sectionHeading('RECENT WORK', 'Reports and reference material')}<div class="resource-list">${reportDocs.map(resourceRow).join('')}</div><div class="section-cta-link"><a class="text-link" href="/reports/">Browse all reports ${icon('arrow', 14)}</a></div></section><section class="section-inline">${sectionHeading('LAWS & LEGISLATION', 'Environmental regulation')}<div class="resource-list">${documents.filter(doc => doc.category === 'Acts & Rules' && /environment|eia|data acquisition/i.test(doc.title)).map(resourceRow).join('')}</div></section><p class="external-destination">The department directs visitors to the <a href="http://www.gbepa.gog.pk/" target="_blank" rel="noopener noreferrer">Gilgit-Baltistan Environmental Protection Agency website</a> for further information. ${icon('external', 12)}</p>`;
  return pageLayout(route, 'Environmental Protection Agency', desc, body, 'ATTACHED DEPARTMENT');
}

function renderFaunaPage() {
  const desc = 'Gilgit-Baltistan’s varied climates and ecosystems support rare and endangered mammals and birds, including several species identified by the department as conservation priorities.';
  const body = `<div class="facts-banner"><div class="facts-banner-icon">${icon('paw', 26)}</div><div><span class="eyebrow">DEPARTMENT FAUNA OVERVIEW</span><h2>54 mammal species</h2><p>The source page groups them as 1 shrew, 10 bats, 18 carnivores, 6 artiodactyls, 3 lagomorphs and 16 rodents. It identifies the woolly flying squirrel as endemic to Gilgit-Baltistan and Astore Markhor as near-endemic.</p></div><a href="/birds-of-gilgit-baltistan/" class="text-link">Birds of Gilgit-Baltistan ${icon('arrow', 13)}</a></div><section class="section-inline">${sectionHeading('WILDLIFE PROFILES', 'Mammals and other fauna', 'Profile content below is transcribed or summarized from the department’s accessible fauna pages. Where the source page does not state a conservation status, it is not inferred.') }<div class="directory-grid">${wildlife.map(item => cardLink(item, 'wildlife')).join('')}</div></section><section class="section-inline">${sectionHeading('BIRD LIFE', 'Birds of Gilgit-Baltistan')}<div class="info-card horizontal-info"><span>${icon('leaf', 22)}</span><p>The department’s bird gallery lists Steppe Eagle, Red-fronted Rosefinch, Tibetan Snowcock, Water Rail, Whiskered Tern, Tickell’s Leaf Warbler, Red-Mantled Rosefinch and White-tailed Rubythroat.</p><a class="text-link" href="/birds-of-gilgit-baltistan/">Browse bird profiles ${icon('arrow', 13)}</a></div></section><p class="source-note">Common and scientific names follow the department’s published pages. Scientific-name spelling varies between source pages for some species.</p>`;
  return pageLayout('/fauna/', 'Fauna of Gilgit-Baltistan', desc, body, 'PARKS & WILDLIFE');
}

function renderAnimalPage(species) {
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Parks & Wildlife', href: '/parks-and-widlife/' }, { label: 'Fauna', href: '/fauna/' }, { label: species.name, href: species.route }];
  const body = `<div class="species-profile"><div class="species-photo">${species.image ? `<img src="${attr(species.image)}" alt="Department wildlife image associated with the trophy-hunting page" />` : `<div class="animal-placeholder large">${icon('paw', 48)}<span>Species image not available locally</span></div>`}</div><article class="prose species-copy"><span class="eyebrow">WILDLIFE PROFILE</span><h2>${esc(species.name)}</h2><p class="scientific-name"><i>${esc(species.scientific)}</i></p><p>${esc(species.detail)}</p><dl class="facts-list"><div><dt>Habitat</dt><dd>${esc(species.habitat)}</dd></div><div><dt>Department status note</dt><dd>${esc(species.status)}</dd></div></dl><p class="small-muted">A status category is shown only when the department source explicitly supplies one; other profiles are labelled as not stated.</p><div class="article-actions"><a href="/fauna/" class="btn btn-outline">Back to fauna ${icon('arrow', 14)}</a><a href="${attr(official)}${attr(species.route)}" target="_blank" rel="noopener noreferrer" class="btn btn-light-border">Official species page ${icon('external', 14)}</a></div></article></div><div class="related-links"><a href="/wildlife-maps/">Protected-area maps ${icon('arrow', 13)}</a><a href="/trophy-hunting/">Community conservation programme ${icon('arrow', 13)}</a><a href="/reports/">Wildlife survey reports ${icon('arrow', 13)}</a></div>`;
  return pageLayout(species.route, species.name, species.summary, body, 'SPECIES PROFILE', crumbs);
}

function renderBirdsPage() {
  const desc = 'Birds recorded in the department’s public species gallery for Gilgit-Baltistan.';
  const body = `<div class="notice-box notice-info"><span class="notice-symbol">${icon('leaf', 17)}</span><div><b>Bird species listed by the source</b><p>The official page supplies common and scientific names and bird photographs, but those files were not available for local storage. Each card marks that image gap rather than substituting an unrelated species photo. Detailed life-history descriptions are not included in the accessible page text.</p></div></div><div class="bird-grid">${birds.map(item => `<article class="bird-card"><div class="bird-art">${icon('leaf', 27)}<small>Species photo unavailable locally</small></div><div><span class="eyebrow tiny">BIRD PROFILE</span><h2><a href="/birds/${attr(item.id)}/">${esc(item.name)}</a></h2><p><i>${esc(item.scientific)}</i></p><a class="text-link" href="/birds/${attr(item.id)}/">View listed record ${icon('arrow', 13)}</a></div></article>`).join('')}</div><div class="section-cta-link"><a class="text-link" href="/fauna/">Return to Fauna ${icon('arrow', 13)}</a></div>`;
  return pageLayout('/birds-of-gilgit-baltistan/', 'Birds of Gilgit-Baltistan', desc, body, 'PARKS & WILDLIFE');
}

function renderBirdDetail(bird) {
  const route = `/birds/${bird.id}/`;
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Parks & Wildlife', href: '/parks-and-widlife/' }, { label: 'Birds', href: '/birds-of-gilgit-baltistan/' }, { label: bird.name, href: route }];
  const body = `<div class="bird-detail-card"><div class="bird-art bird-art-large">${icon('leaf', 40)}<small>Species photo unavailable locally</small></div><div><span class="eyebrow">DEPARTMENT BIRD GALLERY</span><h2>${esc(bird.name)}</h2><p class="scientific-name"><i>${esc(bird.scientific)}</i></p><p>The department’s bird gallery lists this species by common and scientific name. Additional ecological or conservation information was not published in the accessible source text.</p><a href="${attr(official)}/birds-of-gilgit-baltistan/" class="text-link" target="_blank" rel="noopener noreferrer">View official gallery ${icon('external', 13)}</a></div></div>${noteBox('Image availability', 'The original department gallery contains an image for this bird, but that species photograph is not part of the local image set. No substitute species image is shown.', 'info')}`;
  return pageLayout(route, bird.name, `Department-listed bird species · ${bird.scientific}`, body, 'BIRD PROFILE', crumbs);
}

function renderParkDirectory() {
  const desc = 'Explore the national parks listed by the department, with source-backed location, area and conservation facts where available.';
  const body = `<div class="park-overview-banner"><span class="park-overview-icon">${icon('mountain', 28)}</span><div><b>Protected landscapes</b><p>The department lists national parks alongside wildlife sanctuaries, game reserves and community-managed conservation areas. Where the source page gives conflicting figures, the local detail page preserves that uncertainty.</p></div><a href="/national-parks-map/" class="text-link">View national parks map ${icon('arrow', 13)}</a></div><div class="directory-grid">${parks.map(item => cardLink(item, 'park')).join('')}</div><div class="other-protected-links"><a href="/wildlife-sanctuaries/">Wildlife Sanctuaries ${icon('arrow', 14)}</a><a href="/game-reserves/">Game Reserves ${icon('arrow', 14)}</a><a href="/cmcas/">Community Managed Conservation Areas ${icon('arrow', 14)}</a></div>`;
  return pageLayout('/national-parks/', 'National Parks', desc, body, 'PROTECTED AREAS');
}

function renderParkDetail(park) {
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Parks & Wildlife', href: '/parks-and-widlife/' }, { label: 'National Parks', href: '/national-parks/' }, { label: park.name, href: park.route }];
  const factRows = park.facts.map(([key, value]) => `<div class="fact-row"><dt>${esc(key)}</dt><dd>${esc(value)}</dd></div>`).join('');
  const mapLink = mapPages.find(page => page.route === '/national-parks-map/');
  const body = `<div class="park-detail-hero">${park.image ? `<img src="${attr(park.image)}" alt="Landscape from ${attr(park.name)}" />` : `<div class="park-photo-placeholder">${icon('mountain', 42)}<b>No park-specific landscape image is available in this local source copy.</b><small>The department source page is linked in the facts panel.</small></div>`}${park.imageCredit && park.imageSource ? `<a class="park-image-credit" href="${attr(park.imageSource)}" target="_blank" rel="noopener noreferrer">Photo: ${esc(park.imageCredit)} ${icon('external', 10)}</a>` : ''}<div class="park-detail-overlay"><span class="eyebrow">PROTECTED AREA · GILGIT-BALTISTAN</span><h2>${esc(park.name)}</h2><p>${esc(park.summary)}</p></div></div><div class="two-column-layout park-info-layout"><article class="prose"><h2>About ${esc(park.name)}</h2><p>${esc(park.description)}</p><h3>Dominant wildlife and biodiversity</h3><p>${esc(park.wildlife)}</p><div class="article-actions"><a href="/national-parks-map/" class="btn btn-primary">Open parks map ${icon('map', 14)}</a><a href="/reports/" class="btn btn-outline">Wildlife survey reports ${icon('arrow', 14)}</a></div></article><aside class="park-facts"><span class="eyebrow">KEY FACTS</span><dl>${factRows}</dl><a href="${attr(park.source)}" class="official-source-link" target="_blank" rel="noopener noreferrer">Official source page ${icon('external', 13)}</a></aside></div>${noteBox('About published figures', 'Figures are drawn from the department’s public page and may be revised. The Central Karakoram and Khunjerab source pages contain differing area or district figures; those discrepancies are noted rather than silently reconciled.', 'info')}<div class="related-links"><a href="/wildlife-maps/">Protected-areas map ${icon('arrow', 13)}</a><a href="/fauna/">Fauna profiles ${icon('arrow', 13)}</a><a href="/contact-us-2/">Contact the department ${icon('arrow', 13)}</a></div>`;
  return pageLayout(park.route, park.name, park.summary, body, 'NATIONAL PARK', crumbs);
}

function renderSanctuaries() {
  const desc = 'Two wildlife sanctuaries are listed by the department as protected habitat for the region’s flora and fauna.';
  const body = `<div class="stat-callout"><b>2</b><span>Wildlife sanctuaries listed by the department</span><p>The source page describes these areas as natural habitat and a resource for study and research.</p></div><div class="sanctuary-grid">${sanctuaries.map((item, i) => `<article class="protected-area-card"><span class="area-number">0${i + 1}</span><span class="eyebrow tiny">${esc(item.district.toUpperCase())} DISTRICT</span><h2>${esc(item.name)}</h2><p class="area-size">${esc(item.area)}</p><p>${esc(item.details)}</p><a href="/wildlife-maps/" class="text-link">View protected-area map ${icon('arrow', 13)}</a></article>`).join('')}</div><div class="related-links"><a href="/national-parks/">National Parks ${icon('arrow', 13)}</a><a href="/game-reserves/">Game Reserves ${icon('arrow', 13)}</a><a href="/cmcas/">Community Conservation Areas ${icon('arrow', 13)}</a></div>`;
  return pageLayout('/wildlife-sanctuaries/', 'Wildlife Sanctuaries', desc, body, 'PROTECTED AREAS');
}

function renderGameReserves() {
  const desc = 'Five game reserves and their associated districts and wildlife are described on the department page.';
  const body = `<div class="stat-callout"><b>909.5 km²</b><span>Combined area stated on the department source page</span><p>The listed reserves include habitats for ibex, snow leopard, Marco Polo sheep and other native wildlife.</p></div><div class="table-scroll"><table class="data-table"><thead><tr><th scope="col">Game reserve</th><th scope="col">District / location</th><th scope="col">Area</th><th scope="col">Wildlife noted by source</th></tr></thead><tbody>${gameReserves.map(item => `<tr><th scope="row">${esc(item.name)}</th><td>${esc(item.district)}</td><td>${esc(item.area)}</td><td>${esc(item.wildlife)}</td></tr>`).join('')}</tbody></table></div>${noteBox('Source terminology', 'The department page uses variant spellings for some place names, including “Askore Nulluh” and “Kilik-Mintika”; the local page retains the wording from that source.', 'info')}<div class="related-links"><a href="/wildlife-maps/">Protected-area maps ${icon('arrow', 13)}</a><a href="/trophy-hunting/">Trophy Hunting ${icon('arrow', 13)}</a></div>`;
  return pageLayout('/game-reserves/', 'Game Reserves', desc, body, 'PROTECTED AREAS');
}

function renderCmcAs() {
  const desc = 'Community-managed conservation areas in which local institutions participate in habitat protection and wildlife management.';
  const body = `<div class="stat-callout"><b>${conservationAreas.length}</b><span>Named entries on the department’s CMCA / CCHA source page</span><p>The source page calls these community-managed conservation areas and lists habitat species and area measurements for many entries.</p></div><div class="filter-toolbar"><label class="filter-search">${icon('search', 17)}<input id="cmca-search" type="search" placeholder="Filter by area or species…" aria-label="Filter community-managed areas" data-filter-kind="cmcas" /><button type="button" data-action="clear-filter" data-filter="cmca-search" aria-label="Clear search">${icon('close', 15)}</button></label><span id="cmca-count" class="filter-count"></span></div><div id="cmca-grid" class="area-card-grid">${renderCmcaCards('')}</div><div id="cmca-pagination" class="pagination"></div><p class="source-note">The source page’s Khanbari entry repeats a Doyan description. That source inconsistency is kept visible on the local record.</p>`;
  return pageLayout('/cmcas/', 'Community Managed Conservation Areas', desc, body, 'PROTECTED AREAS');
}
function renderCmcaCards(query) {
  const matches = conservationAreas.filter(([name, desc]) => `${name} ${desc}`.toLowerCase().includes((query || '').toLowerCase()));
  const pageSize = 12;
  const pages = Math.max(1, Math.ceil(matches.length / pageSize));
  listingPage = Math.min(listingPage, pages);
  const visible = matches.slice((listingPage - 1) * pageSize, listingPage * pageSize);
  return visible.length ? visible.map(([name, details], i) => `<article class="area-card"><span class="area-number">${String((listingPage - 1) * pageSize + i + 1).padStart(2, '0')}</span><h3>${esc(name)}</h3><p>${esc(details)}</p></article>`).join('') : `<div class="empty-state"><h3>No matching areas</h3><p>Try another place name or species.</p></div>`;
}

function renderTrophyHunting() {
  const desc = 'A community-based conservation programme for selected mountain ungulates, with revenue shared with local communities in community-managed areas.';
  const body = `<div class="two-column-layout trophy-intro"><article class="prose"><h2>Trophy hunting in Gilgit-Baltistan</h2><p>The department states that the Parks &amp; Wildlife Department introduced its trophy-hunting programme with the community of Bar Valley in 1990. It says limited trophy hunting of markhor, blue sheep and ibex is permitted under the wildlife law only in notified community-managed conservation areas; hunting is otherwise prohibited.</p><p>The programme is described as a source of revenue for local communities and the supervising department. The source page reports 47 community-managed / community-controlled areas and indicates an 80% community share in its programme materials.</p><h3>Hunting seasons</h3><p>The source page states the season for markhor, ibex and blue sheep runs from 1 November to 31 April. Because this is an unusual end date and the information may be dated, hunters should confirm current permit conditions with the department before travel.</p><div class="article-actions"><a href="/cmcas/" class="btn btn-primary">Explore community areas ${icon('arrow', 14)}</a><a href="/resource/trophy-hunting-guidelines-english/" class="btn btn-outline">Read official guidelines ${icon('file', 14)}</a></div></article><aside class="trophy-feature">${photoFigure(photos.trophy.src, photos.trophy.alt, 'Department-hosted image from the Trophy Hunting page. It depicts a hunter beside a killed wild mountain ungulate; no separate image license is stated.')}<div class="trophy-highlight"><b>1990</b><span>Programme introduced with the community of Bar Valley</span></div><div class="trophy-highlight"><b>80%</b><span>Community share stated in source programme material</span></div></aside></div><section class="section-inline">${sectionHeading('COMMUNITY-MANAGED LANDSCAPES', 'Hunting areas and local stewardship')}<p class="section-lead">The source page names community conservation areas across Gilgit-Baltistan and provides selected area sizes and species. View the full local directory for source wording.</p>${btnLink('/cmcas/', 'Browse community conservation areas', 'outline')}</section><section class="section-inline">${sectionHeading('PROGRAMME UPDATE', 'Astore Markhor, 2023–24')}<article class="feature-news-card feature-news-card-text"><div><span class="tag">NEWS · 6 DEC 2023</span><h3><a href="${attr(updates.find(item => item.slug === 'first-successful-trophy-hunting-of-astore-markhore-for-2023-24').route)}">First Successful Trophy Hunting of Astore Markhor for 2023–24</a></h3><p>${esc(updates.find(item => item.slug === 'first-successful-trophy-hunting-of-astore-markhore-for-2023-24').summary)}</p><a class="text-link" href="${attr(updates.find(item => item.slug === 'first-successful-trophy-hunting-of-astore-markhore-for-2023-24').route)}">Read update ${icon('arrow', 13)}</a></div></article></section>`;
  return pageLayout('/trophy-hunting/', 'Trophy Hunting', desc, body, 'PARKS & WILDLIFE');
}

function renderLeadership() {
  const desc = 'Department leadership and senior officers listed by the official source. Profiles include available biographical details and contact information.';
  const body = `<div class="profile-grid">${leaders.map(item => cardLink(item, 'profile')).join('')}</div><div class="notice-box notice-info"><span class="notice-symbol">${icon('people', 17)}</span><div><b>Leadership information</b><p>Names, titles, service dates and contacts below follow the department’s public profile pages. Public service assignments can change; refer to the source page for current postings.</p></div></div><div class="section-cta-link"><a class="text-link" href="/our-team/">Browse all team members ${icon('arrow', 13)}</a></div>`;
  return pageLayout('/leadership/', 'Leadership', desc, body, 'ABOUT THE DEPARTMENT');
}

function renderProfile(profile) {
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'About Us', href: '/about-us/' }, { label: 'Leadership', href: '/leadership/' }, { label: profile.name, href: profile.route }];
  const image = profile.image ? `<img src="${attr(profile.image)}" alt="Portrait of ${attr(profile.name)}" />` : `<div class="initials-avatar profile-avatar-large" aria-label="Portrait not available">${esc(profile.name.split(' ').filter(Boolean).slice(-2).map(word => word[0]).join('').toUpperCase())}</div><p class="photo-unavailable-note">A portrait is present on the official source page; it was not retrievable in the local image set.</p>`;
  const body = `<div class="profile-detail"><div class="profile-detail-photo">${image}</div><article class="profile-detail-copy"><span class="eyebrow">${esc(profile.title)}</span><h2>${esc(profile.name)}</h2><p class="profile-department">${esc(profile.department)}<br />${esc(SITE.government)}</p><p>${esc(profile.profile)}</p><dl class="facts-list"><div><dt>Phone</dt><dd><a href="tel:${attr(profile.phone.replace(/[^0-9+]/g, ''))}">${esc(profile.phone)}</a></dd></div><div><dt>Office</dt><dd>${esc(profile.address)}</dd></div></dl><div class="article-actions"><a href="/contact-us-2/" class="btn btn-primary">Contact the department ${icon('arrow', 14)}</a><a href="${attr(profile.source)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline">Official profile ${icon('external', 14)}</a></div></article></div><div class="related-links"><a href="/leadership/">All leadership profiles ${icon('arrow', 13)}</a><a href="/organogram/">Organizational structure ${icon('arrow', 13)}</a><a href="/our-team/">Our team ${icon('arrow', 13)}</a></div>`;
  return pageLayout(profile.route, profile.name, `${profile.title} · ${profile.department}`, body, 'LEADERSHIP PROFILE', crumbs);
}

function renderTeamPage() {
  const dept = [...new Set(team.map(person => person[2]))];
  const body = `<div class="team-tools"><label class="filter-search">${icon('search', 17)}<input id="team-search" type="search" placeholder="Search team members or roles…" aria-label="Search team members" data-filter-kind="team" /></label><label class="select-filter"><span class="visually-hidden">Filter by department</span><select id="team-department" data-filter-kind="team"><option value="All">All departments</option>${dept.map(item => `<option value="${attr(item)}">${esc(item)}</option>`).join('')}</select></label><span id="team-count" class="filter-count"></span></div><div id="team-grid" class="team-grid">${renderTeamCards('', 'All')}</div><div id="team-pagination" class="pagination"></div><p class="source-note">Names and designations are reproduced from the department’s Our Team page. A generic initials tile is used where an official portrait was not available locally; no substitute portrait is implied.</p>`;
  return pageLayout('/our-team/', 'Our Team', 'Officers and teams supporting forestry, parks, wildlife, environmental protection and development programmes.', body, 'ABOUT THE DEPARTMENT');
}
function renderTeamCards(query, selectedDept) {
  const q = (query || '').toLowerCase();
  const matches = team.filter(person => (selectedDept === 'All' || person[2] === selectedDept) && person.join(' ').toLowerCase().includes(q));
  const pageSize = 15;
  const pages = Math.max(1, Math.ceil(matches.length / pageSize));
  listingPage = Math.min(listingPage, pages);
  const visible = matches.slice((listingPage - 1) * pageSize, listingPage * pageSize);
  return visible.length ? visible.map(person => {
    const profile = leaders.find(item => item.name.toLowerCase().includes(person[0].toLowerCase()) || person[0].toLowerCase().includes(item.name.replace(/^mr\.\s*/i, '').toLowerCase()));
    const initials = person[0].split(/\s+/).slice(-2).map(word => word[0]).join('').toUpperCase();
    return `<article class="team-card"><div class="team-avatar">${profile?.image ? `<img src="${attr(profile.image)}" alt="Portrait of ${attr(person[0])}" loading="lazy" />` : `<span>${esc(initials)}</span>`}</div><div><span class="team-dept">${esc(person[2])}</span><h3>${esc(person[0])}</h3><p>${esc(person[1])}</p>${profile ? `<a class="text-link" href="${attr(profile.route)}">View profile ${icon('arrow', 12)}</a>` : ''}</div></article>`;
  }).join('') : `<div class="empty-state"><h3>No team members found</h3><p>Try a different name or department filter.</p><button class="btn btn-outline" type="button" data-action="clear-team-filter">Clear team filters</button></div>`;
}

function renderOrganization() {
  const body = `<div class="org-chart" aria-label="Department organizational structure"><div class="org-node org-root"><span class="eyebrow">SECRETARIAT</span><h2>Secretary<br />Forest, Wildlife &amp; Environment</h2><p>Department leadership and coordination</p></div><div class="org-connectors" aria-hidden="true"><span></span><span></span></div><div class="org-branches"><section class="org-branch"><span class="org-branch-mark">${icon('forest', 23)}</span><span class="eyebrow">ATTACHED DEPARTMENT</span><h3>Forest, Parks &amp; Wildlife</h3><p>Custody and management of forests, parks, wildlife and protected areas.</p><ul><li>Chief Conservator of Forests, Parks &amp; Wildlife</li><li>Forest Circles &amp; Divisions</li><li>Parks &amp; Wildlife Circle</li><li>Working Plan Circle</li><li>Satellite Forest Circle</li></ul></section><section class="org-branch"><span class="org-branch-mark">${icon('leaf', 23)}</span><span class="eyebrow">ATTACHED DEPARTMENT</span><h3>Environmental Protection Agency</h3><p>Environmental protection, monitoring, assessment, research and sustainable development.</p><ul><li>Director, GBEPA</li><li>Environmental monitoring and laboratory work</li><li>GIS and remote sensing</li></ul></section></div><div class="org-project-row"><span class="eyebrow">PROGRAMMES &amp; PARTNERSHIPS</span><div><a href="/tbttp/">TBTTP</a><a href="/glof-ll/">GLOF-II</a><a href="/redd-plus/">REDD+</a><a href="/chilgoza/">Chilgoza</a><a href="/cknp/">Central Karakoram National Park</a></div></div></div><p class="source-note">This accessible text chart is based on the department description and team listings. The source also publishes a visual organogram image; the chart is a text alternative and not a newly invented reporting hierarchy.</p><div class="section-cta-link"><a class="text-link" href="/our-team/">See the published team directory ${icon('arrow', 13)}</a></div>`;
  return pageLayout('/organogram/', 'Organizational Structure', 'An accessible text view of the department and its two attached agencies, based on public source descriptions.', body, 'ABOUT THE DEPARTMENT');
}

function renderDivisions(route) {
  const title = route === '/circles/' ? 'Forest Circles' : 'Forest Divisions';
  const desc = 'Regional forest and wildlife administration across Gilgit-Baltistan.';
  const body = `<div class="two-column-layout"><article class="prose"><h2>Regional structure</h2><p>The department’s About page describes three territorial Forest Circles, one Wildlife &amp; Parks Circle, a Working Plan Circle and a Satellite Forest Circle. The Forest Department page also describes divisions in Gilgit, Diamer and Baltistan, with Baltistan Forest Division established in 1957.</p><p>The public source inventory contains separate Division pages, but those pages do not provide a complete, current division-by-division directory in the accessible content. The local directory therefore records only the regional structure stated in the department’s overview.</p><div class="notice-box notice-warning"><span class="notice-symbol">${icon('eye', 17)}</span><div><b>Directory content gap</b><p>Current divisional officer postings and office contact details can change. Consult the official Contact Us page before relying on an assignment.</p></div></div></article><aside class="office-list-card"><span class="eyebrow">FOREST, PARKS &amp; WILDLIFE</span><h2>Regional units named by source</h2><ul class="plain-list"><li>Territorial Forest Circles (3)</li><li>Wildlife &amp; Parks Circle</li><li>Working Plan Circle</li><li>Satellite Forest Circle</li><li>Forest Divisions in Gilgit, Diamer and Baltistan (historical overview)</li></ul><a class="text-link" href="/contact-us-2/">Department directory ${icon('arrow', 13)}</a></aside></div><div class="related-links"><a href="/forest/">Forest overview ${icon('arrow', 13)}</a><a href="/our-team/">Our team ${icon('arrow', 13)}</a><a href="/contact-us-2/">Contact directory ${icon('arrow', 13)}</a></div>`;
  return pageLayout(route, title, desc, body, 'FOREST, PARKS & WILDLIFE');
}

function renderLegislationIndex() {
  const items = [
    { title: 'Acts', href: '/acts/', summary: 'Forest, wildlife and environmental Acts linked from the official source.' },
    { title: 'Rules', href: '/rules/', summary: 'Published rules and items identified by the department as under review.' },
    { title: 'Policies', href: '/policies/', summary: 'Environmental assessment policy and related source material.' },
    { title: 'Procedures', href: '/procedures/', summary: 'Trophy hunting terms of reference, guidelines and management documents.' },
    { title: 'Notifications', href: '/notifications/', summary: 'Transfer, posting and other notification records in the source archive.' },
  ];
  const body = `<div class="three-column-cards legislation-grid">${items.map(item => cardLink(item)).join('')}</div><div class="section-inline">${sectionHeading('LEGISLATIVE RECORD', 'Documents and status notes')}<div class="resource-list">${documents.filter(doc => doc.category === 'Acts & Rules').slice(0, 8).map(resourceRow).join('')}</div></div>${noteBox('Read the source carefully', 'Some rules on the official page are identified as under review or awaiting approval. A title appearing on this local page does not imply that a draft has been promulgated or is currently in force.', 'warning')}`;
  return pageLayout('/legislation/', 'Legislation', 'Acts, rules, policies, procedures and notifications relevant to forests, wildlife and the environment.', body, 'LEGAL FRAMEWORK');
}

function renderListTabs(items, active, action) {
  const label = action === 'doc-tab' ? 'Resource categories' : 'Update categories';
  const panel = action === 'doc-tab' ? 'doc-results' : 'archive-results';
  return `<div class="tabs" role="tablist" aria-label="${attr(label)}">${items.map((item, i) => `<button type="button" role="tab" id="${attr(action)}-${i}" aria-controls="${attr(panel)}" tabindex="${active === item ? '0' : '-1'}" class="tab-button ${active === item ? 'selected' : ''}" aria-selected="${active === item}" data-action="${attr(action)}" data-tab="${attr(item)}">${esc(item)}</button>`).join('')}</div>`;
}

function docExplain(route) {
  if (route === '/acts/') return 'The department lists Forest, Parks & Wildlife legislation and an environmental Act. Source notes about rule-making are preserved below.';
  if (route === '/rules/') return 'Rules and codes published or referenced by the department. Items with no linked file are clearly marked as unavailable.';
  if (route === '/policies/') return 'Policies and environmental assessment materials made available by the department.';
  if (route === '/procedures/') return 'Operational guidance, study terms of reference and park management documents linked by the department.';
  if (route === '/reports/') return 'Technical reports on forest inventories, wildlife surveys, wetlands, air, water and other environmental topics.';
  if (route === '/publications/') return 'Research and reference publications linked from the Forest, Parks & Wildlife and Environment sections.';
  return 'Search and filter the department’s public resource library. Official files continue to be hosted at fwegb.gov.pk.';
}

function docFilterForRoute(route) {
  if (['/acts/', '/rules/', '/policies/'].includes(route)) return ['Acts & Rules'];
  if (route === '/procedures/') return ['Guidelines'];
  if (route === '/reports/') return ['Reports'];
  if (route === '/publications/') return ['Publications'];
  return null;
}

function renderDocumentLibrary(route, title) {
  const desc = docExplain(route);
  const filter = docFilterForRoute(route);
  const categoryOptions = filter || ['All', 'Reports', 'Publications', 'Guidelines', 'Acts & Rules', 'Tenders', 'Careers'];
  const tabs = categoryOptions.length > 1 ? renderListTabs(categoryOptions, categoryOptions[0], 'doc-tab') : '';
  const tabPanelAttrs = categoryOptions.length > 1 ? 'role="tabpanel" aria-labelledby="doc-tab-0" tabindex="0"' : '';
  const extra = route === '/acts/' ? `<p class="section-lead">The source says rules under the GB Forest Act 2019 and Wildlife Act are being formulated; it also lists an Environmental Protection Act.</p>` : route === '/rules/' ? `<div class="notice-box notice-warning"><span class="notice-symbol">${icon('eye', 17)}</span><div><b>Approval status matters</b><p>The source page identifies several items as under review or awaiting government approval. Those entries are not represented here as in-force law.</p></div></div>` : '';
  const body = `${extra}<div class="library-toolbar"><label class="filter-search">${icon('search', 17)}<input id="doc-search" type="search" placeholder="Search title, year or type…" aria-label="Search resource library" data-filter-kind="documents" /></label><label class="select-filter"><span class="visually-hidden">Sort documents</span><select id="doc-sort" data-filter-kind="documents"><option value="newest">Newest first</option><option value="title">Title A–Z</option></select></label></div>${tabs}<div id="doc-results" class="document-results" ${tabPanelAttrs}>${renderDocumentRows('', filter ? filter[0] : 'All', route, 'newest')}</div><div id="doc-pagination" class="pagination"></div><p class="source-note">“View / download” opens the official department file in a new tab. Files marked unavailable are named on the source page but have no linked source file there.</p>`;
  return pageLayout(route, title, desc, body, 'DOCUMENT LIBRARY');
}

function renderDocumentRows(query, category, route, sort) {
  const allowed = docFilterForRoute(route);
  let list = documents.filter(doc => (!allowed || allowed.includes(doc.category)) && (category === 'All' || doc.category === category) && `${doc.title} ${doc.category} ${doc.year} ${doc.summary || ''}`.toLowerCase().includes((query || '').toLowerCase()));
  if (sort === 'title') list.sort((a, b) => a.title.localeCompare(b.title));
  else list.sort((a, b) => String(b.year).localeCompare(String(a.year)) || a.title.localeCompare(b.title));
  const pageSize = 10;
  const pages = Math.max(1, Math.ceil(list.length / pageSize));
  listingPage = Math.min(listingPage, pages);
  const start = (listingPage - 1) * pageSize;
  const visible = list.slice(start, start + pageSize);
  return visible.length ? visible.map((doc, i) => `<article class="library-row"><span class="library-index">${String(start + i + 1).padStart(2, '0')}</span><span class="resource-file-icon">${icon('file', 18)}</span><div class="library-row-main"><h3><a href="/resource/${attr(doc.id)}/">${esc(doc.title)}</a></h3><p>${esc(doc.summary || `${doc.category} · ${doc.year}`)}</p><small>${esc(doc.category)} · ${esc(doc.year)} · ${esc(doc.format)}</small></div><div class="library-row-actions"><a class="btn btn-small btn-outline" href="/resource/${attr(doc.id)}/">Details</a>${doc.sourceUrl ? `<a class="download-square" href="${attr(doc.sourceUrl)}" target="_blank" rel="noopener noreferrer" aria-label="View or download ${attr(doc.title)}">${icon('download', 15)}</a>` : `<span class="download-square disabled" title="No official file linked">${icon('download', 15)}</span>`}</div></article>`).join('') : `<div class="empty-state"><span class="empty-icon">${icon('file', 22)}</span><h3>No resources found</h3><p>Try a different search term or select another category.</p><button class="btn btn-outline" type="button" data-action="clear-doc-filters">Clear filters</button></div>`;
}

function renderDocumentDetail(doc) {
  const route = `/resource/${doc.id}/`;
  const sourcePagePath = doc.sourcePage === 'Reports' ? '/reports/' : doc.sourcePage === 'Publications' ? '/publications/' : doc.sourcePage === 'Policies' ? '/policies/' : doc.sourcePage === 'Procedures' ? '/procedures/' : doc.sourcePage === 'Rules' ? '/rules/' : doc.sourcePage === 'Acts' ? '/acts/' : doc.sourcePage === 'Careers' ? '/career/' : '/resources/';
  const body = `<div class="document-detail-card"><div class="document-cover">${icon('file', 46)}<span>${esc(doc.format)}</span></div><div class="document-detail-main"><span class="tag">${esc(doc.category)}</span><h2>${esc(doc.title)}</h2><p>${esc(doc.summary || 'Official resource record linked from the department’s public document library.')}</p><dl class="facts-list"><div><dt>Year / date</dt><dd>${esc(doc.year || 'Not stated on source page')}</dd></div><div><dt>Format</dt><dd>${esc(doc.format)}</dd></div><div><dt>Source library</dt><dd><a href="${attr(sourcePagePath)}">${esc(doc.sourcePage || 'Resources')}</a></dd></div></dl>${doc.sourceUrl ? `<div class="article-actions"><a href="${attr(doc.sourceUrl)}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">View / download official file ${icon('external', 14)}</a><a href="${attr(doc.sourceUrl)}" class="btn btn-outline" target="_blank" rel="noopener noreferrer">Open in new tab ${icon('arrow', 14)}</a></div>` : noteBox('Source file unavailable', 'The department source page names this document but does not provide a usable file link. The record is shown so the source gap is explicit.', 'warning')}</div></div><div class="related-links"><a href="${attr(sourcePagePath)}">Return to ${esc(doc.sourcePage || 'Resources')} ${icon('arrow', 13)}</a><a href="/resources/">Browse all resources ${icon('arrow', 13)}</a></div>`;
  return pageLayout(route, doc.title, `${doc.category} · ${doc.year || 'Date not stated'} · ${doc.format}`, body, 'RESOURCE DETAIL', [{ label: 'Home', href: '/' }, { label: 'Resources', href: '/resources/' }, { label: doc.title, href: route }]);
}

function renderMapIndex() {
  const desc = 'Explore official forest, wildlife and environmental maps published by the department. Map images in this local version are stored locally and include zoom and full-screen controls.';
  const body = `<div class="map-card-grid">${mapPages.map(page => `<article class="map-card"><a href="${attr(page.route)}" class="map-card-preview"><img src="${attr(page.maps[0].asset)}" alt="${attr(page.maps[0].alt)}" loading="lazy" /><span>${icon('map', 16)} ${esc(page.category)}</span></a><div class="map-card-copy"><span class="eyebrow tiny">${esc(page.category.toUpperCase())} MAPS</span><h2><a href="${attr(page.route)}">${esc(page.title)}</a></h2><p>${esc(page.summary)}</p><a href="${attr(page.route)}" class="text-link">Open map viewer ${icon('arrow', 13)}</a></div></article>`).join('')}</div><p class="source-note">The local previews are genuine map images linked from official department pages. Missing source images are identified on their relevant pages.</p>`;
  return pageLayout('/maps/', 'Maps & Geographic Information', desc, body, 'MAP LIBRARY');
}

function renderMapViewer(page) {
  selectedMapIndex = 0;
  mapZoom = 1;
  mapOffset = { x: 0, y: 0 };
  const first = page.maps[0];
  const body = `<div class="map-viewer-layout"><section class="map-viewer" id="map-viewer" aria-label="Interactive map viewer"><div class="map-toolbar"><div class="map-title"><span class="eyebrow">${esc(page.category.toUpperCase())} MAP VIEWER</span><h2 id="active-map-title">${esc(first.title)}</h2></div><div class="map-controls" aria-label="Map controls"><button type="button" class="map-control" aria-label="Zoom in" title="Zoom in" data-action="map-zoom-in">${icon('plus', 16)}</button><button type="button" class="map-control" aria-label="Zoom out" title="Zoom out" data-action="map-zoom-out">${icon('minus', 16)}</button><button type="button" class="map-control map-fit" data-action="map-fit">Fit</button><button type="button" class="map-control" aria-label="Full screen" title="Full screen" data-action="map-fullscreen">${icon('expand', 15)}</button></div></div><div class="map-stage" id="map-stage"><div class="map-loading" id="map-loading"><span class="spinner"></span><span>Loading map preview…</span></div><div class="map-image-wrap" id="map-image-wrap"><img id="active-map-image" src="${attr(first.asset)}" alt="${attr(first.alt)}" draggable="false" /></div><div class="map-error" id="map-error" hidden><h3>Map preview unavailable</h3><p>The local map preview could not be loaded.</p><a href="${attr(first.source)}" target="_blank" rel="noopener noreferrer">Open official map source ${icon('external', 13)}</a></div><span class="map-hint">Scroll or use + / − to zoom · Drag to pan</span></div><div class="map-source-bar"><a id="map-source-link" href="${attr(first.source)}" target="_blank" rel="noopener noreferrer">Open original map ${icon('external', 13)}</a><a id="map-download-link" href="${attr(first.asset)}" download>${icon('download', 13)} Download local preview</a></div></section><aside class="map-side-panel"><span class="eyebrow">MAP LAYERS</span><h3>Choose a map</h3><div class="map-layer-list">${page.maps.map((map, index) => `<button type="button" class="map-layer-button ${index === 0 ? 'active' : ''}" aria-pressed="${index === 0}" data-action="select-map" data-map-index="${index}"><span class="map-layer-thumb"><img src="${attr(map.asset)}" alt="" loading="lazy" /></span><span><b>${esc(map.title)}</b><small>${esc(page.category)} · Official source</small></span>${icon('arrow', 13)}</button>`).join('')}</div><div class="map-about"><b>About this map</b><p id="map-description">${esc(page.summary)}</p><a href="${attr(page.sourcePage)}" target="_blank" rel="noopener noreferrer">Official map page ${icon('external', 12)}</a></div></aside></div>${page.unavailable?.length ? `<section class="source-gap-panel"><div>${icon('eye', 19)}</div><div><b>Some source images are not available locally</b><p>The official page also lists: ${page.unavailable.map(esc).join(', ')}. These assets were not retrievable for local storage; they are not replaced with invented map images.</p><a href="${attr(page.sourcePage)}" target="_blank" rel="noopener noreferrer">Open original department map page ${icon('external', 13)}</a></div></section>` : ''}<p class="source-note">Map preview is a local copy of a map published by the Forest, Wildlife &amp; Environment Department. The original department file opens separately from “Open original map”.</p>`;
  return pageLayout(page.route, page.title, page.summary, body, `${page.category.toUpperCase()} MAPS`);
}

function projectSlug(title, index = 0) { return `/project/${slugify(title)}${index ? `-${index + 1}` : ''}/`; }
function renderProjectIndex() {
  const body = `<div class="project-intro-grid">${projectPages.filter(item => item.route !== '/projects/').map(item => `<a class="project-card" href="${attr(item.route)}"><span class="project-card-icon">${icon(item.kind === 'glof' ? 'mountain' : item.kind === 'redd' ? 'forest' : 'leaf', 21)}</span><span class="eyebrow tiny">DEVELOPMENT PORTFOLIO</span><h2>${esc(item.title)}</h2><p>${esc(item.summary)}</p><span class="text-link">Explore project ${icon('arrow', 13)}</span></a>`).join('')}</div><section class="section-inline">${sectionHeading('INVESTMENT & PROGRAMMES', 'Programme directories')}<div class="three-column-cards"><a class="info-card link-card" href="/adp/"><span>${icon('file', 21)}</span><h3>ADP schemes</h3><p>21 schemes and costs as published in the ADP table.</p><b class="text-link">View ADP ${icon('arrow', 13)}</b></a><a class="info-card link-card" href="/psdp/"><span>${icon('calendar', 21)}</span><h3>PSDP projects</h3><p>Published project dates and programmes.</p><b class="text-link">View PSDP ${icon('arrow', 13)}</b></a><a class="info-card link-card" href="/fwf-frf/"><span>${icon('book', 21)}</span><h3>Forest &amp; Wildlife Fund</h3><p>Funded activities listed in the source table.</p><b class="text-link">View fund projects ${icon('arrow', 13)}</b></a></div></section><p class="source-note">Scheme titles, amounts, dates and status are transcribed from the department’s published portfolio pages. More detailed project records are shown only where an official narrative exists.</p>`;
  return pageLayout('/projects/', 'Development Portfolio', 'Public-sector, provincial and donor-supported initiatives across forests, biodiversity, climate resilience and environmental protection.', body, 'PROJECTS & PROGRAMMES');
}

function renderProjectPage(meta) {
  const body = (() => {
    switch (meta.kind) {
      case 'adp': return `<div class="stat-callout"><b>Rs 1,375.080m</b><span>Total cost stated in the ADP page</span><p>The published table contains 21 schemes. The entries below preserve the source’s status and cost figures.</p></div>${renderProjectTable('ADP', adpProjects)}<p class="source-note">Amounts are in millions of rupees, as labelled by the official table. The source table contains repeated scheme names in separate entries.</p>`;
      case 'psdp': return `<div class="notice-box notice-info"><span class="notice-symbol">${icon('calendar', 17)}</span><div><b>Published schedule dates</b><p>Dates below follow the department’s PSDP page. The source material does not indicate whether every listed project remains active.</p></div></div>${renderProjectTable('PSDP', psdpProjects)}<p class="source-note">Use the linked project pages for additional narrative where the department publishes one.</p>`;
      case 'frf': return `<div class="stat-callout"><b>Rs 228.640m</b><span>Total approved cost stated in the FRF projects table</span><p>Selected scheme names and costs are listed below exactly as represented in the department source.</p></div>${renderFrfTable()}<p class="source-note">The source table contains a few formatting and arithmetic irregularities; values are displayed as published without recalculation.</p>`;
      case 'tbttp': return `<div class="project-hero-panel"><div><span class="eyebrow">PUBLIC SECTOR DEVELOPMENT PROGRAMME</span><h2>Restoring forests and wildlife at scale.</h2><p>Ten Billion Trees Tsunami Programme — Phase I, Up-scaling of the Green Pakistan Programme (Revised).</p></div><span class="project-hero-icon">${icon('forest', 38)}</span></div><div class="two-column-layout"><article class="prose"><h2>Programme background</h2><p>The department describes the Gilgit-Baltistan component as a four-year project (2019–2023), with a total cost of Rs 8,032 million. The Prime Minister inaugurated the programme on 2 September 2018 during Plant for Pakistan Day.</p><h3>Objectives</h3><p>The stated aim is to revive forest and wildlife resources, improve conservation of existing protected areas, encourage eco-tourism, and create opportunities through community engagement and conservation.</p><h3>Progress reported by the department</h3><p>The source page reports a target of 170 million plants across Gilgit-Baltistan; component allocations of Rs 6,920 million for forestry, Rs 650 million for protected areas and Rs 359 million for wildlife; and green-stimulus employment for 7,654 people during the COVID-19 period. It reports 10.765 million plants achieved and a 10.850 million target for 30 June 2022.</p></article><aside class="project-stat-stack"><div><b>2019–2023</b><span>Phase I period stated by source</span></div><div><b>7,654</b><span>Green-stimulus jobs reported</span></div><div><b>170m</b><span>Planting target stated on source page</span></div></aside></div>${noteBox('Historical programme information', 'These figures are transcribed from the public project page and refer to its stated project period. The page does not provide a current status update.', 'info')}`;
      case 'glof': return `<div class="project-hero-panel glof-panel"><div><span class="eyebrow">UNDP · GREEN CLIMATE FUND</span><h2>Reducing risk from glacial lake outburst floods.</h2><p>Scaling-up of Glacial Lake Outburst Flood risk reduction in Northern Pakistan.</p></div><span class="project-hero-icon">${icon('mountain', 38)}</span></div><div class="prose project-prose"><h2>Overview</h2><p>GLOF-II is described by the department as a donor-funded project of UNDP, supported by the Green Climate Fund. It builds on GLOF-I, which supported early-warning systems, infrastructure and community-based disaster-risk management.</p><p>The source page reports 3,044 glacial lakes across Gilgit-Baltistan and Khyber Pakhtunkhwa and says 33 have been assessed as prone to hazardous outburst flooding. It describes potential impacts on lives, roads, hydropower, agriculture and livelihoods.</p><h3>Objectives</h3><p>The project aims to empower communities to identify and manage GLOF risks, strengthen public services and improve preparedness and response. The source also highlights livelihood options, food security and women’s participation.</p><h3>Expected results in source plan</h3><ul class="check-list"><li>At least two policies reviewed or revised to incorporate GLOF risk reduction</li><li>95% of households in target communities able to receive and act on early warnings</li><li>At least 250 small-scale engineering or nature-based structures</li><li>50 weather stations and 408 river-discharge sensors</li><li>Training for 65,000 women, 240 water-efficient farming technologies and 35,000 hectares of reforestation</li></ul><h3>Department’s role</h3><p>The source page says the Planning &amp; Development Department is the focal and coordinating unit, while the Forest, Wildlife &amp; Environment Department implements activities related to climate change, glaciology, bioengineering and biodiversity with community participation and UNDP collaboration.</p></div><div class="related-links"><a href="/psdp/">PSDP listing ${icon('arrow', 13)}</a><a href="/resources/">Related resources ${icon('arrow', 13)}</a></div>`;
      case 'chilgoza': return `<div class="project-hero-panel chilgoza-panel"><div><span class="eyebrow">FAO · GLOBAL ENVIRONMENT FACILITY</span><h2>Restoring high-conservation-value Chilgoza forests.</h2><p>“The Reversing Deforestation and Degradation in High Conservation Value Chilgoza Pine Forests in Pakistan.”</p></div><span class="project-hero-icon">${icon('forest', 38)}</span></div><div class="two-column-layout"><article class="prose"><h2>Project background</h2><p>The department describes the Chilgoza Project as a Food and Agriculture Organization of the United Nations donor-funded project within the global Restoration Initiative. It was approved by the GEF Council in April 2018 and became operational in early September 2018.</p><p>Chilgoza forests occur in Pakistan’s dry temperate zone at roughly 2,000–3,350 m elevation. The source notes their ecological and livelihood value, including pine nuts, medicinal plants, mushrooms, honey and biodiversity, and identifies unsustainable harvesting, overgrazing, agricultural conversion, natural disasters and climate change as pressures.</p><h3>Objective</h3><p>Contribute to restoration, protection and sustainable management of Chilgoza pine forests, global environmental benefits and resilient socioeconomic development.</p><h3>Achievements listed by the source</h3><p>The department reports distribution of 30,250 forest plants and 3,041 fruit plants in target areas, establishment of 40 hectares of block plantation and 0.5 hectares of nurseries in Diamer.</p></article><aside class="project-stat-stack"><div><b>2018</b><span>Project became operational</span></div><div><b>40 ha</b><span>Block plantation reported</span></div><div><b>0.5 ha</b><span>Nurseries reported in Diamer</span></div></aside></div>${noteBox('Project figures', 'The source page includes separate greenhouse-gas estimates and plant-distribution figures with formatting that may require verification. Only the clearly readable figures are summarized here.', 'info')}`;
      case 'redd': return `<div class="project-hero-panel redd-panel"><div><span class="eyebrow">FOREST CARBON & CLIMATE</span><h2>Reducing emissions through sustainable forest management.</h2><p>REDD+ preparedness and planning for Gilgit-Baltistan.</p></div><span class="project-hero-icon">${icon('leaf', 38)}</span></div><div class="two-column-layout"><article class="prose"><h2>About REDD+</h2><p>The department describes REDD+ as an internationally funded forest-sector initiative adopted at COP 16 in Cancun in 2010. It reports Rs 30 million for the first preparedness phase and Rs 85 million approved for the second phase.</p><h3>Objectives</h3><ul class="check-list"><li>Reduce carbon emissions from deforestation and forest degradation</li><li>Conserve forest carbon stocks</li><li>Promote sustainable forest management</li><li>Enhance forest carbon stocks</li></ul><h3>Achievements listed by the source</h3><p>These include forest inventories and field data from 537 sample plots, policy and regulatory review, preparation and publication of forest and wildlife Acts and forest manuals, medicinal and aromatic plant rules, a Working Plan Code for private forests in Diamer, land-use classification and management plans for Astore and Skardu.</p></article><aside class="project-stat-stack"><div><b>Rs 30m</b><span>Phase I estimate stated by the source</span></div><div><b>Rs 85m</b><span>Phase II approved amount stated by source</span></div><div><b>537</b><span>Forest / biomass inventory sample plots reported</span></div></aside></div>${btnLink('/adp/', 'View ADP schemes', 'outline')}`;
      default: return `${noteBox('Source content unavailable', 'The official source page is present in the department’s navigation, but its accessible content did not include a detailed narrative or project document. This page intentionally avoids inventing project facts.', 'warning')}<p><a class="text-link" href="${attr(official)}${attr(meta.route)}" target="_blank" rel="noopener noreferrer">Open the official source page ${icon('external', 13)}</a></p>`;
    }
  })();
  return pageLayout(meta.route, meta.title, meta.summary, body, 'DEVELOPMENT PORTFOLIO');
}

function renderProjectTable(type, data) {
  if (type === 'ADP') {
    return `<div class="table-scroll"><table class="data-table"><thead><tr><th scope="col">S#</th><th scope="col">Project / Scheme</th><th scope="col">Status</th><th scope="col">Cost (Rs million)</th></tr></thead><tbody>${data.map((row, index) => {
      const [title, status, cost, route] = row;
      const href = route || projectSlug(title, index);
      return `<tr><td>${index + 1}</td><th scope="row"><a href="${attr(href)}">${esc(title)}</a></th><td><span class="status-pill ${status.toLowerCase() === 'approved' ? 'approved' : 'pending'}">${esc(status)}</span></td><td>${esc(cost)}</td></tr>`;
    }).join('')}</tbody><tfoot><tr><th colspan="3">Total stated by source</th><td><b>1,375.080</b></td></tr></tfoot></table></div>`;
  }
  const offset = type === 'PSDP' ? adpProjects.length : 0;
  return `<div class="table-scroll"><table class="data-table"><thead><tr><th scope="col">S#</th><th scope="col">Project / Scheme</th><th scope="col">Start date</th><th scope="col">End date</th></tr></thead><tbody>${data.map((row, index) => { const [title, start, end, route] = row; const href = route || projectSlug(title, index + offset); return `<tr><td>${index + 1}</td><th scope="row"><a href="${attr(href)}">${esc(title)}</a></th><td>${esc(start)}</td><td>${esc(end)}</td></tr>`; }).join('')}</tbody></table></div>`;
}
function renderFrfTable() {
  const offset = adpProjects.length + psdpProjects.length;
  return `<div class="table-scroll"><table class="data-table"><thead><tr><th scope="col">S#</th><th scope="col">Name of scheme</th><th scope="col">Approved cost (Rs million)</th></tr></thead><tbody>${frfProjects.map((row, index) => `<tr><td>${index + 1}</td><th scope="row"><a href="${attr(projectSlug(row[0], index + offset))}">${esc(row[0])}</a></th><td>${esc(row[1])}</td></tr>`).join('')}</tbody><tfoot><tr><th colspan="2">Total stated by source</th><td><b>228.640</b></td></tr></tfoot></table></div>`;
}

const projectRecords = [
  ...adpProjects.map((row, index) => ({ id: slugify(row[0]) + (index ? `-${index + 1}` : ''), title: row[0], type: 'ADP Scheme', status: row[1], cost: row[2], sourceRoute: '/adp/', route: projectSlug(row[0], index) })),
  ...psdpProjects.map((row, index) => ({ id: slugify(row[0]) + (index ? `-${index + 1}` : ''), title: row[0], type: 'PSDP Project', start: row[1], end: row[2], sourceRoute: '/psdp/', route: projectSlug(row[0], index + adpProjects.length) })),
  ...frfProjects.map((row, index) => ({ id: slugify(row[0]) + `-${index + 1}`, title: row[0], type: 'FWF / FRF Scheme', cost: row[1], sourceRoute: '/fwf-frf/', route: projectSlug(row[0], index + adpProjects.length + psdpProjects.length) })),
];
function projectFromRoute(route) {
  const slug = normalizedPath(route).split('/').filter(Boolean).slice(1).join('/');
  return projectRecords.find(item => item.route === normalizedPath(route) || item.id === slug) || null;
}
function renderProjectDetail(item) {
  const rows = [['Portfolio', item.type], ...(item.status ? [['Published status', item.status]] : []), ...(item.cost ? [['Cost (Rs million)', item.cost]] : []), ...(item.start ? [['Start date', item.start]] : []), ...(item.end ? [['End date', item.end]] : [])];
  const body = `<div class="project-detail-card"><span class="project-card-icon">${icon('leaf', 24)}</span><div><span class="tag">${esc(item.type)}</span><h2>${esc(item.title)}</h2><p>This individual scheme record is built from the title and figures published in the department’s ${esc(item.sourceRoute.replaceAll('/', '').toUpperCase())} table. A separate narrative or project file was not linked for this row.</p><dl class="facts-list">${rows.map(([key, value]) => `<div><dt>${esc(key)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl><div class="article-actions"><a href="${attr(item.sourceRoute)}" class="btn btn-primary">Return to portfolio table ${icon('arrow', 14)}</a><a href="${attr(official)}${attr(item.sourceRoute)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline">Official source table ${icon('external', 14)}</a></div></div></div>${noteBox('Project detail gap', 'The official portfolio page publishes a scheme title and limited status / cost / date fields. No additional scope, completion status or results are inferred here.', 'info')}`;
  return pageLayout(item.route, item.title, `${item.type} · department portfolio record`, body, 'PROJECT DETAIL', [{ label: 'Home', href: '/' }, { label: 'Development Portfolio', href: '/projects/' }, { label: item.type, href: item.sourceRoute }, { label: item.title, href: item.route }]);
}

function archiveFilterOptions(route) {
  if (route === '/tender/') return ['Tenders'];
  if (route === '/public-notice/') return ['Public Notices', 'Notifications'];
  if (route === '/notifications/') return ['Notifications'];
  if (route === '/career/') return ['Careers'];
  return ['All updates', 'News', 'Public Notices', 'Tenders', 'Careers', 'Notifications', 'Trophy Hunting'];
}
function routeArchiveDefault(route) {
  if (route === '/tender/') return 'Tenders';
  if (route === '/public-notice/') return 'Public Notices';
  if (route === '/notifications/') return 'Notifications';
  if (route === '/career/') return 'Careers';
  return 'All updates';
}
function updateCategoryMatches(item, category) {
  if (!category || category === 'All updates') return true;
  if (category === 'News') return item.category === 'News' || item.category === 'Trophy Hunting';
  if (category === 'Public Notices') return item.category === 'Public Notices' || item.category === 'Notifications';
  if (category === 'Careers') return item.category === 'Careers';
  return item.category === category;
}
function renderUpdatesList(query, category, dateFilter = '') {
  const q = (query || '').toLowerCase();
  let list = updates.filter(item => updateCategoryMatches(item, category) && (!dateFilter || item.date.startsWith(dateFilter)) && `${item.title} ${item.summary} ${item.category} ${item.date}`.toLowerCase().includes(q));
  list = list.slice().sort((a, b) => b.date.localeCompare(a.date));
  const pageSize = 10;
  const pages = Math.max(1, Math.ceil(list.length / pageSize));
  listingPage = Math.min(listingPage, pages);
  const start = (listingPage - 1) * pageSize;
  const visible = list.slice(start, start + pageSize);
  document.getElementById('archive-count')?.replaceChildren(document.createTextNode(`${list.length} ${list.length === 1 ? 'record' : 'records'}`));
  return visible.length ? `<div class="updates-list">${visible.map(item => updateCard(item)).join('')}</div>` : `<div class="empty-state"><span class="empty-icon">${icon('search', 22)}</span><h3>No updates found</h3><p>Try another term or select a different category.</p><button class="btn btn-outline" type="button" data-action="clear-archive-filters">Clear filters</button></div>`;
}
function archiveTitle(route) {
  if (route === '/tender/') return ['Tenders', 'Tender notices and procurement opportunities published by the department.'];
  if (route === '/public-notice/') return ['Public Notices', 'Public notices, advisories and community information published by the department.'];
  if (route === '/notifications/') return ['Notifications', 'Transfer, posting and other notification records in the department archive.'];
  if (route === '/press-release/') return ['Press Releases & News', 'Department announcements and public updates, with original dates and source links.'];
  return ['Department Updates', 'Search and filter official news, notices, tenders and career announcements.'];
}
function renderUpdateArchive(route, dateFilter = '') {
  const [title, desc] = archiveTitle(route);
  const tabs = archiveFilterOptions(route);
  const selected = routeArchiveDefault(route);
  const dateIntro = dateFilter ? `Records published on ${dateLabel(dateFilter)}.` : desc;
  const body = `<div class="archive-toolbar"><label class="filter-search">${icon('search', 17)}<input id="archive-search" type="search" placeholder="Search notices, dates or keywords…" aria-label="Search department updates" data-filter-kind="updates" /></label><label class="select-filter"><span class="visually-hidden">Filter updates</span><select id="archive-category" data-filter-kind="updates">${tabs.map(item => `<option value="${attr(item)}" ${item === selected ? 'selected' : ''}>${esc(item)}</option>`).join('')}</select></label><span id="archive-count" class="filter-count"></span></div>${tabs.length > 1 ? renderListTabs(tabs, selected, 'archive-tab') : ''}<div id="archive-results" ${tabs.length > 1 ? `role="tabpanel" aria-labelledby="archive-tab-${tabs.indexOf(selected)}" tabindex="0"` : ''}>${renderUpdatesList('', selected, dateFilter)}</div><div id="archive-pagination" class="pagination"></div><p class="source-note">Dates and headlines are reproduced from the public department website. For items whose accessible source page contains only a title or file link, the local detail page identifies that content gap.</p>`;
  return pageLayout(route, title, dateIntro, body, 'DEPARTMENT UPDATES');
}

function renderUpdateDetail(item) {
  const crumbs = [{ label: 'Home', href: '/' }, { label: item.category === 'Tenders' ? 'Tenders' : item.category === 'Careers' ? 'Careers' : item.category === 'Public Notices' ? 'Public Notices' : 'Press Releases', href: item.category === 'Tenders' ? '/tender/' : item.category === 'Careers' ? '/career/' : item.category === 'Public Notices' ? '/public-notice/' : '/press-release/' }, { label: item.title, href: item.route }];
  const imageAttachment = /\.(jpe?g|png|webp)$/i.test(item.attachment || '');
  const articleBody = item.summary ? `<p>${esc(item.summary)}</p>` : `<p>The department’s public archive identifies this item by title, date and category. Additional article text was not available in the accessible source record used for this local page.</p>`;
  const attachment = item.attachment ? `<div class="article-attachment"><span class="resource-file-icon">${icon(imageAttachment ? 'eye' : 'file', 18)}</span><div><b>${esc(item.attachmentLabel || 'Official attachment')}</b><small>${imageAttachment ? 'Image file hosted at the official department site; opens as an outbound link.' : 'Document hosted by the Forest, Wildlife &amp; Environment Department.'}</small></div><a class="btn btn-small btn-outline" href="${attr(item.attachment)}" target="_blank" rel="noopener noreferrer">View / download ${icon('external', 12)}</a></div>` : noteBox('No source attachment listed', 'No document or image link was available in the accessible archive entry. Open the official article for any later updates.', 'info');
  const body = `<article class="article-detail"><div class="article-meta"><span class="tag">${esc(item.category)}</span><time datetime="${attr(item.date)}">${icon('calendar', 14)} ${esc(dateLabel(item.date))}</time></div><div class="article-content prose">${articleBody}</div>${attachment}<div class="article-source-note"><span>${icon('shield', 15)}</span><p>This local detail preserves the official headline and date. No current status, deadline or extra requirements are inferred unless visible in the source record.</p></div><div class="article-actions"><a href="${attr(item.sourceUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Open official article ${icon('external', 14)}</a><a href="/${item.category === 'Tenders' ? 'tender' : item.category === 'Careers' ? 'career' : item.category === 'Public Notices' ? 'public-notice' : 'press-release'}/" class="btn btn-outline">Back to listing ${icon('arrow', 14)}</a></div></article><aside class="article-sidebar"><span class="eyebrow">RELATED INFORMATION</span><h2>Explore more</h2><a href="/tender/">Tenders &amp; procurement ${icon('arrow', 13)}</a><a href="/public-notice/">Public notices ${icon('arrow', 13)}</a><a href="/career/">Careers ${icon('arrow', 13)}</a><a href="/resources/">Resources &amp; documents ${icon('arrow', 13)}</a></aside>`;
  return pageLayout(item.route, item.title, item.summary || `${item.category} · ${dateLabel(item.date)}`, `<div class="article-layout">${body}</div>`, item.category.toUpperCase(), crumbs);
}

function renderCareers() {
  const desc = 'Vacancy announcements and career notices linked from the official department page.';
  const vacancies = [
    ['Situation Vacant at Gilgit Forest Division', 'https://fwegb.gov.pk/wp-content/uploads/2023/11/Situation-Vacant.pdf'],
    ['Situation Vacant at Baltistan Forest Circle', 'https://fwegb.gov.pk/wp-content/uploads/2023/11/Jobs.pdf'],
    ["Project Director — Non-Timber Forest Products Project", 'https://fwegb.gov.pk/wp-content/uploads/2023/11/ad.pdf'],
  ];
  const body = `<div class="career-status"><span class="status-dot"></span><div><b>No active vacancy could be verified</b><p>The source page currently displays an “Current Openings” heading, but the linked notices are dated November 2023. This local page treats them as archived rather than implying they are still open.</p></div></div><section class="section-inline">${sectionHeading('ARCHIVED NOTICES', 'Previous vacancy announcements')}<div class="resource-list">${vacancies.map(([title, url], index) => `<article class="resource-row"><span class="resource-file-icon">${icon('file', 18)}</span><div class="resource-row-copy"><a href="/resource/career-notice-${index + 1}/">${esc(title)}</a><small>Career notice · November 2023 · PDF</small></div><span class="file-type">PDF</span><a class="resource-download" href="${attr(url)}" target="_blank" rel="noopener noreferrer" aria-label="Open official vacancy notice">${icon('download', 15)}</a></article>`).join('')}</div></section><div class="section-cta-link"><a class="text-link" href="/contact-us-2/">Ask the department about current recruitment ${icon('arrow', 13)}</a></div>`;
  return pageLayout('/career/', 'Careers', desc, body, 'ADVERTISEMENTS');
}

function renderAdvertisements() {
  const links = [
    { title: 'Tenders', href: '/tender/', summary: 'Procurement notices, bids, expressions of interest and tender attachments.' },
    { title: 'Press Releases', href: '/press-release/', summary: 'News and public updates from forest, wildlife and environment teams.' },
    { title: 'Public Notices', href: '/public-notice/', summary: 'Public information and community notices.' },
    { title: 'Careers', href: '/career/', summary: 'Current and archived vacancy announcements. Openings are labelled by source date.' },
  ];
  return pageLayout('/advertisements/', 'Advertisements', 'Find tender notices, public announcements, vacancy postings and department updates.', `<div class="three-column-cards">${links.map(item => cardLink(item)).join('')}</div><section class="section-inline">${sectionHeading('LATEST NOTICES', 'Recently published')}<div class="update-grid">${updates.filter(item => ['Tenders', 'Public Notices', 'Careers'].includes(item.category)).slice(0, 3).map(item => updateCard(item)).join('')}</div></section>`, 'PUBLIC INFORMATION');
}

function renderEventPage() {
  const body = `<div class="empty-state"><span class="empty-icon">${icon('calendar', 24)}</span><h2>No upcoming events are published</h2><p>The department’s event route is present, but the accessible source page does not list event details. For recent activities, visit the news archive.</p><a href="/press-release/" class="btn btn-primary">Browse department updates ${icon('arrow', 14)}</a></div>`;
  return pageLayout('/event/', 'Events', 'Department events and public engagement activities.', body, 'DEPARTMENT UPDATES');
}

const galleryItems = [
  { title: 'Astore Valley landscape', category: 'Forest', src: photos.valley.src, alt: photos.valley.alt, credit: photos.valley.credit, source: photos.valley.source, license: photos.valley.license },
  { title: 'Sheosar Lake in Deosai National Park', category: 'Parks & Wildlife', src: photos.deosai.src, alt: photos.deosai.alt, credit: photos.deosai.credit, source: photos.deosai.source, license: photos.deosai.license },
  { title: 'Yellow and orange poppies in Deosai', category: 'Environment', src: photos.flowers.src, alt: photos.flowers.alt, credit: photos.flowers.credit, source: photos.flowers.source, license: photos.flowers.license },
  { title: 'Department trophy-hunting programme photograph', category: 'Trophy Hunting', src: photos.trophy.src, alt: photos.trophy.alt, credit: photos.trophy.credit, source: photos.trophy.source, license: '' },
];
function renderMediaPage(route = '/media/') {
  galleryImages = galleryItems;
  const tabs = ['All', 'Forest', 'Parks & Wildlife', 'Environment', 'Trophy Hunting'];
  const body = `<section class="media-video-panel"><div class="media-video-icon">${icon('play', 23)}</div><div><span class="eyebrow">VIDEOS &amp; DOCUMENTARIES</span><h2>Watch the department’s conservation stories</h2><p>The public source page names a documentaries section and links to the department’s YouTube channel. Individual video IDs were not present in the accessible page source, so no unverified embedded player is shown.</p></div><a href="https://www.youtube.com/channel/UCWlYT081_HoUGse-LJ4JvTA" target="_blank" rel="noopener noreferrer" class="btn btn-outline">Open official YouTube channel ${icon('external', 14)}</a></section><section class="section-inline">${sectionHeading('GALLERY', 'Images from the region')}<div class="tabs gallery-tabs" role="tablist" aria-label="Filter gallery images">${tabs.map((tab, i) => `<button type="button" role="tab" id="gallery-tab-${i}" aria-controls="gallery-grid" tabindex="${i === 0 ? '0' : '-1'}" aria-selected="${i === 0}" class="tab-button ${i === 0 ? 'selected' : ''}" data-action="gallery-tab" data-tab="${attr(tab)}">${esc(tab)}</button>`).join('')}</div><div id="gallery-grid" class="gallery-grid" role="tabpanel" aria-labelledby="gallery-tab-0" tabindex="0">${renderGalleryCards('All')}</div><p class="source-note">Image credits and source links are shown in the image viewer. All displayed images are stored locally in the site bundle.</p></section>`;
  return pageLayout(route, route === '/picture-gallery/' ? 'Picture Gallery' : 'Media', 'Department gallery categories and documentary video links.', body, 'MEDIA & GALLERY');
}
function renderGalleryCards(category) {
  const items = galleryItems.filter(item => category === 'All' || item.category === category);
  return items.length ? items.map((item, index) => `<button type="button" class="gallery-card" data-action="open-gallery" data-image-index="${galleryItems.indexOf(item)}"><span class="gallery-photo"><img src="${attr(item.src)}" alt="${attr(item.alt)}" loading="lazy" /><span class="gallery-view">${icon('eye', 16)} View image</span></span><span class="gallery-caption"><b>${esc(item.title)}</b><small>${esc(item.category)}</small></span></button>`).join('') : `<div class="empty-state"><h3>No images in this category</h3><p>Choose another gallery filter.</p></div>`;
}
function galleryDialogMarkup() {
  return `<div class="lightbox" id="gallery-lightbox" hidden><div class="lightbox-scrim" data-action="close-gallery"></div><section class="lightbox-dialog" role="dialog" aria-modal="true" aria-labelledby="lightbox-title"><button class="lightbox-close" type="button" aria-label="Close image viewer" data-action="close-gallery">${icon('close', 19)}</button><button class="lightbox-nav lightbox-prev" type="button" aria-label="Previous image" data-action="gallery-prev">‹</button><figure><img id="lightbox-image" src="" alt="" /><figcaption><b id="lightbox-title"></b><span id="lightbox-category"></span><small id="lightbox-credit"></small><a id="lightbox-source" href="" target="_blank" rel="noopener noreferrer">Source / credit ${icon('external', 12)}</a><a id="lightbox-license" href="" target="_blank" rel="noopener noreferrer" hidden>License ${icon('external', 12)}</a></figcaption></figure><button class="lightbox-nav lightbox-next" type="button" aria-label="Next image" data-action="gallery-next">›</button></section></div>`;
}

function renderContactPage() {
  const rows = [
    ['Mr. Haji Shah Baig', 'Senior Minister / Minister FW&E', '05811-922524', ''],
    ['Mr. Syed Abdul Waheed Shah', 'Secretary FW&E Department', '05811-920229', ''],
    ['Mr. Mehmood Ghaznavi', 'Chief Conservator Forest', '05811-920434 / 920471', ''],
    ['Dr. Zakir Hussain', 'Chief Conservator Parks & Wildlife', '05811-920434 / 920471', ''],
    ['Forest, Wildlife & Environment Secretariat', 'Public enquiries', '05811-920146 / 920273', 'info@fwegb.gov.pk'],
    ['Environmental Protection Agency', 'Environmental enquiries', 'Not stated on accessible source page', ''],
  ];
  const endpoint = (import.meta.env.VITE_CONTACT_ENDPOINT || '').trim();
  const body = `<div class="contact-grid"><section class="contact-form-card"><span class="eyebrow">SEND US A MESSAGE</span><h2>How can we help?</h2><p>Fields marked required must be completed. The form will only report a successful submission if a configured endpoint accepts it.</p><form id="contact-form" data-contact-form novalidate>
    <div class="form-grid"><label>Full name <span aria-hidden="true">*</span><input name="name" autocomplete="name" required minlength="2" maxlength="100" /></label><label>Email address <span aria-hidden="true">*</span><input name="email" type="email" autocomplete="email" required maxlength="160" /></label><label>Mobile number <input name="phone" type="tel" autocomplete="tel" maxlength="40" /></label><label>Subject <span aria-hidden="true">*</span><input name="subject" required minlength="3" maxlength="140" /></label><label class="form-full">Message <span aria-hidden="true">*</span><textarea name="message" rows="6" required minlength="10" maxlength="3000"></textarea></label></div><div class="form-submit-row"><button type="submit" class="btn btn-primary" id="contact-submit">Send message ${icon('arrow', 14)}</button><span id="contact-status" class="form-status" role="status" aria-live="polite">${endpoint ? 'Messages will be submitted to the configured service.' : 'No submission service is configured; a filled form will not be sent.'}</span></div></form></section><aside class="contact-details"><span class="eyebrow">GET IN TOUCH</span><h2>Department contact</h2><div class="contact-detail-row">${icon('pin', 18)}<div><b>Office</b><span>${esc(SITE.address)}<br />Forest, Wildlife &amp; Environment Department, Government of Gilgit-Baltistan</span></div></div><div class="contact-detail-row">${icon('phone', 18)}<div><b>Telephone</b><a href="tel:+925811920146">${esc(SITE.phone)}</a></div></div><div class="contact-detail-row">${icon('mail', 18)}<div><b>Email</b><a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a></div></div><a class="contact-map-link" href="https://maps.google.com/?q=Civil+Services+Complex+Jutial+Gilgit" target="_blank" rel="noopener noreferrer">Open location in maps ${icon('external', 13)}</a>${noteBox('Before you send', 'The official source page shows a form but does not publish a submission endpoint. This local form validates your message and will clearly state if it cannot be sent.', 'warning')}</aside></div><section class="section-inline">${sectionHeading('OFFICIAL DIRECTORY', 'Key contacts')}<div class="table-scroll"><table class="data-table"><thead><tr><th scope="col">Name / office</th><th scope="col">Designation</th><th scope="col">Telephone</th><th scope="col">Email</th></tr></thead><tbody>${rows.map(row => `<tr><th scope="row">${esc(row[0])}</th><td>${esc(row[1])}</td><td>${row[2].includes('05811') ? `<a href="tel:+925811920146">${esc(row[2])}</a>` : esc(row[2])}</td><td>${row[3] ? `<a href="mailto:${attr(row[3])}">${esc(row[3])}</a>` : '—'}</td></tr>`).join('')}</tbody></table></div><p class="source-note">The department’s published contact directory contains staff names that differ from current leadership profile pages. Contact details above are presented as source records; please verify current postings directly.</p></section>`;
  return pageLayout('/contact-us-2/', 'Contact Us', 'Contact the Forest, Wildlife & Environment Department for information, public notices and departmental enquiries.', body, 'GET IN TOUCH');
}

function renderSearchPage(query) {
  const results = searchMatches(query, 40);
  const cards = results.length ? `<div class="search-page-results">${results.map(item => `<article class="search-page-result"><span class="search-result-icon">${icon('arrow', 15)}</span><div><span class="tag">${esc(item.type)}</span><h2><a href="${attr(item.href)}">${esc(item.title)}</a></h2><p>${esc(item.text.slice(0, 220))}${item.text.length > 220 ? '…' : ''}</p><a href="${attr(item.href)}" class="text-link">Open result ${icon('arrow', 13)}</a></div></article>`).join('')}</div>` : `<div class="empty-state"><span class="empty-icon">${icon('search', 22)}</span><h2>No results found</h2><p>Try a broader term or browse the site navigation.</p></div>`;
  const body = `<form id="search-page-form" class="search-form page-search-form"><label class="visually-hidden" for="search-page-input">Search department website</label><div class="search-input-wrap">${icon('search', 18)}<input id="search-page-input" name="q" type="search" value="${attr(query)}" placeholder="Search this website…" /><button class="btn btn-primary" type="submit">Search</button></div></form><p class="filter-count">${results.length} ${results.length === 1 ? 'result' : 'results'} for “${esc(query)}”</p>${cards}`;
  return pageLayout('/search/', 'Search results', 'Search the locally implemented department pages, official archive records, projects, maps and resources.', body, 'SITE SEARCH');
}

function renderSourceGap(route, title) {
  const body = `${noteBox('Source content unavailable', 'An official route exists in the department’s public site inventory, but its accessible page did not provide substantive content for this local implementation. We have not invented the missing information.', 'warning')}<div class="source-gap-links"><a href="${attr(official)}${attr(route)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Open original source page ${icon('external', 14)}</a><a href="/contact-us-2/" class="btn btn-outline">Contact the department ${icon('arrow', 14)}</a></div>${title === 'Website Credits' ? `<section class="section-inline">${sectionHeading('LOCAL SITE IMPLEMENTATION', 'Asset and accessibility notes')}<ul class="check-list"><li>Government emblem and department images are stored locally under <code>public/assets</code>.</li><li>Official map previews and portrait assets link back to their source pages or image credits.</li><li>Keyboard navigation, visible focus and reduced-motion preferences are supported.</li><li>The contact form requires <code>VITE_CONTACT_ENDPOINT</code> before it can send.</li></ul></section>` : ''}`;
  return pageLayout(route, title, 'Source detail is unavailable in the accessible public content.', body, 'SOURCE CONTENT');
}

function renderMapsRoute(route) {
  const mapPage = mapPages.find(page => page.route === route);
  return mapPage ? renderMapViewer(mapPage) : renderMapIndex();
}

function renderPage(route, searchParams) {
  if (route === '/') return renderHome();
  if (route === '/search/') return renderSearchPage(searchParams.get('q') || '');
  if (route === '/about-us/') return renderAboutPage(route);
  if (route === '/forest/') return renderForestPage();
  if (route === '/parks-and-widlife/') return renderWildlifeOverview();
  if (route === '/environment/' || route === '/environment-2/') return renderEnvironmentPage(route);
  if (route === '/fauna/') return renderFaunaPage();
  if (route === '/birds-of-gilgit-baltistan/') return renderBirdsPage();
  if (route === '/national-parks/') return renderParkDirectory();
  if (route === '/wildlife-sanctuaries/') return renderSanctuaries();
  if (route === '/game-reserves/') return renderGameReserves();
  if (route === '/cmcas/') return renderCmcAs();
  if (route === '/trophy-hunting/') return renderTrophyHunting();
  if (route === '/leadership/') return renderLeadership();
  if (route === '/our-team/') return renderTeamPage();
  if (route === '/organogram/') return renderOrganization();
  if (['/division/', '/division-2/', '/circles/'].includes(route)) return renderDivisions(route);
  if (route === '/legislation/' || route === '/law/') return renderLegislationIndex();
  if (route === '/maps/') return renderMapIndex();
  if (mapPages.some(page => page.route === route)) return renderMapsRoute(route);
  if (route === '/projects/') return renderProjectIndex();
  if (route === '/advertisements/') return renderAdvertisements();
  if (route === '/contact-us-2/') return renderContactPage();
  if (route === '/media/' || route === '/picture-gallery/') return renderMediaPage(route);
  if (route === '/career/') return renderCareers();
  if (route === '/event/') return renderEventPage();
  if (['/press-release/', '/tender/', '/public-notice/', '/notifications/'].includes(route)) return renderUpdateArchive(route);
  if (['/resources/', '/publications/', '/reports/', '/acts/', '/rules/', '/policies/', '/procedures/'].includes(route)) {
    const title = route === '/resources/' ? 'Resources & Downloads' : route === '/publications/' ? 'Publications' : route === '/reports/' ? 'Reports' : route === '/acts/' ? 'Acts' : route === '/rules/' ? 'Rules' : route === '/policies/' ? 'Policies' : 'Procedures';
    return renderDocumentLibrary(route, title);
  }
  const projectMeta = projectPages.find(page => page.route === route);
  if (projectMeta) return renderProjectPage(projectMeta);
  const park = parks.find(item => item.route === route);
  if (park) return renderParkDetail(park);
  const leader = leaders.find(item => item.route === route);
  if (leader) return renderProfile(leader);
  const animal = wildlife.find(item => item.route === route);
  if (animal) return renderAnimalPage(animal);
  const bird = route.startsWith('/birds/') ? birds.find(item => route === `/birds/${item.id}/`) : null;
  if (bird) return renderBirdDetail(bird);
  const document = route.startsWith('/resource/') ? documents.find(item => route === `/resource/${item.id}/`) : null;
  if (document) return renderDocumentDetail(document);
  const portfolioItem = route.startsWith('/project/') ? projectFromRoute(route) : null;
  if (portfolioItem) return renderProjectDetail(portfolioItem);
  const update = updates.find(item => item.route === route || item.slug === route.split('/').filter(Boolean).at(-1));
  if (update) return renderUpdateDetail(update);
  const dateMatch = route.match(/^\/(\d{4})\/(\d{2})\/(\d{2})\/$/);
  if (dateMatch) return renderUpdateArchive('/press-release/', `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`);
  if (route === '/developers/') return renderSourceGap(route, 'Website Credits');
  if (route === '/ndmrf/') return renderSourceGap(route, 'NDMRF');
  if (route === '/parks/') {
    return pageLayout(route, 'Parks', 'Explore parks and protected landscapes across Gilgit-Baltistan.', `<div class="directory-grid">${parks.map(item => cardLink(item, 'park')).join('')}</div>`, 'PROTECTED AREAS');
  }
  const sourceMeta = sourcePages.find(([slug]) => `/${slug}/` === route);
  if (sourceMeta) {
    const [, title, kind] = sourceMeta;
    if (kind === 'projects') return renderProjectIndex();
    if (kind === 'map') return renderMapIndex();
    if (kind === 'updates') return renderUpdateArchive(route);
    if (kind === 'documents') return renderDocumentLibrary(route, title);
    if (kind === 'profile') return renderLeadership();
    if (kind === 'team') return renderTeamPage();
    if (kind === 'media') return renderMediaPage(route);
    if (kind === 'source-gap') return renderSourceGap(route, title);
    if (kind === 'environment') return renderEnvironmentPage(route);
    if (kind === 'about') return renderAboutPage(route);
  }
  return renderNotFound(route);
}

function renderNotFound(route) {
  const body = `<div class="not-found"><div class="not-found-code">404</div><span class="eyebrow">PAGE NOT FOUND</span><h2>We couldn't find that page.</h2><p>The address <code>${esc(route)}</code> does not match a local department page. Check the URL or search the implemented content.</p><div class="not-found-actions"><a href="/" class="btn btn-primary">Return home ${icon('arrow', 14)}</a><button class="btn btn-outline" type="button" data-action="open-search">Search the site ${icon('search', 14)}</button></div></div>`;
  return pageLayout(route, 'Page not found', 'The requested local route could not be found.', body, '404');
}

let currentArchiveDate = '';
let activeDocCategory = 'All';
let lastRenderedRoute = '';

function countArchiveResults(query, category, dateFilter = '') {
  const q = (query || '').toLowerCase();
  return updates.filter(item => updateCategoryMatches(item, category) && (!dateFilter || item.date.startsWith(dateFilter)) && `${item.title} ${item.summary} ${item.category} ${item.date}`.toLowerCase().includes(q)).length;
}
function countDocuments(query, category, route) {
  const allowed = docFilterForRoute(route);
  const q = (query || '').toLowerCase();
  return documents.filter(doc => (!allowed || allowed.includes(doc.category)) && (category === 'All' || doc.category === category) && `${doc.title} ${doc.category} ${doc.year} ${doc.summary || ''}`.toLowerCase().includes(q)).length;
}
function paginationMarkup(total, page, pageSize, scope) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return '';
  const items = [];
  items.push(`<button type="button" class="page-step" data-action="page" data-page-target="${Math.max(1, page - 1)}" data-page-scope="${attr(scope)}" ${page <= 1 ? 'disabled' : ''} aria-label="Previous page">‹</button>`);
  for (let i = 1; i <= pages; i += 1) {
    if (pages > 7 && i > 2 && i < pages - 1 && Math.abs(i - page) > 1) {
      if (i === 3 || i === pages - 2) items.push('<span class="page-ellipsis" aria-hidden="true">…</span>');
      continue;
    }
    items.push(`<button type="button" class="page-number ${page === i ? 'active' : ''}" data-action="page" data-page-target="${i}" data-page-scope="${attr(scope)}" ${page === i ? 'aria-current="page"' : ''}>${i}</button>`);
  }
  items.push(`<button type="button" class="page-step" data-action="page" data-page-target="${Math.min(pages, page + 1)}" data-page-scope="${attr(scope)}" ${page >= pages ? 'disabled' : ''} aria-label="Next page">›</button>`);
  return items.join('');
}

function refreshArchive() {
  const route = canonicalRoute(location.pathname);
  const input = document.getElementById('archive-search');
  const select = document.getElementById('archive-category');
  const category = select?.value || routeArchiveDefault(route);
  const query = input?.value || '';
  const total = countArchiveResults(query, category, currentArchiveDate);
  const pageSize = 10;
  const maxPage = Math.max(1, Math.ceil(total / pageSize));
  listingPage = Math.min(listingPage, maxPage);
  const resultEl = document.getElementById('archive-results');
  if (resultEl) resultEl.innerHTML = renderUpdatesList(query, category, currentArchiveDate);
  const pager = document.getElementById('archive-pagination');
  if (pager) pager.innerHTML = paginationMarkup(total, listingPage, pageSize, 'updates');
  const count = document.getElementById('archive-count');
  if (count) count.textContent = `${total} ${total === 1 ? 'record' : 'records'}`;
  document.querySelectorAll('[data-action="archive-tab"]').forEach(button => {
    const selected = button.dataset.tab === category;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-selected', String(selected));
    button.setAttribute('tabindex', selected ? '0' : '-1');
    if (selected) document.getElementById('archive-results')?.setAttribute('aria-labelledby', button.id);
  });
}

function refreshDocuments() {
  const route = canonicalRoute(location.pathname);
  const query = document.getElementById('doc-search')?.value || '';
  const sort = document.getElementById('doc-sort')?.value || 'newest';
  const category = activeDocCategory;
  const total = countDocuments(query, category, route);
  const pageSize = 10;
  listingPage = Math.min(listingPage, Math.max(1, Math.ceil(total / pageSize)));
  const results = document.getElementById('doc-results');
  if (results) results.innerHTML = renderDocumentRows(query, category, route, sort);
  const pager = document.getElementById('doc-pagination');
  if (pager) pager.innerHTML = paginationMarkup(total, listingPage, pageSize, 'documents');
  document.querySelectorAll('[data-action="doc-tab"]').forEach(button => {
    const selected = button.dataset.tab === category;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-selected', String(selected));
    button.setAttribute('tabindex', selected ? '0' : '-1');
    if (selected) document.getElementById('doc-results')?.setAttribute('aria-labelledby', button.id);
  });
}

function refreshTeam() {
  const query = document.getElementById('team-search')?.value || '';
  const department = document.getElementById('team-department')?.value || 'All';
  const list = team.filter(person => (department === 'All' || person[2] === department) && person.join(' ').toLowerCase().includes(query.toLowerCase()));
  listingPage = Math.min(listingPage, Math.max(1, Math.ceil(list.length / 15)));
  const grid = document.getElementById('team-grid');
  if (grid) grid.innerHTML = renderTeamCards(query, department);
  const pager = document.getElementById('team-pagination');
  if (pager) pager.innerHTML = paginationMarkup(list.length, listingPage, 15, 'team');
  const count = document.getElementById('team-count');
  if (count) count.textContent = `${list.length} ${list.length === 1 ? 'person' : 'people'}`;
}

function refreshCmcAs() {
  const query = document.getElementById('cmca-search')?.value || '';
  const matches = conservationAreas.filter(([name, details]) => `${name} ${details}`.toLowerCase().includes(query.toLowerCase()));
  listingPage = Math.min(listingPage, Math.max(1, Math.ceil(matches.length / 12)));
  const grid = document.getElementById('cmca-grid');
  if (grid) grid.innerHTML = renderCmcaCards(query);
  const pager = document.getElementById('cmca-pagination');
  if (pager) pager.innerHTML = paginationMarkup(matches.length, listingPage, 12, 'cmcas');
  const count = document.getElementById('cmca-count');
  if (count) count.textContent = `${matches.length} areas`;
}

function refreshHomeUpdateTab(tab, selectedButton = null) {
  const list = document.getElementById('home-update-list');
  if (list) list.innerHTML = renderHomeUpdateCards(tab);
  document.querySelectorAll('[data-action="home-tab"]').forEach(button => {
    const selected = button.dataset.tab === tab;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-selected', String(selected));
    button.setAttribute('tabindex', selected ? '0' : '-1');
    if (selected) list?.setAttribute('aria-labelledby', button.id);
  });
}
function refreshHomeResourceTab(tab) {
  const list = document.getElementById('home-resource-list');
  if (list) list.innerHTML = renderHomeResourceRows(tab);
  document.querySelectorAll('[data-action="home-resource-tab"]').forEach(button => {
    const selected = button.dataset.tab === tab;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-selected', String(selected));
    button.setAttribute('tabindex', selected ? '0' : '-1');
    if (selected) list?.setAttribute('aria-labelledby', button.id);
  });
}
function refreshGallery(category) {
  activeGalleryCategory = category;
  const grid = document.getElementById('gallery-grid');
  if (grid) grid.innerHTML = renderGalleryCards(category);
  document.querySelectorAll('[data-action="gallery-tab"]').forEach(button => {
    const selected = button.dataset.tab === category;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-selected', String(selected));
    button.setAttribute('tabindex', selected ? '0' : '-1');
    if (selected) grid?.setAttribute('aria-labelledby', button.id);
  });
}

function applyMapTransform() {
  const wrapper = document.getElementById('map-image-wrap');
  if (!wrapper) return;
  wrapper.style.transform = `translate(${mapOffset.x}px, ${mapOffset.y}px) scale(${mapZoom})`;
  wrapper.classList.toggle('is-zoomed', mapZoom > 1);
}
function setMapImage(index) {
  const page = mapPages.find(item => item.route === canonicalRoute(location.pathname));
  if (!page || !page.maps[index]) return;
  selectedMapIndex = index;
  mapZoom = 1;
  mapOffset = { x: 0, y: 0 };
  const map = page.maps[index];
  const img = document.getElementById('active-map-image');
  const title = document.getElementById('active-map-title');
  const source = document.getElementById('map-source-link');
  const download = document.getElementById('map-download-link');
  const loading = document.getElementById('map-loading');
  const error = document.getElementById('map-error');
  const errorSource = document.querySelector('#map-error a');
  if (!img || !title || !source || !download) return;
  if (loading) loading.hidden = false;
  if (error) error.hidden = true;
  img.onload = () => { if (loading) loading.hidden = true; if (error) error.hidden = true; };
  img.onerror = () => { if (loading) loading.hidden = true; if (error) error.hidden = false; };
  img.src = map.asset;
  img.alt = map.alt;
  title.textContent = map.title;
  source.href = map.source;
  if (errorSource) errorSource.href = map.source;
  download.href = map.asset;
  document.querySelectorAll('[data-action="select-map"]').forEach(button => {
    const selected = Number(button.dataset.mapIndex) === index;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  applyMapTransform();
}

function showGalleryImage(index) {
  if (!galleryImages.length) return;
  const normalized = (index + galleryImages.length) % galleryImages.length;
  const image = galleryImages[normalized];
  const dialog = document.getElementById('gallery-lightbox');
  if (!dialog) return;
  dialog.dataset.currentIndex = String(normalized);
  const img = document.getElementById('lightbox-image');
  img.src = image.src;
  img.alt = image.alt;
  document.getElementById('lightbox-title').textContent = image.title;
  document.getElementById('lightbox-category').textContent = image.category;
  document.getElementById('lightbox-credit').textContent = image.credit;
  const source = document.getElementById('lightbox-source');
  source.href = image.source;
  const license = document.getElementById('lightbox-license');
  if (image.license) {
    license.href = image.license;
    license.hidden = false;
    license.innerHTML = `License ${esc(image.license.split('/').filter(Boolean).slice(-2).join(' '))} ${icon('external', 12)}`;
  } else {
    license.hidden = true;
    license.removeAttribute('href');
  }
  dialog.hidden = false;
  document.body.classList.add('dialog-open');
  document.querySelector('[data-action="close-gallery"]')?.focus();
}
function closeGallery() {
  const dialog = document.getElementById('gallery-lightbox');
  if (!dialog) return;
  dialog.hidden = true;
  document.body.classList.remove('dialog-open');
  document.querySelector('[data-action="open-gallery"]')?.focus();
}

function openSearchDialog() {
  const dialog = document.getElementById('search-overlay');
  if (!dialog) return;
  searchDialogPreviousFocus = document.activeElement;
  dialog.hidden = false;
  document.body.classList.add('dialog-open');
  window.setTimeout(() => document.getElementById('global-search-input')?.focus(), 20);
}
function closeSearchDialog() {
  const dialog = document.getElementById('search-overlay');
  if (!dialog) return;
  dialog.hidden = true;
  document.body.classList.remove('dialog-open');
  if (searchDialogPreviousFocus?.focus) searchDialogPreviousFocus.focus();
}

function navigate(href, replace = false) {
  if (!href) return;
  const url = new URL(href, window.location.origin);
  if (url.origin !== window.location.origin) {
    window.open(url.href, '_blank', 'noopener,noreferrer');
    return;
  }
  const next = `${url.pathname}${url.search}${url.hash}`;
  if (replace) window.history.replaceState({}, '', next);
  else window.history.pushState({}, '', next);
  listingPage = 1;
  if (url.pathname !== '/media/' && url.pathname !== '/picture-gallery/') galleryImages = [];
  document.body.classList.remove('dialog-open');
  renderApp();
  document.getElementById('main')?.focus({ preventScroll: true });
  if (url.hash) document.getElementById(url.hash.slice(1))?.scrollIntoView();
  else window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
}

function renderApp() {
  const route = canonicalRoute(window.location.pathname);
  if (route !== lastRenderedRoute) {
    listingPage = 1;
    activeDocCategory = docFilterForRoute(route)?.[0] || 'All';
    currentArchiveDate = /^\/\d{4}\/\d{2}\/\d{2}\/$/.test(route) ? route.split('/').filter(Boolean).join('-') : '';
    selectedMapIndex = 0;
    mapZoom = 1;
    mapOffset = { x: 0, y: 0 };
  }
  lastRenderedRoute = route;
  root.setAttribute('aria-busy', 'true');
  const params = new URLSearchParams(window.location.search);
  root.innerHTML = `${renderHeader()}<main id="main" class="site-main" tabindex="-1">${renderPage(route, params)}</main>${renderFooter()}${searchDialogMarkup()}${galleryDialogMarkup()}`;
  root.setAttribute('aria-busy', 'false');
  const heading = root.querySelector('main h1');
  document.title = `${heading?.textContent?.trim() || SITE.department} | ${SITE.government}`;
  const navToggle = document.querySelector('.mobile-menu-toggle');
  if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
  if (document.getElementById('active-map-image')) {
    const image = document.getElementById('active-map-image');
    const loading = document.getElementById('map-loading');
    const error = document.getElementById('map-error');
    image.onload = () => { if (loading) loading.hidden = true; if (error) error.hidden = true; };
    image.onerror = () => { if (loading) loading.hidden = true; if (error) error.hidden = false; };
    if (image.complete) {
      if (image.naturalWidth) { if (loading) loading.hidden = true; }
      else { if (loading) loading.hidden = true; if (error) error.hidden = false; }
    }
  }
  if (route === '/our-team/') refreshTeam();
  if (route === '/cmcas/') refreshCmcAs();
  if (['/press-release/', '/tender/', '/public-notice/', '/notifications/'].includes(route) || /^\/\d{4}\/\d{2}\/\d{2}\/$/.test(route)) refreshArchive();
  if (['/resources/', '/publications/', '/reports/', '/acts/', '/rules/', '/policies/', '/procedures/'].includes(route)) refreshDocuments();
}

function handlePagination(scope, page) {
  listingPage = Math.max(1, Number(page) || 1);
  if (scope === 'updates') refreshArchive();
  else if (scope === 'documents') refreshDocuments();
  else if (scope === 'team') refreshTeam();
  else if (scope === 'cmcas') refreshCmcAs();
  document.querySelector('.pagination')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

async function handleContactSubmit(form) {
  const status = document.getElementById('contact-status');
  const button = document.getElementById('contact-submit');
  if (!form.reportValidity()) return;
  const formData = Object.fromEntries(new FormData(form).entries());
  const endpoint = (import.meta.env.VITE_CONTACT_ENDPOINT || '').trim();
  if (!endpoint) {
    status.className = 'form-status status-error';
    status.textContent = `Message not sent: no submission endpoint is configured. Please email ${SITE.email} or call ${SITE.phone}.`;
    return;
  }
  button.disabled = true;
  button.innerHTML = `${icon('calendar', 14)} Sending…`;
  status.className = 'form-status';
  status.textContent = 'Submitting your message…';
  try {
    const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(formData) });
    if (!response.ok) throw new Error(`The configured service returned HTTP ${response.status}.`);
    status.className = 'form-status status-success';
    status.textContent = 'Your message was accepted by the configured submission service.';
    form.reset();
  } catch (error) {
    status.className = 'form-status status-error';
    status.textContent = `Message not sent: ${error.message || 'the submission service could not be reached.'} Please use the department email or telephone above.`;
  } finally {
    button.disabled = false;
    button.innerHTML = `Send message ${icon('arrow', 14)}`;
  }
}

function onDocumentClick(event) {
  const link = event.target.closest('a[href]');
  if (link && !event.defaultPrevented && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && link.target !== '_blank' && !link.hasAttribute('download')) {
    const url = new URL(link.href, window.location.href);
    const sameOrigin = url.origin === window.location.origin;
    const hashOnly = sameOrigin && url.pathname === window.location.pathname && url.search === window.location.search && Boolean(url.hash);
    if (sameOrigin && !hashOnly && !link.hasAttribute('data-native')) {
      event.preventDefault();
      navigate(`${url.pathname}${url.search}${url.hash}`);
      return;
    }
  }
  const actionButton = event.target.closest('[data-action]');
  if (!actionButton) return;
  const action = actionButton.dataset.action;
  if (action === 'open-search') { event.preventDefault(); openSearchDialog(); }
  else if (action === 'close-search') { event.preventDefault(); closeSearchDialog(); }
  else if (action === 'mobile-menu') {
    const bar = document.getElementById('nav-bar');
    const expanded = actionButton.getAttribute('aria-expanded') === 'true';
    actionButton.setAttribute('aria-expanded', String(!expanded));
    bar?.classList.toggle('mobile-open', !expanded);
  }
  else if (action === 'menu-toggle') {
    const item = actionButton.closest('.nav-item');
    const expanded = actionButton.getAttribute('aria-expanded') === 'true';
    actionButton.setAttribute('aria-expanded', String(!expanded));
    item?.classList.toggle('open', !expanded);
  }
  else if (action === 'home-tab') refreshHomeUpdateTab(actionButton.dataset.tab);
  else if (action === 'home-resource-tab') refreshHomeResourceTab(actionButton.dataset.tab);
  else if (action === 'archive-tab') {
    const select = document.getElementById('archive-category');
    if (select) select.value = actionButton.dataset.tab;
    listingPage = 1;
    document.querySelectorAll('[data-action="archive-tab"]').forEach(button => { const selected = button.dataset.tab === actionButton.dataset.tab; button.classList.toggle('selected', selected); button.setAttribute('aria-selected', String(selected)); });
    refreshArchive();
  }
  else if (action === 'doc-tab') {
    activeDocCategory = actionButton.dataset.tab;
    listingPage = 1;
    document.querySelectorAll('[data-action="doc-tab"]').forEach(button => { const selected = button.dataset.tab === activeDocCategory; button.classList.toggle('selected', selected); button.setAttribute('aria-selected', String(selected)); });
    refreshDocuments();
  }
  else if (action === 'page') { handlePagination(actionButton.dataset.pageScope, actionButton.dataset.pageTarget); }
  else if (action === 'clear-archive-filters') {
    const input = document.getElementById('archive-search'); if (input) input.value = '';
    const select = document.getElementById('archive-category'); if (select) select.value = routeArchiveDefault(canonicalRoute(location.pathname));
    listingPage = 1; refreshArchive();
  }
  else if (action === 'clear-doc-filters') {
    const input = document.getElementById('doc-search'); if (input) input.value = '';
    activeDocCategory = docFilterForRoute(canonicalRoute(location.pathname))?.[0] || 'All';
    listingPage = 1; refreshDocuments();
  }
  else if (action === 'clear-filter') {
    const input = document.getElementById(actionButton.dataset.filter); if (input) input.value = '';
    listingPage = 1;
    if (actionButton.dataset.filter === 'cmca-search') refreshCmcAs();
  }
  else if (action === 'clear-team-filter') {
    const input = document.getElementById('team-search'); if (input) input.value = '';
    const select = document.getElementById('team-department'); if (select) select.value = 'All';
    listingPage = 1; refreshTeam();
  }
  else if (action === 'gallery-tab') refreshGallery(actionButton.dataset.tab);
  else if (action === 'open-gallery') showGalleryImage(Number(actionButton.dataset.imageIndex));
  else if (action === 'close-gallery') closeGallery();
  else if (action === 'gallery-prev') showGalleryImage(Number(document.getElementById('gallery-lightbox')?.dataset.currentIndex || 0) - 1);
  else if (action === 'gallery-next') showGalleryImage(Number(document.getElementById('gallery-lightbox')?.dataset.currentIndex || 0) + 1);
  else if (action === 'select-map') setMapImage(Number(actionButton.dataset.mapIndex));
  else if (action === 'map-zoom-in') { mapZoom = Math.min(4, mapZoom + 0.25); applyMapTransform(); }
  else if (action === 'map-zoom-out') { mapZoom = Math.max(1, mapZoom - 0.25); if (mapZoom === 1) mapOffset = { x: 0, y: 0 }; applyMapTransform(); }
  else if (action === 'map-fit') { mapZoom = 1; mapOffset = { x: 0, y: 0 }; applyMapTransform(); }
  else if (action === 'map-fullscreen') {
    const viewer = document.getElementById('map-viewer');
    if (viewer?.requestFullscreen) viewer.requestFullscreen().catch(() => {});
    else viewer?.classList.toggle('fullscreen-fallback');
  }
}

function onDocumentInput(event) {
  const target = event.target;
  if (target.id === 'global-search-input') {
    const results = document.getElementById('global-search-results');
    if (results) results.innerHTML = renderSearchResults(target.value, 8);
  } else if (target.id === 'archive-search' || target.id === 'archive-category') {
    listingPage = 1; refreshArchive();
  } else if (target.id === 'doc-search' || target.id === 'doc-sort') {
    listingPage = 1; refreshDocuments();
  } else if (target.id === 'team-search' || target.id === 'team-department') {
    listingPage = 1; refreshTeam();
  } else if (target.id === 'cmca-search') {
    listingPage = 1; refreshCmcAs();
  }
}

function onDocumentSubmit(event) {
  const form = event.target;
  if (form.id === 'global-search-form') {
    event.preventDefault();
    const query = document.getElementById('global-search-input')?.value.trim() || '';
    closeSearchDialog();
    navigate(`/search/?q=${encodeURIComponent(query)}`);
  } else if (form.id === 'search-page-form') {
    event.preventDefault();
    const query = new FormData(form).get('q')?.toString().trim() || '';
    navigate(`/search/?q=${encodeURIComponent(query)}`);
  } else if (form.id === 'contact-form') {
    event.preventDefault();
    handleContactSubmit(form);
  }
}

function onDocumentKeydown(event) {
  const search = document.getElementById('search-overlay');
  const gallery = document.getElementById('gallery-lightbox');
  if (event.key === 'Escape') {
    if (search && !search.hidden) closeSearchDialog();
    if (gallery && !gallery.hidden) closeGallery();
  }
  if (!gallery?.hidden && event.key === 'ArrowLeft') showGalleryImage(Number(gallery.dataset.currentIndex || 0) - 1);
  if (!gallery?.hidden && event.key === 'ArrowRight') showGalleryImage(Number(gallery.dataset.currentIndex || 0) + 1);
  const tab = event.target.closest?.('[role="tab"]');
  if (tab && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
    const tabs = [...tab.closest('[role="tablist"]').querySelectorAll('[role="tab"]')];
    const index = tabs.indexOf(tab);
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    event.preventDefault();
    tabs[nextIndex].focus();
    tabs[nextIndex].click();
  }
  const activeDialog = search && !search.hidden ? search : gallery && !gallery.hidden ? gallery : null;
  if (event.key === 'Tab' && activeDialog) {
    const focusable = [...activeDialog.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
}

function onMapPointerDown(event) {
  if (!event.target.closest('#map-stage') || mapZoom <= 1) return;
  mapDragging = true;
  mapDragStart = { x: event.clientX - mapOffset.x, y: event.clientY - mapOffset.y };
  event.target.closest('#map-stage').setPointerCapture?.(event.pointerId);
}
function onMapPointerMove(event) {
  if (!mapDragging) return;
  mapOffset = { x: event.clientX - mapDragStart.x, y: event.clientY - mapDragStart.y };
  applyMapTransform();
}
function onMapPointerUp() { mapDragging = false; }
function onMapWheel(event) {
  if (!event.target.closest('#map-stage')) return;
  event.preventDefault();
  mapZoom = Math.max(1, Math.min(4, mapZoom + (event.deltaY < 0 ? 0.15 : -0.15)));
  if (mapZoom === 1) mapOffset = { x: 0, y: 0 };
  applyMapTransform();
}

// Delegated listeners are registered once so direct URLs and refreshed page content behave identically.
document.addEventListener('click', onDocumentClick);
document.addEventListener('input', onDocumentInput);
document.addEventListener('change', onDocumentInput);
document.addEventListener('submit', onDocumentSubmit);
document.addEventListener('keydown', onDocumentKeydown);
document.addEventListener('pointerdown', onMapPointerDown);
document.addEventListener('pointermove', onMapPointerMove);
document.addEventListener('pointerup', onMapPointerUp);
document.addEventListener('pointercancel', onMapPointerUp);
document.addEventListener('wheel', onMapWheel, { passive: false });
window.addEventListener('popstate', () => { listingPage = 1; renderApp(); document.getElementById('main')?.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'instant' }); });

renderApp();
