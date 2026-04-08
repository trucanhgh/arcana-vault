import { cards } from '../data/cards.js';
import { UI_TEXT } from './i18n/uiText.js';

const suitClass = {major:'suit-major', wands:'suit-wands', cups:'suit-cups', swords:'suit-swords', pents:'suit-pents'};
const suitOrder = ['major', 'wands', 'cups', 'swords', 'pents'];
const suitCount = cards.reduce((acc, card) => {
  acc[card.suit] = (acc[card.suit] || 0) + 1;
  return acc;
}, {});
const LANGUAGE_STORAGE_KEY = 'tarot-lang';

let activeFilter = 'all';
let searchVal = '';
let currentLang = 'vi';

function getUi() {
  return UI_TEXT[currentLang] || UI_TEXT.vi;
}

function getNormalizedLanguage(lang) {
  return lang === 'en' ? 'en' : 'vi';
}

function updateTabLabels() {
  const ui = getUi();
  document.querySelectorAll('.tab').forEach((tab) => {
    const suit = tab.dataset.suit;
    const baseLabel = ui.tabs[suit];
    if (!baseLabel) return;

    const count = suit === 'all' ? cards.length : (suitCount[suit] || 0);
    const prefix = suit === 'all' ? '' : '✦ ';
    tab.textContent = `${prefix}${baseLabel} (${count})`;
  });
}

function applyLanguageToUi() {
  const ui = getUi();
  const searchInput = document.getElementById('search');
  const heroTitle = document.querySelector('.hero h1');
  const heroSubtitle = document.querySelector('.hero .subtitle');
  const desktopLangLabel = document.querySelector('.header-actions .lang-wrap > span');
  const mobileLangLabel = document.querySelector('.mobile-lang > span');
  const menuToggle = document.getElementById('menuToggle');
  const brandHome = document.getElementById('brandHome');
  const backToTop = document.getElementById('backToTop');
  const footerParagraphs = document.querySelectorAll('.site-footer p');

  document.documentElement.lang = currentLang;
  document.title = ui.documentTitle;

  if (searchInput) searchInput.placeholder = ui.searchPlaceholder;
  if (heroTitle) heroTitle.textContent = ui.heroTitle;
  if (heroSubtitle) heroSubtitle.textContent = ui.heroSubtitle;
  if (desktopLangLabel) desktopLangLabel.textContent = ui.languageLabel;
  if (mobileLangLabel) mobileLangLabel.textContent = ui.mobileLanguageLabel;
  if (menuToggle) menuToggle.setAttribute('aria-label', ui.menuAriaLabel);
  if (brandHome) brandHome.setAttribute('aria-label', ui.brandAriaLabel);
  if (backToTop) backToTop.setAttribute('aria-label', ui.backToTopAriaLabel);

  if (footerParagraphs[0]) footerParagraphs[0].textContent = ui.footerIntro;
  if (footerParagraphs[1]) footerParagraphs[1].textContent = ui.footerContact;

  document.querySelectorAll('.lang-select-input').forEach((select) => {
    select.value = currentLang;
  });

  updateTabLabels();
}

function setLanguage(lang, shouldRender = true) {
  currentLang = getNormalizedLanguage(lang);
  localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLang);
  applyLanguageToUi();
  if (shouldRender) {
    render();
  }
}

function render() {
  const ui = getUi();
  const grid = document.getElementById('grid');
  const suits = activeFilter === 'all' ? suitOrder : [activeFilter];
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
      html += `<div class="section-divider">${ui.sectionLabels[suit]}</div>`;
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
              <span class="suit-label ${suitClass[c.suit]}">${ui.suitLabel[c.suit]}</span>
            </div>
            <div class="card-vi">${c.vi}</div>
            <div class="card-meaning">${c.meaning}</div>
            <div class="keywords">${kwHtml}</div>
            <span class="flip-hint">${ui.flipHintFront}</span>
          </div>
          <div class="card-back">
            <div class="card-header">
              <span class="card-num" style="transform:rotate(180deg);display:inline-block">⟳</span>
              <span class="card-name">${c.name}${ui.reversedSuffix}</span>
            </div>
            <div class="card-vi" style="padding-left:2.4rem"><span class="rev-badge">${ui.reversedBadge}</span></div>
            <div class="card-rev-meaning">${c.rev}</div>
            <div class="keywords">${revkwHtml}</div>
            <span class="flip-hint">${ui.flipHintBack}</span>
          </div>
        </div>
      </div>`;
    });
  });

  grid.innerHTML = html || `<div class="empty-state">${ui.emptyState}</div>`;
  document.getElementById('count').textContent = ui.countText(total);
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
  setLanguage(changedSelect.value);
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

  const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  const initialLanguage = savedLanguage || languageSelects[0]?.value || 'vi';
  setLanguage(initialLanguage, false);

  render();
});
