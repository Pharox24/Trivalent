// Full product portfolio transcribed from the ICIS/安迅思 CHEMEASE coverage map
// (化工流程图.pdf). The PDF has no text layer — this was read by eye from
// high-DPI renders, so a handful of dense leaf labels are flagged for review
// in docs. Structure is a directed graph (a few nodes have multiple parents).
//
// coverage: 'daily'   = yellow  (covered + daily report)
//           'tracked' = blue    (covered, not daily)
//           'unit'    = process unit / feedstock (rounded/hex)
//           'app'     = white end-use application
export type Coverage = 'daily' | 'tracked' | 'unit' | 'app';

export interface PNode {
  id: string;
  en: string;
  zh: string;
  coverage: Coverage;
}
export interface PEdge {
  from: string;
  to: string;
}
export interface Diagram {
  id: string;
  titleEn: string;
  titleZh: string;
  nodes: PNode[];
  edges: PEdge[];
}

// ── Diagram 1: CHEMEASE main coverage map ────────────────────────────────────
const n = (id: string, en: string, zh: string, coverage: Coverage = 'daily'): PNode => ({ id, en, zh, coverage });

const mainNodes: PNode[] = [
  // Roots / feedstocks
  n('crude', 'Crude Oil', '原油', 'unit'),
  n('salt', 'Salt', '原盐', 'unit'),
  n('sulphur', 'Sulphur', '硫磺'),
  n('coal', 'Coal', '煤', 'unit'),

  // Crude → distillation cuts
  n('avd', 'Atmospheric & Vacuum Distillation', '常减压装置', 'unit'),
  n('naphtha', 'Naphtha', '石脑油'),
  n('diesel', 'Diesel', '柴油'),
  n('kerosene', 'Kerosene', '煤油', 'tracked'),
  n('gasoline', 'Gasoline', '重整汽油', 'tracked'),
  n('fueloil', 'Fuel Oil', '重质馏分油', 'tracked'),
  n('steamcracker', 'Steam Cracker', '乙烯裂解装置', 'unit'),
  n('catcracker', 'Catalytic Cracker', '催化裂化装置', 'unit'),
  n('btx', 'BTX Extraction', '芳烃抽提', 'unit'),

  // Catalytic cracker products
  n('fuelgas', 'Fuel Gas', '燃料气', 'tracked'),
  n('cc_gasoline', 'Gasoline', '汽油'),
  n('cc_diesel', 'Diesel', '柴油'),
  n('cc_fueloil', 'Fuel Oil', '燃料油'),
  n('lpg', 'LPG', '液化气'),

  // Steam cracker products
  n('ethylene', 'Ethylene', '乙烯', 'tracked'),
  n('propylene', 'Propylene', '丙烯', 'tracked'),
  n('c4', 'Mixed C4', '混合碳4', 'tracked'),
  n('bd', 'Butadiene', '丁二烯'),
  n('c5', 'C5', '碳5', 'tracked'),

  // BTX
  n('mx', 'Mixed Xylene', '混合二甲苯'),
  n('toluene', 'Toluene', '甲苯'),
  n('benzene', 'Benzene', '纯苯'),
  n('nparaffin', 'N-paraffin', '直链烷烃', 'tracked'),

  // Ethylene downstream
  n('pe', 'PE', '聚乙烯', 'tracked'),
  n('eva', 'EVA', 'EVA'),
  n('eo', 'EO', '环氧乙烷'),
  n('edc', 'EDC', '二氯乙烷', 'tracked'),
  n('acetaldehyde', 'Acetaldehyde', '乙醛', 'tracked'),
  n('mpe', 'Metallocene PE', '茂金属聚乙烯', 'tracked'),
  n('epdm', 'EPDM', '三元乙丙橡胶', 'tracked'),
  n('meg', 'MEG', 'MEG'),
  n('deg', 'DEG', 'DEG'),
  n('vcm', 'VCM', '氯乙烯'),
  n('pvc', 'PVC', 'PVC粉'),
  n('epvc', 'EPVC', 'PVC糊'),
  // PE apps
  n('pe_pack', 'Packaging film', '包装膜', 'app'),
  n('pe_cable', 'Cable', '电缆', 'app'),
  n('pe_pipe', 'PE Pipe', 'PE管材'),
  n('pe_agri', 'Agriculture Film', '农膜', 'app'),
  n('mpe_food', 'Food Package', '食品包装', 'app'),
  n('epdm_seal', 'Automobile Seal Components', '汽车密封条', 'app'),
  // PVC apps
  n('pvc_cable', 'Cable', '电缆', 'app'),
  n('pvc_pipe', 'Pipe', '管材', 'app'),
  n('pvc_film', 'Film', '薄膜', 'app'),
  n('pvc_plate', 'Plate', '片材', 'app'),
  n('pvc_wall', 'Wallpaper', '墙纸', 'app'),
  n('pvc_shoes', 'Shoes', '鞋', 'app'),
  n('pvc_toy', 'Toy', '玩具', 'app'),
  n('pvc_leather', 'Leather', '皮革', 'app'),
  n('pvc_profile', 'Profile', '塑料型材', 'app'),
  n('epvc_glove', 'Glove', '手套', 'app'),
  n('epvc_shoes', 'Shoes', '鞋', 'app'),
  n('epvc_wall', 'Wallpaper', '墙纸', 'app'),
  n('epvc_toy', 'Toy', '玩具', 'app'),
  n('epvc_leather', 'Leather', '皮革', 'app'),

  // Salt downstream
  n('hydrogen', 'Hydrogen', '氢', 'app'),
  n('chlorine', 'Chlorine', '氯'),
  n('caustic', 'Caustic Soda', '烧碱'),
  n('sodaash', 'Soda Ash', '纯碱'),
  n('hcl', 'HCl', '氯化氢'),
  n('alumina_pulp', 'Alumina / Pulp & Paper Making', '氧化铝 / 纸浆', 'app'),
  n('glasssheet', 'Glass Sheet', '平板玻璃', 'app'),
  n('dailyglass', 'Daily Use Glass', '日用玻璃', 'app'),
  n('alumina', 'Alumina', '氧化铝', 'app'),
  n('stpp', 'Sodium Tripolyphosphate', '三聚磷酸钠', 'app'),
  // Coke/carbide route
  n('coke2', 'Coke', '兰炭'),
  n('lime', 'Lime', '石灰石', 'app'),
  n('limestone', 'Limestone', '白灰', 'app'),
  n('carbide', 'Calcium Carbide', '电石'),
  n('acetylene', 'Acetylene', '乙炔'),

  // Sulphur / fertilizer
  n('h2so4', 'Sulphuric Acid', '硫酸'),
  n('tio2', 'TiO2', '钛白粉'),
  n('urea', 'Urea', '尿素'),
  n('map', 'MAP', '磷酸一铵'),
  n('dap', 'DAP', '磷酸二铵'),
  n('mop', 'MOP', '氯化钾'),
  n('sop', 'SOP', '硫酸钾'),
  n('npk', 'NPK Compound Fertilizer', 'NPK复合肥'),

  // Propylene downstream
  n('pp', 'PP', '聚丙烯'),
  n('acn', 'ACN', '丙烯腈'),
  n('po', 'PO', '环氧丙烷'),
  n('eh', '2-EH / Butanol', '辛醇/丁醇'),
  n('ipa', 'IPA', '异丙醇'),
  n('ech', 'ECH', '环氧氯丙烷'),
  n('acrylic', 'Acrylic Acid', '丙烯酸'),
  n('acrylamide', 'Acrylamide', '丙烯酰胺'),
  n('af', 'Acrylic Fiber', '腈纶'),
  n('additives', 'Additives', '助剂', 'app'),
  n('textile1', 'Textile', '纺织制品', 'app'),
  n('acrylester', 'Acrylic Ester', '丙烯酸酯'),
  n('dop', 'DOP', 'DOP'),
  n('dbp', 'DBP', 'DBP', 'tracked'),
  n('dibp', 'DIBP', 'DIBP', 'tracked'),
  n('dinp', 'DINP', 'DINP'),
  n('dotp', 'DOTP', 'DOTP'),
  n('plasticprod', 'Plastic Products (PVC leather, soft plastic, film)', '塑料制品', 'app'),

  // C4 downstream
  n('mtbe', 'MTBE', 'MTBE'),
  n('ina', 'INA', '壬醇'),
  n('nbutylene', 'N-butylene', '正丁烯', 'tracked'),
  n('isobutene', 'Isobutene', '异丁烯', 'tracked'),
  n('iir', 'Butyl Rubber IIR', '丁基橡胶', 'tracked'),
  n('innertube', 'Inner Tubes', '轮胎内胎', 'app'),

  // BD / rubber
  n('sbr', 'SBR', '丁苯橡胶'),
  n('sbs', 'SBS', 'SBS'),
  n('br', 'BR', '顺丁橡胶'),
  n('nbr', 'NBR', '丁腈橡胶'),
  n('nr', 'Natural Rubber', '天然橡胶'),
  n('nrlatex', 'Natural Rubber Latex', '天然胶乳'),
  n('tyres1', 'Tyres', '轮胎', 'app'),
  n('shoes1', 'Shoes', '鞋', 'app'),
  n('tyres2', 'Tyres', '轮胎', 'app'),
  n('oilseal', 'Oil-resistant Seal Components', '耐油密封件', 'app'),
  n('rubbergloves', 'Rubber Gloves', '橡胶手套', 'app'),
  n('petresin', 'Petroleum Resin', '石油树脂'),

  // MX / PX / OX
  n('px', 'PX', '对二甲苯', 'tracked'),
  n('ox', 'OX', '邻二甲苯'),
  n('dnt', 'DNT', 'DNT', 'app'),
  n('pta', 'PTA', 'PTA'),
  n('pa', 'PA', '苯酐'),
  n('tdi', 'TDI', 'TDI'),
  n('dyestuffs', 'Dyestuffs / Pesticide', '染料/杀虫剂', 'app'),
  n('upr_alkyd', 'UPR / Alkyd Resin', 'UPR/醇酸树脂', 'app'),
  n('pusoft', 'PU Soft-foam', '聚氨酯软泡'),

  // Benzene downstream
  n('sm', 'SM', '苯乙烯'),
  n('benzcl', 'Benzene Chloride', '氯化苯'),
  n('cyclohexane', 'Cyclohexane', '环己烷'),
  n('phenolacetone', 'Phenol / Acetone', '苯酚/丙酮'),
  n('nitrobenzene', 'Nitrobenzene', '硝基苯'),
  n('alkylbenzene', 'Alkylbenzene', '烷基苯'),
  n('ma', 'Maleic Anhydride', '顺酐'),
  n('bpa', 'BPA', '双酚A'),
  n('mma', 'MMA', 'MMA'),
  n('ppo', 'PPO', '聚苯醚'),
  n('aniline', 'Aniline', '苯胺'),
  n('eps', 'EPS', 'EPS'),
  n('ps', 'PS', 'PS'),
  n('abs', 'ABS', 'ABS'),
  n('foampack', 'Foam Packaging', '泡沫包装', 'app'),
  n('archsheet', 'Architectural Sheet', '建筑板材', 'app'),
  n('electronic1', 'Electronic & Electrical', '电子电器', 'app'),
  n('cyclohexanone', 'Cyclohexanone', '环己酮'),
  n('adipic', 'Adipic Acid', '己二酸'),
  n('cpl', 'CPL', '己内酰胺'),
  n('nylon66', 'Nylon-66', '尼龙-66'),
  n('nylon6', 'Nylon-6', '尼龙-6'),
  n('bdo', 'BDO', 'BDO'),
  n('puresin', 'PU resin', '聚氨酯浆料/鞋底原液'),
  n('mdi', 'MDI', 'MDI'),
  n('pc', 'PC', '聚碳酸酯'),
  n('pmma', 'PMMA', 'PMMA', 'tracked'),
  n('epoxy', 'BPA-Epoxy Resin', '双酚A型环氧树脂'),
  n('unsatresin', 'Unsaturated Resin UPR', '不饱和树脂'),
  n('frp', 'FRP', '玻璃钢', 'app'),
  n('nonfrp', 'Non-glass fiber reinforced plastics', '非玻璃钢', 'app'),

  // Polyester / PET
  n('bottlepet', 'Bottle PET Chip', '瓶级聚酯切片'),
  n('fiberpet', 'Fiber PET Chip', '纤维级聚酯切片'),
  n('pfy', 'PFY', '涤纶长丝'),
  n('psf', 'PSF', '涤纶短纤'),
  n('bottles', 'Bottles', '水瓶/饮料瓶', 'app'),
  n('textile2', 'Textile', '纺织制品', 'app'),
  n('pbt', 'PBT', 'PBT'),
  n('thf', 'THF', 'THF', 'tracked'),
  n('ptmeg', 'PTMEG', 'PTMEG', 'tracked'),
  n('polymdi', 'Polymeric MDI', '聚合MDI'),
  n('puremdi', 'Pure MDI', '纯MDI', 'tracked'),
  n('puhard', 'PU Hard-foam', '聚氨酯硬泡', 'tracked'),
  n('spandex', 'Spandex', '氨纶'),

  // Coal → coking chain
  n('htcoking', 'High Temperature Coking', '高温炼焦', 'unit'),
  n('ammonia', 'Ammonia', '合成氨'),
  n('methanol_coal', 'Methanol', '甲醇'),
  n('coke', 'Coke', '焦炭'),
  n('cog', 'Coke Oven Gas', '焦炉煤气', 'tracked'),
  n('cotail', 'Coke Oven Tail Gas', '焦炉尾气', 'tracked'),
  n('coaltar', 'Coal Tar', '煤焦油'),
  n('crudebenzene', 'Crude Benzene', '粗苯'),
  n('ammsulf', 'Ammonium Sulphate', '硫酸铵'),
  n('melamine', 'Melamine', '三聚氰胺'),
  n('mf', 'MF Resin', '三聚氰胺甲醛树脂', 'app'),
  n('pitch_mid', 'Coal Tar Pitch (mid-temp)', '中温沥青'),
  n('pitch_mod', 'Coal Tar Pitch (modified)', '改质沥青'),
  n('anthracene', 'Anthracene Oil', '蒽油', 'tracked'),
  n('naphthaleneoil', 'Naphthalene Oil', '萘洗油', 'tracked'),
  n('washingoil', 'Washing Oil', '洗油', 'tracked'),
  n('phenoloil', 'Phenol Oil', '酚油', 'tracked'),
  n('lightoil', 'Light Oil', '轻油', 'tracked'),
  n('crudephenol', 'Crude Phenol', '粗酚', 'tracked'),
  n('indnaphthalene', 'Industrial Naphthalene', '工业萘'),
  n('waterreducer', 'Water-reducing Admixture', '减水剂'),
  n('construction', 'Construction', '建筑', 'app'),
  n('refnaphthalene', 'Refined Naphthalene', '精萘'),
  n('naphthol', '2-naphthol', '二萘酚'),
  n('azodyes', 'Azo Dyes', '偶氮染料'),
  n('dyeapps', 'Dyeing: Wool, Textile, Paper, Medicament', '染羊毛/织品/纸/药剂', 'app'),
  n('cokingbenzene', 'Coking Benzene', '焦化苯', 'tracked'),
  n('cokingtoluene', 'Coking Toluene', '焦化甲苯', 'tracked'),
  n('cokingxylene', 'Coking Xylene', '焦化二甲苯', 'tracked'),
  n('hydrobenzene', 'Hydro-coking Benzene', '加氢苯', 'tracked'),
  n('refbenzene', 'Refined Benzene', '精致苯', 'tracked'),
  n('nitrochlorobenzene', 'Nitrochlorobenzene', '硝基氯苯'),
  n('orgsynth', 'Organic Synthesis Intermediate', '有机合成中间体', 'app'),
  n('medicine1', 'Medicine', '医药', 'app'),
  n('pesticide1', 'Pesticide', '农药', 'app'),

  // Natural gas / C1
  n('natgas', 'Natural Gas', '天然气', 'unit'),
  n('methanol', 'Methanol', '甲醇'),
  n('formaldehyde', 'Formaldehyde', '甲醛'),
  n('aa', 'Acetic Acid', '冰醋酸'),
  n('mono', 'Monomethylamine', '一甲胺'),
  n('di', 'Dimethylamine', '二甲胺'),
  n('tri', 'Trimethylamine', '三甲胺'),
  n('chloromethane', 'Chloromethane', '一氯甲烷'),
  n('dcm', 'Dichloromethane', '二氯甲烷'),
  n('chloroform', 'Chloroform', '三氯甲烷'),
  n('ctc', 'Carbon Tetrachloride', '四氯甲烷'),
  n('mma2', 'MMA', 'MMA'),
  n('dmc', 'DMC', '碳酸二甲酯'),
  n('dme', 'DME', '二甲醚'),
  n('fuelblend', 'Fuel Blending', '甲醇汽油', 'tracked'),
  n('mtomtp', 'MTO / MTP', 'MTO/MTP', 'tracked'),
  n('aceticanhydride', 'Acetic Anhydride', '醋酐', 'tracked'),
  n('eac', 'EAC', '醋酸乙酯'),
  n('bac', 'BAC', '醋酸丁酯'),
  n('vam', 'VAM', '醋酸乙烯'),
  n('mca', 'MCA', '氯乙酸'),
  n('aceticellulose', 'Acetic Cellulose', '醋酸纤维束', 'app'),
  n('pva', 'PVA', '聚乙烯醇'),
  n('glycin', 'Glycin', '甘氨酸'),
  n('glyphosate', 'Glyphosate', '草甘膦'),
  n('dmf', 'DMF', 'DMF'),
  n('cholinechloride', 'Choline Chloride', '氯化胆碱'),
  n('uf', 'UF Adhesive', '脲醛树脂胶', 'app'),
  n('pf', 'PF Adhesive', '酚醛树脂胶', 'app'),
  n('mfadhesive', 'Melamine-Formaldehyde Resin Adhesive', '三聚氰胺树脂胶', 'app'),
  n('paraformaldehyde', 'Paraformaldehyde', '多聚甲醛'),
  n('pom', 'POM', '聚甲醛'),
  n('urotropine', 'Urotropine', '乌洛托品', 'tracked'),
  n('pentaerythritol', 'Pentaerythritol', '季戊四醇', 'tracked'),
  n('synresin', 'Synthetic Resin', '合成树脂', 'app'),

  // Ethanol / bio
  n('corn', 'Corn', '玉米', 'app'),
  n('cassava', 'Cassava', '木薯', 'app'),
  n('treacle', 'Treacle', '糖蜜', 'app'),
  n('ethanol', 'Ethanol', '乙醇'),
  n('ethanolfuel', 'Ethanol Fuel', '乙醇汽油', 'app'),
  n('wine', 'Wine', '酒类', 'app'),
  n('ethylacetate', 'Ethyl Acetate', '醋酸乙酯', 'app'),

  // Glycerine / oleochemical
  n('glycerine', 'Glycerine', '甘油'),
  n('fattyacids', 'Fatty Acids', '脂肪酸'),
];

