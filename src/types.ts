export type CreationMode = 
  | 'omni' 
  | 'web_app' 
  | 'code' 
  | 'architecture' 
  | 'document' 
  | 'science' 
  | 'visual_art';

export type IntelligenceTier = 
  | 'flash' 
  | 'reasoning_high' 
  | 'astro_supreme'
  | 'argon_ultra'
  | 'astro_4';

export type PersonaType = 
  | 'omni_architect' 
  | 'fullstack_engineer' 
  | 'uiux_designer' 
  | 'vc_strategist' 
  | 'chief_scientist' 
  | 'creative_author';

export type ViewMode = 'chat' | 'studio' | 'split';

export type PlanId = 
  | 'free' 
  | 'starter_50k' 
  | 'pro_150k' 
  | 'ultra_350k' 
  | 'titan_700k' 
  | 'vip_argon_astro_8m';

export interface PricingPlan {
  id: PlanId;
  name: string;
  price: number; // in IDR
  period: string;
  badge?: string;
  description: string;
  popular?: boolean;
  features: string[];
  maxDailyCreations: number;
  unlockedTiers: IntelligenceTier[];
}

export interface CodeBlock {
  language: string;
  code: string;
  filename?: string;
}

export interface CreationItem {
  id: string;
  title: string;
  prompt: string;
  mode: CreationMode;
  intelligenceTier: IntelligenceTier;
  persona: PersonaType;
  reasoning?: string;
  content: string;
  rawOutput: string;
  codeBlocks: CodeBlock[];
  previewHtml?: string;
  imageUrl?: string;
  createdAt: number;
  tags: string[];
}

export interface BusinessAppOutput {
  title: string;
  category: string;
  html: string;
  summary: string;
}

export type SandboxType = 'game' | 'app' | 'website';

export interface InteractiveSandboxItem {
  id: string;
  type: SandboxType;
  title: string;
  description: string;
  html: string;
  category?: string;
}

export type BlackArchToolType = 'aircrack' | 'hydra' | 'nmap' | 'sherlock';

export interface BlackArchSimulation {
  tool: BlackArchToolType;
  target: string;
  title: string;
  logs: string[];
  findings?: Array<{ label: string; value: string; status: 'safe' | 'warning' | 'critical' | 'info' }>;
  osintProfiles?: Array<{ platform: string; url: string; status: number }>;
}

export type DolphyProtocolType = 'infrared' | 'bluetooth' | 'nfc' | 'wifi_spectrum' | 'media_cast' | 'plugin' | 'subghz_frequency';

export interface DolphyProtocolSimulation {
  type: DolphyProtocolType;
  title: string;
  protocolName: string;
  frequencyOrBand?: string;
  payloadData: string;
  decodedInfo?: Array<{ label: string; value: string; detail?: string }>;
  rawHexOrTimings?: string;
  recommendedTool?: string;
}

export interface TvCommandCode {
  name: string;
  label: string;
  protocol: 'NEC' | 'Samsung32' | 'Sony12' | 'RC5' | 'RAW';
  address: string;
  command: string;
  frequency: number;
  rawTimings?: string;
}

export interface TvBrandProfile {
  id: string;
  name: string;
  countryOrType: string;
  protocol: 'NEC' | 'Samsung32' | 'Sony12' | 'RC5' | 'RAW';
  defaultFrequency: number;
  ipControlPort?: number;
  commands: Record<string, TvCommandCode>;
}

export interface UniversalTvRemoteData {
  initialBrand?: string;
  initialAction?: string;
  availableBrands?: string[];
  activeBrand: string;
  lastCommandSent?: string;
  lastCodeHex?: string;
  timestamp?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  imageUrl?: string;
  video?: string;
  videoName?: string;
  link?: { url: string; title?: string };
  generatedImage?: string;
  generatedVideo?: {
    videoUrl?: string;
    aspectRatio: string;
    resolution: string;
    fps: string;
    duration: string;
    thumbnail?: string;
  };
  businessApp?: BusinessAppOutput;
  sandboxItem?: InteractiveSandboxItem;
  blackArchSimulation?: BlackArchSimulation;
  dolphySimulation?: DolphyProtocolSimulation;
  tvRemoteSimulation?: UniversalTvRemoteData;
  isGeneratingImage?: boolean;
  isGeneratingVideo?: boolean;
  isGeneratingApp?: boolean;
  modelBadge?: string;
  reasoning?: string;
  previewHtml?: string;
  codeBlocks?: CodeBlock[];
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface TransactionRecord {
  id: string; // e.g. "#AI-PRO-87361"
  status: 'PENDING_VERIFICATION' | 'ACTIVE_PREMIUM' | 'REJECTED';
  planId: PlanId;
  planName: string;
  amount: number;
  timestamp: number;
  gopayTarget: string;
  clientSessionId: string;
  approvedAt?: number;
  approvedBy?: string;
}

export interface UserAuditLog {
  id: string;
  sessionId: string;
  action: string;
  timestamp: number;
  details?: string;
}

export interface OneTimeLicense {
  key: string; // e.g. "GP-TITAN-8391-4209"
  planId: PlanId;
  planName: string;
  createdAt: number;
  isUsed: boolean;
  usedAt?: number;
  usedBySessionId?: string;
}

export interface OneTimePasscode5H {
  code: string; // e.g. "GPAI-5H-A82F-9C14"
  createdAt: number;
  expiresAt: number; // 5 hours after creation
  isRedeemed: boolean;
  redeemedAt?: number;
  redeemedBySessionId?: string;
  creatorSessionId?: string;
  label?: string;
}

export interface ActivePasscodeSession {
  code: string;
  activatedAt: number;
  expiresAt: number;
  grantedPlan: PlanId;
}

export interface UserProfile {
  email: string;
  name: string;
  isAdmin: boolean;
  role: 'developer' | 'premium_user' | 'free_user';
  createdAt: number;
  planId: PlanId;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'promo' | 'system' | 'quota';
  timestamp: number;
  read: boolean;
  badge?: string;
  linkAction?: 'pricing' | 'install' | 'token_topup';
}

export type AppEdition = 'public' | 'developer';
export type DeviceTarget = 'auto' | 'mobile' | 'windows';

export interface AppUpdateConfig {
  version: string;
  releaseDate: string;
  announcement: string;
  isMaintenance: boolean;
  targetPlatform: 'all' | 'handphone' | 'windows';
  changelog: string[];
}
