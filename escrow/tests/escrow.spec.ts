import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Escrow } from "../target/types/escrow";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createMint, createAccount, mintTo } from "@solana/spl-token";
import { BN } from "bn.js";
import { expect } from "chai";

describe("escrow", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Escrow as Program<Escrow>;

  const maker = Keypair.generate();
  const taker = Keypair.generate();
  let mintA: PublicKey;
  let mintB: PublicKey;
  let makerTokenAccountA: PublicKey;
  let makerAtaB: PublicKey;
  let takerAtaA: PublicKey;
  let takerAtaB: PublicKey;
  let escrowAccount: PublicKey;
  let vaultAccount: PublicKey;

  const escrowSeed = new BN(1);
  const depositAmount = new BN(50);
  const receiveAmount = new BN(100);

  const fundWallet = async (pubKey: PublicKey) => {
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

  before(async () => {
    // Airdrop SOL
    // await provider.connection.requestAirdrop(maker.publicKey, 2 * LAMPORTS_PER_SOL);
    // await provider.connection.requestAirdrop(taker.publicKey, 2 * LAMPORTS_PER_SOL);

    await fundWallet(maker.publicKey);
    await fundWallet(taker.publicKey);
    // Create mints
    mintA = await createMint(provider.connection, maker, maker.publicKey, null, 6);
    mintB = await createMint(provider.connection, maker, maker.publicKey, null, 6);

    // Create ATAs
    makerTokenAccountA = await createAccount(provider.connection, maker, mintA, maker.publicKey);
    makerAtaB = await createAccount(provider.connection, maker, mintB, maker.publicKey);
    takerAtaA = await createAccount(provider.connection, taker, mintA, taker.publicKey);
    takerAtaB = await createAccount(provider.connection, taker, mintB, taker.publicKey);

    // Mint tokens
    await mintTo(provider.connection, maker, mintA, makerTokenAccountA, maker, depositAmount.toNumber());
    await mintTo(provider.connection, maker, mintB, takerAtaB, maker, receiveAmount.toNumber());

    // Derive PDAs
    [escrowAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), maker.publicKey.toBuffer(), escrowSeed.toArrayLike(Buffer, 'le', 8)],
      program.programId
    );

    [vaultAccount] = PublicKey.findProgramAddressSync(
      [escrowAccount.toBuffer(), mintA.toBuffer()],
      program.programId
    );
  });

  it("Creates escrow", async () => {
    await program.methods
      .make(escrowSeed, receiveAmount, depositAmount)
      .accountsPartial({
        maker: maker.publicKey,
        mintA: mintA,
        mintB: mintB,
        makerMintAAta: makerTokenAccountA,
        escrow: escrowAccount,
        vault: vaultAccount,
        associatedTokenProgram: TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([maker])
      .rpc();

    const escrowState = await program.account.escrowState.fetch(escrowAccount);
    expect(escrowState.maker.equals(maker.publicKey)).to.be.true;
    expect(escrowState.mintA.equals(mintA)).to.be.true;
    expect(escrowState.mintB.equals(mintB)).to.be.true;
    expect(escrowState.receiveAmount.eq(receiveAmount)).to.be.true;
  });

  it("Takes escrow", async () => {
    await program.methods
      .take()
      .accountsPartial({
        taker: taker.publicKey,
        maker: maker.publicKey,
        mintA: mintA,
        mintB: mintB,
        takerAtaA,
        takerAtaB,
        makerAtaB,
        escrow: escrowAccount,
        vault: vaultAccount,
        associatedTokenProgram: TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([taker])
      .rpc();
  });

  it("Refunds escrow", async () => {
    await program.methods
      .refund()
      .accountsPartial({
        maker: maker.publicKey,
        tokenMintA: mintA,
        makerTokenAccountA: makerTokenAccountA,
        escrow: escrowAccount,
        vault: vaultAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([maker])
      .rpc();
  });
});