const e = (from: string, to: string): PEdge => ({ from, to });
const mainEdges: PEdge[] = [
  // Crude
  e('crude', 'avd'),
  e('avd', 'naphtha'), e('avd', 'diesel'), e('avd', 'kerosene'), e('avd', 'gasoline'), e('avd', 'fueloil'),
  e('naphtha', 'steamcracker'), e('gasoline', 'steamcracker'), e('gasoline', 'btx'), e('fueloil', 'catcracker'),
  e('catcracker', 'fuelgas'), e('catcracker', 'cc_gasoline'), e('catcracker', 'cc_diesel'), e('catcracker', 'cc_fueloil'), e('catcracker', 'lpg'),
  e('steamcracker', 'ethylene'), e('steamcracker', 'propylene'), e('steamcracker', 'c4'), e('steamcracker', 'bd'), e('steamcracker', 'c5'),
  e('btx', 'mx'), e('btx', 'toluene'), e('btx', 'benzene'), e('btx', 'nparaffin'),
  // Ethylene
  e('ethylene', 'pe'), e('ethylene', 'eva'), e('ethylene', 'eo'), e('ethylene', 'edc'),
  e('ethylene', 'acetaldehyde'), e('ethylene', 'mpe'), e('ethylene', 'epdm'), e('ethylene', 'sm'),
  e('eo', 'meg'), e('eo', 'deg'), e('meg', 'unsatresin'),
  e('edc', 'vcm'), e('vcm', 'pvc'), e('vcm', 'epvc'),
  e('pe', 'pe_pack'), e('pe', 'pe_cable'), e('pe', 'pe_pipe'), e('pe', 'pe_agri'),
  e('mpe', 'mpe_food'), e('epdm', 'epdm_seal'),
  e('pvc', 'pvc_cable'), e('pvc', 'pvc_pipe'), e('pvc', 'pvc_film'), e('pvc', 'pvc_plate'),
  e('pvc', 'pvc_wall'), e('pvc', 'pvc_shoes'), e('pvc', 'pvc_toy'), e('pvc', 'pvc_leather'), e('pvc', 'pvc_profile'),
  e('epvc', 'epvc_glove'), e('epvc', 'epvc_shoes'), e('epvc', 'epvc_wall'), e('epvc', 'epvc_toy'), e('epvc', 'epvc_leather'),
  // Salt
  e('salt', 'hydrogen'), e('salt', 'chlorine'), e('salt', 'caustic'), e('salt', 'sodaash'),
  e('hydrogen', 'hcl'), e('chlorine', 'edc'), e('chlorine', 'hcl'),
  e('caustic', 'alumina_pulp'),
  e('sodaash', 'glasssheet'), e('sodaash', 'dailyglass'), e('sodaash', 'alumina'), e('sodaash', 'stpp'),
  e('coal', 'coke2'), e('coke2', 'carbide'), e('lime', 'limestone'), e('limestone', 'carbide'),
  e('carbide', 'acetylene'), e('acetylene', 'vcm'), e('hcl', 'vcm'),
  // Sulphur
  e('sulphur', 'h2so4'), e('h2so4', 'tio2'), e('h2so4', 'map'), e('h2so4', 'dap'),
  e('map', 'npk'), e('dap', 'npk'), e('mop', 'npk'), e('sop', 'npk'), e('urea', 'npk'),
  // Propylene
  e('propylene', 'pp'), e('propylene', 'acn'), e('propylene', 'po'), e('propylene', 'eh'),
  e('propylene', 'ipa'), e('propylene', 'ech'), e('propylene', 'acrylic'),
  e('acn', 'acrylamide'), e('acn', 'af'), e('acrylamide', 'additives'), e('af', 'textile1'),
  e('acrylic', 'acrylester'), e('acrylic', 'dop'), e('acrylic', 'dbp'), e('acrylic', 'dibp'),
  e('acrylic', 'dinp'), e('acrylic', 'dotp'),
  e('dop', 'plasticprod'), e('dinp', 'plasticprod'),
  // C4
  e('c4', 'mtbe'), e('c4', 'ina'), e('c4', 'nbutylene'), e('c4', 'isobutene'),
  e('isobutene', 'iir'), e('iir', 'innertube'), e('ina', 'dinp'),
  // BD
  e('bd', 'sbr'), e('bd', 'sbs'), e('bd', 'br'), e('bd', 'nbr'),
  e('sbr', 'tyres1'), e('sbs', 'shoes1'), e('br', 'tyres2'), e('nbr', 'oilseal'),
  e('nr', 'tyres1'), e('nrlatex', 'rubbergloves'), e('c5', 'petresin'),
  // MX/aromatics
  e('mx', 'px'), e('mx', 'ox'), e('mx', 'dnt'),
  e('px', 'pta'), e('ox', 'pa'),
  e('pa', 'dop'), e('pa', 'dinp'), e('pa', 'dyestuffs'), e('pa', 'upr_alkyd'),
  e('toluene', 'tdi'), e('toluene', 'dnt'), e('tdi', 'pusoft'),
  // Benzene
  e('benzene', 'sm'), e('benzene', 'benzcl'), e('benzene', 'cyclohexane'), e('benzene', 'phenolacetone'),
  e('benzene', 'nitrobenzene'), e('benzene', 'alkylbenzene'), e('benzene', 'ma'),
  e('phenolacetone', 'bpa'), e('phenolacetone', 'ppo'),
  e('sm', 'eps'), e('sm', 'ps'), e('sm', 'abs'),
  e('eps', 'foampack'), e('ps', 'archsheet'), e('abs', 'electronic1'),
  e('cyclohexane', 'cyclohexanone'), e('cyclohexanone', 'adipic'), e('cyclohexanone', 'cpl'),
  e('adipic', 'nylon66'), e('adipic', 'puresin'), e('adipic', 'bdo'), e('cpl', 'nylon6'),
  e('ma', 'unsatresin'), e('ma', 'bdo'), e('ma', 'aniline'),
  e('nitrobenzene', 'aniline'), e('aniline', 'mdi'),
  e('bpa', 'pc'), e('bpa', 'pmma'), e('bpa', 'epoxy'),
  e('unsatresin', 'frp'), e('unsatresin', 'nonfrp'),
  // Polyester
  e('pta', 'bottlepet'), e('pta', 'fiberpet'), e('meg', 'bottlepet'), e('meg', 'fiberpet'),
  e('fiberpet', 'pfy'), e('fiberpet', 'psf'), e('bottlepet', 'bottles'),
  e('pfy', 'textile2'), e('psf', 'textile2'),
  e('pta', 'pbt'), e('bdo', 'pbt'), e('bdo', 'thf'), e('thf', 'ptmeg'),
  e('mdi', 'polymdi'), e('mdi', 'puremdi'), e('polymdi', 'puhard'), e('puremdi', 'puresin'), e('puremdi', 'spandex'),
  // Coal coking
  e('coal', 'htcoking'),
  e('htcoking', 'ammonia'), e('htcoking', 'methanol_coal'), e('htcoking', 'coke'), e('htcoking', 'cog'), e('htcoking', 'cotail'),
  e('ammonia', 'urea'), e('urea', 'melamine'), e('melamine', 'mf'),
  e('coke', 'coaltar'),
  e('coaltar', 'pitch_mid'), e('coaltar', 'pitch_mod'), e('coaltar', 'anthracene'),
  e('coaltar', 'naphthaleneoil'), e('coaltar', 'washingoil'), e('coaltar', 'phenoloil'),
  e('coaltar', 'lightoil'), e('coaltar', 'crudephenol'),
  e('naphthaleneoil', 'indnaphthalene'), e('indnaphthalene', 'waterreducer'), e('waterreducer', 'construction'),
  e('indnaphthalene', 'refnaphthalene'), e('refnaphthalene', 'naphthol'), e('naphthol', 'azodyes'), e('azodyes', 'dyeapps'),
  e('cog', 'ammsulf'), e('cog', 'methanol_coal'),
  e('crudebenzene', 'cokingbenzene'), e('crudebenzene', 'cokingtoluene'), e('crudebenzene', 'cokingxylene'), e('crudebenzene', 'hydrobenzene'),
  e('hydrobenzene', 'refbenzene'),
  e('refbenzene', 'aniline'), e('refbenzene', 'cyclohexanone'), e('refbenzene', 'cyclohexane'), e('refbenzene', 'sm'),
  e('cokingbenzene', 'benzcl'), e('cokingbenzene', 'ma'), e('cokingbenzene', 'bdo'),
  e('benzcl', 'nitrochlorobenzene'),
  e('nitrochlorobenzene', 'dyestuffs'), e('nitrochlorobenzene', 'orgsynth'), e('nitrochlorobenzene', 'medicine1'), e('nitrochlorobenzene', 'pesticide1'),
  // Natural gas / C1
  e('natgas', 'methanol'),
  e('methanol', 'formaldehyde'), e('methanol', 'mtbe'), e('methanol', 'mono'), e('methanol', 'di'), e('methanol', 'tri'),
  e('methanol', 'chloromethane'), e('methanol', 'dcm'), e('methanol', 'chloroform'), e('methanol', 'ctc'),
  e('methanol', 'mma2'), e('methanol', 'dmc'), e('methanol', 'dme'), e('methanol', 'fuelblend'), e('methanol', 'mtomtp'),
  e('methanol', 'aa'),
  e('aa', 'aceticanhydride'), e('aa', 'eac'), e('aa', 'bac'), e('aa', 'vam'), e('aa', 'mca'), e('aa', 'pta'),
  e('aceticanhydride', 'aceticellulose'), e('vam', 'pva'), e('vam', 'eva'),
  e('mca', 'glycin'), e('glycin', 'glyphosate'), e('mca', 'pesticide1'),
  e('mono', 'pesticide1'), e('mono', 'medicine1'), e('mono', 'dyestuffs'),
  e('di', 'dmf'), e('di', 'cholinechloride'), e('di', 'pesticide1'), e('di', 'medicine1'),
  e('formaldehyde', 'uf'), e('formaldehyde', 'pf'), e('formaldehyde', 'mfadhesive'),
  e('formaldehyde', 'paraformaldehyde'), e('formaldehyde', 'pom'), e('formaldehyde', 'bdo'),
  e('formaldehyde', 'mdi'), e('formaldehyde', 'urotropine'), e('formaldehyde', 'pentaerythritol'),
  e('paraformaldehyde', 'pesticide1'), e('paraformaldehyde', 'medicine1'), e('paraformaldehyde', 'synresin'),
  e('chloromethane', 'mma2'),
  // Ethanol
  e('corn', 'ethanol'), e('cassava', 'ethanol'), e('treacle', 'ethanol'),
  e('ethanol', 'ethanolfuel'), e('ethanol', 'wine'), e('ethanol', 'ethylacetate'),
  // Glycerine
  e('glycerine', 'upr_alkyd'), e('fattyacids', 'upr_alkyd'),
];

