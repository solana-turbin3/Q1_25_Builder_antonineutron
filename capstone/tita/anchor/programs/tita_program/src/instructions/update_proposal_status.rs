use anchor_lang::prelude::*;
use anchor_spl::token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked};
use crate::state::*;

#[derive(Accounts)]
pub struct UpdateProposalStatus<'info> {
    #[account(mut)]
    pub grant_provider: Signer<'info>,

    #[account(
        mut,
        constraint = proposal.grant_campaign == grant_campaign.key(),
        constraint = proposal.status == ProposalStatus::Pending
    )]
    pub proposal: Account<'info, Proposal>,

    #[account(
        constraint = grant_campaign.grant_provider == grant_provider.key()
    )]
    pub grant_campaign: Account<'info, GrantCampaign>,

    #[account(
        mut,
        seeds = [
            grant_campaign.key().as_ref(),
            token_mint.key().as_ref()
        ],
        bump,
    )]
    pub campaign_vault: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [
            proposal.key().as_ref(),
            token_mint.key().as_ref()
        ],
        bump,
    )]
    pub proposal_vault: InterfaceAccount<'info, TokenAccount>,

    pub token_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
}

impl<'info> UpdateProposalStatus<'info> {
    pub fn update_proposal_status(
        &mut self,
        status: ProposalStatus
    ) -> Result<()> {
        let proposal = &mut self.proposal;
        let clock = Clock::get()?;

        if status == ProposalStatus::Approved {
            // First find the correct PDA and bump
            let (expected_pda, expected_bump) = Pubkey::find_program_address(
                &[
                    self.grant_campaign.campaign_id.as_bytes(),
                    self.grant_campaign.grant_provider.as_ref(),
                ],
                &crate::ID
            );
            
            msg!("Expected PDA: {}", expected_pda);
            msg!("Expected bump: {}", expected_bump);
            msg!("Stored bump: {}", self.grant_campaign.bump);
            msg!("Campaign ID: {}", self.grant_campaign.campaign_id);
            msg!("Grant Provider: {}", self.grant_campaign.grant_provider);
            
            let campaign_seeds = &[
                self.grant_campaign.campaign_id.as_bytes(),
                self.grant_campaign.grant_provider.as_ref(),
                &[expected_bump],
            ];
            let signer = &[&campaign_seeds[..]];

            transfer_checked(
                CpiContext::new_with_signer(
                    self.token_program.to_account_info(),
                    TransferChecked {
                        from: self.campaign_vault.to_account_info(),
                        mint: self.token_mint.to_account_info(),
                        to: self.proposal_vault.to_account_info(),
                        authority: self.grant_campaign.to_account_info(),
                    },
                    signer,
                ),
                self.grant_campaign.total_funding,
                self.token_mint.decimals,
            )?;
        }

        proposal.status = status;
        proposal.updated_at = clock.unix_timestamp;

        Ok(())
    }
}