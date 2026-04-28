/**
 * UNDRFLX Portfolio — main.js
 * GSAP アニメーション実装
 */
"use strict";

// ============================================================
// 0. LOADING SCREEN
//    バーを 0→100% に伸ばし、完了後フェードアウト
//    → ヒーローアニメーション開始
// ============================================================
function runHeroAnimation() {
  const titleInner = document.querySelector(".hero__title-inner");
  const heroSub = document.querySelector(".hero__sub");
  const scrollInd = document.querySelector(".hero__scroll-indicator");

  if (!titleInner || typeof gsap === "undefined") return;

  // 初回アクセスのみアニメーション。2回目以降は即時表示。
  if (sessionStorage.getItem("undrflx_hero_done")) {
    gsap.set(titleInner, { y: 0 });
    gsap.set(heroSub, { opacity: 1, y: 0 });
    gsap.set(scrollInd, { opacity: 1 });
    return;
  }

  sessionStorage.setItem("undrflx_hero_done", "1");

  gsap.fromTo(titleInner, { y: "110%" }, { y: "0%", duration: 1.4, ease: "power4.out", delay: 0.2 });
  gsap.fromTo(heroSub, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.9 });
  gsap.fromTo(scrollInd, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: "power2.out", delay: 1.3 });
}

(function initLoading() {
  const loadingEl = document.getElementById("loading");
  const barEl = document.getElementById("loadingBar");

  // ローディング要素がない場合
  if (!loadingEl || !barEl) {
    document.addEventListener("DOMContentLoaded", runHeroAnimation);
    return;
  }

  // sessionStorage で初回アクセスかどうかを判定
  // 同一セッション内（タブを閉じるまで）は2回目以降スキップ
  if (sessionStorage.getItem("undrflx_loaded")) {
    loadingEl.style.display = "none";
    document.addEventListener("DOMContentLoaded", runHeroAnimation);
    return;
  }

  // 初回のみローディングを表示
  let progress = 0;
  const duration = 1200; // ms
  const interval = 16; // ~60fps
  const step = 100 / (duration / interval);

  const timer = setInterval(() => {
    progress = Math.min(progress + step, 100);
    barEl.style.width = progress + "%";

    if (progress >= 100) {
      clearInterval(timer);
      setTimeout(() => {
        gsap.to(loadingEl, {
          opacity: 0,
          duration: 0.5,
          ease: "power2.inOut",
          onComplete: () => {
            loadingEl.style.display = "none";
            sessionStorage.setItem("undrflx_loaded", "1"); // 表示済みを記録
            runHeroAnimation();
          },
        });
      }, 200);
    }
  }, interval);
})();

