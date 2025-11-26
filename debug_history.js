const { Connection, PublicKey } = require('@solana/web3.js');

// Your fresh API Key
const RPC = "https://mainnet.helius-rpc.com/?api-key=79c05ea6-d06f-4dad-913c-bd24404df17f";
// The History Account we found earlier
const HISTORY_ADDR = new PublicKey("DdTy7HNhERD2Uw7wGUGj13SXSZBsvHdXSdgYEdX8GvP4");

async function main() {
    console.log("🔍 Connecting to History Buffer...");
    const conn = new Connection(RPC);
    const info = await conn.getAccountInfo(HISTORY_ADDR);
    
    if (!info) return console.log("❌ Account not found. Check connection.");

    console.log(`✅ Data Size: ${info.data.length} bytes`);
    const view = new DataView(info.data.buffer);

    console.log("\n--- SCANNING FOR PATTERNS ---");
    console.log("| Offset | Value (u64)   | As SOL?    |");
    console.log("|--------|---------------|------------|");
    
    // Scan 8-byte chunks to find numbers that look like data
    for (let i = 0; i < info.data.length - 8; i += 8) {
        const val = view.getBigUint64(i, true); // Little Endian
        const asSol = Number(val) / 1_000_000_000;

        // We are looking for:
        // 1. Round IDs (e.g., 10500 - 11000)
        // 2. SOL Amounts (e.g., 0.5 - 50.0 SOL)
        const isRound = (val > 10000n && val < 12000n);
        const isSol = (asSol > 0.1 && asSol < 100.0);

        if (isRound || isSol) {
            console.log(`| ${i.toString().padEnd(6)} | ${val.toString().padEnd(13)} | ${asSol.toFixed(4).padEnd(10)} | ${isRound ? "⬅️ Round?" : ""} ${isSol ? "⬅️ SOL?" : ""}`);
        }
    }
    console.log("-------------------------------------");
}
main();