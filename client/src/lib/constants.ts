import { Node, Edge } from 'reactflow';
import CustomNode from '@/components/custom-node';
import CustomEdge from '@/components/custom-edge';
import TextBoxNode from '@/components/text-box-node';

export type NodeType = 'simple' | 'scanner' | 'eject' | 'feed' | 'ptlzone' | 'sblzone';

export interface NodeData {
  code: string;
  type: NodeType;
  cmd: number;
  attrs: Record<string, string>;
}

export interface TextBoxData {
  text: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  textDecoration: string;
  textAlign: string;
  color: string;
  backgroundColor: string;
  width: number;
  height: number;
}

export const NODE_TYPES = {
  custom: CustomNode,
  textbox: TextBoxNode,
};

export const EDGE_TYPES = {
  custom: CustomEdge,
  smoothstep: CustomEdge,
};

export const NODE_TYPES_LIST: NodeType[] = ['simple', 'scanner', 'eject', 'feed', 'ptlzone', 'sblzone'];

export const DEFAULT_NODE_ATTRS: Record<NodeType, Record<string, string>> = {
  simple: {},
  scanner: {},
  eject: {},
  feed: { sblFeed: 'true' },
  ptlzone: {},
  sblzone: {},
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
  { key: 'xdockMapping', value: '', label: 'Xdock Mapping' },
  { key: 'routeId', value: '', label: 'Route ID' },
  { key: 'sequenceId', value: '', label: 'Sequence ID' },
  { key: 'zone', value: '', label: 'Zone' },
  { key: 'priority', value: '', label: 'Priority' },
  { key: 'capacity', value: '', label: 'Capacity' },
  { key: 'maxSpeed', value: '', label: 'Max Speed' },
  { key: 'conveyor', value: '', label: 'Conveyor' },
  { key: 'deviceId', value: '', label: 'Device ID' },
  { key: 'networkId', value: '', label: 'Network ID' },
  { key: 'status', value: 'active', label: 'Status' },
  { key: 'enabled', value: 'true', label: 'Enabled' },
];

export const EDGE_COLORS = {
  default: '#666666',
  blue: '#3b82f6',
  red: '#ef4444',
  green: '#22c55e',
};
