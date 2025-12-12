# Order Execution Engine 

**Live Deployment:** [https://ordercheck-production.up.railway.app](https://ordercheck-production.up.railway.app)  
**Demo Video:** 

---

## Project Overview
**Order Execution Engine** built for the Solana ecosystem. This backend system acts as a DEX aggregator, simulating the routing of trade orders between **Raydium** and **Meteora**. It handles high concurrency using queues, ensures persistence via PostgreSQL, and provides real-time status updates to clients via WebSockets.

## Key Features
* **Smart DEX Routing:** Automatically compares quotes from Raydium and Meteora to execute the best price.
* **High Concurrency:** Implements **BullMQ (Redis)** to handle concurrent user requests without blocking the main thread.
* **Real-Time Updates:** Full WebSocket integration streaming order states (`pending` → `routing` → `building` → `confirmed`).
* **Persistent History:** All executed trades are audited and stored in a **PostgreSQL** database.
* **Robust Architecture:** Built with **Fastify** for low overhead and high speed.

## Tech Stack
* **Runtime:** Node.js & TypeScript
* **Server Framework:** Fastify (HTTP + WebSocket)
* **Message Queue:** BullMQ + Redis
* **Database:** PostgreSQL (via `pg` pool)
* **Deployment:** Railway (Dockerized Node + Managed Redis/Postgres)
* **Testing:** Jest

---

##  Design Decisions

### 1. Why "Market Order"?
I chose to implement **Market Orders** because they represent the fundamental use case of a DEX: immediate execution at the current best available price. This allowed me to focus on the core architectural challenges—latency, concurrency, and race conditions—without the added complexity of tracking state over long periods (like Limit orders).

### 2. Extensibility: Supporting Limit & Sniper Orders
The current architecture is designed to be easily extended:
* **Limit Orders:** I would add a `delayed` queue in BullMQ. A separate "Price Watcher" worker would poll prices every second and move matching orders from the `delayed` queue to the `execution` queue.
* **Sniper Orders:** I would integrate a Solana RPC listener. When a `LiquidityPoolCreated` event is detected on-chain, the listener would trigger an immediate job injection into the execution queue with high priority.

---

##  Setup & Installation (Local)

### Prerequisites
* Node.js (v18+)
* Redis & PostgreSQL

### 1. Clone & Install
```bash
git clone [https://github.com/NAVYA-KAUSHIK/order_check.git](https://github.com/NAVYA-KAUSHIK/order_check.git)
cd order_check
npm install
