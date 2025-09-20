/**
 * PumpFun API Client
 * Handles communication with pump.fun APIs for token creation and fee claiming
 */

import {
  PumpFunConfig,
  TokenCreateRequest,
  TokenCreateResponse,
  CreatorFeeClaimRequest,
  CreatorFeeClaimResponse
} from './types';

export class PumpFunClient {
  private config: PumpFunConfig;
  private baseUrl: string;

  constructor(config: PumpFunConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || 'https://pumpportal.fun/api';
  }

  /**
   * Create a new token on pump.fun
   */
  async createToken(request: TokenCreateRequest): Promise<TokenCreateResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/trade?api-key=${this.config.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          name: request.name,
          symbol: request.symbol,
          description: request.description,
          image: request.imageUrl,
          initialBuySOL: request.initialBuySOL || 0.01,
          priorityFee: this.config.priorityFee || 0.000001,
        })
      });

      const data = await response.json();
      
      if (data.signature) {
        return {
          success: true,
          mint: data.mint,
          signature: data.signature
        };
      } else {
        return {
          success: false,
          error: data.error || 'Token creation failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Network error: ${error.message}`
      };
    }
  }

  /**
   * Claim creator fees from pump.fun
   */
  async claimCreatorFees(request: CreatorFeeClaimRequest): Promise<CreatorFeeClaimResponse> {
    try {
      const body: any = {
        action: 'collectCreatorFee',
        priorityFee: request.priorityFee || this.config.priorityFee || 0.000001,
        pool: request.pool || 'pump'
      };

      // Add mint for meteora-dbc
      if (request.pool === 'meteora-dbc' && request.mint) {
        body.mint = request.mint;
      }

      const response = await fetch(`${this.baseUrl}/trade?api-key=${this.config.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      
      if (data.signature || typeof data === 'string') {
        return {
          success: true,
          signature: data.signature || data,
          claimedAmount: data.amount || 0
        };
      } else {
        return {
          success: false,
          error: data.error || 'Fee claim failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Network error: ${error.message}`
      };
    }
  }

  /**
   * Get local transaction for manual signing
   */
  async getLocalTransaction(request: any, publicKey: string): Promise<Uint8Array> {
    try {
      const response = await fetch(`${this.baseUrl}/trade-local`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          publicKey
        })
      });

      return new Uint8Array(await response.arrayBuffer());
    } catch (error) {
      throw new Error(`Failed to get local transaction: ${error.message}`);
    }
  }
}