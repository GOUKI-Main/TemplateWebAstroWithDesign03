// src/content/site.ts
// Single source of truth for site-wide settings. Header, Footer, SEO meta,
// JSON-LD graph, sitemap and the web manifest all read from here. (設定の集約)

export type SiteNavItem = {
  label: string;
  /** Site-absolute, and "/#section" for a section of the top page — the bare
   *  "#section" form would break from /404. */
  href: string;
  /** Latin caption shown large in the fullscreen menu (e.g. "ACCESS"). */
  en?: string;
  /** Sub-links listed under this item in the fullscreen menu. Without them
   *  the item itself is the one link listed. */
  children?: { label: string; href: string }[];
};

/** Optional local-business / MEO data. When present, a LocalBusiness JSON-LD
 *  node is emitted and you can surface NAP in the UI. Leave undefined for
 *  non-storefront sites. (§4 MEO) */
export type BusinessConfig = {
  /** schema.org type, e.g. "LocalBusiness", "Restaurant", "Store". */
  type?: string;
  legalName?: string;
  telephone?: string;
  email?: string;
  priceRange?: string;
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion?: string;
    postalCode: string;
    addressCountry: string;
  };
  geo?: { latitude: number; longitude: number };
  /** Google Maps place URL (MEO). */
  hasMap?: string;
  areaServed?: string[];
  /** e.g. "Mo-Fr 09:00-18:00". Shown in the access section as 「月〜金 9:00〜18:00」. */
  openingHours?: string[];
  /** Extra rows for the access section only (最寄り駅, 定休日, 駐車場, …).
   *  Not structured data — put anything search engines must know above. */
  notes?: { label: string; value: string }[];
  /** Google Maps embed URL (共有 → 地図を埋め込む → the iframe's src). Without
   *  it the access section shows a placeholder panel. */
  mapEmbedUrl?: string;
};

/** The logo lockup used by the header mark, loader, hero and footer. */
export type BrandConfig = {
  /** Large Latin wordmark in the hero, loader and footer (e.g. "LUMIÈRE"). */
  wordmark: string;
  /** One or two characters inside the diamond mark (e.g. "L"). */
  initial: string;
  /** Small spaced-out caption under the wordmark (e.g. "OMOTESANDO"). */
  subtitle?: string;
};

/** Who runs the site, as structured data. "Organization" for a company, shop
 *  or group; "Person" for an individual / freelancer. With "Person", no
 *  Organization node is emitted and the site Person becomes the publisher.
 *  (構造化データの主体) */
export type PublisherType = "Organization" | "Person";

export type SiteConfig = {
  /** Absolute production origin, no trailing slash (e.g. "https://example.jp").
   *  Drives canonical URLs, sitemap, robots.txt and JSON-LD via Astro.site. */
  url: string;
  name: string;
  brand: BrandConfig;
  tagline: string;
  description: string;
  locale: string;
  ogLocale: string;
  publisher: PublisherType;
  /** Brand/organization social profiles → Organization.sameAs (§4/§10). */
  sameAs?: string[];
  author: {
    name: string;
    email?: string;
    url?: string;
    socials?: {
      x?: string;
      github?: string;
      linkedin?: string;
    };
  };
  business?: BusinessConfig;
  /** External contact form (Google Forms, Tally, …). Linked from /contact —
   *  no form JS is shipped. Widen form-action / frame-src in public/_headers
   *  if you embed or post to it. */
  contactFormUrl?: string;
  nav: SiteNavItem[];
  /** Secondary links shown in the footer (policy pages and the like). */
  footerNav?: SiteNavItem[];
  seo: {
    ogImage?: string;
    /** Intrinsic size of `ogImage` → og:image:width/height hints. */
    ogImageWidth?: number;
    ogImageHeight?: number;
    /** Site X (Twitter) handle → twitter:site, e.g. "@yourhandle". */
    twitterSite?: string;
    /** Organization / publisher logo (square, ideally >=112px). */
    logo?: string;
    robots: string;
    /** Browser UI color in light mode — keep in sync with --color-bg. */
    themeColor: string;
    /** Paths excluded from indexing: drives meta robots AND sitemap. (§1) */
    noindexPaths: string[];
    /** Google Search Console HTML-tag verification code (the `content` value).
     *  Public by design — it is printed into every page. */
    googleSiteVerification?: string;
  };
  /** Cloudflare Web Analytics beacon token. Public by design (it ships to the
   *  browser); the beacon renders only when this is set. */
  cloudflareBeaconToken?: string;
};

