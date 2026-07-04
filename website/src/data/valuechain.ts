// Single source of truth for the value-chain diagram.
// Desktop coords target a 1200×560 viewBox; mobile (mx/my) a 420×980 vertical one.
export type Tier = 'feedstock' | 'process' | 'division' | 'market';

export type VCNode = {
  id: string; // key under dict.diagram.nodes
  tier: Tier;
  x: number;
  y: number;
  mx: number;
  my: number;
  href?: 'oilfield' | 'coatings' | 'agro';
};

export const DESKTOP = { w: 1200, h: 560 };
export const MOBILE = { w: 420, h: 980 };

export const nodes: VCNode[] = [
  { id: 'hydrocarbons', tier: 'feedstock', x: 90, y: 200, mx: 130, my: 70 },
  { id: 'minerals', tier: 'feedstock', x: 90, y: 360, mx: 290, my: 70 },
  { id: 'refining', tier: 'process', x: 400, y: 200, mx: 130, my: 250 },
  { id: 'synthesis', tier: 'process', x: 400, y: 360, mx: 290, my: 250 },
  { id: 'oilfield', tier: 'division', x: 720, y: 120, mx: 90, my: 470, href: 'oilfield' },
  { id: 'coatings', tier: 'division', x: 720, y: 280, mx: 210, my: 510, href: 'coatings' },
  { id: 'agro', tier: 'division', x: 720, y: 440, mx: 330, my: 470, href: 'agro' },
  { id: 'egypt', tier: 'market', x: 1080, y: 140, mx: 90, my: 800 },
  { id: 'gulf', tier: 'market', x: 1080, y: 280, mx: 210, my: 850 },
  { id: 'africa', tier: 'market', x: 1080, y: 420, mx: 330, my: 800 },
];

export const edges: [string, string][] = [
  ['hydrocarbons', 'refining'],
  ['hydrocarbons', 'synthesis'],
  ['minerals', 'synthesis'],
  ['refining', 'oilfield'],
  ['refining', 'coatings'],
  ['synthesis', 'oilfield'],
  ['synthesis', 'coatings'],
  ['synthesis', 'agro'],
  ['oilfield', 'egypt'],
  ['oilfield', 'gulf'],
  ['coatings', 'egypt'],
  ['coatings', 'africa'],
  ['agro', 'egypt'],
  ['agro', 'gulf'],
  ['agro', 'africa'],
];

export const tierOrder: Tier[] = ['feedstock', 'process', 'division', 'market'];
