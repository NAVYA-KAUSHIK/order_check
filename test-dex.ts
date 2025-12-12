import { MockDexService } from './src/services/mockDex';

async function test() {
    const dex = new MockDexService();
    console.log("--- Starting Test ---");
    
    // Ask for the best price
    const bestQuote = await dex.getBestQuote(1);
    
    console.log(`Winner: ${bestQuote.dex} at $${bestQuote.price}`);
    
    // Try to buy
    const result = await dex.executeTrade(bestQuote.dex, 1);
    console.log(`Trade Complete! Hash: ${result.txHash}`);
}

test();