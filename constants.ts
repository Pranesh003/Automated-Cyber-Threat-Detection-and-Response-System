import { ThreatAlert, ThreatSeverity, NetworkDataPoint, ThreatTypeDataPoint, Packet, XaiFeature, Honeypot, HoneypotLog, Playbook } from './types';

const threatTypes = ['DDoS Attack', 'Port Scan', 'Malware', 'SQL Injection', 'Unauthorized Access', 'Data Exfiltration'];
const locations = ['USA', 'China', 'Russia', 'Germany', 'Brazil', 'India', 'UK', 'Nigeria'];

const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomIP = () => `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

let isSpike = false;
let spikeEndTime = 0;

export const DEMO_BLOCK_DURATION_MS = 2 * 60 * 1000; // 2 minutes for demo

const getThreatDetails = (threatType: string): { targetService: string, payloadSignature: string } => {
    switch (threatType) {
        case 'DDoS Attack':
            return { targetService: 'HTTPS (443)', payloadSignature: 'SYN.Flood.Generic' };
        case 'Port Scan':
            return { targetService: 'Multiple', payloadSignature: 'Nmap.Stealth.Scan' };
        case 'Malware':
            return { targetService: 'HTTP (80)', payloadSignature: 'CobaltStrike.Beacon.HTTP' };
        case 'SQL Injection':
            return { targetService: 'HTTP (80)', payloadSignature: 'SQLi.Union.Attempt' };
        case 'Unauthorized Access':
            return { targetService: 'SSH (22)', payloadSignature: 'BruteForce.Login.Attempt' };
        case 'Data Exfiltration':
            return { targetService: 'DNS (53)', payloadSignature: 'DNS.Tunneling.Exfil' };
        default:
            return { targetService: 'Unknown', payloadSignature: 'Generic.Anomaly' };
    }
};


const generateXaiExplanation = (threatType: string, isHoneypotAlert: boolean = false): XaiFeature[] => {
  if (isHoneypotAlert) {
    return [
      { feature: 'Honeypot Interaction', score: 0.99 },
      { feature: 'Source IP Reputation', score: 0.8 },
      { feature: 'Probing Behavior', score: 0.65 },
    ].sort((a, b) => b.score - a.score);
  }
  
  const baseFeatures: XaiFeature[] = [
    { feature: 'Packet Rate Anomaly', score: Math.random() * 0.5 },
    { feature: 'Payload Entropy', score: Math.random() * 0.4 },
    { feature: 'Source IP Reputation', score: Math.random() * 0.6 },
    { feature: 'Unusual Port Activity', score: Math.random() * 0.5 },
  ];

  let explanation: XaiFeature[];

  switch (threatType) {
    case 'DDoS Attack':
      explanation = [
        { feature: 'Packet Rate Anomaly', score: 0.9 + Math.random() * 0.1 },
        { feature: 'Source IP Diversity', score: 0.8 + Math.random() * 0.15 },
        { feature: 'Connection State Saturation', score: 0.75 + Math.random() * 0.1 },
        { feature: 'Low Payload Entropy', score: 0.5 + Math.random() * 0.2 },
      ];
      break;
    case 'Port Scan':
      explanation = [
        { feature: 'Sequential Port Probing', score: 0.95 + Math.random() * 0.05 },
        { feature: 'Connection Failure Rate', score: 0.8 + Math.random() * 0.1 },
        { feature: 'Source IP Reputation', score: 0.6 + Math.random() * 0.2 },
        { feature: 'Low Data Transfer Volume', score: 0.4 + Math.random() * 0.1 },
      ];
      break;
    case 'Malware':
       explanation = [
        { feature: 'Known Malicious Signature', score: 0.98 + Math.random() * 0.02 },
        { feature: 'C2 Beaconing Pattern', score: 0.85 + Math.random() * 0.1 },
        { feature: 'DNS Tunneling Indicators', score: 0.7 + Math.random() * 0.15 },
        { feature: 'Payload Entropy', score: 0.6 + Math.random() * 0.2 },
      ];
      break;
    default:
      explanation = baseFeatures;
  }
  return explanation.sort((a, b) => b.score - a.score).slice(0, 4);
};

export const generateNewAlert = (honeypotLog?: HoneypotLog): ThreatAlert => {
  if (honeypotLog) {
      return {
          id: `alert-hp-${Date.now()}`,
          timestamp: new Date().toISOString(),
          ip: honeypotLog.attackerIp,
          type: 'Honeypot Interaction',
          severity: ThreatSeverity.HIGH,
          description: `High-confidence alert: Attacker interacted with ${honeypotLog.honeypotType} decoy.`,
          location: honeypotLog.attackerLocation,
          details: getThreatDetails('Unauthorized Access'),
          xaiExplanation: generateXaiExplanation('Honeypot Interaction', true),
      };
  }
  
  const isHighSeveritySpike = isSpike && Date.now() < spikeEndTime;
  
  const severity = isHighSeveritySpike 
    ? (Math.random() > 0.3 ? ThreatSeverity.HIGH : ThreatSeverity.MEDIUM) // During spike, 70% chance of HIGH
    : getRandomElement([ThreatSeverity.HIGH, ThreatSeverity.MEDIUM, ThreatSeverity.LOW]);
  
  const type = isHighSeveritySpike ? 'DDoS Attack' : getRandomElement(threatTypes);

  return {
    id: `alert-${Date.now()}-${Math.random()}`,
    timestamp: new Date().toISOString(),
    ip: getRandomIP(),
    type: type,
    severity,
    description: `Suspicious activity detected from ${getRandomIP()}. Potential ${type}.`,
    location: getRandomElement(locations),
    details: getThreatDetails(type),
    xaiExplanation: generateXaiExplanation(type),
  };
};

export const INITIAL_ALERTS: ThreatAlert[] = Array.from({ length: 20 }, () => generateNewAlert()).sort(
  (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
);

export const INITIAL_NETWORK_DATA: NetworkDataPoint[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setSeconds(date.getSeconds() - (30 - i) * 10);
  return {
    time: date.toLocaleTimeString(),
    incoming: Math.floor(Math.random() * (80 + i * 2) + 20),
    outgoing: Math.floor(Math.random() * (40 + i) + 10),
  };
});

export const INITIAL_THREAT_DISTRIBUTION: ThreatTypeDataPoint[] = [
  { name: 'DDoS Attack', value: 400 },
  { name: 'Malware', value: 300 },
  { name: 'Port Scan', value: 300 },
  { name: 'SQL Injection', value: 200 },
  { name: 'Unauthorized Access', value: 278 },
  { name: 'Data Exfiltration', value: 189 },
];

export const generateNewDataPoint = (): NetworkDataPoint => {
    // 1.5% chance to start a spike lasting 10-20 seconds
    if (!isSpike && Math.random() < 0.015) {
        isSpike = true;
        spikeEndTime = Date.now() + (10 + Math.random() * 10) * 1000;
    }

    if (isSpike && Date.now() >= spikeEndTime) {
        isSpike = false;
    }

    const incomingTraffic = isSpike 
        ? Math.floor(Math.random() * 100 + 150) // 150-250 MB/s during spike
        : Math.floor(Math.random() * 120 + 20); // 20-140 MB/s normal
    
    const outgoingTraffic = isSpike
        ? Math.floor(Math.random() * 50 + 70) // 70-120 MB/s during spike
        : Math.floor(Math.random() * 60 + 10); // 10-70 MB/s normal

    return {
        time: new Date().toLocaleTimeString(),
        incoming: incomingTraffic,
        outgoing: outgoingTraffic,
    };
};

const protocols: Packet['protocol'][] = ['TCP', 'UDP', 'ICMP'];
export const generateNewPacket = (): Packet => ({
  id: `pkt-${Date.now()}-${Math.random()}`,
  timestamp: new Date().toISOString(),
  sourceIp: getRandomIP(),
  destIp: getRandomIP(),
  sourcePort: Math.floor(Math.random() * 65535) + 1,
  destPort: Math.floor(Math.random() * 65535) + 1,
  protocol: getRandomElement(protocols),
  size: Math.floor(Math.random() * 1400) + 60, // Typical packet sizes
});

// --- Honeynet Constants ---
export const INITIAL_HONEYPOTS: Honeypot[] = [
    { id: 'hp-1', type: 'SSH', ip: '192.168.10.254', status: 'Active' },
    { id: 'hp-2', type: 'HTTP Web Server', ip: '192.168.10.253', status: 'Active' },
    { id: 'hp-3', type: 'FTP', ip: '192.168.10.252', status: 'Active' },
    { id: 'hp-4', type: 'SMB Share', ip: '192.168.10.251', status: 'Active' },
];

const honeypotAttackSummaries: Record<Honeypot['type'], string[]> = {
    'SSH': ["Login attempt with user 'root'", "SSH version scan", "Brute-force attempt detected"],
    'HTTP Web Server': ["Probing for '/.env'", "SQL injection attempt on login form", "Log4Shell vulnerability scan"],
    'FTP': ["Anonymous login attempt", "Directory traversal attempt", "Probing for open FTP port"],
    'SMB Share': ["Attempted to access ADMIN$ share", "Enum. users via SAMR", "WannaCry malware propagation attempt"],
};

export const generateNewHoneypotLog = (honeypots: Honeypot[]): HoneypotLog => {
    const targetHoneypot = getRandomElement(honeypots);
    return {
        id: `hplog-${Date.now()}`,
        timestamp: new Date().toISOString(),
        honeypotId: targetHoneypot.id,
        honeypotType: targetHoneypot.type,
        attackerIp: getRandomIP(),
        attackerLocation: getRandomElement(locations),
        summary: getRandomElement(honeypotAttackSummaries[targetHoneypot.type]),
    };
};

// --- SOAR Playbooks ---
export const DEFAULT_PLAYBOOKS: Playbook[] = [
    {
        id: 'PB-001',
        name: 'Malware Containment',
        description: 'Standard procedure for isolating and analyzing a potential malware infection.',
        appliesTo: ['Malware', 'Honeypot Interaction', 'Unauthorized Access'],
        steps: [
            { action: 'ISOLATE_HOST', description: 'Isolate host from the network to prevent lateral movement.' },
            { action: 'BLOCK_IP', description: 'Block the source IP address at the firewall.' },
            { action: 'SNAPSHOT_DISK', description: 'Take a forensic snapshot of the host\'s disk for analysis.' },
            { action: 'NOTIFY_SOC_LEAD', description: 'Send a high-priority notification to the SOC Lead.' },
        ],
        isCustom: false,
    },
    {
        id: 'PB-002',
        name: 'DDoS Mitigation',
        description: 'Procedure to mitigate an ongoing Distributed Denial-of-Service attack.',
        appliesTo: ['DDoS Attack'],
        steps: [
            { action: 'BLOCK_IP', description: 'Block the primary source IP (Note: often insufficient for DDoS).' },
            { action: 'NOTIFY_SOC_LEAD', description: 'Notify SOC Lead to engage upstream DDoS mitigation service.' },
        ],
        isCustom: false,
    },
    {
        id: 'PB-003',
        name: 'Suspicious Activity Triage',
        description: 'Initial triage for low-to-medium confidence alerts.',
        appliesTo: ['Port Scan', 'SQL Injection', 'Data Exfiltration', 'Anomalous Traffic Volume'],
        steps: [
            { action: 'BLOCK_IP', description: 'Temporarily block the source IP address.' },
            { action: 'NOTIFY_SOC_LEAD', description: 'Create a ticket for a Level 1 analyst to investigate further.' },
        ],
        isCustom: false,
    },
];