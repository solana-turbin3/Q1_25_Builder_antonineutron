import { AnchorProvider } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import * as anchor from '@coral-xyz/anchor';

export default async  function fundWallet (provider: AnchorProvider, pubKey: PublicKey) {
    const signature = await provider.connection.requestAirdrop(
        pubKey,
        10 * anchor.web3.LAMPORTS_PER_SOL
    );
    const latestBlockHash = await provider.connection.getLatestBlockhash();
    await provider.connection.confirmTransaction(
        {
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: signature
        },
        "confirmed"
    );
}