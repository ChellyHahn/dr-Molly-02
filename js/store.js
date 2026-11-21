/* =========================================================
 * 달빛 DALBIT — 장바구니 · 관심 상품 저장소
 * ---------------------------------------------------------
 * localStorage에 저장해 새로고침 후에도 유지합니다.
 * 저장소를 쓸 수 없는 환경(사생활 보호 모드 등)에서는
 * 화면 안에서만 유지되고 오류는 나지 않습니다.
 * ========================================================= */
(function (D) {
  "use strict";

  const KEYS = { cart: "dalbit.cart.v1", wishlist: "dalbit.wishlist.v1" };
  const MAX_QTY = 99;

  const SHIPPING_FEE = 3000;
  const FREE_SHIPPING_MIN = 50000;

  let productMap = new Map();
  let cart = []; // [{ key, productId, color, size, qty }]
  let wishlist = []; // [productId]
  const listeners = [];

  function read(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* 저장 불가 환경: 메모리에서만 유지 */
    }
  }

  const itemKey = (productId, color, size) => `${productId}::${color}::${size}`;
  const clampQty = (n) => Math.min(MAX_QTY, Math.max(1, Math.floor(n)));

  /** 저장된 장바구니 항목이 현재 상품 데이터와 맞는지 검사 */
  function isValidItem(item) {
    if (!item || typeof item !== "object") return false;
    const p = productMap.get(item.productId);
    return (
      !!p &&
      p.colors.some((c) => c.name === item.color) &&
      p.sizes.includes(item.size) &&
      Number.isFinite(item.qty) &&
      item.qty >= 1
    );
  }

  function emit() {
    write(KEYS.cart, cart);
    write(KEYS.wishlist, wishlist);
    listeners.forEach((fn) => fn());
  }

  const Store = {
    SHIPPING_FEE,
    FREE_SHIPPING_MIN,
    MAX_QTY,

    init(products) {
      productMap = new Map(products.map((p) => [p.id, p]));

      const savedCart = read(KEYS.cart);
      const merged = new Map();
      (Array.isArray(savedCart) ? savedCart : []).filter(isValidItem).forEach((item) => {
        const key = itemKey(item.productId, item.color, item.size);
        const prev = merged.get(key);
        const qty = clampQty((prev ? prev.qty : 0) + item.qty);
        merged.set(key, { key, productId: item.productId, color: item.color, size: item.size, qty });
      });
      cart = [...merged.values()];

      const savedWish = read(KEYS.wishlist);
      wishlist = [...new Set(Array.isArray(savedWish) ? savedWish : [])].filter((id) => productMap.has(id));

      emit();
    },

    subscribe(fn) {
      listeners.push(fn);
    },

    getProduct(id) {
      return productMap.get(id) || null;
    },

    /* ---------- 장바구니 ---------- */
    getCart() {
      return cart.map((item) => ({ ...item, product: productMap.get(item.productId) }));
    },

    /** 같은 상품이라도 색상·사이즈가 다르면 별도 항목 */
    addToCart(productId, color, size, qty) {
      const item = { productId, color, size, qty: clampQty(qty) };
      if (!isValidItem(item)) return { ok: false };
      if (productMap.get(productId).stock === D.STOCK.SOLD_OUT) return { ok: false, soldOut: true };

      const key = itemKey(productId, color, size);
      const existing = cart.find((x) => x.key === key);
      let capped = false;
      if (existing) {
        capped = existing.qty + item.qty > MAX_QTY;
        existing.qty = clampQty(existing.qty + item.qty);
      } else {
        cart.push({ key, ...item });
      }
      emit();
      return { ok: true, capped };
    },

    setQty(key, qty) {
      const item = cart.find((x) => x.key === key);
      if (!item) return;
      if (qty < 1) return Store.removeItem(key);
      item.qty = clampQty(qty);
      emit();
    },

    removeItem(key) {
      cart = cart.filter((x) => x.key !== key);
      emit();
    },

    cartCount() {
      return cart.reduce((sum, x) => sum + x.qty, 0);
    },

    /** 금액 계산: 상품 금액, 배송비, 총 주문 금액 */
    totals() {
      const subtotal = cart.reduce((sum, x) => {
        const p = productMap.get(x.productId);
        return sum + (p ? p.price * x.qty : 0);
      }, 0);
      const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
      return { subtotal, shipping, total: subtotal + shipping };
    },

    /* ---------- 관심 상품 ---------- */
    isWished(id) {
      return wishlist.includes(id);
    },

    /** 등록 ↔ 해제, 바뀐 상태(true = 등록됨)를 돌려준다 */
    toggleWish(id) {
      if (!productMap.has(id)) return false;
      const on = !wishlist.includes(id);
      wishlist = on ? [...wishlist, id] : wishlist.filter((x) => x !== id);
      emit();
      return on;
    },

    getWishlist() {
      return wishlist.map((id) => productMap.get(id)).filter(Boolean);
    },
  };

  D.Store = Store;
})((window.Dalbit = window.Dalbit || {}));
