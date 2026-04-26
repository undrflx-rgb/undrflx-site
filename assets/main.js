/**
 * UNDRFLX Portfolio — main.js
 * GSAP アニメーション実装
 */
'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // ============================================================
  // 1. HERO アニメーション
  //    ① タイトル: マスクから上にスライドイン
  //    ② サブテキスト: フェードイン + 上昇
  //    ③ スクロールインジケーター: フェードイン
  // ============================================================
  const titleInner = document.querySelector('.hero__title-inner');
  const heroSub    = document.querySelector('.hero__sub');
  const scrollInd  = document.querySelector('.hero__scroll-indicator');

  if (titleInner && typeof gsap !== 'undefined') {

    // タイトル: translateY(110%) → 0 (マスクで隠れた状態から出現)
    gsap.to(titleInner, {
      y: '0%',
      duration: 1.4,
      ease: 'power4.out',
      delay: 0.2,
    });

    // サブテキスト: opacity 0→1 + translateY
    gsap.to(heroSub, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
      delay: 0.9,
    });

    // スクロールインジケーター: フェードイン
    gsap.to(scrollInd, {
      opacity: 1,
      duration: 0.8,
      ease: 'power2.out',
      delay: 1.3,
    });
  }

  // ============================================================
  // 2. スクロールアニメーション  [data-anim] 要素
  //    IntersectionObserver で .is-visible を付与
  //    data-delay 属性で遅延(ms)を指定可能
  // ============================================================
  const animEls = document.querySelectorAll('[data-anim]');

  if (animEls.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const delay = parseInt(entry.target.dataset.delay || '0', 10);
            setTimeout(() => {
              entry.target.classList.add('is-visible');
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    animEls.forEach(el => observer.observe(el));
  }

  // ============================================================
  // 3. スムーススクロール
  // ============================================================
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const headerH = document.querySelector('.header')?.offsetHeight || 120;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

});
