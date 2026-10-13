'use strict';
const menuButton = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');
function setMenu(open) {
  menuButton?.setAttribute('aria-expanded', String(open));
  nav?.classList.toggle('open', open);
  const label = document.querySelector('[data-menu-label]');
  if (label) label.textContent = open ? 'Cerrar menú' : 'Abrir menú';
}
menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') { setMenu(false); menuButton.focus(); } });
document.addEventListener('click', event => { if (nav?.classList.contains('open') && !nav.contains(event.target) && !menuButton.contains(event.target)) setMenu(false); });
window.matchMedia('(min-width: 801px)').addEventListener('change', event => { if (event.matches) setMenu(false); });
document.querySelectorAll('[data-year]').forEach(element => { element.textContent = String(new Date().getFullYear()); });
document.querySelector('[data-copy-email]')?.addEventListener('click', async event => {
  const button = event.currentTarget;
  const status = document.querySelector('[data-copy-status]');
  try {
    await navigator.clipboard.writeText('dmpstudiodev@gmail.com');
    button.textContent = 'Correo copiado ✓';
    if (status) status.textContent = 'Correo copiado al portapapeles.';
  } catch {
    button.textContent = 'Selecciona el correo para copiarlo';
    if (status) status.textContent = 'No se pudo acceder al portapapeles. Puedes seleccionar y copiar el correo.';
    const email = document.querySelector('.contact-email');
    if (email) { const range = document.createRange(); range.selectNodeContents(email); const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range); }
  }
});
const shots = [...document.querySelectorAll('[data-lightbox]')];
if (shots.length && typeof HTMLDialogElement !== 'undefined') {
  const dialog = document.createElement('dialog');
  dialog.className = 'lightbox';
  dialog.setAttribute('aria-label', 'Vista ampliada de la captura');
  dialog.innerHTML = '<div class="lightbox-bar"><span data-counter></span><button class="lightbox-close" type="button">Cerrar ×</button></div><img alt=""><p class="lightbox-caption"></p><div class="lightbox-nav"><button class="lightbox-arrow" type="button" data-prev aria-label="Captura anterior">←</button><button class="lightbox-arrow" type="button" data-next aria-label="Captura siguiente">→</button></div>';
  document.body.append(dialog);
  let current = 0;
  let opener;
  function show(index) {
    current = (index + shots.length) % shots.length;
    const img = dialog.querySelector('img');
    img.src = shots[current].href;
    img.alt = shots[current].querySelector('img')?.alt || 'Captura de la aplicación';
    dialog.querySelector('.lightbox-caption').textContent = shots[current].dataset.caption || img.alt;
    dialog.querySelector('[data-counter]').textContent = `${current + 1} / ${shots.length}`;
  }
  shots.forEach((link, index) => link.addEventListener('click', event => { event.preventDefault(); opener = link; show(index); dialog.showModal(); }));
  dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-prev]').addEventListener('click', () => show(current - 1));
  dialog.querySelector('[data-next]').addEventListener('click', () => show(current + 1));
  dialog.addEventListener('keydown', event => { if (event.key === 'ArrowRight') { event.preventDefault(); show(current + 1); } if (event.key === 'ArrowLeft') { event.preventDefault(); show(current - 1); } });
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => opener?.focus());
}
