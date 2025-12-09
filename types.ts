export enum CampaignStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  REJECTED = 'REJECTED'
}

export enum PolicyStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface ReviewPolicy {
  status: PolicyStatus;
  reason: string;
  timestamp: number;
}

export interface Campaign {
  id: string;
  name: string;
  budget: number;
  adTextContent: string;
  adImageContent: string | null; // Base64 string
  keywords: string[];
  semanticDescription: string; // "Offline embedding" description
  reviewPolicy: ReviewPolicy;
  createdAt: number;
}

export interface CreateCampaignDraft {
  name: string;
  budget: number;
  adTextContent: string;
  adImageContent: string | null;
}

export type ViewState = 'LOGIN' | 'DASHBOARD' | 'CREATE';