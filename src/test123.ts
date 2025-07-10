// src/test123.ts
import https from "https";

https.get("https://hnrss.org/newest", res => {
  console.log("✅ Connected:", res.statusCode);

  // Consume and discard response data
  res.on("data", () => {});  // required to let stream end

  res.on("end", () => {
    console.log("✅ Response fully received. Exiting.");
    process.exit(0);  // 💡 Force exit to be safe
  });
}).on("error", err => {
  console.error("❌ Connection failed:", err);
  process.exit(1);
});
