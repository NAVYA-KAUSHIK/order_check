// src/services/mockDex.ts

interface Quote {
    dex: 'Raydium' | 'Meteora';
    price: number;
    fee: number;
}

export class MockDexService {
    
    // Helper: Pauses the code
    private async sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 1. Get a Fake Price from Raydium
    // Matches Guide: basePrice * (0.98 + random * 0.04)
    async getRaydiumQuote(tokenIn: string, tokenOut: string, amount: number): Promise<Quote> {
        await this.sleep(200); 
        const basePrice = 100; // Assume 1 SOL = $100 for simplicity
        const price = basePrice * (0.98 + Math.random() * 0.04); 
        
        return { 
            dex: 'Raydium', 
            price: parseFloat(price.toFixed(2)), 
            fee: 0.003 
        };
    }

    // 2. Get a Fake Price from Meteora
    // Matches Guide: basePrice * (0.97 + random * 0.05)
    async getMeteoraQuote(tokenIn: string, tokenOut: string, amount: number): Promise<Quote> {
        await this.sleep(200);
        const basePrice = 100;
        const price = basePrice * (0.97 + Math.random() * 0.05);
        
        return { 
            dex: 'Meteora', 
            price: parseFloat(price.toFixed(2)), 
            fee: 0.002 
        };
    }

    // 3. Compare and Pick the Best
    async getBestQuote(amount: number): Promise<Quote> {
        // We hardcode 'SOL' and 'USDC' just to satisfy the new signature
        const [raydium, meteora] = await Promise.all([
            this.getRaydiumQuote('SOL', 'USDC', amount),
            this.getMeteoraQuote('SOL', 'USDC', amount)
        ]);

        // Compare prices (Lower is better for BUYING, Higher is better for SELLING)
        // Assuming we are BUYING SOL, we want the lower price.
        if (raydium.price < meteora.price) {
            return raydium;
        } else {
            return meteora;
        }
    }

    // 4. Simulate the Trade execution
    // Matches Guide: sleep(2000 + random * 1000)
    async executeTrade(dex: string, amount: number) {
        // Random delay between 2000ms and 3000ms
        const delay = 2000 + Math.random() * 1000;
        await this.sleep(delay); 

        return {
            success: true,
            txHash: 'solana_tx_' + Math.random().toString(36).substring(7),
            executedPrice: 100 
        };
    }
}