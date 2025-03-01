use anchor_lang::prelude::*;

declare_id!("8PJFAdH2RJ2v1zdME3HU477yvHf7LRheLWd3xxeSbrsZ");

pub mod instructions;
use instructions::*;

pub mod state;
pub use state::*;

#[program]
pub mod tita_program {
    use crate::state::{MilestoneStatus, ProposalStatus};

    use super::*;

    pub fn create_campaign(
        ctx: Context<CreateCampaign>,
        campaign_id: String,
        total_funding: u64,
        deadline: Option<i64>
    ) -> Result<()> {
        let _ = ctx
            .accounts
            .create_campaign(campaign_id, total_funding, deadline, ctx.bumps.grant_campaign)?;

        Ok(())
    }

    pub fn create_milestone(
        ctx: Context<CreateMilestone>,
        milestone_id: u8,
        amount: u64,
        proof_uri: String
    ) -> Result<()> {
        ctx.accounts
            .create_milestone(milestone_id, amount, proof_uri, ctx.bumps.milestone)?;

        Ok(())
    }

    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        proposal_id: String,
        deadline: Option<i64>,
        ask_amount: u64,
    ) -> Result<()> {
        ctx.accounts.create_proposal(proposal_id, deadline, ask_amount, ctx.bumps.proposal)?;

        Ok(())
    }

    pub fn set_milestone_status(
        ctx: Context<SetMilestoneStatus>,
        status: MilestoneStatus,
    ) -> Result<()> {
        ctx.accounts.set_milestone_status(status)?;

        Ok(())
    }

    pub fn submit_proof(ctx: Context<SubmitProof>, proof_uri: String) -> Result<()> {
        ctx.accounts.submit_proof(proof_uri)?;

        Ok(())
    }

    pub fn update_campaign(
        ctx: Context<UpdateCampaign>,
        total_funding: u64,
        is_active: bool,
    ) -> Result<()> {
        ctx.accounts.update_campaign(total_funding, is_active)?;

        Ok(())
    }

    pub fn update_proposal_status(
        ctx: Context<UpdateProposalStatus>,
        status: ProposalStatus,
    ) -> Result<()> {
        ctx.accounts.update_proposal_status(status)?;

        Ok(())
    }

    pub fn close_campaign(ctx: Context<CloseCampaign>) -> Result<()> {
        ctx.accounts.close_campaign()?;

        Ok(())
    }

    pub fn withdraw_from_proposal(
        ctx: Context<WithdrawFromProposal>
    ) -> Result<()> {
        ctx.accounts.withdraw_from_proposal()?;

        Ok(())
    }
}
