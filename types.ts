
export enum ViewType {
  LOGISTICS = 'LOGISTICS',
  ENCYCLOPEDIA = 'ENCYCLOPEDIA'
}

export enum Tier {
  BASIC = 'BASIC',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  MYTHIC = 'MYTHIC'
}

export interface Resource {
  id: string;
  name: string;
  tier: Tier;
  icon: string;
  description: string;
  count: number;
  unlocked: boolean;
  ingredients?: { resourceId: string; amount: number }[];
}

export type BuildingType = 'hq' | 'extractor' | 'processor' | 'assembler' | 'storage' | 'power';

export interface Node {
  id: string;
  type: BuildingType;
  name: string;
  x: number;
  y: number;
  progress: number;
  status: 'idle' | 'working' | 'blocked' | 'no_power';
  inventory: Record<string, number>;
  inputs: string[];
  outputs: string[];
}

export interface Connection {
  id: string;
  fromId: string;
  toId: string;
}
