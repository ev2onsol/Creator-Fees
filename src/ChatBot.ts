/**
 * Creator SDK ChatBot
 * Handles conversational interface for token creation and fee management
 */

import { ChatMessage, ChatResponse, TokenCreateRequest, CreatorFeeClaimRequest } from './types';

export class CreatorChatBot {
  private messages: ChatMessage[] = [];
  private sessionData: any = {};

  /**
   * Process user message and return bot response
   */
  async processMessage(content: string): Promise<ChatResponse> {
    const userMessage: ChatMessage = {
      id: this.generateId(),
      content,
      sender: 'user',
      timestamp: new Date()
    };

    this.messages.push(userMessage);

    // Analyze message intent
    const intent = this.analyzeIntent(content);
    let response: ChatResponse;

    switch (intent.type) {
      case 'create_token':
        response = this.handleCreateToken(intent.data);
        break;
      
      case 'claim_fees':
        response = this.handleClaimFees(intent.data);
        break;
      
      case 'distribute_funds':
        response = this.handleDistributeFunds(intent.data);
        break;
      
      case 'check_status':
        response = this.handleCheckStatus();
        break;
      
      case 'help':
        response = this.handleHelp();
        break;
      
      default:
        response = this.handleUnknown();
    }

    const botMessage: ChatMessage = {
      id: this.generateId(),
      content: response.message,
      sender: 'bot',
      timestamp: new Date()
    };

    this.messages.push(botMessage);
    return response;
  }

  /**
   * Analyze user message to determine intent
   */
  private analyzeIntent(message: string): { type: string; data?: any } {
    const text = message.toLowerCase();

    // Token creation patterns
    if (text.includes('create') && (text.includes('token') || text.includes('coin'))) {
      return {
        type: 'create_token',
        data: this.extractTokenData(message)
      };
    }

    // Fee claiming patterns
    if (text.includes('claim') && text.includes('fee')) {
      return {
        type: 'claim_fees',
        data: this.extractFeeClaimData(message)
      };
    }

    // Distribution patterns
    if (text.includes('distribute') || text.includes('send') && text.includes('users')) {
      return {
        type: 'distribute_funds',
        data: this.extractDistributeData(message)
      };
    }

    // Status check patterns
    if (text.includes('status') || text.includes('balance') || text.includes('stats')) {
      return { type: 'check_status' };
    }

    // Help patterns
    if (text.includes('help') || text.includes('commands')) {
      return { type: 'help' };
    }

    return { type: 'unknown' };
  }

  private handleCreateToken(data: any): ChatResponse {
    if (data && data.name && data.symbol) {
      return {
        message: `I'll help you create the token "${data.name}" with symbol ${data.symbol}. Let me process this for you...`,
        actions: ['create_token'],
        data: data
      };
    } else {
      return {
        message: "I'd be happy to help you create a token! I need some information:\n\n• Token name (e.g., 'My Awesome Token')\n• Token symbol (e.g., 'MAT')\n• Description (optional)\n• Image URL (optional)\n\nPlease provide these details and I'll create your token on pump.fun!"
      };
    }
  }

  private handleClaimFees(): ChatResponse {
    return {
      message: "I'll check and claim any available creator fees from your tokens. This may take a moment...",
      actions: ['claim_fees']
    };
  }

  private handleDistributeFunds(data: any): ChatResponse {
    if (data && data.recipients) {
      return {
        message: `I'll distribute funds to ${data.recipients.length} recipients. Processing the distribution now...`,
        actions: ['distribute_funds'],
        data: data
      };
    } else {
      return {
        message: "To distribute funds, please provide recipient addresses and amounts. Example format:\n\n• Address1: 0.1 SOL\n• Address2: 0.2 SOL\n\nOr tell me how many users and I'll help you set up equal distribution!"
      };
    }
  }

  private handleCheckStatus(): ChatResponse {
    return {
      message: "Let me check your creator stats and token status...",
      actions: ['check_status']
    };
  }

  private handleHelp(): ChatResponse {
    return {
      message: `**Creator SDK Commands:**

🪙 **Create Token**: "Create a token called [name] with symbol [symbol]"
💰 **Claim Fees**: "Claim my creator fees"
📤 **Distribute**: "Distribute [amount] SOL to [recipients]"
📊 **Status**: "Check my status" or "Show my stats"
❓ **Help**: "Help" or "Show commands"

**Example Commands:**
• "Create a token called Moon Rocket with symbol MOON"
• "Claim my fees from all tokens"
• "Distribute 1 SOL equally to 10 users"
• "What's my current balance?"

Just type naturally and I'll understand what you want to do!`
    };
  }

  private handleUnknown(): ChatResponse {
    return {
      message: "I'm not sure what you'd like to do. Here are some things I can help with:\n\n• Create new tokens on pump.fun\n• Claim creator fees from your tokens\n• Distribute funds to multiple users\n• Check your creator stats\n\nType 'help' to see all available commands!"
    };
  }

  /**
   * Extract token creation data from message
   */
  private extractTokenData(message: string): TokenCreateRequest | null {
    const nameMatch = message.match(/(?:token|coin)\s+(?:called|named)\s+["']?([^"']+)["']?/i);
    const symbolMatch = message.match(/(?:symbol|ticker)\s+["']?([A-Z]+)["']?/i);
    
    if (nameMatch && symbolMatch) {
      return {
        name: nameMatch[1].trim(),
        symbol: symbolMatch[1].trim().toUpperCase()
      };
    }
    
    // Try alternative patterns
    const altMatch = message.match(/create\s+["']?([^"']+)["']?\s+(?:with\s+symbol\s+)?["']?([A-Z]+)["']?/i);
    if (altMatch) {
      return {
        name: altMatch[1].trim(),
        symbol: altMatch[2].trim().toUpperCase()
      };
    }

    return null;
  }

  /**
   * Extract fee claim data from message
   */
  private extractFeeClaimData(message: string): CreatorFeeClaimRequest {
    const poolMatch = message.match(/(?:from|on)\s+(meteora|pump)/i);
    return {
      pool: poolMatch ? (poolMatch[1].toLowerCase() as 'pump' | 'meteora-dbc') : 'pump'
    };
  }

  /**
   * Extract distribution data from message
   */
  private extractDistributeData(message: string): any {
    const amountMatch = message.match(/(\d+(?:\.\d+)?)\s*sol/i);
    const userCountMatch = message.match(/(\d+)\s+users?/i);
    
    if (amountMatch && userCountMatch) {
      const totalAmount = parseFloat(amountMatch[1]);
      const userCount = parseInt(userCountMatch[1]);
      const amountPerUser = totalAmount / userCount;
      
      return {
        totalAmount,
        userCount,
        amountPerUser,
        distributionType: 'equal'
      };
    }
    
    return null;
  }

  /**
   * Get conversation history
   */
  getMessages(): ChatMessage[] {
    return [...this.messages];
  }

  /**
   * Clear conversation history
   */
  clearMessages(): void {
    this.messages = [];
    this.sessionData = {};
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}