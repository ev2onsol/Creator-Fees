/**
 * Creator SDK Example Usage
 * 
 * Demonstrates how to use the Creator SDK for pump.fun integration
 */

import { CreatorSDK } from './src/index.js';

async function main() {
  console.log('🚀 Creator SDK Example Starting...');

  // Initialize the SDK
  const sdk = new CreatorSDK({
    pumpfun: {
      apiKey: process.env.PUMPFUN_API_KEY || 'your-api-key-here',
      priorityFee: 0.000001
    },
    solana: {
      rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
      privateKey: process.env.SOLANA_PRIVATE_KEY // Optional, for distributions
    }
  });

  try {
    // Initialize
    await sdk.initialize();
    console.log('✅ SDK initialized successfully');

    // Example 1: Create token via chat
    console.log('\n--- Example 1: Create Token via Chat ---');
    let response = await sdk.chat("Create a token called Example Token with symbol EXP");
    console.log('Bot Response:', response.message);

    // Example 2: Claim fees via chat
    console.log('\n--- Example 2: Claim Creator Fees ---');
    response = await sdk.chat("Claim my creator fees from all tokens");
    console.log('Bot Response:', response.message);

    // Example 3: Check status
    console.log('\n--- Example 3: Check Status ---');
    response = await sdk.chat("What's my current status and balance?");
    console.log('Bot Response:', response.message);

    // Example 4: Direct API usage
    console.log('\n--- Example 4: Direct API Usage ---');
    
    const tokenResult = await sdk.createToken({
      name: "Direct API Token",
      symbol: "DAT",
      description: "Created directly via API",
      initialBuySOL: 0.001
    });
    
    if (tokenResult.success) {
      console.log('✅ Token created directly:', tokenResult.mint);
    } else {
      console.log('❌ Token creation failed:', tokenResult.error);
    }

    // Example 5: Get stats
    console.log('\n--- Example 5: Creator Stats ---');
    const stats = await sdk.getStats();
    console.log('Creator Stats:', {
      tokensCreated: stats.tokensCreated,
      feesEarned: `${stats.totalFeesEarned} SOL`,
      distributed: `${stats.totalDistributed} SOL`,
      activeTokens: stats.activeTokens.length
    });

    // Example 6: Interactive chat session
    console.log('\n--- Example 6: Interactive Chat ---');
    
    const chatMessages = [
      "Hello, I'm new here. Can you help me?",
      "I want to create a meme coin",
      "Create a token called Doge Moon with symbol DOGEM",
      "How can I claim fees from my tokens?",
      "Show me all available commands"
    ];

    for (const message of chatMessages) {
      console.log(`\nUser: ${message}`);
      const response = await sdk.chat(message);
      console.log(`Bot: ${response.message}`);
      
      // Small delay between messages
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Example 7: Chat history
    console.log('\n--- Example 7: Chat History ---');
    const history = sdk.getChatHistory();
    console.log(`Chat history contains ${history.length} messages`);
    console.log('Latest messages:');
    history.slice(-4).forEach(msg => {
      console.log(`${msg.sender}: ${msg.content.substring(0, 100)}...`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n🎉 Example completed!');
}

// Run the example
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}