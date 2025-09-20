Creator SDK - Pump.fun Integration
A conversational SDK for creating tokens on pump.fun and managing creator fees through a chatbot interface.

Features
🤖 Chatbot Interface - Natural language commands for all operations 🪙 Token Creation - Create new tokens on pump.fun 💰 Fee Claiming - Automatically claim creator fees from your tokens 📤 Fund Distribution - Distribute claimed fees to multiple users 📊 Analytics - Track your token creation and earnings

Quick Start
import { CreatorSDK } from './src/index';
// Initialize the SDK
const sdk = new CreatorSDK({
  pumpfun: {
    apiKey: 'your-pumpfun-api-key',
    priorityFee: 0.000001
  },
  solana: {
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    privateKey: 'your-base64-private-key' // optional
  }
});
await sdk.initialize();
// Chat with the bot
const response = await sdk.chat("Create a token called Moon Rocket with symbol MOON");
console.log(response.message);
// Direct API calls
const tokenResult = await sdk.createToken({
  name: "My Token",
  symbol: "MT",
  description: "An awesome token",
  initialBuySOL: 0.01
});
// Claim fees
const feesResult = await sdk.claimFees({ pool: 'pump' });
// Check stats
const stats = await sdk.getStats();
Chat Commands
The chatbot understands natural language. Try these commands:

"Create a token called [name] with symbol [symbol]"
"Claim my creator fees"
"Distribute 1 SOL to 10 users"
"What's my status?"
"Help me get started"
API Reference
CreatorSDK
new CreatorSDK(config)
Creates a new SDK instance.

async initialize()
Initialize the SDK and test connections.

async chat(message: string)
Process a natural language message and execute actions.

async createToken(request: TokenCreateRequest)
Create a new token on pump.fun.

async claimFees(request: CreatorFeeClaimRequest)
Claim creator fees from your tokens.

async distributeFunds(request: DistributeRequest)
Distribute funds to multiple recipients.

async getStats()
Get your creator statistics.

Configuration
interface CreatorSDKConfig {
  pumpfun: {
    apiKey: string;
    baseUrl?: string; // defaults to https://pumpportal.fun/api
    priorityFee?: number; // defaults to 0.000001
  };
  solana: {
    rpcUrl: string;
    privateKey?: string; // Base58 encoded, required for distributions
  };
  wallet?: {
    publicKey: string;
  };
}
Examples
Create Token via Chat
const response = await sdk.chat("Create a token called Diamond Hands with symbol DIAMOND");
// Bot will create the token and respond with transaction details
Claim All Creator Fees
const response = await sdk.chat("Claim my creator fees");
// Bot will claim all available fees from pump.fun
Distribute to Community
const response = await sdk.chat("Distribute 5 SOL equally to 50 community members");
// Bot will help set up the distribution
Error Handling
All methods return success/error objects:

const result = await sdk.createToken(request);
if (result.success) {
  console.log('Token created:', result.mint);
} else {
  console.error('Error:', result.error);
}
Requirements
Node.js 16+
Pump.fun API key
Solana RPC endpoint
Private key for fund distributions (optional for token creation)
License
MIT
