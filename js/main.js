import { cards } from '../data/cards.js';

const suitLabel = {major:'Major Arcana', wands:'Wands', cups:'Cups', swords:'Swords', pents:'Pentacles'};
const suitClass = {major:'suit-major', wands:'suit-wands', cups:'suit-cups', swords:'suit-swords', pents:'suit-pents'};

let activeFilter = 'all';
let searchVal = '';

function render() {
  const grid = document.getElementById('grid');
  const suits = activeFilter === 'all' ? ['major','wands','cups','swords','pents'] : [activeFilter];
  let html = '';
  let total = 0;

  suits.forEach(suit => {
    const filtered = cards.filter(c => {
      if (c.suit !== suit) return false;
      if (!searchVal) return true;
      const q = searchVal.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.vi.toLowerCase().includes(q) || c.meaning.toLowerCase().includes(q) || c.rev.toLowerCase().includes(q) || c.kw.join(' ').toLowerCase().includes(q);
    });
    if (!filtered.length) return;

    if (activeFilter === 'all') {
      const labels = {major:'✦ Major Arcana — 22 Bài Lớn',wands:'✦ Wands — Bộ Gậy',cups:'✦ Cups — Bộ Ly',swords:'✦ Swords — Bộ Kiếm',pents:'✦ Pentacles — Bộ Tiền'};
      html += `<div class="section-divider">${labels[suit]}</div>`;
    }

    filtered.forEach(c => {
      total++;
      const kwHtml = c.kw.map(k=>`<span class="kw">${k}</span>`).join('');
      const revkwHtml = c.revkw.map(k=>`<span class="kw kw-rev">${k}</span>`).join('');
      html += `<div class="card" onclick="this.classList.toggle('flipped')" data-suit="${c.suit}">
        <div class="card-inner">
          <div class="card-front">
            <div class="card-header">
              <span class="card-num">${c.num}</span>
              <span class="card-name">${c.name}</span>
              <span class="suit-label ${suitClass[c.suit]}">${suitLabel[c.suit]}</span>
            </div>
            <div class="card-vi">${c.vi}</div>
            <div class="card-meaning">${c.meaning}</div>
            <div class="keywords">${kwHtml}</div>
            <span class="flip-hint">↩ nhấn để lật</span>
          </div>
          <div class="card-back">
            <div class="card-header">
              <span class="card-num" style="transform:rotate(180deg);display:inline-block">⟳</span>
              <span class="card-name">${c.name} — Ngược</span>
            </div>
            <div class="card-vi" style="padding-left:2.4rem"><span class="rev-badge">REVERSED</span></div>
            <div class="card-rev-meaning">${c.rev}</div>
            <div class="keywords">${revkwHtml}</div>
            <span class="flip-hint">↩ nhấn để quay lại</span>
          </div>
        </div>
      </div>`;
    });
  });

  grid.innerHTML = html || '<div class="empty-state">Không tìm thấy lá phù hợp.</div>';
  document.getElementById('count').textContent = total + ' lá';
}

function filter(suit) {
  activeFilter = suit;
  document.querySelectorAll('.tab').forEach((t) => {
    t.classList.toggle('active', t.dataset.suit === suit);
  });

  const mobilePanel = document.getElementById('mobilePanel');
  if (mobilePanel) {
    mobilePanel.classList.remove('open');
  }

  render();
}

function search(val) {
  searchVal = val;
  render();
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goHome() {
  const searchInput = document.getElementById('search');
  activeFilter = 'all';
  searchVal = '';

  if (searchInput) {
    searchInput.value = '';
  }

  document.querySelectorAll('.tab').forEach((t) => {
    t.classList.toggle('active', t.dataset.suit === 'all');
  });

  const mobilePanel = document.getElementById('mobilePanel');
  mobilePanel?.classList.remove('open');

  render();
  scrollToTop();
}

function syncLanguageSelectors(changedSelect) {
  const value = changedSelect.value;
  document.querySelectorAll('.lang-select-input').forEach((select) => {
    select.value = value;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const siteHeader = document.querySelector('.site-header');
  const tabs = document.querySelectorAll('.tab');
  const searchInput = document.getElementById('search');
  const menuToggle = document.getElementById('menuToggle');
  const mobilePanel = document.getElementById('mobilePanel');
  const brandHome = document.getElementById('brandHome');
  const backToTop = document.getElementById('backToTop');
  const languageSelects = document.querySelectorAll('.lang-select-input');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      filter(tab.dataset.suit);
    });
  });

  searchInput?.addEventListener('input', (event) => {
    search(event.target.value);
  });

  menuToggle?.addEventListener('click', () => {
    mobilePanel?.classList.toggle('open');
    document.querySelector('.site-header')?.classList.remove('header-hidden');
  });

  languageSelects.forEach((select) => {
    select.addEventListener('change', () => {
      syncLanguageSelectors(select);
    });
  });

  brandHome?.addEventListener('click', goHome);
  backToTop?.addEventListener('click', scrollToTop);

  let lastScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    if (siteHeader) {
      const scrollingDown = window.scrollY > lastScrollY;
      const menuOpen = mobilePanel?.classList.contains('open');
      const shouldHide = scrollingDown && window.scrollY > 120 && !menuOpen;
      siteHeader.classList.toggle('header-hidden', shouldHide);
      lastScrollY = window.scrollY;
    }

    if (!backToTop) return;
    const shouldShow = window.scrollY > 250;
    backToTop.classList.toggle('visible', shouldShow);
  });

  render();
});