// ── Diagram 2: C1 Market Coverage (refinery flow) ────────────────────────────
const c1Nodes: PNode[] = [
  n('c_crude', 'Crude Oil', '原油'),
  n('c_naphtha', 'Naphtha', '石脑油'),
  n('c_cdu', 'Crude Distillation Unit', '常减压装置', 'unit'),
  n('c_reform', 'Catalytic Reforming Unit', '催化重整装置', 'unit'),
  n('c_ethcracker', 'Ethylene Cracker', '乙烯裂解', 'unit'),
  n('c_fcc', 'Fluid Catalytic Cracker', '催化裂化装置', 'unit'),
  n('c_hydro', 'Catalytic Hydrotreating', '催化加氢装置', 'unit'),
  n('c_coker', 'Delayed Coker', '延迟焦化装置', 'unit'),
  n('c_mixarom', 'Mixed Aromatics', '混合芳烃'),
  n('c_aromext', 'Aromatics Extraction', '芳烃抽提', 'unit'),
  n('c_c4', 'Mixed C4', '混合碳4'),
  n('c_c5', 'Cracked C5', '裂解碳5'),
  n('c_c9', 'Cracked C9', '裂解碳9'),
  n('c_mtbe', 'MTBE', 'MTBE'),
  n('c_c5resin', 'C5 Petroleum Resin', '碳5石油树脂'),
  n('c_c9resin', 'C9 Petroleum Resin', '碳9石油树脂'),
  n('c_lpg', 'LPG', '液化石油气'),
  n('c_solvent1', 'Solvent Oil (6#, 120#)', '溶剂油(6#,120#)'),
  n('c_btx', 'BTX', '芳烃'),
  n('c_heavyarom', 'Heavy Aromatics', '重芳烃'),
  n('c_gasoline', 'Gasoline', '汽油'),
  n('c_solvent2', 'Solvent Oil (200#)', '溶剂油(200#)'),
  n('c_gasoil', 'Gasoil', '柴油'),
  n('c_baseoil', 'Base Oil / Lubricants', '基础油/润滑油'),
  n('c_fueloil', 'Fuel Oil', '燃料油'),
  n('c_paraffin', 'Paraffin', '石蜡', 'tracked'),
  n('c_petcoke', 'Petroleum Coke', '石油焦'),
  n('c_bitumen', 'Petroleum Bitumen', '石油沥青'),
  n('c_natgas', 'Natural Gas', '天然气'),
  n('c_coal', 'Coal', '煤炭'),
  n('c_methanol1', 'Methanol', '甲醇'),
  n('c_methanol2', 'Methanol', '甲醇'),
  n('c_dme', 'Dimethyl Ether', '二甲醚'),
];
const c1Edges: PEdge[] = [
  e('c_crude', 'c_cdu'),
  e('c_naphtha', 'c_ethcracker'), e('c_naphtha', 'c_reform'),
  e('c_cdu', 'c_naphtha'), e('c_cdu', 'c_gasoline'), e('c_cdu', 'c_solvent2'), e('c_cdu', 'c_gasoil'),
  e('c_cdu', 'c_baseoil'), e('c_cdu', 'c_fueloil'), e('c_cdu', 'c_fcc'), e('c_cdu', 'c_hydro'), e('c_cdu', 'c_coker'),
  e('c_ethcracker', 'c_c4'), e('c_ethcracker', 'c_c5'), e('c_ethcracker', 'c_c9'), e('c_ethcracker', 'c_lpg'),
  e('c_reform', 'c_mixarom'), e('c_mixarom', 'c_aromext'),
  e('c_aromext', 'c_solvent1'), e('c_aromext', 'c_btx'), e('c_aromext', 'c_heavyarom'),
  e('c_c4', 'c_mtbe'), e('c_c5', 'c_c5resin'), e('c_c9', 'c_c9resin'),
  e('c_fcc', 'c_gasoline'), e('c_fcc', 'c_gasoil'), e('c_fcc', 'c_fueloil'),
  e('c_hydro', 'c_baseoil'), e('c_hydro', 'c_paraffin'),
  e('c_coker', 'c_petcoke'), e('c_coker', 'c_bitumen'),
  e('c_natgas', 'c_methanol1'), e('c_coal', 'c_methanol2'),
  e('c_methanol1', 'c_dme'), e('c_methanol2', 'c_dme'),
];

