const { PublicKey } = require('@solana/web3.js');
const { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } = require('@solana/spl-token');

// CONFIGURATION
const CONFIG_ADDR = new PublicKey("84XvjJyyQLxgRBmPx1yNCRmDkabS5jYoHM72r9qC4o3k"); 
const ORB_MINT = new PublicKey("orebyr4mDiPDVgnfqvF5xiu5gKnh94Szuz8dqgNqdJn");

// We assume the Motherlode is the ORB token account owned by the CONFIG PDA.
const MOTHERLODE_ATA = getAssociatedTokenAddressSync(
    ORB_MINT,           // Mint Address (The token being stored)
    CONFIG_ADDR,        // Owner Address (The Config Account owns the jackpot)
    true,               // AllowOwnerOffCurve (Required for PDAs)
    TOKEN_PROGRAM_ID    // Token Program
);

console.log("-----------------------------------------");
console.log("🎯 MOTHERLODE TOKEN ACCOUNT FOUND:");
console.log(`Address: ${MOTHERLODE_ATA.toBase58()}`);
console.log("-----------------------------------------");

// You must manually check this address on Solscan to verify the balance.