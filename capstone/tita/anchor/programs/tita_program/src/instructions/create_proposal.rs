use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};
use crate::state::*;

#[derive(Accounts)]
pub struct CreateProposal<'info> {
    #[account(mut)]
    pub applicant: Signer<'info>,

    #[account(
        init,
        payer = applicant,
        space = 8 + Proposal::INIT_SPACE,
        seeds = [
            grant_campaign.key().as_ref(),
            applicant.key().as_ref(),
        ],
        bump
    )]
    pub proposal: Account<'info, Proposal>,
    
    #[account(
        init,
        payer = applicant,
        seeds = [
            proposal.key().as_ref(),
            token_mint.key().as_ref()
        ],
        bump,
        token::mint = token_mint,
        token::authority = proposal,
    )]
    pub proposal_vault: InterfaceAccount<'info, TokenAccount>,

    #[account(
        constraint = grant_campaign.is_active
    )]
    pub grant_campaign: Account<'info, GrantCampaign>,

    pub token_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

impl<'info> CreateProposal<'info> {
    pub fn create_proposal(
        &mut self,
        proposal_id: String,
        deadline: Option<i64>,
        ask_amount: u64,
        bump: u8,
    ) -> Result<()> {
        let proposal = &mut self.proposal;
        let clock = Clock::get()?;

        proposal.proposal_id = proposal_id;
        proposal.grant_campaign = self.grant_campaign.key();
        proposal.applicant = self.applicant.key();
        proposal.status = ProposalStatus::Pending;
        proposal.created_at = clock.unix_timestamp;
        proposal.updated_at = clock.unix_timestamp;
        proposal.deadline = deadline;
        proposal.ask_amount = ask_amount;
        proposal.token_mint = self.token_mint.key();
        proposal.bump = bump;

        Ok(())
    }
}