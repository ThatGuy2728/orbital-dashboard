const { Connection, PublicKey } = require('@solana/web3.js');
const { Program, AnchorProvider } = require('@coral-xyz/anchor');

// CONFIGURATION
const PROGRAM_ID = "boreXQWsKpsJz5RR9BMtN8Vk4ndAk23sutj8spWYhwk";
const RPC_URL = "https://mainnet.helius-rpc.com/?api-key=79c05ea6-d06f-4dad-913c-bd24404df17f";

async function main() {
    console.log("🔍 Hunting for On-Chain IDL...");
    
    const connection = new Connection(RPC_URL);
    // Mock provider for read-only access
    const provider = new AnchorProvider(connection, {}, {});
    
    try {
        // Fetch IDL
        const idl = await Program.fetchIdl(new PublicKey(PROGRAM_ID), provider);
        
        if (!idl) {
            console.log("❌ No IDL found on-chain. It might be closed source or raw Rust.");
            return;
        }

        console.log("\n✅ IDL FOUND! HERE IS THE DATA MAP:\n");
        
        // Print Account Layouts
        if (idl.accounts) {
            idl.accounts.forEach(acc => {
                console.log(`\n[Account: ${acc.name}]`);
                let offset = 8; // Discriminator
                acc.type.fields.forEach(field => {
                    let typeStr = typeof field.type === 'string' ? field.type : JSON.stringify(field.type);
                    console.log(`  + Offset ${offset}: ${field.name} (${typeStr})`);
                    
                    // Estimate size
                    if (typeStr === 'u64' || typeStr === 'i64') offset += 8;
                    else if (typeStr === 'u32' || typeStr === 'i32') offset += 4;
                    else if (typeStr === 'u8') offset += 1;
                    else if (typeStr === 'publicKey') offset += 32;
                    else offset += "?"; 
                });
            });
        }

    } catch (e) {
        console.error("Error:", e.message);
    }
}

main();