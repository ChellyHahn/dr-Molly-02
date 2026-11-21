/* =========================================================
 * 달빛 DALBIT — 상품 이미지
 * ---------------------------------------------------------
 * 실제 사진(product.image.src)이 있으면 <img>를,
 * 없으면 옷 실루엣 SVG 플레이스홀더를 그립니다.
 * 플레이스홀더는 선택한 색상으로 칠해집니다.
 * ========================================================= */
(function (D) {
  "use strict";

  const BG = "#ECE6DA"; // 이미지 배경 (베이지)
  let uid = 0; // SVG pattern id 중복 방지

  /* 실루엣: body = 옷 외곽선, details = 봉제선·단추 (currentColor 사용) */
  const SHAPES = {
    shirt: {
      body: "M78 28 L92 22 L100 30 L108 22 L122 28 L160 44 L178 120 L160 126 L146 84 L146 222 L54 222 L54 84 L40 126 L22 120 L40 44 Z",
      details:
        '<path d="M92 22 L88 40 L100 32 L112 40 L108 22"/><path d="M100 32 L100 222"/>' +
        '<path d="M24 112 L42 118 M176 112 L158 118"/><path d="M112 72 h16 v18 h-16 z"/>' +
        dots([[104, 58], [104, 92], [104, 126], [104, 160], [104, 194]]),
    },
    cardigan: {
      body: "M76 26 L100 30 L124 26 L160 42 L176 196 L156 200 L146 92 L148 214 L52 214 L54 92 L44 200 L24 196 L40 42 Z",
      details:
        '<path d="M80 27 L100 96 L120 27"/><path d="M100 96 L100 214"/>' +
        '<path d="M53 202 L147 202"/><path d="M25 186 L45 190 M175 186 L155 190"/>' +
        dots([[104, 112], [104, 136], [104, 160], [104, 184]]),
    },
    tee: {
      body: "M76 30 Q100 46 124 30 L160 46 L176 88 L152 96 L146 80 L146 216 L54 216 L54 80 L48 96 L24 88 L40 46 Z",
      details:
        '<path d="M80 33 Q100 52 120 33"/><path d="M28 80 L50 88 M172 80 L150 88"/><path d="M54 206 L146 206"/>',
    },
    slacks: {
      body: "M62 22 L138 22 L158 228 L106 228 L100 86 L94 228 L42 228 Z",
      details:
        '<path d="M62 36 L138 36"/><path d="M100 36 L100 80"/><path d="M80 22 v14 M120 22 v14"/>' +
        '<path d="M66 40 Q76 56 70 70 M134 40 Q124 56 130 70"/><path d="M78 52 L68 224 M122 52 L132 224" opacity=".6"/>',
    },
    pants: {
      body: "M66 22 L134 22 L142 228 L106 228 L100 88 L94 228 L58 228 Z",
      details:
        '<path d="M66 36 L134 36"/><path d="M100 36 L100 80"/><path d="M82 22 v14 M118 22 v14"/>' +
        '<path d="M68 40 Q78 56 72 68 M132 40 Q122 56 128 68"/><path d="M59 216 L94 216 M106 216 L141 216"/>',
    },
    skirt: {
      body: "M72 26 L128 26 L162 226 L38 226 Z",
      details:
        '<path d="M71 40 L129 40"/><path d="M88 40 L72 226 M100 40 L100 226 M112 40 L128 226" opacity=".6"/>',
    },
    trench: {
      body: "M70 22 L86 16 L100 26 L114 16 L130 22 L164 42 L182 176 L162 180 L150 90 L156 232 L44 232 L50 90 L38 180 L18 176 L36 42 Z",
      details:
        '<path d="M86 16 L80 34 L94 62 L100 26 M114 16 L120 34 L106 62 L100 26"/><path d="M106 62 L112 232"/>' +
        '<path d="M49 118 L151 118 M49 132 L151 132"/><path d="M92 115 h16 v20 h-16 z"/>' +
        '<path d="M22 160 L40 164 M178 160 L160 164"/>' +
        dots([[88, 76], [118, 76], [88, 100], [118, 100], [92, 160], [120, 160]]),
    },
    jacket: {
      body: "M70 26 L86 20 L100 30 L114 20 L130 26 L162 44 L176 168 L156 172 L148 92 L150 204 L50 204 L52 92 L44 172 L24 168 L38 44 Z",
      details:
        '<path d="M86 20 L80 40 L86 44 L80 50 L100 120 M114 20 L120 40 L114 44 L120 50 L100 120"/>' +
        '<path d="M100 120 L100 204"/><path d="M62 158 h24 M114 158 h24 M116 78 h18"/>' +
        '<path d="M26 156 L44 160 M174 156 L156 160"/>' +
        dots([[104, 138], [104, 166]]),
    },
  };

  function dots(points) {
    return points
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="currentColor" stroke="none"/>`)
      .join("");
  }

  /** 밝기 (0~1): 어두운 옷 위에는 밝은 봉제선을 그린다 */
  function luminance(hex) {
    const n = parseInt(String(hex).replace("#", ""), 16);
    if (Number.isNaN(n)) return 1;
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  function lineColor(hex) {
    return luminance(hex) < 0.45 ? "rgba(255,255,255,0.28)" : "rgba(24,36,58,0.22)";
  }

  /** 옷 한 벌 (SVG <g>) */
  function garmentGroup(shape, hex, transform) {
    const s = SHAPES[shape] || SHAPES.tee;
    return (
      `<g${transform ? ` transform="${transform}"` : ""}>` +
      `<path d="${s.body}" fill="${hex}" stroke="rgba(24,36,58,0.16)" stroke-width="1" stroke-linejoin="round"/>` +
      `<g fill="none" stroke="currentColor" color="${lineColor(hex)}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${s.details}</g>` +
      `</g>`
    );
  }

  /** 상품 대표 이미지 (플레이스홀더 SVG) */
  function garmentSVG(shape, hex, label) {
    return (
      `<svg class="ph" viewBox="0 0 200 250" role="img" aria-label="${label}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">` +
      `<rect width="200" height="250" fill="${BG}"/>` +
      `<ellipse cx="100" cy="238" rx="64" ry="5" fill="rgba(24,36,58,0.06)"/>` +
      garmentGroup(shape, hex, "translate(20 10) scale(0.8)") +
      `</svg>`
    );
  }

  /** 원단 질감 확대 이미지 (상세 이미지) */
  function fabricSVG(fabric, hex, label) {
    const id = "fab" + ++uid;
    const line = lineColor(hex);
    const patterns = {
      cotton: `<pattern id="${id}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0 V6" stroke="${line}" stroke-width="1"/></pattern>`,
      jersey: `<pattern id="${id}" width="8" height="6" patternUnits="userSpaceOnUse"><path d="M0 0 L4 6 L8 0" fill="none" stroke="${line}" stroke-width="0.8"/></pattern>`,
      knit: `<pattern id="${id}" width="16" height="12" patternUnits="userSpaceOnUse"><path d="M0 0 L8 12 L16 0" fill="none" stroke="${line}" stroke-width="2"/></pattern>`,
      twill: `<pattern id="${id}" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)"><path d="M0 0 V8" stroke="${line}" stroke-width="1.6"/></pattern>`,
      wool: `<pattern id="${id}" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M0 0 L10 10 L0 20 M10 0 L20 10 L10 20" fill="none" stroke="${line}" stroke-width="1.4"/></pattern>`,
    };
    return (
      `<svg class="ph" viewBox="0 0 200 250" role="img" aria-label="${label}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">` +
      `<defs>${patterns[fabric] || patterns.cotton}</defs>` +
      `<rect width="200" height="250" fill="${hex}"/><rect width="200" height="250" fill="url(#${id})"/>` +
      `</svg>`
    );
  }

  /** 상품 이미지: 실제 사진이 있으면 사진, 없으면 플레이스홀더 */
  function productImage(product, color) {
    const c = color || product.colors[0] || { name: "", hex: "#D8CCB6" };
    const label = `${product.name}${c.name ? " " + c.name : ""} 상품 이미지`;
    const src = product.image && product.image.src;
    if (src) return `<img src="${src}" alt="${label}" loading="lazy" />`;
    return garmentSVG(product.image && product.image.placeholder, c.hex, label);
  }

  /** 메인 화면 대표 이미지 */
  function heroArt() {
    return (
      `<svg class="hero-svg" viewBox="0 0 400 460" role="img" aria-label="베이지 트렌치 코트와 아이보리 셔츠가 놓인 달빛 대표 이미지" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">` +
      `<rect width="400" height="460" fill="#E6DCCB"/>` +
      `<circle cx="300" cy="96" r="44" fill="#F7F4ED" opacity="0.9"/>` +
      `<rect x="0" y="392" width="400" height="68" fill="#DDD1BD"/>` +
      garmentGroup("shirt", "#F4F2EC", "translate(30 120) scale(1.12)") +
      garmentGroup("trench", "#C6B08C", "translate(150 78) scale(1.32)") +
      `</svg>`
    );
  }

  D.images = { productImage, fabricSVG, garmentSVG, heroArt };
})((window.Dalbit = window.Dalbit || {}));
