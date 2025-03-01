use anchor_lang::prelude::*;
use anchor_spl::token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked};
use crate::{instructions::TitaErrorCode, state::*};

#[derive(Accounts)]
pub struct SetMilestoneStatus<'info> {
    #[account(mut)]
    pub grant_provider: Signer<'info>,

    #[account(
        mut,
        constraint = milestone.proposal == proposal.key(),
        constraint = milestone.status == MilestoneStatus::Completed
    )]
    pub milestone: Account<'info, Milestone>,

    #[account(
        constraint = proposal.grant_campaign == grant_campaign.key(),
        constraint = proposal.status == ProposalStatus::Approved
    )]
    pub proposal: Account<'info, Proposal>,

    #[account(
        constraint = grant_campaign.grant_provider == grant_provider.key(),
        constraint = grant_campaign.is_active
    )]
    pub grant_campaign: Account<'info, GrantCampaign>,

    #[account(
        mut,
        seeds = [
            proposal.key().as_ref(),
            token_mint.key().as_ref()
        ],
        bump,
    )]
    pub proposal_vault: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        constraint = recipient.owner == proposal.applicant
    )]
    pub recipient: InterfaceAccount<'info, TokenAccount>,

    pub token_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
}

impl<'info> SetMilestoneStatus<'info> {
    pub fn set_milestone_status(
        &mut self,
        status: MilestoneStatus,
    ) -> Result<()> {
        // Validate status transition
        match status {
            MilestoneStatus::Approved | MilestoneStatus::Rejected | MilestoneStatus::Completed => (),
            _ => return Err(TitaErrorCode::InvalidStatusTransition.into())
        }

        // Check deadline if exists
        if let Some(deadline) = self.proposal.deadline {
            require!(
                Clock::get()?.unix_timestamp <= deadline,
                TitaErrorCode::DeadlineExceeded
            );
        }

        if status == MilestoneStatus::Approved {
            // Get proposal PDA signer seeds (matching creation)
            let grant_campaign_key = self.grant_campaign.key();
            let proposal_seeds = &[
                grant_campaign_key.as_ref(),
                self.proposal.applicant.as_ref(),
                &[self.proposal.bump],
            ];
            let signer = &[&proposal_seeds[..]];

            msg!("Proposal Debug:");
            msg!("Grant Campaign Key: {}", self.grant_campaign.key());
            msg!("Applicant Key: {}", self.proposal.applicant);
            msg!("Proposal Bump: {}", self.proposal.bump);
            msg!("Proposal PDA: {}", self.proposal.key());

            transfer_checked(
                CpiContext::new_with_signer(
                    self.token_program.to_account_info(),
                    TransferChecked {
                        from: self.proposal_vault.to_account_info(),
                        mint: self.token_mint.to_account_info(),
                        to: self.recipient.to_account_info(),
                        authority: self.proposal.to_account_info(),
                    },
                    signer,
                ),
                self.milestone.amount,
                self.token_mint.decimals,
            )?;
        }

        let milestone = &mut self.milestone;
        milestone.status = status;
        milestone.updated_at = Clock::get()?.unix_timestamp;

        Ok(())
    }
}