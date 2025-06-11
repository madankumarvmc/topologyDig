import { Node, Edge } from 'reactflow';
import CustomNode from '@/components/custom-node';
import CustomEdge from '@/components/custom-edge';

export type NodeType = 'simple' | 'scanner' | 'eject';

export interface NodeData {
  code: string;
  type: NodeType;
  cmd: number;
  attrs: Record<string, string>;
}

export const NODE_TYPES = {
  custom: CustomNode,
};

export const EDGE_TYPES = {
  custom: CustomEdge,
};

export const NODE_TYPES_LIST: NodeType[] = ['simple', 'scanner', 'eject'];

export const DEFAULT_NODE_ATTRS: Record<NodeType, Record<string, string>> = {
  simple: {},
  scanner: {},
  eject: {},
};

export const QUICK_ATTRIBUTES = [
  { key: 'junction', value: 'true', label: 'Junction' },
  { key: 'ptlFeed', value: 'true', label: 'PTL Feed' },
  { key: 'blockedHU', value: 'true', label: 'Blocked HU' },
  { key: 'emptyHU', value: 'true', label: 'Empty HU' },
  { key: 'misc', value: 'true', label: 'Misc' },
  { key: 'noEligibleZone', value: 'true', label: 'No Eligible Zone' },
  { key: 'qc', value: 'true', label: 'QC' },
  { key: 'sblFeed', value: 'true', label: 'SBL Feed' },
  { key: 'packedCHU', value: 'true', label: 'Packed CHU' },
  { key: 'emptyPackedCHU', value: 'true', label: 'Empty Packed CHU' },
  { key: 'ptlFeedControl', value: 'true', label: 'PTL Feed Control' },
];

export const EDGE_COLORS = {
  default: '#666666',
  blue: '#3b82f6',
  red: '#ef4444',
  green: '#22c55e',
};
