import { Commitment, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import wallet from "../wba-wallet.json"
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// Mint address
const mint = new PublicKey("7UXYAZ9nhy6zYCrr8zfJuKp8UvpJLWZVLibcHPCXCKNQ");

// Recipient address
const to = new PublicKey("EpG8VkF9Cv4iGBGYvaxAATVDEgd74VjWmsPdKcF9WGwc");


const token_decimals = 1_000_000n;


(async () => {
    try {
        // Get the token account of the fromWallet address, and if it does not exist, create it
        const ataOfFromWallet = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mint,
            keypair.publicKey
        );
        
        // Get the token account of the toWallet address, and if it does not exist, create it
        const ataOfToWallet = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mint,
            to
        );

        // Transfer the new token to the "toTokenAccount" we just created
        const sig = await transfer(
            connection,
            keypair,
            ataOfFromWallet.address,
            ataOfToWallet.address,
            keypair,
            20n * token_decimals
        );
        console.log(
            `Transferred 20 tokens to ATA at ${ataOfToWallet.address}. Transaction signature: ${sig}`
        );
        

        
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();