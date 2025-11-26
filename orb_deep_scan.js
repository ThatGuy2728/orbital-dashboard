const { Connection, PublicKey } = require('@solana/web3.js');

// CONFIGURATION
const RPC = "https://mainnet.helius-rpc.com/?api-key=79c05ea6-d06f-4dad-913c-bd24404df17f";
const PROGRAM_ID = new PublicKey("boreXQWsKpsJz5RR9BMtN8Vk4ndAk23sutj8spWYhwk");
const CONFIG_ADDR = new PublicKey("84XvjJyyQLxgRBmPx1yNCRmDkabS5jYoHM72r9qC4o3k");
const TREASURY_ADDR = new PublicKey("6aAGoVq9jKywWXyvWwoUtZFxbjR5aLBtfjhQXP1xezA");

// Get target value from command line (e.g. "node orb_deep_scan.js 62.4")
const targetOrb = parseFloat(process.argv[2]);

if (!targetOrb) {
    console.log("❌ Please provide the current Motherlode amount!");
    console.log("Usage: node orb_deep_scan.js <AMOUNT>");
    console.log("Example: node orb_deep_scan.js 62.4");
    process.exit(1);
}

const targetLamports = BigInt(Math.round(targetOrb * 1_000_000_000));
console.log(`🎯 Hunting for: ${targetOrb} ORB (${targetLamports} units)`);

async function main() {
    const connection = new Connection(RPC);
    
    // 1. LIST ACCOUNTS TO SCAN
    const accounts = [
        { name: "CONFIG", pubkey: CONFIG_ADDR },
        { name: "TREASURY", pubkey: TREASURY_ADDR }
    ];

    // Add Bus Accounts (0-7)
    for (let i = 0; i < 8; i++) {
        const [busPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("bus"), Buffer.from([i])], 
            PROGRAM_ID
        );
        accounts.push({ name: `BUS_${i}`, pubkey: busPda });
    }

    // 2. SCAN THEM
    console.log("Scanning...");
    
    for (const acc of accounts) {
        try {
            const info = await connection.getAccountInfo(acc.pubkey);
            if (!info) {
                console.log(`[${acc.name}] Not found.`);
                continue;
            }

            const data = info.data;
            const view = new DataView(data.buffer);
            
            // Scan for the target value (Tolerance +/- 1 ORB in case of precision drift)
            let found = false;
            for (let i = 0; i < data.length - 8; i++) { // Check every byte alignment
                 const val = view.getBigUint64(i, true);
                 
                 // Check exact match
                 if (val === targetLamports) {
                     console.log(`✅ FOUND EXACT MATCH in ${acc.name} at Offset ${i}!`);
                     found = true;
                 }
                 // Check close match (in case it updated)
                 else if (val > (targetLamports - 5000000000n) && val < (targetLamports + 5000000000n)) {
                     const foundOrb = Number(val) / 1_000_000_000;
                     console.log(`⚠️  FOUND CLOSE MATCH in ${acc.name} at Offset ${i}: ${foundOrb} ORB`);
                     found = true;
                 }
            }
            
            if (!found) console.log(`[${acc.name}] No match.`);

        } catch (e) { console.log(`Error reading ${acc.name}`); }
    }
}

main();