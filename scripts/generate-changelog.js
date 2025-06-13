import { execSync } from "child_process";
import fs from "fs";
import pkg from "../package.json" with { type: "json" };

// Get latest 50 commits, adjust as needed
const output = execSync(`git log -50 --pretty=format:'{"hash":"%h","date":"%ad","author":"%an","subject":"%s"},' --date=short`).toString();

const entries = `[${output.slice(0, -1)}]`; // Remove last comma, wrap in array
const commits = JSON.parse(entries);

const changelog = {
  version: pkg.version,
  generatedAt: new Date().toISOString(),
  commits,
};

fs.writeFileSync("changelog.json", JSON.stringify(changelog, null, 2));
console.log("changelog.json generated.");
