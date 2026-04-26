/**
 * UNDRFLX Portfolio — main.js
 * GSAP アニメーション実装
 */
'use strict';

// ============================================================
// 0. LOADING SCREEN
//    バーを 0→100% に伸ばし、完了後フェードアウト
//    → ヒーローアニメーション開始
// ============================================================
function runHeroAnimation() {
  const titleInner = document.querySelector('.hero__title-inner');
  const heroSub    = document.querySelector('.hero__sub');
  const scrollInd  = document.querySelector('.hero__scroll-indicator');

  if (!titleInner || typeof gsap === 'undefined') return;

  // 初回アクセスのみアニメーション。2回目以降は即時表示。
  if (sessionStorage.getItem('undrflx_hero_done')) {
    gsap.set(titleInner, { y: 0 });
    gsap.set(heroSub,    { opacity: 1, y: 0 });
    gsap.set(scrollInd,  { opacity: 1 });
    return;
  }

  sessionStorage.setItem('undrflx_hero_done', '1');

  gsap.fromTo(titleInner,
    { y: '110%' },
    { y: '0%', duration: 1.4, ease: 'power4.out', delay: 0.2 }
  );
  gsap.fromTo(heroSub,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.9 }
  );
  gsap.fromTo(scrollInd,
    { opacity: 0 },
    { opacity: 1, duration: 0.8, ease: 'power2.out', delay: 1.3 }
  );
}

(function initLoading() {
  const loadingEl = document.getElementById('loading');
  const barEl     = document.getElementById('loadingBar');

  // ローディング要素がない場合
  if (!loadingEl || !barEl) {
    document.addEventListener('DOMContentLoaded', runHeroAnimation);
    return;
  }

  // sessionStorage で初回アクセスかどうかを判定
  // 同一セッション内（タブを閉じるまで）は2回目以降スキップ
  if (sessionStorage.getItem('undrflx_loaded')) {
    loadingEl.style.display = 'none';
    document.addEventListener('DOMContentLoaded', runHeroAnimation);
    return;
  }

  // 初回のみローディングを表示
  let progress = 0;
  const duration = 1200; // ms
  const interval = 16;   // ~60fps
  const step = 100 / (duration / interval);

  const timer = setInterval(() => {
    progress = Math.min(progress + step, 100);
    barEl.style.width = progress + '%';

    if (progress >= 100) {
      clearInterval(timer);
      setTimeout(() => {
        gsap.to(loadingEl, {
          opacity: 0,
          duration: 0.5,
          ease: 'power2.inOut',
          onComplete: () => {
            loadingEl.style.display = 'none';
            sessionStorage.setItem('undrflx_loaded', '1'); // 表示済みを記録
            runHeroAnimation();
          },
        });
      }, 200);
    }
  }, interval);
})();

document.addEventListener('DOMContentLoaded', () => {

  // ============================================================
  // 1. スクロールアニメーション  [data-anim] 要素
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
  // 2. スムーススクロール
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

  // ============================================================
  // 3. works-card__img 3D 傾きアニメーション (js-tilt 風)
  //    カード内カーソル位置に応じて画像エリアを rotateX/Y で傾ける
  // ============================================================
  const TILT_MAX = 12; // 最大傾き角度（度）

  document.querySelectorAll('.works-card').forEach(card => {
    const imgEl = card.querySelector('.works-card__img');
    if (!imgEl || typeof gsap === 'undefined') return;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x =  (e.clientX - rect.left)  / rect.width  - 0.5; // -0.5 〜 0.5
      const y =  (e.clientY - rect.top)   / rect.height - 0.5; // -0.5 〜 0.5

      gsap.to(imgEl, {
        rotateY:            x * TILT_MAX,
        rotateX:           -y * TILT_MAX,
        transformPerspective: 800,
        scale:              1.04,
        duration:           0.4,
        ease:               'power2.out',
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(imgEl, {
        rotateX:  0,
        rotateY:  0,
        scale:    1,
        duration: 0.7,
        ease:     'power3.out',
      });
    });
  });

});