// ─────────────────────────────────────────────────────────────────────────
// TEMPLATE: every value below is a placeholder. The setup interview in
// CLAUDE.md (「初期セットアップ」) fills them in; `pnpm check:setup` lists
// every setup marker still left in the repo.
// ─────────────────────────────────────────────────────────────────────────
export const site: SiteConfig = {
  // TODO(setup): Q14 公開するURL（未定の間は example.com のままでよい）
  url: "https://example.com",
  // TODO(setup): Q2 サイト名 / Q3 キャッチコピー・説明文（120字前後）
  name: "サイト名",
  // TODO(setup): Q2 ロゴの文字（ヒーロー・ローディング・フッターの英字ロゴと、菱形マークの頭文字）
  brand: {
    wordmark: "BRAND",
    initial: "B",
    subtitle: "TOKYO",
  },
  tagline: "ひとことで伝わるキャッチコピー。",
  description:
    "検索結果やSNSでのシェア時に表示される、サイト全体の説明文です。誰に・何を・どこで提供しているかを120字前後で書きます。",
  locale: "ja",
  ogLocale: "ja_JP",
  // TODO(setup): Q1 構造化データ（JSON-LD）の主体。会社・店舗・団体 → "Organization"、個人・フリーランス → "Person"
  publisher: "Organization",
  // TODO(setup): Q8 公式SNSのURL（なければ空配列）
  sameAs: [],
  // TODO(setup): Q4 運営責任者（人の名前）と連絡用メールアドレス
  author: {
    name: "運営者名",
    email: "hello@example.com",
    // url: "https://example.com",
    socials: {
      // x: "https://x.com/yourhandle",
      // github: "https://github.com/yourhandle",
      // linkedin: "https://www.linkedin.com/in/yourhandle/",
    },
  },
  // TODO(setup): Q5 店舗・事務所の情報。トップの「アクセス」欄と構造化データの両方に出る。
  // 店舗が無ければ business ごと削除（アクセス欄も消える）。
  business: {
    type: "LocalBusiness",
    legalName: "株式会社〇〇",
    telephone: "+81-3-0000-0000",
    // email: "info@example.jp", // 公開してよい店舗の連絡先だけ
    priceRange: "¥¥",
    address: {
      streetAddress: "〇〇1-2-3 〇〇ビル 3F",
      addressLocality: "〇〇区",
      addressRegion: "東京都",
      postalCode: "100-0000",
      addressCountry: "JP",
    },
    // geo: { latitude: 35.6595, longitude: 139.7005 },
    // hasMap: "https://maps.google.com/?cid=XXXX",
    // areaServed: ["東京都"],
    openingHours: ["Mo 10:00-20:00", "We-Su 10:00-20:00"],
    notes: [
      { label: "最寄り駅", value: "〇〇線 〇〇駅 徒歩3分" },
      { label: "定休日", value: "毎週火曜日" },
    ],
    // mapEmbedUrl: "https://www.google.com/maps/embed?pb=XXXX",
  },
  // TODO(setup): Q7 お問い合わせフォームの外部URL（Googleフォーム等。なければ行ごと削除）
  // contactFormUrl: "https://forms.gle/XXXX",
  // TODO(setup): Q6 トップページの節（セクション）に合わせてメニューを並べる。
  // href は "/#節のid"。en はメニューに大きく出る英字。
  nav: [
    {
      label: "メニュー",
      href: "/#menu",
      en: "MENU",
      children: [
        { label: "メニュー・料金", href: "/#menu" },
        { label: "ギャラリー", href: "/#gallery" },
      ],
    },
    {
      label: "私たちについて",
      href: "/#concept",
      en: "ABOUT",
      children: [
        { label: "コンセプト", href: "/#concept" },
        { label: "スタッフ", href: "/#staff" },
        { label: "よくある質問", href: "/#faq" },
      ],
    },
    {
      label: "アクセス",
      href: "/#access",
      en: "ACCESS",
      children: [
        { label: "アクセス", href: "/#access" },
        { label: "お問い合わせ", href: "/#contact" },
      ],
    },
  ],
  footerNav: [{ label: "サイトポリシー", href: "/#policy" }],
  seo: {
    ogImage: "/images/og/og-default.jpg",
    ogImageWidth: 1200,
    ogImageHeight: 630,
    // twitterSite: "@yourhandle",
    logo: "/icon-512.png",
    robots:
      "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
    // global.css の --color-bg と揃える（配色を変えたらここも）
    themeColor: "#ffffff",
    noindexPaths: [],
    // 公開後: Search Console の「HTMLタグ」の content の値
    // googleSiteVerification: "XXXXXXXX",
  },
  // 公開後: Cloudflare Web Analytics のトークン（入れるとアクセス解析が有効になる）
  // cloudflareBeaconToken: "XXXXXXXX",
};
