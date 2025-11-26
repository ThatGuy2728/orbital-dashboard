const { Connection, PublicKey } = require('@solana/web3.js');

const RPC = "https://mainnet.helius-rpc.com/?api-key=79c05ea6-d06f-4dad-913c-bd24404df17f";
// The Protocol Config Account (The true source for the jackpot)
const CONFIG_ADDR = new PublicKey("84XvjJyyQLxgRBmPx1yNCRmDkabS5jYoHM72r9qC4o3k"); 

async function main() {
    console.log("🔍 Hunting for Motherlode value in CONFIG ACCOUNT...");
    const conn = new Connection(RPC);
    const info = await conn.getAccountInfo(CONFIG_ADDR);
    
    if (!info) return console.log("❌ Config Account not found.");

    console.log(`✅ Data Size: ${info.data.length} bytes`);
    const view = new DataView(info.data.buffer);

    console.log("\n--- SEARCHING U64 CANDIDATES (10 ORB - 1000 ORB RANGE) ---");
    console.log("| Offset | Value (u64) | ORB Equivalent |");
    console.log("|--------|-------------|----------------|");
    
    // Motherlode filter range: 10 ORB (1e10 lamports) to 1000 ORB (1e12 lamports)
    const MIN_MOTHERLODE = 10000000000n; 
    const MAX_MOTHERLODE = 1000000000000n; 

    // Start after the 8-byte discriminator and scan the rest of the memory
    for (let i = 8; i < info.data.length - 8; i += 8) {
        try {
            const val = view.getBigUint64(i, true);
            
            if (val > MIN_MOTHERLODE && val < MAX_MOTHERLODE) {
                const asOrb = Number(val) / 1_000_000_000;
                console.log(`| ${i.toString().padEnd(6)} | ${val.toString().padEnd(11)} | ${asOrb.toFixed(4).padEnd(14)} | <--- CANDIDATE!`);
            }
        } catch (e) { /* Ignore non-u64 data */ }
    }
    console.log("------------------------------------------------------------");
}
main();