// ── Diagram 3: Flow Chart of Paper ───────────────────────────────────────────
const paperNodes: PNode[] = [
  n('p_wood', 'Wood Pulp', '木浆', 'tracked'),
  n('p_bamboo', 'Bamboo Pulp', '竹浆', 'tracked'),
  n('p_reed', 'Reed Pulp', '苇浆', 'tracked'),
  n('p_bagasse', 'Bagasse Pulp', '甘蔗浆', 'tracked'),
  n('p_straw', 'Straw Pulp', '草浆', 'tracked'),
  n('p_recovered', 'Recovered Paper', '废纸', 'tracked'),
  n('p_printing', 'Printing & Writing Paper', '文化用纸', 'tracked'),
  n('p_packaging', 'Packaging Paper & Board', '包装用纸', 'tracked'),
  n('p_tissue', 'Tissue Paper', '卫生用纸', 'tracked'),
  n('p_office', 'Office Paper', '办公用纸', 'tracked'),
  n('p_special', 'Special Paper', '特种纸', 'tracked'),
  n('p_art', 'Art Paper', '铜版纸'),
  n('p_offset', 'Offset', '双胶纸'),
  n('p_newsprint', 'Newsprint', '新闻纸'),
  n('p_lwc', 'Light Weight Coated', '轻涂纸'),
  n('p_wlc', 'White Lined Cartonboard & Folding Carton', '白板&白卡'),
  n('p_artboard', 'Art Board', '铜板卡'),
  n('p_container', 'Containerboard', '箱板纸'),
  n('p_corrugated', 'Corrugated Paper', '瓦楞纸'),
];
const paperEdges: PEdge[] = [
  e('p_wood', 'p_printing'), e('p_bamboo', 'p_printing'), e('p_reed', 'p_printing'),
  e('p_wood', 'p_packaging'), e('p_reed', 'p_packaging'), e('p_bagasse', 'p_packaging'),
  e('p_bagasse', 'p_tissue'), e('p_straw', 'p_office'), e('p_recovered', 'p_special'),
  e('p_recovered', 'p_packaging'),
  e('p_printing', 'p_art'), e('p_printing', 'p_offset'), e('p_printing', 'p_newsprint'), e('p_printing', 'p_lwc'),
  e('p_packaging', 'p_wlc'), e('p_packaging', 'p_artboard'), e('p_packaging', 'p_container'), e('p_packaging', 'p_corrugated'),
];

export const diagrams: Diagram[] = [
  { id: 'chemease', titleEn: 'Chemical Product Coverage', titleZh: '化工产品覆盖面', nodes: mainNodes, edges: mainEdges },
  { id: 'c1', titleEn: 'C1 Market Coverage', titleZh: '产品覆盖范围', nodes: c1Nodes, edges: c1Edges },
  { id: 'paper', titleEn: 'Flow Chart of Paper', titleZh: '纸品生产流程', nodes: paperNodes, edges: paperEdges },
];
