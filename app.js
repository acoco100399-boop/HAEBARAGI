const FLOWERS = [
  { id:'sunflower', name:'해바라기', icon:'🌻', color:'#f3c84b' },
  { id:'rose', name:'장미', icon:'🌹', color:'#e88991' },
  { id:'tulip', name:'튤립', icon:'🌷', color:'#ef9ba3' },
  { id:'cosmos', name:'코스모스', icon:'🌼', color:'#efb0bd' },
  { id:'lavender', name:'라벤더', icon:'🪻', color:'#9c87be' },
  { id:'daisy', name:'데이지', icon:'🌼', color:'#fff0a6' }
];

const app = document.querySelector('#app');
const modalRoot = document.querySelector('#modal-root');
const state = {
  nickname: localStorage.getItem('haebaragi-nickname') || '',
  inventory: JSON.parse(localStorage.getItem('haebaragi-inventory') || '[]'),
  garden: JSON.parse(localStorage.getItem('haebaragi-garden') || '[]'),
  page: 'home'
};

function save() {
  localStorage.setItem('haebaragi-nickname', state.nickname);
  localStorage.setItem('haebaragi-inventory', JSON.stringify(state.inventory));
  localStorage.setItem('haebaragi-garden', JSON.stringify(state.garden));
}

function topbar() {
  return `
    <header class="topbar">
      <button class="brand" data-action="home"><strong>해바라기</strong><small>happy vibe shop</small></button>
      <nav class="nav-actions">
        <button class="nav-button" data-action="shop">꽃씨 상점</button>
        <button class="nav-button" data-action="garden">내 화단</button>
      </nav>
    </header>`;
}

function flowerIllustration(count = 5) {
  return `<div class="flower-row">${Array.from({length:count},()=>'<span class="flower"></span>').join('')}</div>`;
}

function renderHome() {
  app.innerHTML = `<div class="app-shell">
    ${topbar()}
    <section class="hero">
      <div class="hero-copy">
        <span class="hero-kicker">HAPPY VIBE SHOP</span>
        <h1><span>해바라기</span><br>바라기</h1>
        <p class="hero-subtitle">올해의 소원을 꽃에 담아<br>친구의 화단을 따뜻하게 피워보세요.</p>
        <button class="primary-button" data-action="start">시작하기</button>
      </div>
      <div class="shop-illustration" aria-label="따뜻한 꽃가게 일러스트">
        <div class="door"></div>
        ${flowerIllustration()}
      </div>
    </section>
  </div>`;
}

function renderShop() {
  app.innerHTML = `<div class="app-shell">
    ${topbar()}
    <section class="shop-page">
      <div class="page-heading">
        <div><h1>꽃씨 상점</h1><p>지금은 0원에 마음을 심을 수 있어요</p></div>
        <button class="nav-button" data-action="garden">내 화단 가기 →</button>
      </div>
      <div class="seed-grid">
        ${FLOWERS.map(flower => {
          const owned = state.inventory.some(item => item.id === flower.id);
          return `<article class="seed-card">
            <div class="bloom" style="color:${flower.color}">${flower.icon}</div>
            <h3>${flower.name}</h3>
            <small>${owned ? '이미 가지고 있어요' : '꽃씨 1개 · 무료'}</small>
            <button class="seed-button ${owned ? 'purchased' : ''}" data-buy="${flower.id}" ${owned ? 'disabled' : ''}>${owned ? '구매 완료' : '씨앗 구매'}</button>
          </article>`;
        }).join('')}
      </div>
    </section>
  </div>`;
}

function renderGarden() {
  app.innerHTML = `<div class="app-shell">
    ${topbar()}
    <section class="garden-page">
      <div class="garden-tools">
        <div><h1>${state.nickname ? `${state.nickname}의 화단` : '나의 화단'}</h1></div>
        <button class="share-button" data-action="share">화단 공유하기 ↗</button>
      </div>
      <div class="garden-bed" id="garden-bed">
        ${state.garden.map((plant, index) => {
          const flower = FLOWERS.find(f => f.id === plant.id) || FLOWERS[0];
          return `<button class="planted-flower" style="left:${plant.x}%; top:${plant.y}%" data-edit="${index}" aria-label="${plant.title || flower.name}">
            <span class="bloom">${flower.icon}</span><span class="stem"></span><span class="name-tag">${escapeHTML(plant.title || flower.name)}</span>
          </button>`;
        }).join('')}
      </div>
      <aside class="seed-tray">
        <div class="seed-tray-title">내 씨앗</div>
        ${state.inventory.length ? state.inventory.map((item, index) => {
          const flower = FLOWERS.find(f => f.id === item.id);
          return `<button class="inventory-seed" draggable="true" data-inventory="${index}" title="화단에 드래그하세요">
            <span>${flower.icon}</span><small>${flower.name}</small>
          </button>`;
        }).join('') : '<div class="empty-tray">상점에서 씨앗을 먼저 구매해 주세요</div>'}
      </aside>
    </section>
  </div>`;
}

