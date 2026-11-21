/* =========================================================
 * 달빛 DALBIT — 상품 데이터
 * ---------------------------------------------------------
 * 화면 코드는 ProductRepository.fetchAll() 만 사용합니다.
 * 나중에 API나 데이터베이스로 옮길 때는 fetchAll() 안쪽만
 *   return fetch("/api/products").then((r) => r.json());
 * 처럼 바꾸면 됩니다. (반환 형태는 아래 PRODUCTS 배열과 동일)
 * ========================================================= */
(function (D) {
  "use strict";

  /** 카테고리: id는 주소(#/shop/top)에, label은 화면에 사용 */
  const CATEGORIES = [
    { id: "top", label: "상의", en: "TOP" },
    { id: "bottom", label: "하의", en: "BOTTOM" },
    { id: "outer", label: "아우터", en: "OUTER" },
  ];

  /** 재고 상태 */
  const STOCK = {
    IN_STOCK: "in_stock",
    LOW_STOCK: "low_stock", // 품절 임박
    SOLD_OUT: "sold_out",
  };

  /*
   * 상품 필드
   *  id, name, price(원), category(CATEGORIES.id), description,
   *  image: { src: 실제 이미지 경로(없으면 ""), placeholder: 실루엣 종류 },
   *  fabric: 상세 이미지의 원단 질감 종류,
   *  colors: [{ name, hex }], sizes: ["S","M","L"] 또는 ["FREE"],
   *  stock, isNew, isBest, material, care[], details[]
   */
  const PRODUCTS = [
    {
      id: 1,
      name: "달빛 코튼 셔츠",
      price: 39000,
      category: "top",
      description:
        "촘촘한 코튼 원단으로 만든 기본 셔츠입니다. 단독으로 입어도, 니트나 재킷 안에 받쳐 입어도 깔끔하게 떨어지는 레귤러 핏이에요.",
      image: { src: "", placeholder: "shirt" },
      fabric: "cotton",
      colors: [
        { name: "화이트", hex: "#F4F2EC" },
        { name: "스카이블루", hex: "#BCCDDD" },
        { name: "네이비", hex: "#18243A" },
      ],
      sizes: ["S", "M", "L"],
      stock: STOCK.IN_STOCK,
      isNew: false,
      isBest: true,
      material: "면 100%",
      care: ["찬물 손세탁 또는 세탁망 사용", "표백제 사용 금지", "그늘에서 뉘어 건조", "중온 다림질"],
      details: ["레귤러 핏", "두께감: 얇음", "비침: 약간 있음 (화이트)"],
    },
    {
      id: 2,
      name: "소프트 니트 가디건",
      price: 45000,
      category: "top",
      description:
        "부드러운 울 혼방 원사로 짠 V넥 가디건입니다. 가볍게 걸치기 좋은 길이감이라 셔츠, 티셔츠 어디에나 잘 어울려요.",
      image: { src: "", placeholder: "cardigan" },
      fabric: "knit",
      colors: [
        { name: "오트밀", hex: "#D8CCB6" },
        { name: "크림", hex: "#EEE5D0" },
        { name: "차콜", hex: "#3C3C3F" },
      ],
      sizes: ["FREE"],
      stock: STOCK.IN_STOCK,
      isNew: true,
      isBest: false,
      material: "아크릴 50%, 울 30%, 나일론 20%",
      care: ["드라이클리닝 권장", "손세탁 시 울 전용 세제 사용", "비틀어 짜지 말고 뉘어서 건조"],
      details: ["세미 오버 핏", "두께감: 보통", "신축성: 좋음"],
    },
    {
      id: 3,
      name: "데일리 라운드 티셔츠",
      price: 19000,
      category: "top",
      description:
        "매일 손이 가는 라운드넥 티셔츠입니다. 적당한 두께의 코튼 저지라 비침이 적고, 세탁 후에도 형태가 잘 유지돼요.",
      image: { src: "", placeholder: "tee" },
      fabric: "jersey",
      colors: [
        { name: "화이트", hex: "#F4F2EC" },
        { name: "멜란지그레이", hex: "#B8B7B3" },
        { name: "블랙", hex: "#232323" },
      ],
      sizes: ["S", "M", "L"],
      stock: STOCK.IN_STOCK,
      isNew: true,
      isBest: false,
      material: "면 100%",
      care: ["30도 이하 물세탁", "뒤집어서 세탁", "건조기 사용 금지"],
      details: ["레귤러 핏", "두께감: 보통", "비침: 적음"],
    },
    {
      id: 4,
      name: "클래식 와이드 슬랙스",
      price: 42000,
      category: "bottom",
      description:
        "허리선부터 밑단까지 곧게 떨어지는 와이드 슬랙스입니다. 앞주름 디테일로 단정한 오피스룩부터 편안한 데일리룩까지 소화해요.",
      image: { src: "", placeholder: "slacks" },
      fabric: "twill",
      colors: [
        { name: "베이지", hex: "#CCBA9C" },
        { name: "그레이", hex: "#8D8D8B" },
        { name: "블랙", hex: "#232323" },
      ],
      sizes: ["S", "M", "L"],
      stock: STOCK.IN_STOCK,
      isNew: false,
      isBest: true,
      material: "폴리에스터 68%, 레이온 28%, 스판덱스 4%",
      care: ["드라이클리닝 권장", "저온 스팀 다림질"],
      details: ["와이드 핏", "허리 뒷밴딩", "신축성: 약간"],
    },
    {
      id: 5,
      name: "내추럴 코튼 팬츠",
      price: 38000,
      category: "bottom",
      description:
        "워싱 처리한 코튼 원단으로 부드럽게 입을 수 있는 스트레이트 팬츠입니다. 자연스러운 색감이라 어떤 상의와도 편하게 맞춰 입을 수 있어요.",
      image: { src: "", placeholder: "pants" },
      fabric: "cotton",
      colors: [
        { name: "아이보리", hex: "#EDE7D8" },
        { name: "베이지", hex: "#CCBA9C" },
        { name: "카키", hex: "#888265" },
      ],
      sizes: ["S", "M", "L"],
      stock: STOCK.IN_STOCK,
      isNew: false,
      isBest: true,
      material: "면 100%",
      care: ["찬물 단독 세탁", "첫 세탁은 이염 방지를 위해 단독으로", "그늘 건조"],
      details: ["스트레이트 핏", "두께감: 보통", "신축성: 없음"],
    },
    {
      id: 6,
      name: "모던 롱 스커트",
      price: 35000,
      category: "bottom",
      description:
        "발목 위로 떨어지는 A라인 롱 스커트입니다. 은은한 핀턱 주름이 움직일 때마다 자연스럽게 흐르는 실루엣을 만들어요.",
      image: { src: "", placeholder: "skirt" },
      fabric: "twill",
      colors: [
        { name: "블랙", hex: "#232323" },
        { name: "브라운", hex: "#6D5240" },
        { name: "네이비", hex: "#18243A" },
      ],
      sizes: ["S", "M"],
      stock: STOCK.IN_STOCK,
      isNew: true,
      isBest: false,
      material: "폴리에스터 100% (안감 포함)",
      care: ["손세탁 또는 드라이클리닝", "저온 다림질"],
      details: ["A라인 핏", "허리 뒷밴딩", "안감 있음"],
    },
    {
      id: 7,
      name: "오버핏 트렌치 코트",
      price: 89000,
      category: "outer",
      description:
        "어깨선을 살짝 내린 오버핏 트렌치 코트입니다. 더블 브레스티드 여밈과 허리 벨트로, 계절이 바뀔 때마다 꺼내 입기 좋은 클래식 아이템이에요.",
      image: { src: "", placeholder: "trench" },
      fabric: "twill",
      colors: [
        { name: "베이지", hex: "#C6B08C" },
        { name: "카키", hex: "#7A7358" },
      ],
      sizes: ["FREE"],
      stock: STOCK.LOW_STOCK,
      isNew: true,
      isBest: false,
      material: "면 65%, 폴리에스터 35%",
      care: ["드라이클리닝", "벨트는 분리해서 보관"],
      details: ["오버 핏", "벨트 포함", "반안감"],
    },
    {
      id: 8,
      name: "클래식 울 자켓",
      price: 79000,
      category: "outer",
      description:
        "울 혼방 원단으로 만든 싱글 브레스티드 자켓입니다. 군더더기 없는 테일러드 라인으로 슬랙스, 스커트 어디에나 단정하게 어울려요.",
      image: { src: "", placeholder: "jacket" },
      fabric: "wool",
      colors: [
        { name: "차콜", hex: "#3C3C3F" },
        { name: "카멜", hex: "#AE895D" },
        { name: "네이비", hex: "#18243A" },
      ],
      sizes: ["S", "M", "L"],
      stock: STOCK.SOLD_OUT,
      isNew: false,
      isBest: true,
      material: "울 50%, 폴리에스터 45%, 기타 5%",
      care: ["드라이클리닝", "옷걸이에 걸어서 보관"],
      details: ["레귤러 핏", "두께감: 도톰함", "안감 있음"],
    },
  ];

  /** 데이터 접근 창구 — 화면 코드는 이것만 사용 */
  const ProductRepository = {
    fetchAll() {
      // 원본이 바뀌지 않도록 복사본을 돌려준다
      return Promise.resolve(JSON.parse(JSON.stringify(PRODUCTS)));
    },
  };

  D.CATEGORIES = CATEGORIES;
  D.STOCK = STOCK;
  D.ProductRepository = ProductRepository;
})((window.Dalbit = window.Dalbit || {}));