// ============================================================
// HERO CANVAS  /  ドット波アニメーション
//   波のような呼吸 + PC はマウス反応 / タブレット・モバイルは波のみ
// ============================================================
function initHeroCanvas() {
  const canvas = document.getElementById("heroCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // CSS 変数から設定値を読み込む
  const css = getComputedStyle(document.documentElement);
  const _color = css.getPropertyValue("--dot-color").trim();
  const _opacity = css.getPropertyValue("--dot-opacity").trim();
  const _size = css.getPropertyValue("--dot-base-size").trim();
  const _spacing = css.getPropertyValue("--dot-spacing").trim();

  const DOT_COLOR = `rgba(${_color}, ${_opacity})`;
  const BASE_R = parseFloat(_size) || 1.4;
  const SPACING = parseFloat(_spacing) || 28;

  const WAVE_AMP = 2.6;
  const WAVE_SPEED = 0.7;
  const WAVE_FREQ_X = 0.018;
  const WAVE_FREQ_Y = 0.018;
  const MOUSE_R = 160;
  const MOUSE_BOOST = 9;

  let dots = [];
  let mouse = { x: -9999, y: -9999 };
  let isPC = window.innerWidth >= 1025;

  function buildDots() {
    dots = [];
    const cols = Math.ceil(canvas.width / SPACING) + 2;
    const rows = Math.ceil(canvas.height / SPACING) + 2;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dots.push({
          x: c * SPACING,
          y: r * SPACING,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }
  }

  function resize() {
    canvas.width = canvas.offsetWidth || window.innerWidth;
    canvas.height = canvas.offsetHeight || window.innerHeight;
    isPC = window.innerWidth >= 1025;
    buildDots();
  }

  function animate(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const now = t * 0.001 * WAVE_SPEED;

    for (let i = 0, len = dots.length; i < len; i++) {
      const d = dots[i];
      const wave = Math.sin(now + d.x * WAVE_FREQ_X + d.y * WAVE_FREQ_Y + d.phase) * WAVE_AMP;
      let r = BASE_R + wave;

      if (isPC) {
        const dx = d.x - mouse.x;
        const dy = d.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_R) r += (1 - dist / MOUSE_R) * MOUSE_BOOST;
      }

      r = Math.max(0.3, r);
      ctx.beginPath();
      ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
      ctx.fillStyle = DOT_COLOR;
      ctx.fill();
    }

    requestAnimationFrame(animate);
  }

  // マウス追跡（PC のみ）
  document.addEventListener("mousemove", (e) => {
    if (!isPC) return;
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  document.addEventListener("mouseleave", () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(animate);
}

// ============================================================
// LANGUAGE SWITCHER
//   applyLang(lang) : 'ja' または 'ko' を渡してテキストを切替
//   initLangSwitch() : ボタン初期化 + localStorage から言語を復元
// ============================================================
function applyLang(lang) {
  // <html> に data-lang を付与（CSS ターゲット + 他ページへの引継ぎ基準）
  document.documentElement.dataset.lang = lang;
  document.documentElement.lang = lang === "ko" ? "ko" : "ja";

  // 通常テキスト: data-ja / data-ko
  document.querySelectorAll("[data-ja]").forEach((el) => {
    el.textContent = lang === "ko" ? el.dataset.ko || el.dataset.ja : el.dataset.ja;
  });

  // HTML含む要素: data-ja-html / data-ko-html（<br> など）
  document.querySelectorAll("[data-ja-html]").forEach((el) => {
    el.innerHTML = lang === "ko" ? el.dataset.koHtml || el.dataset.jaHtml : el.dataset.jaHtml;
  });
}

function initLangSwitch() {
  const btn = document.getElementById("langBtn");

  // localStorage から言語を復元（デフォルト: ja）
  const saved = localStorage.getItem("undrflx_lang") || "ja";
  applyLang(saved);

  if (!btn) return;

  btn.addEventListener("click", () => {
    const current = document.documentElement.dataset.lang || "ja";
    const next = current === "ja" ? "ko" : "ja";
    applyLang(next);
    localStorage.setItem("undrflx_lang", next);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // 言語切替初期化（テキスト復元 + ボタン設定）
  initLangSwitch();

  // Canvas ドットアニメーション起動
  initHeroCanvas();

  // ============================================================
  // 1. スクロールアニメーション  [data-anim] 要素
  //    IntersectionObserver で .is-visible を付与
  //    data-delay 属性で遅延(ms)を指定可能
  // ============================================================
  const animEls = document.querySelectorAll("[data-anim]");

  if (animEls.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = parseInt(entry.target.dataset.delay || "0", 10);
            setTimeout(() => {
              entry.target.classList.add("is-visible");
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -80px 0px" },
    );

    animEls.forEach((el) => observer.observe(el));
  }

  // ============================================================
  // 2. スムーススクロール
  // ============================================================
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const headerH = document.querySelector(".header")?.offsetHeight || 120;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });

  // ============================================================
  // 3. works-card__img 3D 傾きアニメーション (js-tilt 風)
  //    カード内カーソル位置に応じて画像エリアを rotateX/Y で傾ける
  // ============================================================
  const TILT_MAX = 12; // 最大傾き角度（度）

  document.querySelectorAll(".works-card").forEach((card) => {
    const imgEl = card.querySelector(".works-card__img");
    if (!imgEl || typeof gsap === "undefined") return;

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 〜 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 〜 0.5

      gsap.to(imgEl, {
        rotateY: x * TILT_MAX,
        rotateX: -y * TILT_MAX,
        transformPerspective: 800,
        scale: 1.04,
        duration: 0.4,
        ease: "power2.out",
      });
    });

    card.addEventListener("mouseleave", () => {
      gsap.to(imgEl, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 0.7,
        ease: "power3.out",
      });
    });
  });

  (function () {
    var btn = document.querySelector(".btn-works .btn-topWorks");
    if (!btn) return;

    btn.addEventListener("mouseenter", function (e) {
      var rect = btn.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var size = Math.sqrt(rect.width * rect.width + rect.height * rect.height) * 2;
      btn.style.setProperty("--circle-x", x + "px");
      btn.style.setProperty("--circle-y", y + "px");
      btn.style.setProperty("--circle-size", size + "px");
      btn.classList.add("is-expanded");
    });

    btn.addEventListener("mouseleave", function () {
      btn.classList.remove("is-expanded");
    });
  })();
});
