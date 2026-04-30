const fs = require("fs");

// Node fetch fix (works in GitHub Actions)
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const FILE = "atlas-log.json";
const API_KEY = process.env.ETHERSCAN_API_KEY;

// 🔐 Fail fast if key is missing
if (!API_KEY) {
  console.error("❌ Missing ETHERSCAN_API_KEY");
  process.exit(1);
}

// 👇 CHANGE THIS wallet anytime
const WALLET = "0x1d6038A425059545996eB14E34cFb8A3b7791Ec5";

// 🔍 Fetch transactions safely
async function getTransactions(address) {
  try {
    const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${API_KEY}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "1") {
      console.log("⚠️ Etherscan warning:", data.message);
      return [];
    }

    return data.result || [];
  } catch (err) {
    console.error("❌ Fetch error:", err);
    return [];
  }
}

// 🧠 Main logic
async function run() {
  const txs = await getTransactions(WALLET);

  let riskFlags = [];
  let score = 100;

  // 🚩 No transactions
  if (txs.length === 0) {
    riskFlags.push("No transaction history");
    score -= 40;
  }

  // 🚩 Very high activity
  if (txs.length > 1000) {
    riskFlags.push("High activity wallet");
    score -= 10;
  }

  // 🚩 Smart contract interaction
  const contractTxs = txs.filter(
    tx => tx.to && tx.input && tx.input !== "0x"
  );

  if (contractTxs.length > 50) {
    riskFlags.push("Heavy smart contract interaction");
    score -= 15;
  }

  // 🚩 Wallet age
  if (txs.length > 0) {
    const firstTx = txs[txs.length - 1];
    const ageDays =
      (Date.now() / 1000 - parseInt(firstTx.timeStamp)) / (60 * 60 * 24);

    if (ageDays < 7) {
      riskFlags.push("Very new wallet");
      score -= 30;
    }
  }

  // Normalize score
  if (score < 0) score = 0;

  // 🧾 Result
  const logEntry = {
    timestamp: new Date().toISOString(),
    wallet: WALLET,
    task: "Real Wallet Risk Analysis",
    txCount: txs.length,
    riskScore: score,
    flags: riskFlags,
    summary:
      score > 70 ? "Low Risk" :
      score > 40 ? "Medium Risk" :
      "High Risk"
  };

  // 📂 SAFE LOAD LOGS
  let logs = [];

  if (fs.existsSync(FILE)) {
    try {
      const data = fs.readFileSync(FILE, "utf-8");
      const parsed = JSON.parse(data);

      if (Array.isArray(parsed)) {
        logs = parsed;
      }
    } catch {
      logs = [];
    }
  }

  // ➕ Append log
  logs.push(logEntry);

  // 💾 Save
  fs.writeFileSync(FILE, JSON.stringify(logs, null, 2));

  // 🖥 Output
  console.log("✅ Atlas Risk Analysis Complete:");
  console.log(logEntry);
}

// 🚀 Run
run();