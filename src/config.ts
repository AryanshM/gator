import fs from "fs";
import os from "os";
import path from "path";

// Updated Config type (camelCase)
export type Config = {
  current_user_name: string;
  dbUrl: string;
};

// Returns ~/.gatorconfig.json path
export function getConfigFilePath(): string {
  return path.join(os.homedir(), ".gatorconfig.json");
}

// Validates and maps raw JSON (snake_case) to Config (camelCase)
function validateConfig(rawConfig: any): Config {
  // console.log("🛠 Config file path:", getConfigFilePath());

  if (
    typeof rawConfig === "object" &&
    rawConfig !== null &&
    typeof rawConfig.current_user_name === "string" &&
    typeof rawConfig.db_url === "string"
  ) {
    //console.log(rawConfig.db_url);
    //console.log("config validated...");
    return {
      current_user_name: rawConfig.current_user_name,
      dbUrl: rawConfig.db_url,
    };
  } else {
    throw new Error("Invalid config format");
  }
}

// Writes Config (camelCase) to file as snake_case
export function writeConfig(cfg: Config): void {
  const filePath = getConfigFilePath();
  const rawConfig = {
    current_user_name: cfg.current_user_name,
    db_url: cfg.dbUrl,
  };

  // console.log("📝 Writing updated config:", rawConfig); // Add this
  fs.writeFileSync(filePath, JSON.stringify(rawConfig, null, 2), "utf-8");
}

// Reads and returns Config object from file
export function readConfig(): Config {
  const filePath = getConfigFilePath();
  const content = fs.readFileSync(filePath, "utf-8");
  const raw = JSON.parse(content);
  return validateConfig(raw);
}

// Sets current_user_name and writes config back
export function setUser(userName: string): void {
  //console.log("🔧 setUser() called with:", userName);
  let cfg: Config;

  try {
    cfg = readConfig();
  } catch (err) {
    throw new Error(
      "No config file found. Please create a .gatorconfig.json file with a valid db_url."
    );
  }

  cfg.current_user_name = userName;
  writeConfig(cfg);
}

/**
 * Changes the current_user_name in ~/.gatorconfig.json to the new username.
 * Throws if the config file does not exist or is invalid.
 */
export function changeUsername(newUserName: string): void {
  //console.log("🔄 changeUsername() called with:", newUserName);
  let cfg: Config;

  try {
    cfg = readConfig();
  } catch (err) {
    throw new Error(
      "No config file found. Please create a .gatorconfig.json file with a valid db_url."
    );
  }

  cfg.current_user_name = newUserName;
  writeConfig(cfg);
  //console.log(`✅ Username changed to "${newUserName}" in .gatorconfig.json`);
}
