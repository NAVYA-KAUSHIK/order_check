const WebSocket = require('ws');

async function runLiveTest() {
    console.log("1. Submitting Order...");
    
    // Step 1: POST request to create order
    const response = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 50 })
    });
    const data = await response.json();
    console.log(`   Order Created: ${data.orderId}`);

    // Step 2: Connect to WebSocket to listen for updates
    console.log("2. Connecting to WebSocket...");
    const ws = new WebSocket(`ws://localhost:3000/ws?orderId=${data.orderId}`);

    ws.on('open', () => {
        console.log("   ✅ WebSocket Connected! Waiting for updates...");
    });

    ws.on('message', (msg) => {
        const update = JSON.parse(msg.toString());
        console.log(`   📩 UPDATE RECEIVED: [${update.status}]`, update);
        
        if (update.status === 'confirmed' || update.status === 'failed') {
            console.log("   🎉 Process Finished. Closing.");
            ws.close();
        }
    });
}

runLiveTest();