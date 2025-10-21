export enum ThreatSeverity {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
}

export interface XaiFeature {
  feature: string;
  score: number; // Represents contribution to the detection
}

export interface ThreatAlert {
  id: string;
  timestamp: string;
  ip: string;
  type: string;
  severity: ThreatSeverity;
  description: string;
  location: string;
  details: {
    targetService: string;
    payloadSignature: string;
  };
  source?: 'API';
  xaiExplanation?: XaiFeature[];
}

export interface NetworkDataPoint {
  time: string;
  incoming: number;
  outgoing: number;
}

export interface ThreatTypeDataPoint {
  name: string;
  value: number;
}

export type ToastType = 'success' | 'info' | 'error';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

export type PlaybookAction = 'BLOCK_IP' | 'ISOLATE_HOST' | 'SNAPSHOT_DISK' | 'NOTIFY_SOC_LEAD';
export type ActionType = PlaybookAction | 'DISMISS' | 'CONFIRM_THREAT' | 'MARK_FALSE_POSITIVE';


export interface BlockedIP {
  ip: string;
  expiresAt: number; // Timestamp in milliseconds
  threatType: string;
}

export interface Packet {
  id: string;
  timestamp: string;
  sourceIp: string;
  destIp: string;
  sourcePort: number;
  destPort: number;
  protocol: 'TCP' | 'UDP' | 'ICMP';
  size: number; // in bytes
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface Settings {
  notificationsEnabled: boolean;
  notificationEndpoint: string;
  mediumSeverityThreshold: number;
  highSeverityThreshold: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  canRollback: boolean;
  isRolledBack: boolean;
}

export interface ThreatActorProfile {
    threatActorGroup: string;
    confidence: number; // A score from 0 to 1
    motivation: string;
    mitreTTPs: string[];
}

export interface Honeypot {
  id: string;
  type: 'SSH' | 'FTP' | 'HTTP Web Server' | 'SMB Share';
  ip: string;
  status: 'Active' | 'Compromised';
}

export interface HoneypotLog {
  id: string;
  timestamp: string;
  honeypotId: string;
  honeypotType: Honeypot['type'];
  attackerIp: string;
  attackerLocation: string;
  summary: string;
}

export interface PlaybookStep {
    action: PlaybookAction;
    description: string;
}

export interface Playbook {
    id: string;
    name: string;
    description: string;
    appliesTo: string[]; // Threat types
    steps: PlaybookStep[];
    isCustom?: boolean;
}