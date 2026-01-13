
import { Resource, Tier } from './types';

export const RESOURCES: Resource[] = [
  {
    id: 'eth_crystal',
    name: '以太结晶',
    tier: Tier.BASIC,
    icon: 'diamond',
    description: '纯净的能源结晶，是所有高阶合成的基础。',
    count: 142,
    unlocked: true,
  },
  {
    id: 'flux_alloy',
    name: '通量合金',
    tier: Tier.INTERMEDIATE,
    icon: 'category',
    description: '具有超导特性的金属材料。',
    count: 89,
    unlocked: true,
    ingredients: [
      { resourceId: 'eth_crystal', amount: 2 },
      { resourceId: 'precision_gear', amount: 1 }
    ]
  },
  {
    id: 'quantum_core',
    name: '量子核心',
    tier: Tier.ADVANCED,
    icon: 'energy_savings_leaf',
    description: '能够处理复杂逻辑的原子级芯片。',
    count: 12,
    unlocked: true,
    ingredients: [
      { resourceId: 'flux_alloy', amount: 3 },
      { resourceId: 'super_computer', amount: 1 }
    ]
  },
  {
    id: 'void_fragment',
    name: '虚空碎片',
    tier: Tier.MYTHIC,
    icon: 'hub',
    description: '来自未知维度的碎片，含有极高能量。',
    count: 0,
    unlocked: false,
  },
  {
    id: 'universal_catalyst',
    name: '通用催化剂',
    tier: Tier.MYTHIC,
    icon: 'hub',
    description: '一种稳定的异向化合物，能够绕过标准的热力学定律。是建造 4 级合成模块和跨维度逻辑单元的必需材料。',
    count: 5,
    unlocked: true,
    ingredients: [
      { resourceId: 'super_computer', amount: 4 },
      { resourceId: 'fusion_core', amount: 1 }
    ]
  },
  {
    id: 'reality_engine',
    name: '现实引擎',
    tier: Tier.MYTHIC,
    icon: 'cyclone',
    description: '能够重构局部现实的高级构件。',
    count: 2,
    unlocked: true,
    ingredients: [
      { resourceId: 'quantum_core', amount: 2 },
      { resourceId: 'universal_catalyst', amount: 1 }
    ]
  },
  {
    id: 'super_computer',
    name: '超级计算机',
    tier: Tier.ADVANCED,
    icon: 'memory',
    description: '高算力逻辑单元。',
    count: 12,
    unlocked: true,
    ingredients: [
      { resourceId: 'battery_pack', amount: 2 },
      { resourceId: 'precision_gear', amount: 2 }
    ]
  },
  {
    id: 'fusion_core',
    name: '聚变核心',
    tier: Tier.ADVANCED,
    icon: 'rocket_launch',
    description: '微型聚变能源站。',
    count: 0,
    unlocked: true,
    ingredients: [
      { resourceId: 'eth_crystal', amount: 10 },
      { resourceId: 'flux_alloy', amount: 5 }
    ]
  },
  {
    id: 'precision_gear',
    name: '精密齿轮',
    tier: Tier.INTERMEDIATE,
    icon: 'settings',
    description: '纳米级加工的传动件。',
    count: 45,
    unlocked: true,
  },
  {
    id: 'battery_pack',
    name: '高容电池组',
    tier: Tier.INTERMEDIATE,
    icon: 'battery_charging_full',
    description: '大容量电化学储能。',
    count: 32,
    unlocked: true,
  }
];
