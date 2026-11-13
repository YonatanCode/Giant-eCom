// The 8 mock Mountain-bike products ported from the ../Giant-PLP prototype, trimmed
// to what the card renders. Remote giant-bicycles.com CDN image URLs kept as-is.
// ponytail: static mock catalog — no per-store stock, no variants beyond the first image.

export interface ProductColor {
  label: string
  hex: string
  image: string
}

export interface CatalogProduct {
  id: string
  title: string
  url: string
  description: string
  /** Display strings, e.g. "$800". oldAmount present only when discounted. */
  price: { amount: string; oldAmount?: string }
  tag?: { type: 'new' | 'sale' | 'best-seller'; label: string }
  /** Award badge alt text; image is /badge.png. */
  award?: string
  colors: ProductColor[]
}

export const catalogProducts: CatalogProduct[] = [
  {
    id: 'talon-2',
    title: 'Talon 2',
    url: 'https://www.giant-bicycles.com/us/talon-2-2025',
    description:
      'A light, capable hardtail built to keep climbing effort low while still feeling stable and responsive on everyday trails.',
    price: { amount: '$800' },
    tag: { type: 'new', label: 'New' },
    colors: [
      { label: 'Asphalt Green', hex: '#004814', image: 'https://images2.giant-bicycles.com/b_white%2Cc_pad%2Ch_2000%2Cq_80/wajuq4zawnoylmfywmcs/MY25Talon292_ColorAAsphaltGreen.jpg' },
      { label: 'Pure Red', hex: '#ff170d', image: 'https://images2.giant-bicycles.com/b_white%2Cc_pad%2Ch_2000%2Cq_80/mmrtbbejknbooj2vjy9v/MY25Talon292_ColorBPureRed.jpg' },
      { label: 'Dried Matcha', hex: '#97936b', image: 'https://images2.giant-bicycles.com/b_white%2Cc_pad%2Ch_2000%2Cq_80/msj8gqqp6hbexmlqcumz/MY25Talon292_ColorCDriedMatcha.jpg' },
    ],
  },
  {
    id: 'anthem-advanced-sl-frameset',
    title: 'Anthem Advanced SL Frameset',
    url: 'https://www.giant-bicycles.com/us/anthem-advanced-sl-frameset',
    description:
      'An ultralight carbon frameset made for building a feathery XC race bike with sharp handling and efficient suspension feel.',
    price: { amount: '$4,500' },
    award: 'Best Climbing Bike 2024 Winner',
    colors: [
      { label: 'Color A', hex: '#00649F', image: 'https://images2.giant-bicycles.com/b_white%2Cc_pad%2Ch_2000%2Cq_80/hbvjwoxk3fv7xa1qoxtw/MY26AnthemAdvancedSL-FR_ColorA.jpg' },
    ],
  },
  {
    id: 'anthem-x-advanced-sl-1',
    title: 'Anthem X Advanced SL 1',
    url: 'https://www.giant-bicycles.com/us/anthem-x-advanced-sl-1',
    description:
      'A top-tier XC bike engineered to save weight for faster climbing, quicker acceleration, and race-day speed.',
    price: { amount: '$8,000' },
    tag: { type: 'best-seller', label: 'Best Seller' },
    award: 'Best Climbing Bike 2024 Winner',
    colors: [
      { label: 'Solar Prominence', hex: '#D53700', image: 'https://images2.giant-bicycles.com/b_white%2Cc_pad%2Ch_2000%2Cq_80/qbyplgjseicqyfzptegh/MY26AnthemXAdvancedSL1_ColorASolarProminence.jpg' },
    ],
  },
  {
    id: 'xtc-advanced-29-1',
    title: 'XTC Advanced 29 1',
    url: 'https://www.giant-bicycles.com/us/xtc-advanced-29-1',
    description:
      'A lightweight 29er hardtail built to maximize power-to-weight efficiency with crisp steering and fast XC response.',
    price: { amount: '$3,200', oldAmount: '$4,000' },
    tag: { type: 'sale', label: 'Save 20%' },
    colors: [
      { label: 'Abyss Black / Steampunk', hex: '#8c6133', image: 'https://images2.giant-bicycles.com/b_white%2Cc_pad%2Ch_2000%2Cq_80/qrpefgqfjrzq6x21nwsw/MY26XTCAdvanced291_ColorAAbyssBlack_Bronze.jpg' },
    ],
  },
  {
    id: 'anthem-x-advanced-sl-2',
    title: 'Anthem X Advanced SL 2',
    url: 'https://www.giant-bicycles.com/us/anthem-x-advanced-sl-2',
    description:
      'A lightweight XC platform that trims climbing burden while keeping enough control and confidence for rough singletrack.',
    price: { amount: '$5,600' },
    tag: { type: 'new', label: 'New' },
    colors: [
      { label: 'Dark Jungle', hex: '#2f3a34', image: 'https://images2.giant-bicycles.com/b_white%2Cc_pad%2Ch_2000%2Cq_80/qrpwlnj9j1d6wfjiv5mc/MY26AnthemXAdvancedSL2_ColorADarkJungle.jpg' },
    ],
  },
  {
    id: 'reign-advanced-pro-29-1',
    title: 'Reign Advanced Pro 29 1',
    url: 'https://www.giant-bicycles.com/us/reign-advanced-pro-29-1-2022',
    description:
      'A high-performance enduro bike with a lightweight carbon frame, 160mm of rear travel, and aggressive geometry built to dominate technical descents.',
    price: { amount: '$7,500' },
    colors: [
      { label: 'Amber Glow', hex: '#b84a14', image: 'https://images2.giant-bicycles.com/b_white%2Cc_pad%2Ch_2000%2Cq_80/vfi2iwtwk4k6opxv8gbh/MY22ReignAdvancedPro291_ColorAAmberGlow.jpg' },
    ],
  },
  {
    id: 'fathom-29-2',
    title: 'Fathom 29 2',
    url: 'https://www.giant-bicycles.com/us/fathom-29-2-2022',
    description:
      'An entry-level trail hardtail with 100mm of front suspension travel and a confident geometry that punches well above its price point.',
    price: { amount: '$1,500' },
    tag: { type: 'new', label: 'New' },
    colors: [
      { label: 'Terracotta', hex: '#C56539', image: 'https://images2.giant-bicycles.com/b_white%2Cc_pad%2Ch_2000%2Cq_80/hpzpepwq3ygdeihzsalb/MY22Fathom292_ColorATerracotta.jpg' },
    ],
  },
  {
    id: 'trance-advanced-pro-29-1',
    title: 'Trance Advanced Pro 29 1',
    url: 'https://www.giant-bicycles.com/us/trance-advanced-pro-29-1',
    description:
      'A versatile trail bike with a lightweight carbon frame and 120mm of suspension travel, ready for technical terrain and long days in the saddle.',
    price: { amount: '$5,250', oldAmount: '$6,000' },
    tag: { type: 'sale', label: 'Save 12%' },
    colors: [
      { label: 'Carbon / Black Diamond', hex: '#2b2b2b', image: 'https://images2.giant-bicycles.com/b_white%2Cc_pad%2Ch_2000%2Cq_80/ganvxmhytrirqusjzxhz/MY22TranceAdvancedPro291_ColorACarbonBlackDiamond.jpg' },
    ],
  },
]
