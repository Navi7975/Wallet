Perfect 👍
Below is a complete, clean, copy-paste–ready README.md that matches your exact backend structure, includes manual seed instructions, and explains JS + TS coexistence clearly.
________________________________________
💳 Wallet Manager Backend
A ledger-based wallet management backend built with Node.js, Express, Sequelize, and TypeScript.
It supports users, wallets, transactions, accurate balances, idempotent operations, and manual database seeding.
________________________________________
🚀 Features
•	👤 User management
•	👛 Wallet per user
•	💰 Ledger-based balance calculation
•	🔄 Add funds & purchase transactions
•	🧾 Transaction & balance history
•	🔁 Idempotency-safe transactions
•	🔐 Database transactions & row locking
•	♻️ Deadlock retry handling
•	🌱 Manual database seeding
________________________________________
🛠 Tech Stack
•	Node.js
•	Express
•	TypeScript / JavaScript
•	Sequelize ORM
•	MySQL / PostgreSQL
•	Ledger-based accounting
________________________________________

⚙️ Installation
cd Backend
npm install
________________________________________
🔑 Environment Variables
Create a .env file in the Backend root:
DB_NAME=wallet_db
DB_USER=root
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_DIALECT=mysql
________________________________________
▶️ Running the Server
Development (TypeScript)
npm run dev
Production / JS
node server.js
Server runs at:
http://localhost:5000
________________________________________
🌱 Database Seeding (Manual)
⚠️ Seed runs manually — not automatically
What the Seed Does
•	Creates SYSTEM_TREASURY user
•	Creates wallets for:
o	Treasury
o	Alice
o	Bob
•	Transfers funds:
o	Treasury → Alice : 1000
o	Treasury → Bob : 500
•	Uses ledger entries for accuracy
________________________________________
Run Seed (TypeScript)
npx ts-node seed/seed.ts
OR Run Seed (JavaScript)
node seed/seed.js
After running:
•	Initial balances are ready
•	App can be tested immediately
________________________________________
📌 API Endpoints
👤 Users
Create User
POST /api/users
{
  "name": "John"
}
Get Users
GET /api/users
________________________________________
👛 Wallets
Create Wallet
POST /api/wallet/create
{
  "userId": 1,
  "assetType": "Coins"
}
Get All Wallets
GET /api/wallet
________________________________________
💰 Balance
Get Wallet Balance
GET /api/wallet/:walletId/balance
{
  "balance": 1600
}
________________________________________
🧾 Transaction History
GET /api/wallet/:walletId/history
Returns ledger entries sorted by latest.
________________________________________
🔄 Create Transaction
POST /api/wallet/transaction
Add Funds
{
  "walletId": 1,
  "amount": 100,
  "type": "add",
  "idempotencyKey": "add-unique-123"
}
Purchase
{
  "walletId": 1,
  "amount": 500,
  "type": "purchase",
  "idempotencyKey": "purchase-unique-001"
}
________________________________________
🧠 Balance Logic (Important)
•	Wallet balance is never stored
•	Calculated using:
SUM(Ledger.amount WHERE walletId = X)
Action	Ledger Entry
Add funds	+amount
Purchase	-amount
✔ Accurate
✔ Auditable
✔ Financially safe
________________________________________
🔁 Idempotency Handling
•	Every transaction requires idempotencyKey
•	Duplicate keys are ignored safely
•	Prevents:
o	Double payments
o	Retry duplicates
o	Network glitches
________________________________________
♻️ Deadlock Retry Utility
withRetry(fn, retries)
•	Automatically retries on DB deadlocks
•	Safe for concurrent wallet operations
•	Used in transaction creation
________________________________________
🛡 Safety Features
•	Database transactions
•	Row-level locking
•	Insufficient balance checks
•	Deadlock retries
•	Atomic ledger writes
________________________________________
🧪 Recommended Test Flow
1.	Run seed
2.	Start server
3.	Fetch wallets
4.	Check balances
5.	Add funds
6.	Make purchase
7.	Verify ledger & history