function openNicknameModal() {
  modalRoot.innerHTML = `<div class="modal-backdrop">
    <section class="modal">
      <h2>오늘의 꽃집 주인은?</h2>
      <p>화단에 보여질 닉네임을 설정해 주세요.</p>
      <input id="nickname-input" maxlength="12" placeholder="예: 행복한 해바라기" value="${escapeHTML(state.nickname)}">
      <button class="primary-button" id="nickname-save">상점 입장하기</button>
    </section>
  </div>`;
  document.querySelector('#nickname-input').focus();
  document.querySelector('#nickname-save').addEventListener('click', () => {
    const value = document.querySelector('#nickname-input').value.trim();
    if (!value) return document.querySelector('#nickname-input').focus();
    state.nickname = value;
    save();
    closeModal();
    state.page = 'shop';
    renderShop();
  });
}

function openMessageModal(index = null) {
  const existing = index === null ? null : state.garden[index];
  modalRoot.innerHTML = `<div class="modal-backdrop">
    <section class="modal message-modal">
      <h2>꽃에 소원을 담아주세요</h2>
      <p>꽃 이름과 올 한 해의 마음을 남겨요.</p>
      <input id="flower-title" maxlength="16" placeholder="꽃 이름" value="${escapeHTML(existing?.title || '')}">
      <textarea id="flower-message" maxlength="100" placeholder="다가오는 새해를 위한 소원을 적어보세요.">${escapeHTML(existing?.message || '')}</textarea>
      <button class="primary-button" id="message-save">완료</button>
    </section>
  </div>`;
  document.querySelector('#message-save').addEventListener('click', () => {
    const title = document.querySelector('#flower-title').value.trim();
    const message = document.querySelector('#flower-message').value.trim();
    if (!title) return document.querySelector('#flower-title').focus();
    if (index === null) return;
    state.garden[index].title = title;
    state.garden[index].message = message;
    save();
    closeModal();
    renderGarden();
  });
}

function closeModal() { modalRoot.innerHTML = ''; }

function escapeHTML(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
}

function navigate(page) {
  state.page = page;
  if (page === 'shop') renderShop();
  else if (page === 'garden') {
    if (!state.nickname) openNicknameModal();
    else renderGarden();
  } else renderHome();
}

app.addEventListener('click', event => {
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action) {
    if (action === 'start' || action === 'garden') navigate('garden');
    else if (action === 'shop') navigate('shop');
    else if (action === 'share') {
      const url = `${location.href.split('#')[0]}#garden`;
      navigator.clipboard?.writeText(url);
      alert('내 화단 주소가 복사되었어요.');
    } else navigate('home');
  }

  const buyButton = event.target.closest('[data-buy]');
  if (buyButton) {
    const flower = FLOWERS.find(f => f.id === buyButton.dataset.buy);
    if (!flower || state.inventory.some(item => item.id === flower.id)) return;
    state.inventory.push({ id: flower.id, planted: false });
    save();
    renderShop();
  }

  const editButton = event.target.closest('[data-edit]');
  if (editButton) openMessageModal(Number(editButton.dataset.edit));
});

app.addEventListener('dragstart', event => {
  const seed = event.target.closest('[data-inventory]');
  if (seed) event.dataTransfer.setData('text/plain', seed.dataset.inventory);
});

app.addEventListener('dragover', event => {
  if (event.target.closest('#garden-bed')) event.preventDefault();
});

app.addEventListener('drop', event => {
  const bed = event.target.closest('#garden-bed');
  if (!bed) return;
  event.preventEvent?.();
  event.preventDefault();
  if (state.garden.length >= 30) return alert('한 화단에는 최대 30송이까지 심을 수 있어요.');
  const index = Number(event.dataTransfer.getData('text/plain'));
  const item = state.inventory[index];
  if (!item) return;
  const rect = bed.getBoundingRect();
  const x = Math.max(8, Math.min(92, ((event.clientX - rect.left) / rect.width) * 100));
  const y = Math.max(18, Math.min(88, ((event.clientY - rect.top) / rect.height) * 100));
  state.garden.push({ id:item.id, x, y, title:'', message:'', plantedAt:new Date().toISOString() });
  state.inventory.splice(index, 1);
  save();
  closeModal();
  renderGarden();
  openMessageModal(state.garden.length - 1);
});

window.addEventListener('hashchange', () => {
  if (location.hash === '#garden') navigate('garden');
});

if (location.hash === '#garden') navigate('garden');
else renderHome();
