use anchor_lang::prelude::*;
use anchor_spl::token_interface::{transfer_checked, close_account, CloseAccount, TokenAccount, TokenInterface, TransferChecked, Mint};
use crate::{state::*, TitaErrorCode};

#[derive(Accounts)]
pub struct WithdrawFromProposal<'info> {
    #[account(
        mut,
        constraint = proposal.grant_campaign == grant_campaign.key(),
    )]
    pub proposal: Account<'info, Proposal>,

    #[account(
        constraint = grant_campaign.grant_provider == grant_provider.key()
    )]
    pub grant_campaign: Account<'info, GrantCampaign>,

    #[account(mut)]
    pub grant_provider: Signer<'info>,

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
        constraint = provider_token_account.owner == grant_provider.key(),
        constraint = provider_token_account.mint == token_mint.key()
    )]
    pub provider_token_account: InterfaceAccount<'info, TokenAccount>,

    pub token_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
}

impl<'info> WithdrawFromProposal<'info> {
    pub fn withdraw_from_proposal(&mut self) -> Result<()> {
        let clock = Clock::get()?;
        
        // Verify deadline has passed
        if let Some(deadline) = self.proposal.deadline {
            require!(
                clock.unix_timestamp > deadline,
                TitaErrorCode::DeadlineNotExceeded
            );
        } else {
            return Err(TitaErrorCode::NoDeadlineSet.into());
        }


        let vault_balance = self.proposal_vault.amount;
        require!(vault_balance > 0, TitaErrorCode::InsufficientFunds);

        let proposal_key = self.proposal.key();
        let token_mint_key = self.token_mint.key();
        let seeds = &[
            proposal_key.as_ref(),
            token_mint_key.as_ref(),
            &[self.proposal.bump],
        ];
        let signer = &[&seeds[..]];

        // Transfer remaining funds
        transfer_checked(
            CpiContext::new_with_signer(
                self.token_program.to_account_info(),
                TransferChecked {
                    from: self.proposal_vault.to_account_info(),
                    mint: self.token_mint.to_account_info(),
                    to: self.provider_token_account.to_account_info(),
                    authority: self.proposal.to_account_info(),
                },
                signer,
            ),
            vault_balance,
            self.token_mint.decimals,
        )?;

        // Close vault
        close_account(
            CpiContext::new_with_signer(
                self.token_program.to_account_info(),
                CloseAccount {
                    account: self.proposal_vault.to_account_info(),
                    destination: self.grant_provider.to_account_info(),
                    authority: self.proposal.to_account_info(),
                },
                signer,
            )
        )?;

        Ok(())
    }
}

