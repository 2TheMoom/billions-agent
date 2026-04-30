const fs = require("fs");

const log = {
  timestamp: new Date().toISOString(),
  status: "Atlas ran successfully",
};

fs.writeFileSync("atlas-log.json", JSON.stringify(log, null, 2));

console.log("Atlas task executed");
