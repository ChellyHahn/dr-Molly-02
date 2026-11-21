/* =========================================================
 * 달빛 DALBIT — 화면 (HTML 문자열을 만드는 함수들)
 * ========================================================= */
(function (D) {
  "use strict";

  const { Store, images, CATEGORIES, STOCK } = D;

  /* ---------- 공통 도우미 ---------- */
  const won = (n) => Number(n).toLocaleString("ko-KR") + "원";

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  const categoryOf = (id) => CATEGORIES.find((c) => c.id === id) || { id, label: id, en: String(id).toUpperCase() };

  const ICON = {
    heart:
      '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
    back: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 5l-7 7 7 7"/></svg>',
    search:
      '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></svg>',
  };

  function badges(p) {
    const list = [];
    if (p.stock === STOCK.SOLD_OUT) list.push('<span class="badge-tag is-soldout">SOLD OUT</span>');
    if (p.isNew) list.push('<span class="badge-tag">NEW</span>');
    if (p.isBest) list.push('<span class="badge-tag is-best">BEST</span>');
    if (p.stock === STOCK.LOW_STOCK) list.push('<span class="badge-tag is-low">품절 임박</span>');
    return list.length ? `<div class="badges">${list.join("")}</div>` : "";
  }

  function wishButton(p, extraClass = "") {
    const on = Store.isWished(p.id);
    return `<button type="button" class="wish-btn ${extraClass}" data-action="wish" data-id="${p.id}"
      aria-pressed="${on}" aria-label="${esc(p.name)} 관심 상품 ${on ? "해제" : "등록"}">${ICON.heart}</button>`;
  }

  /* ---------- 상품 카드 ---------- */
  function productCard(p) {
    const cat = categoryOf(p.category);
    const soldOut = p.stock === STOCK.SOLD_OUT;
    return `
      <article class="card${soldOut ? " is-soldout" : ""}">
        <div class="card-media">
          <a href="#/product/${p.id}" tabindex="-1" aria-hidden="true">${images.productImage(p)}</a>
          ${badges(p)}
          ${wishButton(p, "on-image")}
        </div>
        <div class="card-body">
          <p class="card-cat">${cat.en} · ${cat.label}</p>
          <h3 class="card-name"><a href="#/product/${p.id}">${esc(p.name)}</a></h3>
          <p class="card-price">${soldOut ? '<span class="sr-only">품절, </span>' : ""}${won(p.price)}</p>
          <ul class="mini-swatches" aria-label="색상 ${p.colors.length}가지">
            ${p.colors.map((c) => `<li style="background:${c.hex}" title="${esc(c.name)}"></li>`).join("")}
          </ul>
        </div>
      </article>`;
  }

  const grid = (list) => `<div class="product-grid">${list.map(productCard).join("")}</div>`;

  /* ---------- 메인 ---------- */
  function home(products) {
    const news = products.filter((p) => p.isNew).slice(0, 4);
    const bests = products.filter((p) => p.isBest).slice(0, 4);
    return `
      <section class="hero">
        <div class="hero-text">
          <p class="eyebrow">DAILY · MINIMAL · OFFICE CASUAL</p>
          <h1 class="hero-title" data-focus>Quietly,<br />every day.</h1>
          <p class="hero-sub">일상에 스며드는 차분하고 오래 입는 옷</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="#/shop">SHOP NOW</a>
            <a class="btn btn-ghost" href="#/about">ABOUT DALBIT</a>
          </div>
        </div>
        <div class="hero-media">${images.heroArt()}</div>
      </section>

      <section class="intro container">
        <p class="intro-logo">DALBIT</p>
        <p>유행에만 집중하기보다 오래 입을 수 있는 실루엣과 차분한 색상, 자연스러운 소재를 고릅니다.<br class="pc-only" />
        특별한 날뿐 아니라 평범한 하루에도 자연스럽게 어울리는 옷을 만듭니다.</p>
      </section>

      <section class="section container" aria-labelledby="new-title">
        <div class="section-head">
          <h2 id="new-title" class="section-title">NEW ARRIVALS</h2>
          <a class="text-link" href="#/shop">VIEW ALL</a>
        </div>
        ${grid(news)}
      </section>

      <section class="section container" aria-labelledby="best-title">
        <div class="section-head">
          <h2 id="best-title" class="section-title">BEST ITEMS</h2>
          <a class="text-link" href="#/shop">VIEW ALL</a>
        </div>
        ${grid(bests)}
      </section>

      <div class="center container section-end">
        <a class="btn btn-primary btn-wide" href="#/shop">전체 상품 보기</a>
      </div>`;
  }

  /* ---------- 상품 목록 (SHOP / TOP / BOTTOM / OUTER) ---------- */
  function shop(category, state) {
    const cat = category ? categoryOf(category) : null;
    const tabs = [{ id: "", label: "전체" }, ...CATEGORIES]
      .map((c) => {
        const current = (c.id || null) === (category || null);
        return `<li><a href="#/shop${c.id ? "/" + c.id : ""}"${current ? ' aria-current="page"' : ""}>${c.label}</a></li>`;
      })
      .join("");
    return `
      <section class="page-head container">
        <h1 class="page-title" data-focus>${cat ? cat.en : "SHOP"}</h1>
        <p class="page-sub">${cat ? cat.label : "전체 상품"}</p>
      </section>
      <section class="container shop">
        <nav class="tabs" aria-label="카테고리"><ul>${tabs}</ul></nav>
        <div class="toolbar">
          <p class="result-count" id="result-count" aria-live="polite"></p>
          <div class="toolbar-right">
            <label class="search">
              <span class="sr-only">상품명 검색</span>
              ${ICON.search}
              <input type="search" id="search" placeholder="상품명 검색" value="${esc(state.search)}" autocomplete="off" />
            </label>
            <label class="sort">
              <span class="sr-only">정렬</span>
              <select id="sort">
                <option value="default"${state.sort === "default" ? " selected" : ""}>기본순</option>
                <option value="low"${state.sort === "low" ? " selected" : ""}>낮은 가격순</option>
                <option value="high"${state.sort === "high" ? " selected" : ""}>높은 가격순</option>
              </select>
            </label>
          </div>
        </div>
        <div id="shop-results"></div>
      </section>`;
  }

  function shopResults(list, total, search) {
    const count = search
      ? `‘${esc(search)}’ 검색 결과 <strong>${list.length}</strong>개`
      : `총 <strong>${total}</strong>개 상품`;
    const body = list.length
      ? grid(list)
      : `<div class="empty">
           <p class="empty-title">검색 결과가 없습니다.</p>
           <p class="empty-sub">‘${esc(search)}’에 맞는 상품을 찾지 못했어요. 다른 상품명으로 검색해 보세요.</p>
           <button type="button" class="btn btn-ghost" data-action="clear-search">검색어 지우기</button>
         </div>`;
    return { count, body };
  }

  /* ---------- 상품 상세 ---------- */
  function sizeOptions(p, selected) {
    return p.sizes
      .map(
        (s) =>
          `<button type="button" class="size-btn" data-action="size" data-size="${esc(s)}" aria-pressed="${s === selected}">${esc(s)}</button>`
      )
      .join("");
  }

  function colorOptions(p, selected) {
    return p.colors
      .map(
        (c) =>
          `<button type="button" class="swatch" data-action="color" data-color="${esc(c.name)}" aria-pressed="${c.name === selected}"
             aria-label="${esc(c.name)}" title="${esc(c.name)}"><span style="background:${c.hex}"></span></button>`
      )
      .join("");
  }

  function detail(p, sel, backHref) {
    const cat = categoryOf(p.category);
    const color = p.colors.find((c) => c.name === sel.color) || p.colors[0];
    const soldOut = p.stock === STOCK.SOLD_OUT;
    return `
      <div class="container">
        <a class="back-link" href="${backHref}">${ICON.back}<span>목록으로 돌아가기</span></a>
      </div>
      <section class="detail container">
        <div class="detail-media">
          <div class="detail-main-img" id="detail-img">${images.productImage(p, color)}</div>
          ${badges(p)}
        </div>

        <div class="detail-info">
          <p class="card-cat"><a href="#/shop/${cat.id}">${cat.en} · ${cat.label}</a></p>
          <h1 class="detail-name" data-focus>${esc(p.name)}</h1>
          <p class="detail-price">${won(p.price)}</p>
          <p class="detail-desc">${esc(p.description)}</p>

          <div class="option">
            <p class="option-label" id="color-label">색상 <span id="color-name">${esc(color.name)}</span></p>
            <div class="swatches" role="group" aria-labelledby="color-label">${colorOptions(p, color.name)}</div>
          </div>

          <div class="option">
            <p class="option-label" id="size-label">사이즈 <span id="size-name">${sel.size ? esc(sel.size) : "선택해 주세요"}</span></p>
            <div class="sizes" role="group" aria-labelledby="size-label">${sizeOptions(p, sel.size)}</div>
          </div>

          <div class="option">
            <p class="option-label" id="qty-label">수량</p>
            <div class="stepper" role="group" aria-labelledby="qty-label">
              <button type="button" data-action="qty-dec" aria-label="수량 줄이기"${sel.qty <= 1 ? " disabled" : ""}>−</button>
              <output id="qty" aria-live="polite">${sel.qty}</output>
              <button type="button" data-action="qty-inc" aria-label="수량 늘리기"${sel.qty >= Store.MAX_QTY ? " disabled" : ""}>+</button>
            </div>
          </div>

          <div class="detail-total">
            <span>총 상품 금액</span>
            <strong id="detail-total">${won(p.price * sel.qty)}</strong>
          </div>

          <div class="detail-actions">
            <button type="button" class="btn btn-primary" data-action="add-cart"${soldOut ? " disabled" : ""}>
              ${soldOut ? "품절된 상품입니다" : "장바구니 담기"}
            </button>
            ${wishButton(p, "boxed")}
          </div>
          <p class="form-msg" id="detail-msg" role="status" aria-live="polite"></p>

          <div class="accordion">
            <details open>
              <summary>상품 정보</summary>
              <ul class="dot-list">${p.details.map((d) => `<li>${esc(d)}</li>`).join("")}</ul>
            </details>
            <details>
              <summary>소재</summary>
              <p>${esc(p.material)}</p>
            </details>
            <details>
              <summary>세탁 방법</summary>
              <ul class="dot-list">${p.care.map((d) => `<li>${esc(d)}</li>`).join("")}</ul>
            </details>
            <details>
              <summary>배송 안내</summary>
              <p>배송비 ${won(Store.SHIPPING_FEE)} · ${won(Store.FREE_SHIPPING_MIN)} 이상 구매 시 무료배송</p>
            </details>
          </div>
        </div>
      </section>

      <section class="detail-gallery container" aria-labelledby="detail-gallery-title">
        <h2 id="detail-gallery-title" class="section-title center">DETAIL</h2>
        <p class="center gallery-sub">${esc(p.name)}의 색상과 원단을 가까이에서 확인해 보세요.</p>
        <div class="gallery-grid">
          ${p.colors
            .map(
              (c) => `<figure>${images.productImage(p, c)}<figcaption>${esc(c.name)}</figcaption></figure>`
            )
            .join("")}
          <figure>${images.fabricSVG(p.fabric, color.hex, `${p.name} 원단 확대 이미지`)}<figcaption>FABRIC DETAIL</figcaption></figure>
        </div>
      </section>`;
  }

  /* ---------- 장바구니 ---------- */
  function cart() {
    const items = Store.getCart();
    if (!items.length) {
      return `
        <section class="page-head container">
          <h1 class="page-title" data-focus>CART</h1>
          <p class="page-sub">장바구니</p>
        </section>
        <div class="container">
          <div class="empty">
            <p class="empty-title">장바구니가 비어 있습니다.</p>
            <p class="empty-sub">마음에 드는 옷을 담아 보세요.</p>
            <a class="btn btn-primary" href="#/shop">쇼핑하러 가기</a>
          </div>
        </div>`;
    }

    const { subtotal, shipping, total } = Store.totals();
    const remaining = Store.FREE_SHIPPING_MIN - subtotal;
    const rows = items
      .map(({ key, product: p, color, size, qty }) => {
        const c = p.colors.find((x) => x.name === color);
        return `
          <li class="cart-row">
            <a class="cart-thumb" href="#/product/${p.id}" tabindex="-1" aria-hidden="true">${images.productImage(p, c)}</a>
            <div class="cart-info">
              <a class="cart-name" href="#/product/${p.id}">${esc(p.name)}</a>
              <p class="cart-opt">색상: ${esc(color)} / 사이즈: ${esc(size)}</p>
              <p class="cart-unit">${won(p.price)}</p>
              <div class="cart-controls">
                <div class="stepper small" role="group" aria-label="${esc(p.name)} 수량">
                  <button type="button" data-action="cart-dec" data-key="${esc(key)}" aria-label="수량 줄이기"${qty <= 1 ? " disabled" : ""}>−</button>
                  <output>${qty}</output>
                  <button type="button" data-action="cart-inc" data-key="${esc(key)}" aria-label="수량 늘리기"${qty >= Store.MAX_QTY ? " disabled" : ""}>+</button>
                </div>
                <button type="button" class="text-btn" data-action="cart-remove" data-key="${esc(key)}"
                  aria-label="${esc(p.name)} ${esc(color)} ${esc(size)} 삭제">삭제</button>
              </div>
            </div>
            <p class="cart-sum">${won(p.price * qty)}</p>
          </li>`;
      })
      .join("");

    return `
      <section class="page-head container">
        <h1 class="page-title" data-focus>CART</h1>
        <p class="page-sub">장바구니 · ${Store.cartCount()}개</p>
      </section>
      <div class="container cart-layout">
        <ul class="cart-list">${rows}</ul>
        <aside class="summary" aria-label="주문 금액">
          <h2 class="summary-title">주문 금액</h2>
          <div class="sum-row"><span>상품 금액</span><span>${won(subtotal)}</span></div>
          <div class="sum-row"><span>배송비</span><span>${won(shipping)}</span></div>
          <div class="sum-row total"><span>총 주문 금액</span><strong>${won(total)}</strong></div>
          <div class="free-ship">
            <p>${remaining > 0 ? `무료배송까지 <strong>${won(remaining)}</strong> 남았어요` : "<strong>무료배송</strong> 조건을 채웠어요"}</p>
            <div class="bar" role="progressbar" aria-label="무료배송 진행률" aria-valuemin="0" aria-valuemax="100"
              aria-valuenow="${Math.round(Math.min(100, (subtotal / Store.FREE_SHIPPING_MIN) * 100))}">
              <div style="width:${Math.min(100, (subtotal / Store.FREE_SHIPPING_MIN) * 100)}%"></div>
            </div>
          </div>
          <button type="button" class="btn btn-primary btn-block" data-action="order">주문하기</button>
          <div class="order-notice" id="order-notice" role="status" aria-live="polite"></div>
          <a class="btn btn-ghost btn-block" href="#/shop">쇼핑 계속하기</a>
        </aside>
      </div>`;
  }

  /* ---------- 관심 상품 ---------- */
  function wishlist() {
    const list = Store.getWishlist();
    return `
      <section class="page-head container">
        <h1 class="page-title" data-focus>WISHLIST</h1>
        <p class="page-sub">관심 상품 · ${list.length}개</p>
      </section>
      <div class="container section">
        ${
          list.length
            ? grid(list)
            : `<div class="empty">
                 <p class="empty-title">관심 상품이 없습니다.</p>
                 <p class="empty-sub">상품의 하트 버튼을 눌러 관심 상품으로 등록해 보세요.</p>
                 <a class="btn btn-primary" href="#/shop">상품 둘러보기</a>
               </div>`
        }
      </div>`;
  }

  /* ---------- ABOUT ---------- */
  function about() {
    return `
      <section class="page-head container">
        <h1 class="page-title" data-focus>ABOUT</h1>
        <p class="page-sub">달빛 DALBIT</p>
      </section>
      <section class="about container">
        <div class="about-media">${images.heroArt()}</div>
        <div class="about-text">
          <p class="about-lead">달빛 DALBIT은 일상의 순간을 편안하게 채우는 옷을 제안합니다.</p>
          <p>유행에만 집중하기보다 오래 입을 수 있는 실루엣과 차분한 색상, 자연스러운 소재를 중요하게 생각합니다.</p>
          <p>특별한 날뿐 아니라 평범한 하루에도 자연스럽게 어울리는 옷.</p>
          <p>달빛은 당신의 일상에 조용히 스며드는 스타일을 만듭니다.</p>
          <ul class="values">
            <li><strong>SILHOUETTE</strong><span>오래 입을 수 있는 실루엣</span></li>
            <li><strong>COLOR</strong><span>차분한 색상</span></li>
            <li><strong>FABRIC</strong><span>자연스러운 소재</span></li>
          </ul>
          <a class="btn btn-primary" href="#/shop">컬렉션 보기</a>
        </div>
      </section>`;
  }

  function notFound(message) {
    return `
      <div class="container">
        <div class="empty">
          <h1 class="empty-title" data-focus>${esc(message)}</h1>
          <p class="empty-sub">주소를 다시 확인하거나 전체 상품에서 찾아보세요.</p>
          <a class="btn btn-primary" href="#/shop">전체 상품 보기</a>
        </div>
      </div>`;
  }

  D.views = { home, shop, shopResults, detail, cart, wishlist, about, notFound, won, esc };
})((window.Dalbit = window.Dalbit || {}));
