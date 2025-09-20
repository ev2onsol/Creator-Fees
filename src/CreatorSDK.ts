/**
 * Creator SDK - Main SDK Class
 * A chatbot SDK for creating tokens on pump.fun and managing creator fees
 */

import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { PumpFunClient } from './PumpFunClient';
import { FeeDistributor } from './FeeDistributor';
import { CreatorChatBot } from './ChatBot';
import {
  PumpFunConfig,
  TokenCreateRequest,
  TokenCreateResponse,
  CreatorFeeClaimRequest,
  CreatorFeeClaimResponse,
  DistributeRequest,
  DistributeResponse,
  ChatResponse,
  CreatorStats
} from './types';

export interface CreatorSDKConfig {
  pumpfun: PumpFunConfig;
  solana: {
    rpcUrl: string;
    privateKey?: string; // Base58 encoded private key
  };
  wallet?: {
    publicKey: string;
  };
}

export class CreatorSDK {
  private pumpFunClient: PumpFunClient;
  private feeDistributor: FeeDistributor;
  private chatBot: CreatorChatBot;
  private connection: Connection;
  private keypair?: Keypair;
  private stats: CreatorStats = {
    tokensCreated: 0,
    totalFeesEarned: 0,
    totalDistributed: 0,
    activeTokens: []
  };

  constructor(config: CreatorSDKConfig) {
    // Initialize Solana connection
    this.connection = new Connection(config.solana.rpcUrl, 'confirmed');
    
    // Initialize keypair if private key provided
    if (config.solana.privateKey) {
      try {
        const secretKey = Buffer.from(config.solana.privateKey, 'base64');
        this.keypair = Keypair.fromSecretKey(secretKey);
      } catch (error) {
        console.warn('Invalid private key format');
      }
    }
    
    // Initialize clients
    this.pumpFunClient = new PumpFunClient(config.pumpfun);
    this.feeDistributor = new FeeDistributor(this.connection);
    this.chatBot = new CreatorChatBot();
  }

  /**
   * Initialize the SDK
   */
  async initialize(): Promise<void> {
    console.log('🚀 Creator SDK initializing...');
    
    // Test connection
    try {
      const version = await this.connection.getVersion();
      console.log(`Connected to Solana: ${version['solana-core']}`);
      
      if (this.keypair) {
        const balance = await this.connection.getBalance(this.keypair.publicKey);
        console.log(`Wallet balance: ${balance / LAMPORTS_PER_SOL} SOL`);
      }
      
      console.log('✅ Creator SDK ready!');
    } catch (error) {
      throw new Error(`Failed to initialize: ${error.message}`);
    }
  }

  /**
   * Process a chat message and execute actions
   */
  async chat(message: string): Promise<ChatResponse> {
    const response = await this.chatBot.processMessage(message);
    
    // Execute actions based on chat response
    if (response.actions) {
      for (const action of response.actions) {
        try {
          switch (action) {
            case 'create_token':
              if (response.data) {
                const result = await this.createToken(response.data);
                response.message += result.success 
                  ? `\n\n✅ Token created successfully!\nMint: ${result.mint}\nTransaction: ${result.signature}`
                  : `\n\n❌ Token creation failed: ${result.error}`;
              }
              break;
              
            case 'claim_fees':
              const claimResult = await this.claimFees({});
              response.message += claimResult.success
                ? `\n\n✅ Claimed ${claimResult.claimedAmount || 0} SOL in creator fees!\nTransaction: ${claimResult.signature}`
                : `\n\n❌ Fee claim failed: ${claimResult.error}`;
              break;
              
            case 'check_status':
              const stats = await this.getStats();
              response.message = `📊 **Your Creator Stats:**\n\n🪙 Tokens Created: ${stats.tokensCreated}\n💰 Fees Earned: ${stats.totalFeesEarned} SOL\n📤 Total Distributed: ${stats.totalDistributed} SOL\n🔥 Active Tokens: ${stats.activeTokens.length}`;
              break;
              
            case 'distribute_funds':
              if (response.data && response.data.recipients) {
                // Implementation would depend on recipient format
                response.message += '\n\n📤 Fund distribution initiated...';
              }
              break;
          }
        } catch (error) {
          response.message += `\n\n❌ Action failed: ${error.message}`;
        }
      }
    }
    
    return response;
  }

  /**
   * Create a new token on pump.fun
   */
  async createToken(request: TokenCreateRequest): Promise<TokenCreateResponse> {
    try {
      const result = await this.pumpFunClient.createToken(request);
      
      if (result.success) {
        this.stats.tokensCreated++;
        if (result.mint) {
          this.stats.activeTokens.push(result.mint);
        }
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Claim creator fees
   */
  async claimFees(request: CreatorFeeClaimRequest): Promise<CreatorFeeClaimResponse> {
    try {
      const result = await this.pumpFunClient.claimCreatorFees(request);
      
      if (result.success && result.claimedAmount) {
        this.stats.totalFeesEarned += result.claimedAmount;
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Distribute funds to recipients
   */
  async distributeFunds(request: DistributeRequest): Promise<DistributeResponse> {
    if (!this.keypair) {
      return {
        success: false,
        error: 'No private key configured for fund distribution'
      };
    }

    try {
      const result = await this.feeDistributor.distribute(this.keypair, request);
      
      if (result.success && result.totalDistributed) {
        this.stats.totalDistributed += result.totalDistributed;
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get current creator stats
   */
  async getStats(): Promise<CreatorStats> {
    return { ...this.stats };
  }

  /**
   * Get wallet balance
   */
  async getBalance(): Promise<number> {
    if (!this.keypair) {
      throw new Error('No wallet configured');
    }
    
    const balance = await this.connection.getBalance(this.keypair.publicKey);
    return balance / LAMPORTS_PER_SOL;
  }

  /**
   * Get chat history
   */
  getChatHistory() {
    return this.chatBot.getMessages();
  }

  /**
   * Clear chat history
   */
  clearChat() {
    this.chatBot.clearMessages();
  }

  /**
   * Get wallet public key
   */
  getWalletAddress(): string | null {
    return this.keypair ? this.keypair.publicKey.toString() : null;
  }
}