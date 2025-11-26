const { Connection, PublicKey } = require('@solana/web3.js');

const RPC_URL = "https://mainnet.helius-rpc.com/?api-key=d52f91ef-ee97-4d18-b47b-108b047031f8";
const connection = new Connection(RPC_URL);

const ORB_MINT = "orebyr4mDiPDVgnfqvF5xiu5gKnh94Szuz8dqgNqdJn";
const ORE_MINT = "oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp";

const SUSPECTS = {
    "MAIN_TREASURY": "6aAGoVq9jKywWXyvWwoUtZFxbjR5aLBtfjhQXP1xezA",
    "BUYBACK_WALLET": "BuryekxQCUbvuuk4TAJwTJMfPFatvcsPBuatLAbmKq9J",
    "FEE_RECEIVER": "GuW6oeR1e7LntTxtZvdc8GxubWnmd3d2zosAUWWZgKNf",
    "DEPLOYER": "BLUgFDHxuJA6jEzGTfRq6x6mLN6JekkqSpWrErqq4aY5",
    "COMMUNITY_HOT": "Diti3b5jvKju79wEKisHHu7xfYyUjux7jvdUZKc1fYv4",
    "COMMUNITY_COLD": "oCZGd7Bpj1SvZz8EP4Gg68LZgmVuX8ANej2jmWyN6cU"
};

async function getBal(wallet, mint) {
    try {
        const res = await connection.getParsedTokenAccountsByOwner(new PublicKey(wallet), { mint: new PublicKey(mint) });
        return res.value[0]?.account.data.parsed.info.tokenAmount.uiAmount || 0;
    } catch { return 0; }
}

async function main() {
    console.log("🕵️  SEARCHING FOR MATCHES...");
    console.log("----------------------------------------------------------------");
    console.log(`| ${"WALLET".padEnd(16)} | ${"SOL".padEnd(12)} | ${"ORB".padEnd(12)} | ${"ORE".padEnd(12)} |`);
    console.log("----------------------------------------------------------------");

    for (const [name, addr] of Object.entries(SUSPECTS)) {
        const sol = await connection.getBalance(new PublicKey(addr)) / 1e9;
        const orb = await getBal(addr, ORB_MINT);
        const ore = await getBal(addr, ORE_MINT);

        console.log(`| ${name.padEnd(16)} | ${sol.toFixed(5).padEnd(12)} | ${orb.toFixed(2).padEnd(12)} | ${ore.toFixed(5).padEnd(12)} |`);
    }
    console.log("----------------------------------------------------------------");
}
main();