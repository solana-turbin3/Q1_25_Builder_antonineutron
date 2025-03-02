import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { TitaProgram } from '../target/types/tita_program';
import { Account, TOKEN_PROGRAM_ID, createMint, getAccount, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import { before, describe, it } from 'node:test';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import fundWallet from './libs/fund_wallet';
import assert from 'assert';

describe('Tita Instructions test', () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.TitaProgram as Program<TitaProgram>;

    const campaign_id = "CAMPAIGN_001";
    const proposal_id = "PROPOSAL_001";
    let grantProvider: anchor.web3.Keypair;
    let grantReceiver: anchor.web3.Keypair;
    let providerTokenAccount: Account;
    let donorATA: Account;
    let tokenMint: PublicKey;
    let campaignPda: PublicKey;
    let campaignVaultPda: PublicKey;
    let proposalPda: PublicKey;
    let proposalVaultPda: PublicKey;
    let milestonePda: PublicKey;

    before(async () => {
        grantProvider = anchor.web3.Keypair.generate();
        grantReceiver = anchor.web3.Keypair.generate();
        await fundWallet(provider, grantProvider.publicKey);
        await fundWallet(provider, grantReceiver.publicKey);

        // Create a token mint
        tokenMint = await createMint(
            provider.connection,
            grantProvider,
            grantProvider.publicKey,
            null,
            6
        );

        // Create associated token account for provider
        providerTokenAccount = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            grantProvider,
            tokenMint,
            grantProvider.publicKey
        );

        // Create associated token account for donor
        donorATA = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            grantReceiver,
            tokenMint,
            grantReceiver.publicKey
        );

        // Mint tokens to provider's ATA
        await mintTo(
            provider.connection,
            grantProvider,
            tokenMint,
            providerTokenAccount.address,
            grantProvider,
            1000000000 // 1000 tokens with 6 decimals
        );

        // Derive PDAs for campaign and vault
        [campaignPda] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from(campaign_id), grantProvider.publicKey.toBuffer()],
            program.programId
        );

        [campaignVaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
            [campaignPda.toBuffer(), tokenMint.toBuffer()],
            program.programId
        );

        // Derive PDA for the proposal
        [proposalPda] = anchor.web3.PublicKey.findProgramAddressSync(
            [campaignPda.toBuffer(), grantReceiver.publicKey.toBuffer()],
            program.programId
        );

        // Derive PDA for the proposal vault
        [proposalVaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
            [proposalPda.toBuffer(), tokenMint.toBuffer()],
            program.programId
        );

        // Derive PDA for the milestone
        const milestoneId = 1;
        [milestonePda] = anchor.web3.PublicKey.findProgramAddressSync(
            [proposalPda.toBuffer(), Buffer.from([milestoneId])],
            program.programId
        );
    });

    it('Create a grant', async () => {
        const totalFunding = new anchor.BN(1000000); // 1 token with 6 decimals
        const deadline = null;//new anchor.BN(Math.floor(Date.now() / 1000) + (5 * 24 * 60 * 60)); // 5 days from now

        await program.methods.createCampaign(campaign_id, totalFunding, deadline)
            .accountsPartial({
                grantProvider: grantProvider.publicKey,
                providerTokenAccount: providerTokenAccount.address,
                grantCampaign: campaignPda,
                campaignVault: campaignVaultPda,
                tokenMint: tokenMint,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            })
            .signers([grantProvider])
            .rpc();

        // Fetch the created campaign account
        const campaignAccount = await program.account.grantCampaign.fetch(campaignPda);

        // Assertions
        assert.equal(campaignAccount.campaignId, campaign_id, "Campaign ID does not match");
        assert.equal(campaignAccount.totalFunding.toString(), totalFunding.toString(), "Total funding does not match");
        assert.equal(campaignAccount.isActive, true, "Campaign should be active");
        assert.equal(campaignAccount.grantProvider.toString(), grantProvider.publicKey.toString(), "Grant provider does not match");
    });

    it('Create a proposal for an active grant campaign with milestones', async () => {
        // Set milestone details
        const milestoneId = 1;
        // in this test only one milestone is created which equates to the proposal amount
        const milestoneAmount = new anchor.BN(500000); // 0.5 tokens with 6 decimals 
        const proofUri = "https://tita.com/proof";

        // Create a proposal
        const deadline = new anchor.BN(new Date().getTime() / 1000 + 86400); // 24 hours from now
        await program.methods.createProposal(proposal_id, deadline, milestoneAmount)
            .accountsPartial({
            applicant: grantReceiver.publicKey,
            proposal: proposalPda,
            proposalVault: proposalVaultPda,
            grantCampaign: campaignPda,
            tokenMint: tokenMint,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            })
            .signers([grantReceiver])
            .rpc();

        // Fetch the created proposal account
        const proposalAccount = await program.account.proposal.fetch(proposalPda);

        // Assertions
        assert.equal(proposalAccount.proposalId, proposal_id, "Proposal ID does not match");
        assert.equal(proposalAccount.grantCampaign.toString(), campaignPda.toString(), "Grant campaign does not match");
        assert.equal(proposalAccount.applicant.toString(), grantReceiver.publicKey.toString(), "Applicant does not match");
        assert.equal(JSON.stringify(proposalAccount.status.pending), "{}", "Proposal status should be pending");

        // Create a milestone tied to the proposal
        await program.methods.createMilestone(milestoneId, milestoneAmount, proofUri)
            .accountsPartial({
                applicant: grantReceiver.publicKey,
                milestone: milestonePda,
                proposal: proposalPda,
                grantCampaign: campaignPda,
                systemProgram: SystemProgram.programId,
            })
            .signers([grantReceiver])
            .rpc();

        // Fetch the created milestone account
        const milestoneAccount = await program.account.milestone.fetch(milestonePda);

        // Assertions
        assert.equal(milestoneAccount.proposal.toString(), proposalPda.toString(), "Proposal does not match");
        assert.equal(milestoneAccount.milestoneId, milestoneId, "Milestone ID does not match");
        assert.equal(milestoneAccount.amount.toString(), milestoneAmount.toString(), "Milestone amount does not match");
        assert.equal(milestoneAccount.proofUri, proofUri, "Proof URI does not match");
    });

    it('Update Proposal Status to approved', async () => {
        // Update proposal status to Approved
        await program.methods.updateProposalStatus({ approved: {} })
            .accountsPartial({
                grantProvider: grantProvider.publicKey,
                proposal: proposalPda,
                grantCampaign: campaignPda,
                campaignVault: campaignVaultPda,
                proposalVault: proposalVaultPda,
                tokenMint: tokenMint,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .signers([grantProvider])
            .rpc();

        // Fetch the updated proposal account
        const proposalAccount = await program.account.proposal.fetch(proposalPda);

        // Assertions
        assert.equal(JSON.stringify(proposalAccount.status.approved), "{}", "Proposal status should be approved");
    });

    it('Submit Proof for approval and set milestone status as completed', async () => {
        const newProofUri = "https://tita.com/updated-proof";

        // Submit proof for the milestone
        await program.methods.submitProof(newProofUri)
            .accountsPartial({
                milestone: milestonePda,
                proposal: proposalPda,
                applicant: grantReceiver.publicKey,
            })
            .signers([grantReceiver])
            .rpc();

        // Fetch the updated milestone account
        const milestoneAccount = await program.account.milestone.fetch(milestonePda);

        // Assertions
        assert.equal(milestoneAccount.proofUri, newProofUri, "Proof URI does not match");

        // Set milestone status to Completed
        await program.methods.setMilestoneStatus({ completed: {} })
            .accountsPartial({
                grantProvider: grantProvider.publicKey,
                milestone: milestonePda,
                proposal: proposalPda,
                grantCampaign: campaignPda,
                proposalVault: proposalVaultPda,
                recipient: donorATA.address,
                tokenMint: tokenMint,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .signers([grantProvider])
            .rpc();

        // Fetch the updated milestone account
        const updatedMilestoneAccount = await program.account.milestone.fetch(milestonePda);

        // Assertions
        assert.equal(JSON.stringify(updatedMilestoneAccount.status.completed), "{}", "Milestone status should be completed");
    });

    it('Set Milestone Status as approved and credit recipient', async () => {
        // Set milestone status to Approved
        await program.methods.setMilestoneStatus({ approved: {} })
            .accountsPartial({
                grantProvider: grantProvider.publicKey,
                milestone: milestonePda,
                proposal: proposalPda,
                grantCampaign: campaignPda,
                proposalVault: proposalVaultPda,
                recipient: donorATA.address,
                tokenMint: tokenMint,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .signers([grantProvider])
            .rpc();

        // Fetch the updated milestone account
        const milestoneAccount = await program.account.milestone.fetch(milestonePda);

        // Assertions
        assert.equal(JSON.stringify(milestoneAccount.status.approved), "{}", "Milestone status should be approved");

        // Verify funds were transferred to the recipient
        const recipientBalance = await getAccount(provider.connection, donorATA.address);
        assert.equal(recipientBalance.amount.toString(), "500000", "Funds were not transferred to the recipient");
    });

    it('Close campaign', async () => {
        // Close the campaign, empty account if there is funds
        await program.methods.closeCampaign()
            .accountsPartial({
                grantCampaign: campaignPda,
                campaignVault: campaignVaultPda,
                providerTokenAccount: providerTokenAccount.address,
                grantProvider: grantProvider.publicKey,
                tokenMint: tokenMint,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            })
            .signers([grantProvider])
            .rpc();

        // Fetch the closed campaign account
        // const campaignAccount = ;

        // // Assertions
        // assert.throws(() => await program.account.grantCampaign.fetch(campaignPda), "Campaign should be closed");
    });

    it('Should fail when creating campaign with zero funding', async () => {
        const totalFunding = new anchor.BN(0);
        try {
            await program.methods.createCampaign(campaign_id, totalFunding, null)
                .accountsPartial({
                    grantProvider: grantProvider.publicKey,
                    providerTokenAccount: providerTokenAccount.address,
                    grantCampaign: campaignPda,
                    campaignVault: campaignVaultPda,
                    tokenMint: tokenMint,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                })
                .signers([grantProvider])
                .rpc();
            assert.fail("Should fail with zero funding");
        } catch (err) {
            assert.ok(err);
        }
    });

    it('Should fail when non-provider tries to approve proposal', async () => {
        try {
            await program.methods.updateProposalStatus({ approved: {} })
                .accountsPartial({
                    grantProvider: grantReceiver.publicKey, // Wrong signer
                    proposal: proposalPda,
                    grantCampaign: campaignPda,
                    campaignVault: campaignVaultPda,
                    proposalVault: proposalVaultPda,
                    tokenMint: tokenMint,
                    tokenProgram: TOKEN_PROGRAM_ID,
                })
                .signers([grantReceiver])
                .rpc();
            assert.fail("Should fail with unauthorized signer");
        } catch (err) {
            assert.ok(err);
        }
    });

    it('Should fail when submitting proof for non-existent milestone', async () => {
        const invalidMilestonePda = anchor.web3.PublicKey.findProgramAddressSync(
            [proposalPda.toBuffer(), Buffer.from([99])],
            program.programId
        )[0];

        try {
            await program.methods.submitProof("invalid-proof")
                .accountsPartial({
                    milestone: invalidMilestonePda,
                    proposal: proposalPda,
                    applicant: grantReceiver.publicKey,
                })
                .signers([grantReceiver])
                .rpc();
            assert.fail("Should fail with invalid milestone");
        } catch (err) {
            assert.ok(err);
        }
    });

    it('Should fail when setting invalid milestone status transition', async () => {
        try {
            await program.methods.setMilestoneStatus({ approved: {} })
                .accountsPartial({
                    grantProvider: grantProvider.publicKey,
                    milestone: milestonePda,
                    proposal: proposalPda,
                    grantCampaign: campaignPda,
                    proposalVault: proposalVaultPda,
                    recipient: donorATA.address,
                    tokenMint: tokenMint,
                    tokenProgram: TOKEN_PROGRAM_ID,
                })
                .signers([grantProvider])
                .rpc();
            assert.fail("Should fail with invalid status transition");
        } catch (err) {
            assert.ok(err);
        }
    });
});