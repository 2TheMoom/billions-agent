const fs = require("fs");

const FILE = "atlas-log.json";

// Simulated trust checks (expand later)
const checks = [
  { name: "Agent Identity", status: "verified" },
  { name: "Ownership Proof", status: "valid" },
  { name: "Repository Integrity", status: "clean" }
];

// Scoring system
const score = checks.filter(
  c => c.status === "verified" || c.status === "valid"
).length;

// New log entry
const logEntry = {
  timestamp: new Date().toISOString(),
  task: "Trust Analysis",
  score: `${score}/${checks.length}`,
  checks: checks,
  summary:
    score === checks.length
      ? "All systems trusted"
      : "Issues detected"
};

// SAFE LOAD
let logs = [];

if (fs.existsSync(FILE)) {
  try {
    const data = fs.readFileSync(FILE, "utf-8");
    const parsed = JSON.parse(data);

    // Ensure it's an array
    if (Array.isArray(parsed)) {
      logs = parsed;
    } else {
      logs = [];
    }
  } catch (error) {
    logs = [];
  }
}

// Append new entry
logs.push(logEntry);

// Save safely
fs.writeFileSync(FILE, JSON.stringify(logs, null, 2));

// Output
console.log("Atlas Trust Analysis Result:");
console.log(logEntry);