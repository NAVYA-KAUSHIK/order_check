async function sendOrder() {
    const response = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 10 })
    });
    const data = await response.json();
    console.log("API Response:", data);
}
sendOrder();