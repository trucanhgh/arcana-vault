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

function filter(suit, btn) {
  activeFilter = suit;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  render();
}

function search(val) {
  searchVal = val;
  render();
}

document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tab');
  const searchInput = document.getElementById('search');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      filter(tab.dataset.suit, tab);
    });
  });

  searchInput.addEventListener('input', (event) => {
    search(event.target.value);
  });

  render();
});
