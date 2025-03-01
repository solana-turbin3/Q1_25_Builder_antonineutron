use crate::{state::*, TitaErrorCode};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(milestone_id: u8)]
pub struct CreateMilestone<'info> {
    #[account(mut)]
    pub applicant: Signer<'info>,
    
    #[account(
        init,
        payer = applicant,
        space = 8 + Milestone::INIT_SPACE,
        seeds = [
            proposal.key().as_ref(),
            &[milestone_id],
        ],
        bump
    )]
    pub milestone: Account<'info, Milestone>,

    #[account(
        mut,
        constraint = proposal.status == ProposalStatus::Pending,
        constraint = proposal.applicant == applicant.key()
    )]
    pub proposal: Account<'info, Proposal>,

    #[account(
        mut,
        constraint = grant_campaign.key() == proposal.grant_campaign,
        constraint = grant_campaign.is_active
    )]
    pub grant_campaign: Account<'info, GrantCampaign>,

    pub system_program: Program<'info, System>,
}

impl<'info> CreateMilestone<'info> {
    pub fn create_milestone(
        &mut self, 
        milestone_id: u8,
        amount: u64,
        proof_uri: String,
        bump: u8
    ) -> Result<()> {
        require!(
            amount <= self.grant_campaign.remaining_funding,
            TitaErrorCode::InsufficientFunds
        );

        let milestone = &mut self.milestone;
        let clock = Clock::get()?;

        milestone.proposal = self.proposal.key();
        milestone.milestone_id = milestone_id;
        milestone.amount = amount;
        milestone.created_at = clock.unix_timestamp;
        milestone.updated_at = clock.unix_timestamp;
        milestone.bump = bump;
        milestone.proof_uri = proof_uri;
        milestone.status = MilestoneStatus::Pending;

        // Update remaining funding in campaign
        self.grant_campaign.remaining_funding = self
            .grant_campaign
            .remaining_funding
            .checked_sub(amount)
            .ok_or(TitaErrorCode::CalculationError)?;

        Ok(())
    }
}
