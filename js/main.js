import { cards } from '../data/cards.js';
import { UI_TEXT } from './i18n/uiText.js';

const suitClass = {major:'suit-major', wands:'suit-wands', cups:'suit-cups', swords:'suit-swords', pents:'suit-pents'};
const suitOrder = ['major', 'wands', 'cups', 'swords', 'pents'];
const suitCount = cards.reduce((acc, card) => {
  acc[card.suit] = (acc[card.suit] || 0) + 1;
  return acc;
}, {});
const LANGUAGE_STORAGE_KEY = 'tarot-lang';
const majorImageIndexMap = {
  '0': '00',
  I: '01',
  II: '02',
  III: '03',
  IV: '04',
  V: '05',
  VI: '06',
  VII: '07',
  VIII: '08',
  IX: '09',
  X: '10',
  XI: '11',
  XII: '12',
  XIII: '13',
  XIV: '14',
  XV: '15',
  XVI: '16',
  XVII: '17',
  XVIII: '18',
  XIX: '19',
  XX: '20',
  XXI: '21',
};
const majorImageFileMap = {
  '0': 'RWS_Tarot_00_Fool.svg',
  I: 'RWS_Tarot_01_Magician.svg',
  II: 'RWS_Tarot_02_High_Priestess.svg',
  III: 'RWS_Tarot_03_Empress.svg',
  IV: 'RWS_Tarot_04_Emperor.svg',
  V: 'RWS_Tarot_05_Hierophant.svg',
  VI: 'RWS_Tarot_06_Lovers.svg',
  VII: 'RWS_Tarot_07_Chariot.svg',
  VIII: 'RWS_Tarot_08_Strength.svg',
  IX: 'RWS_Tarot_09_Hermit.svg',
  X: 'RWS_Tarot_10_Wheel_of_Fortune.svg',
  XI: 'RWS_Tarot_11_Justice.svg',
  XII: 'RWS_Tarot_12_Hanged_Man.svg',
  XIII: 'RWS_Tarot_13_Death.svg',
  XIV: 'RWS_Tarot_14_Temperance.svg',
  XV: 'RWS_Tarot_15_Devil.svg',
  XVI: 'RWS_Tarot_16_Tower.svg',
  XVII: 'RWS_Tarot_17_Star.svg',
  XVIII: 'RWS_Tarot_18_Moon.svg',
  XIX: 'RWS_Tarot_19_Sun.svg',
  XX: 'RWS_Tarot_20_Judgement.svg',
  XXI: 'RWS_Tarot_21_World.svg',
};
const minorSuitPrefix = {
  wands: 'Wands',
  cups: 'Cups',
  swords: 'Swords',
  pents: 'Pents',
};
const minorRankMap = {
  A: 1,
  P: 11,
  Kn: 12,
  Q: 13,
  K: 14,
};
const BASE_CARD_MIN_HEIGHT = 340;
let cardHeightRafId = 0;

let activeFilter = 'all';
let searchVal = '';
let currentLang = 'vi';

function getLocalizedCardText(card, key, lang = currentLang) {
  const value = card?.[key];

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value[lang] || value.vi || value.en || '';
  }

  return typeof value === 'string' ? value : '';
}

function getLocalizedCardList(card, key, lang = currentLang) {
  const value = card?.[key];

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const localized = value[lang] || value.vi || value.en;
    return Array.isArray(localized) ? localized : [];
  }

  return Array.isArray(value) ? value : [];
}

function getUi() {
  return UI_TEXT[currentLang] || UI_TEXT.vi;
}

