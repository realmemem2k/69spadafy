const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const horizontalSections = [...document.querySelectorAll('[data-horizontal]')];
const bridge = document.querySelector('.image-bridge');
const bridgeImage = bridge.querySelector('img');
const loading = document.querySelector('.loading-transition');
const loadingCard = loading.querySelector('.loading-card');
const loadingTitle = loading.querySelector('h2');
const siteHeader = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('.site-menu');
const hasHover = window.matchMedia('(hover: hover)');
let pointerNearTop = false;
let ticking = false;

function updateHeaderVisibility() {
  const visible = !hasHover.matches || window.scrollY < window.innerHeight * .8 || pointerNearTop || !menu.hidden || siteHeader.matches(':focus-within');
  siteHeader.classList.toggle('is-visible', visible);
}

function measure() {
  for (const section of horizontalSections) {
    const track = section.querySelector('.horizontal-track');
    const travel = Math.max(0, track.scrollWidth - window.innerWidth);
    section.dataset.travel = String(travel);
    section.style.height = `${window.innerHeight + travel}px`;
  }
  renderScroll();
}

function renderScroll() {
  const y = window.scrollY;
  const vh = window.innerHeight;
  for (const section of horizontalSections) {
    const travel = Number(section.dataset.travel || 0);
    const progress = travel ? clamp((y - section.offsetTop) / travel, 0, 1) : 0;
    section.querySelector('.horizontal-track').style.transform = `translate3d(${-progress * travel}px,0,0)`;
  }

  if (!reducedMotion.matches) {
    const box = bridge.getBoundingClientRect();
    const progress = clamp((vh - box.top) / (vh + box.height), 0, 1);
    bridgeImage.style.transform = `translate3d(0,${-progress * 80}px,0)`;
  } else {
    bridgeImage.style.transform = '';
  }

  const range = Math.max(1, loading.offsetHeight - vh);
  const progress = clamp((y - loading.offsetTop) / range, 0, 1);
  const eased = reducedMotion.matches ? (progress >= .5 ? 1 : 0) : progress * progress * (3 - 2 * progress);
  const startWidth = Math.min(431, window.innerWidth * .43);
  const startHeight = Math.min(600, vh * .56);
  loadingCard.style.width = `${startWidth + (window.innerWidth - startWidth) * eased}px`;
  loadingCard.style.height = `${startHeight + (vh - startHeight) * eased}px`;
  loadingCard.style.borderRadius = `${60 * (1 - eased)}px`;
  loadingTitle.style.fontSize = `${64 + (140 - 64) * eased}px`;
  updateHeaderVisibility();
}

window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { renderScroll(); ticking = false; });
}, { passive: true });
window.addEventListener('resize', measure);
window.addEventListener('load', measure);
document.fonts?.ready.then(measure);
reducedMotion.addEventListener?.('change', renderScroll);
measure();

function closeMenu() { menu.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Open menu'); updateHeaderVisibility(); }
menuButton.addEventListener('click', () => {
  menu.hidden = !menu.hidden;
  menuButton.setAttribute('aria-expanded', String(!menu.hidden));
  menuButton.setAttribute('aria-label', menu.hidden ? 'Open menu' : 'Close menu');
  updateHeaderVisibility();
});
window.addEventListener('pointermove', event => { pointerNearTop = event.clientY < 130 || siteHeader.contains(event.target); updateHeaderVisibility(); }, { passive: true });
window.addEventListener('blur', () => { pointerNearTop = false; updateHeaderVisibility(); });
siteHeader.addEventListener('focusin', updateHeaderVisibility);
siteHeader.addEventListener('focusout', () => requestAnimationFrame(updateHeaderVisibility));
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
document.addEventListener('click', event => { if (!document.querySelector('.site-header').contains(event.target)) closeMenu(); });

const carousel = document.querySelector('.team-carousel');
const cardStep = () => carousel.querySelector('.person').getBoundingClientRect().width + 16;
document.querySelector('#team-prev').addEventListener('click', () => carousel.scrollBy({ left: -cardStep(), behavior: reducedMotion.matches ? 'instant' : 'smooth' }));
document.querySelector('#team-next').addEventListener('click', () => carousel.scrollBy({ left: cardStep(), behavior: reducedMotion.matches ? 'instant' : 'smooth' }));
let dragStart = null;
carousel.addEventListener('pointerdown', event => { if (event.pointerType === 'mouse') { dragStart = { x: event.clientX, left: carousel.scrollLeft }; carousel.classList.add('dragging'); carousel.setPointerCapture(event.pointerId); } });
carousel.addEventListener('pointermove', event => { if (dragStart) carousel.scrollLeft = dragStart.left - (event.clientX - dragStart.x); });
const stopDrag = () => { dragStart = null; carousel.classList.remove('dragging'); };
carousel.addEventListener('pointerup', stopDrag);
carousel.addEventListener('pointercancel', stopDrag);

const dialog = document.querySelector('#prototype-dialog');
document.querySelectorAll('[data-dialog-open],[data-contact-open]').forEach(button => button.addEventListener('click', () => dialog.showModal()));
dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.querySelector('.dialog-dismiss').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
