import { Queue, Worker } from 'bullmq';
import { redisClient, pgPool } from './config'; // Import pgPool
import { MockDexService } from './services/mockDex';
import { websocketManager } from './websocketManager';

export const orderQueue = new Queue('order-queue', {
    connection: redisClient
});

const dexService = new MockDexService();

const worker = new Worker('order-queue', async (job) => {
    const { amount, orderId } = job.data;
    
    // 1. Processing
    websocketManager.notify(orderId, 'processing', { message: 'Worker started job' });
    
    // 2. Routing
    await job.updateProgress(10); 
    websocketManager.notify(orderId, 'routing', { message: 'Checking prices on DEXs...' });
    
    const quote = await dexService.getBestQuote(amount);
    
    // 3. Building
    await job.updateProgress(50);
    websocketManager.notify(orderId, 'building', { 
        message: `Found best price on ${quote.dex}: $${quote.price}` 
    });

    // 4. Execution
    const result = await dexService.executeTrade(quote.dex, amount);
    
    // 5. SAVE TO DATABASE (The New Part)
    try {
        await pgPool.query(
            `INSERT INTO orders (order_id, amount, dex, price, tx_hash, status) 
             VALUES ($1, $2, $3, $4, $5, 'confirmed')`,
            [orderId, amount, quote.dex, quote.price, result.txHash]
        );
        console.log(`💾 Saved order ${orderId} to Database.`);
    } catch (dbError) {
        console.error("❌ Failed to save to DB:", dbError);
    }

    // 6. Confirm to User
    await job.updateProgress(100);
    websocketManager.notify(orderId, 'confirmed', { 
        txHash: result.txHash,
        price: quote.price
    });
    
    return result;

}, {
    connection: redisClient,
    concurrency: 2
});

worker.on('failed', async (job, err) => {
    if (job) {
        // Log failure to DB
        const { orderId, amount } = job.data;
        await pgPool.query(
            `INSERT INTO orders (order_id, amount, status) VALUES ($1, $2, 'failed')`,
            [orderId, amount]
        ).catch(e => console.error(e));

        websocketManager.notify(orderId, 'failed', { error: err.message });
    }
});

console.log("⚙️  Queue System Initialized");