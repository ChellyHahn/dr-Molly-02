/* =========================================================
 * 달빛 DALBIT — 라우터 · 이벤트
 * ---------------------------------------------------------
 * 주소(#)로 화면을 바꿉니다. 파일을 더블클릭해서 열어도 동작합니다.
 *   #/                 메인
 *   #/shop             전체 상품      #/shop/top|bottom|outer  카테고리
 *   #/product/:id      상품 상세      #/cart  장바구니
 *   #/wishlist         관심 상품      #/about 브랜드 소개
 * ========================================================= */
(function (D) {
  "use strict";

  const { Store, views, images, CATEGORIES, ProductRepository } = D;
  const app = document.getElementById("app");
  const $ = (id) => document.getElementById(id);

  let products = [];
  const shopState = { search: "", sort: "default" };
  let lastListHash = "#/shop"; // "목록으로 돌아가기" 목적지
  let detailState = null; // { product, color, size, qty }

  /* ---------- 라우팅 ---------- */
  function parseRoute() {
    const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
    const [page = "home", param] = parts;
    return { page, param };
  }

  function render() {
    const { page, param } = parseRoute();
    let nav = page;
    let title = "달빛 DALBIT";
    detailState = null;

    if (page === "home") {
      app.innerHTML = views.home(products);
      lastListHash = "#/";
    } else if (page === "shop") {
      const category = param && CATEGORIES.some((c) => c.id === param) ? param : null;
      if (param && !category) {
        app.innerHTML = views.notFound("존재하지 않는 카테고리입니다.");
      } else {
        app.innerHTML = views.shop(category, shopState);
        renderShopResults(category);
        nav = category || "shop";
        title = `${category ? CATEGORIES.find((c) => c.id === category).en : "SHOP"} | 달빛 DALBIT`;
        lastListHash = location.hash;
      }
    } else if (page === "product") {
      const product = Store.getProduct(Number(param));
      if (!product) {
        app.innerHTML = views.notFound("상품을 찾을 수 없습니다.");
      } else {
        detailState = {
          product,
          color: product.colors[0] ? product.colors[0].name : "",
          size: product.sizes.length === 1 ? product.sizes[0] : "", // FREE처럼 하나뿐이면 자동 선택
          qty: 1,
        };
        app.innerHTML = views.detail(product, detailState, lastListHash);
        nav = product.category;
        title = `${product.name} | 달빛 DALBIT`;
      }
    } else if (page === "cart") {
      app.innerHTML = views.cart();
      title = "장바구니 | 달빛 DALBIT";
    } else if (page === "wishlist") {
      app.innerHTML = views.wishlist();
      title = "관심 상품 | 달빛 DALBIT";
      lastListHash = "#/wishlist";
    } else if (page === "about") {
      app.innerHTML = views.about();
      title = "ABOUT | 달빛 DALBIT";
    } else {
      app.innerHTML = views.notFound("페이지를 찾을 수 없습니다.");
    }

    document.title = title;
    document.querySelectorAll("[data-nav]").forEach((a) => {
      if (a.dataset.nav === nav) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  /** 화면 전환 시: 맨 위로 이동 + 제목으로 포커스 (스크린리더 안내) */
  function onRouteChange() {
    render();
    window.scrollTo(0, 0);
    const heading = app.querySelector("[data-focus]");
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }
  }

  /* ---------- 상품 목록: 카테고리 → 검색 → 정렬 ---------- */
  function renderShopResults(category) {
    const inCategory = products.filter((p) => !category || p.category === category);
    const q = shopState.search.trim().toLowerCase();
    let list = q ? inCategory.filter((p) => p.name.toLowerCase().includes(q)) : inCategory;
    if (shopState.sort === "low") list = [...list].sort((a, b) => a.price - b.price || a.id - b.id);
    if (shopState.sort === "high") list = [...list].sort((a, b) => b.price - a.price || a.id - b.id);

    const { count, body } = views.shopResults(list, inCategory.length, shopState.search.trim());
    $("result-count").innerHTML = count;
    $("shop-results").innerHTML = body;
  }

  const currentCategory = () => {
    const { param } = parseRoute();
    return CATEGORIES.some((c) => c.id === param) ? param : null;
  };

  /* ---------- 상품 상세: 선택 상태만 부분 갱신 ---------- */
  function updateDetail() {
    const { product: p, color, size, qty } = detailState;
    const c = p.colors.find((x) => x.name === color);
    $("detail-img").innerHTML = images.productImage(p, c);
    $("color-name").textContent = color;
    $("size-name").textContent = size || "선택해 주세요";
    $("qty").textContent = qty;
    $("detail-total").textContent = views.won(p.price * qty);
    app.querySelectorAll('[data-action="color"]').forEach((b) => b.setAttribute("aria-pressed", b.dataset.color === color));
    app.querySelectorAll('[data-action="size"]').forEach((b) => b.setAttribute("aria-pressed", b.dataset.size === size));
    app.querySelector('[data-action="qty-dec"]').disabled = qty <= 1;
    app.querySelector('[data-action="qty-inc"]').disabled = qty >= Store.MAX_QTY;
  }

  function setDetailMsg(html, isError) {
    const msg = $("detail-msg");
    msg.innerHTML = html;
    msg.classList.toggle("is-error", !!isError);
  }

  function addToCart() {
    const { product: p, color, size, qty } = detailState;
    if (!color) return setDetailMsg("색상을 선택해 주세요.", true);
    if (!size) {
      setDetailMsg("사이즈를 선택해 주세요.", true);
      const first = app.querySelector('[data-action="size"]');
      if (first) first.focus();
      return;
    }
    const result = Store.addToCart(p.id, color, size, qty);
    if (!result.ok) {
      return setDetailMsg(result.soldOut ? "품절된 상품입니다." : "장바구니에 담지 못했습니다. 옵션을 다시 확인해 주세요.", true);
    }
    setDetailMsg(
      `장바구니에 담았습니다. (${views.esc(color)} / ${views.esc(size)} · ${qty}개)` +
        (result.capped ? ` 한 옵션당 최대 ${Store.MAX_QTY}개까지 담을 수 있어요.` : "") +
        ` <a href="#/cart">장바구니 보기</a>`
    );
  }

  /* ---------- 관심 상품 ---------- */
  function toggleWish(id) {
    const p = Store.getProduct(id);
    if (!p) return;
    const on = Store.toggleWish(id);
    if (parseRoute().page === "wishlist") {
      app.innerHTML = views.wishlist();
      return;
    }
    document.querySelectorAll(`[data-action="wish"][data-id="${id}"]`).forEach((b) => {
      b.setAttribute("aria-pressed", on);
      b.setAttribute("aria-label", `${p.name} 관심 상품 ${on ? "해제" : "등록"}`);
    });
  }

  /* ---------- 헤더 개수 표시 ---------- */
  function updateBadges() {
    const cartCount = Store.cartCount();
    const wishCount = Store.getWishlist().length;
    $("cart-count").textContent = cartCount > 99 ? "99+" : cartCount;
    $("cart-count").hidden = cartCount === 0;
    $("wish-count").textContent = wishCount;
    $("wish-count").hidden = wishCount === 0;
    $("cart-link").setAttribute("aria-label", `장바구니 ${cartCount}개`);
    $("wish-link").setAttribute("aria-label", `관심 상품 ${wishCount}개`);
  }

  /* ---------- 이벤트 (한 곳에서 위임 처리) ---------- */
  app.addEventListener("click", (e) => {
    const el = e.target.closest("[data-action]");
    if (!el) return;
    const action = el.dataset.action;

    switch (action) {
      case "wish":
        e.preventDefault();
        toggleWish(Number(el.dataset.id));
        break;
      case "clear-search":
        shopState.search = "";
        $("search").value = "";
        renderShopResults(currentCategory());
        $("search").focus();
        break;
      case "color":
        if (!detailState) break;
        detailState.color = el.dataset.color;
        updateDetail();
        break;
      case "size":
        if (!detailState) break;
        detailState.size = el.dataset.size;
        setDetailMsg("");
        updateDetail();
        break;
      case "qty-dec":
      case "qty-inc":
        if (!detailState) break;
        detailState.qty = Math.min(Store.MAX_QTY, Math.max(1, detailState.qty + (action === "qty-inc" ? 1 : -1)));
        updateDetail();
        break;
      case "add-cart":
        if (detailState) addToCart();
        break;
      case "cart-inc":
      case "cart-dec":
      case "cart-remove": {
        const key = el.dataset.key;
        const item = Store.getCart().find((x) => x.key === key);
        if (!item) break;
        if (action === "cart-remove") Store.removeItem(key);
        else Store.setQty(key, item.qty + (action === "cart-inc" ? 1 : -1));
        app.innerHTML = views.cart();
        // 다시 그린 뒤에도 같은 버튼에 포커스 유지 (없으면 제목으로)
        const same = app.querySelector(`[data-action="${action}"][data-key="${CSS.escape(key)}"]`);
        (same && !same.disabled ? same : app.querySelector("[data-focus]") || app).focus();
        break;
      }
      case "order": {
        const { total } = Store.totals();
        $("order-notice").innerHTML =
          `결제 예정 금액은 <strong>${views.won(total)}</strong>입니다.<br>` +
          "지금은 온라인 결제를 준비 중이에요. 주문은 매장 또는 고객센터로 문의해 주세요.";
        $("order-notice").classList.add("show");
        break;
      }
    }
  });

  app.addEventListener("input", (e) => {
    if (e.target.id !== "search") return;
    shopState.search = e.target.value;
    renderShopResults(currentCategory());
  });

  app.addEventListener("change", (e) => {
    if (e.target.id !== "sort") return;
    shopState.sort = e.target.value;
    renderShopResults(currentCategory());
  });

  // 본문 바로가기: 해시 라우터와 충돌하지 않게 직접 포커스 이동
  document.querySelector(".skip-link").addEventListener("click", (e) => {
    e.preventDefault();
    app.focus();
  });

  window.addEventListener("hashchange", onRouteChange);

  /* ---------- 시작 ---------- */
  ProductRepository.fetchAll()
    .then((list) => {
      products = Array.isArray(list) ? list : [];
      Store.subscribe(updateBadges);
      Store.init(products);
      render();
    })
    .catch(() => {
      app.innerHTML =
        '<div class="container"><div class="empty"><p class="empty-title">상품 정보를 불러오지 못했습니다.</p>' +
        '<p class="empty-sub">잠시 후 새로고침해 주세요.</p></div></div>';
    });
})((window.Dalbit = window.Dalbit || {}));
