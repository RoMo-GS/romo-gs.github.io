'use strict';

// Keep all interactions local and dependency-free for GitHub Pages.
const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#nav-links');
function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
  navigation.classList.remove('is-open');
}
menuToggle.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!expanded));
  menuToggle.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  navigation.classList.toggle('is-open', !expanded);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuToggle.focus();
  }
});
window.matchMedia('(min-width: 701px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});

const comparison = document.querySelector('#image-comparison');
const reveal = comparison.querySelector('input');
reveal.addEventListener('input', () => {
  comparison.style.setProperty('--position', `${reveal.value}%`);
  reveal.setAttribute('aria-valuetext', `${reveal.value} percent RoMo-GS reconstruction`);
});

const video = document.querySelector('#project-video');
const chapters = [...document.querySelectorAll('[data-time]')];
chapters.forEach(button => button.addEventListener('click', () => {
  const playFromHighlight = () => {
    video.currentTime = Number(button.dataset.time);
    video.play().catch(() => { /* Native controls remain available if autoplay is blocked. */ });
  };
  if (video.readyState >= 1) playFromHighlight();
  else {
    video.addEventListener('loadedmetadata', playFromHighlight, { once: true });
    video.load();
  }
}));
video.addEventListener('timeupdate', () => {
  const current = chapters.findLast(button => video.currentTime >= Number(button.dataset.time));
  chapters.forEach(button => {
    button.classList.toggle('is-active', button === current);
    if (button === current) button.setAttribute('aria-current', 'true');
    else button.removeAttribute('aria-current');
  });
});

const copyButton = document.querySelector('.copy-button');
const copyLabel = document.querySelector('#copy-label');
const copyStatus = document.querySelector('#copy-status');
let copyReset;
copyButton.addEventListener('click', async () => {
  const code = document.querySelector('#bibtex-code');
  const citation = code.textContent.trim();
  let copied = false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(citation);
      copied = true;
    }
  } catch { /* Continue with a local-file-compatible selection fallback. */ }
  if (!copied) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(code);
    selection.removeAllRanges();
    selection.addRange(range);
    try { copied = document.execCommand('copy'); } catch { copied = false; }
    if (copied) selection.removeAllRanges();
  }
  clearTimeout(copyReset);
  copyLabel.textContent = copied ? 'Copied!' : 'Text selected';
  copyButton.classList.toggle('is-copied', copied);
  copyStatus.textContent = copied ? 'BibTeX copied to clipboard.' : 'Press Ctrl+C or ⌘C to copy the selected citation, or download the .bib file.';
  copyReset = setTimeout(() => { copyLabel.textContent = 'Copy'; copyButton.classList.remove('is-copied'); }, 3000);
});

if ('IntersectionObserver' in window) {
  const links = [...navigation.querySelectorAll('a')];
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(link => {
          if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      }
    });
  }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });
  links.forEach(link => {
    const target = document.querySelector(link.hash);
    if (target) observer.observe(target);
  });
}
