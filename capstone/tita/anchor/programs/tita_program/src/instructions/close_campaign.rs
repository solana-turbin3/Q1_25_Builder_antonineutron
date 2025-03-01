use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::token_interface::{
    close_account, transfer_checked, CloseAccount, Mint, TokenAccount, TokenInterface,
    TransferChecked,
};

#[derive(Accounts)]
pub struct CloseCampaign<'info> {
    #[account(
        mut,
        close = grant_provider,
        constraint = grant_campaign.grant_provider == grant_provider.key(),
        constraint = grant_campaign.is_active,
        constraint = grant_campaign.deadline.map_or(true, |deadline| Clock::get().unwrap().unix_timestamp >= deadline)
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
        constraint = provider_token_account.owner == grant_provider.key(),
        constraint = provider_token_account.mint == token_mint.key()
    )]
    pub provider_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(mut)]
    pub grant_provider: Signer<'info>,

    pub token_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

impl<'info> CloseCampaign<'info> {
    pub fn close_campaign(&mut self) -> Result<()> {
        let campaign = &mut self.grant_campaign;
        let vault_balance = self.campaign_vault.amount;

        if vault_balance > 0 {

        let campaign_key = campaign.key();
        let token_mint_key = self.token_mint.key();
        let seeds = &[
            campaign_key.as_ref(),
            token_mint_key.as_ref(),
            &[campaign.bump],
        ];

        let signer = &[&seeds[..]];


            // Transfer remaining funds
            transfer_checked(
                CpiContext::new_with_signer(
                    self.token_program.to_account_info(),
                    TransferChecked {
                        from: self.campaign_vault.to_account_info(),
                        mint: self.token_mint.to_account_info(),
                        to: self.provider_token_account.to_account_info(),
                        authority: campaign.to_account_info(),
                    },
                    signer,
                ),
                vault_balance,
                self.token_mint.decimals,
            )?;
        }

        let seeds = &[
            campaign.campaign_id.as_bytes(),
            campaign.grant_provider.as_ref(),
            &[campaign.bump],
        ];

        let close_signer = &[&seeds[..]];

        // Close vault
        close_account(CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            CloseAccount {
                account: self.campaign_vault.to_account_info(),
                destination: self.grant_provider.to_account_info(),
                authority: campaign.to_account_info(),
            },
            close_signer,
        ))?;

        campaign.is_active = false;
        campaign.updated_at = Clock::get()?.unix_timestamp;

        Ok(())
    }
}
