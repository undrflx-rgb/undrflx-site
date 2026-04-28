/**
 * UNDRFLX — works.js
 * Works detail page specific scripts
 */
'use strict';

// Hero reveal on load
document.addEventListener('DOMContentLoaded', () => {
  // Skip loading screen on works pages
  const loading = document.getElementById('loading');
  if (loading) {
    loading.style.display = 'none';
  }
  document.body.classList.remove('is-loading');

  // Reveal hero elements after tiny delay
  setTimeout(() => {
    document.querySelectorAll('[data-wh-reveal]').forEach((el, i) => {
      setTimeout(() => el.classList.add('is-revealed'), i * 150);
    });
  }, 100);
});