function getCardImageSrc(card) {
  if (typeof card?.image === 'string' && card.image.trim()) {
    return card.image;
  }

  if (card?.suit === 'major') {
    const majorFilename = majorImageFileMap[card.num];
    if (majorFilename) {
      return `./assets/images/cards/${majorFilename}`;
    }

    const majorIndex = majorImageIndexMap[card.num];
    if (!majorIndex) return '';

    const fallbackName = (card.name?.en || card.name?.vi || '').replace(/\s+/g, '_');
    return `./assets/images/cards/RWS_Tarot_${majorIndex}_${fallbackName}.svg`;
  }

  const suitPrefix = minorSuitPrefix[card?.suit];
  if (!suitPrefix) return '';

  const rank = Number.isFinite(Number(card.num))
    ? Number(card.num)
    : minorRankMap[card.num];

  if (!rank || rank < 1 || rank > 14) return '';
  return `./assets/images/cards/${suitPrefix}${String(rank).padStart(2, '0')}.svg`;
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

    const isMobileTab = tab.closest('.mobile-tabs');
    const count = suit === 'all' ? cards.length : (suitCount[suit] || 0);
    const prefix = suit === 'all' ? '' : '✦ ';
    tab.textContent = isMobileTab ? `${prefix}${baseLabel}` : `${prefix}${baseLabel} (${count})`;
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

function syncCardHeights() {
  const cardsInGrid = Array.from(document.querySelectorAll('#grid .card'));
  if (!cardsInGrid.length) return;

  let unifiedHeight = BASE_CARD_MIN_HEIGHT;

  cardsInGrid.forEach((card) => {
    const front = card.querySelector('.card-front');
    const back = card.querySelector('.card-back');

    if (!(front instanceof HTMLElement) || !(back instanceof HTMLElement)) {
      return;
    }

    unifiedHeight = Math.max(unifiedHeight, front.scrollHeight, back.scrollHeight);
  });

  cardsInGrid.forEach((card) => {
    const inner = card.querySelector('.card-inner');
    card.style.height = `${unifiedHeight}px`;
    if (inner instanceof HTMLElement) {
      inner.style.height = `${unifiedHeight}px`;
      inner.style.minHeight = `${unifiedHeight}px`;
    }
  });
}

function scheduleCardHeightSync() {
  if (cardHeightRafId) {
    cancelAnimationFrame(cardHeightRafId);
  }

  cardHeightRafId = requestAnimationFrame(() => {
    cardHeightRafId = 0;
    syncCardHeights();
  });
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

      const localizedName = getLocalizedCardText(c, 'name');
      const localizedLabel = getLocalizedCardText(c, 'label');
      const localizedMeaning = getLocalizedCardText(c, 'meaning');
      const localizedRev = getLocalizedCardText(c, 'rev');
      const localizedKw = getLocalizedCardList(c, 'kw').join(' ');
      const localizedRevKw = getLocalizedCardList(c, 'revkw').join(' ');
      const q = searchVal.toLowerCase();

      return localizedName.toLowerCase().includes(q)
        || localizedLabel.toLowerCase().includes(q)
        || localizedMeaning.toLowerCase().includes(q)
        || localizedRev.toLowerCase().includes(q)
        || localizedKw.toLowerCase().includes(q)
        || localizedRevKw.toLowerCase().includes(q);
    });
    if (!filtered.length) return;

    if (ui.sectionLabels[suit]) {
      html += `<div class="section-divider">${ui.sectionLabels[suit]}</div>`;
    }

    filtered.forEach(c => {
      total++;
      const localizedName = getLocalizedCardText(c, 'name');
      const localizedLabel = getLocalizedCardText(c, 'label');
      const localizedMeaning = getLocalizedCardText(c, 'meaning');
      const localizedRev = getLocalizedCardText(c, 'rev');
      const localizedKw = getLocalizedCardList(c, 'kw');
      const localizedRevKw = getLocalizedCardList(c, 'revkw');
      const cardImageSrc = getCardImageSrc(c);

      const kwHtml = localizedKw.map(k=>`<span class="kw">${k}</span>`).join('');
      const revkwHtml = localizedRevKw.map(k=>`<span class="kw kw-rev">${k}</span>`).join('');
      html += `<div class="card" onclick="this.classList.toggle('flipped')" data-suit="${c.suit}">
        <div class="card-inner">
          <div class="card-front">
            <div class="card-header">
              <span class="card-num">${c.num}</span>
              <span class="card-name">${localizedName}</span>
              <span class="suit-label ${suitClass[c.suit]}">${ui.suitLabel[c.suit]}</span>
            </div>
            <div class="card-vi">${localizedLabel}</div>
            <div class="card-main">
              ${cardImageSrc ? `<img class="card-thumb" src="${cardImageSrc}" alt="${localizedName}" loading="lazy" decoding="async" onerror="this.style.display='none'">` : ''}
              <div class="card-content">
                <div class="card-meaning">${localizedMeaning}</div>
                <div class="keywords">${kwHtml}</div>
              </div>
            </div>
            <span class="flip-hint">${ui.flipHintFront}</span>
          </div>
          <div class="card-back">
            <div class="card-header">
              <span class="card-num" style="transform:rotate(180deg);display:inline-block">⟳</span>
              <span class="card-name">${localizedName}</span>
              <span class="suit-label ${suitClass[c.suit]} reversed-badge">${ui.reversedBadge}</span>
            </div>
            <div class="card-vi">${localizedLabel}</div>
            <div class="card-main">
              ${cardImageSrc ? `<img class="card-thumb is-reversed" src="${cardImageSrc}" alt="${localizedName}" loading="lazy" decoding="async" onerror="this.style.display='none'">` : ''}
              <div class="card-content">
                <div class="card-rev-meaning">${localizedRev}</div>
                <div class="keywords">${revkwHtml}</div>
              </div>
            </div>
            <span class="flip-hint">${ui.flipHintBack}</span>
          </div>
        </div>
      </div>`;
    });
  });

  grid.innerHTML = html || `<div class="empty-state">${ui.emptyState}</div>`;
  document.getElementById('count').textContent = ui.countText(total);
  scheduleCardHeightSync();

  grid.querySelectorAll('.card-thumb').forEach((image) => {
    if (image.complete) return;
    image.addEventListener('load', scheduleCardHeightSync, { once: true });
  });
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

  let touchStartX = 0;
  let touchStartY = 0;
  let suppressMenuToggleUntil = 0;

  document.addEventListener('touchstart', (event) => {
    const touch = event.touches?.[0];
    if (!touch) return;
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }, { passive: true });

  document.addEventListener('touchmove', (event) => {
    const touch = event.touches?.[0];
    if (!touch) return;

    const deltaX = Math.abs(touch.clientX - touchStartX);
    const deltaY = Math.abs(touch.clientY - touchStartY);

    // Ignore synthetic click after swipe so mobile menu only opens by tap.
    if (deltaX > 14 || deltaY > 14) {
      suppressMenuToggleUntil = Date.now() + 250;
    }
  }, { passive: true });

  menuToggle?.addEventListener('click', () => {
    if (Date.now() < suppressMenuToggleUntil) return;

    mobilePanel?.classList.toggle('open');
    document.querySelector('.site-header')?.classList.remove('header-hidden');
  });

  document.addEventListener('touchstart', (event) => {
    if (!mobilePanel?.classList.contains('open')) return;
    const target = event.target;
    if (!(target instanceof Element)) return;

    const touchedOutsideMenu = !mobilePanel.contains(target) && !menuToggle?.contains(target);
    if (touchedOutsideMenu) {
      mobilePanel.classList.remove('open');
    }
  }, { passive: true });

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

  window.addEventListener('resize', scheduleCardHeightSync);
  window.addEventListener('load', scheduleCardHeightSync);

  if (document.fonts && typeof document.fonts.ready?.then === 'function') {
    document.fonts.ready.then(scheduleCardHeightSync);
  }

  const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  const initialLanguage = savedLanguage || languageSelects[0]?.value || 'vi';
  setLanguage(initialLanguage, false);

  render();
});
