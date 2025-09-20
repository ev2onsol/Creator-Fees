/**
 * Creator SDK Types - Pump.fun Integration
 */

export interface PumpFunConfig {
  apiKey: string;
  baseUrl?: string;
  priorityFee?: number;
}

export interface TokenCreateRequest {
  name: string;
  symbol: string;
  description?: string;
  imageUrl?: string;
  initialBuySOL?: number;
}

export interface TokenCreateResponse {
  success: boolean;
  mint?: string;
  signature?: string;
  error?: string;
}

export interface CreatorFeeClaimRequest {
  mint?: string; // Optional for pump.fun, required for meteora
  pool?: 'pump' | 'meteora-dbc';
  priorityFee?: number;
}

export interface CreatorFeeClaimResponse {
  success: boolean;
  signature?: string;
  claimedAmount?: number;
  error?: string;
}

export interface DistributeRequest {
  recipients: Array<{
    address: string;
    amount: number;
  }>;
  message?: string;
}

export interface DistributeResponse {
  success: boolean;
  signatures?: string[];
  totalDistributed?: number;
  error?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface ChatResponse {
  message: string;
  actions?: string[];
  data?: any;
}

export interface CreatorStats {
  tokensCreated: number;
  totalFeesEarned: number;
  totalDistributed: number;
  activeTokens: string[];
}