use crate::state::*;

use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, transfer_checked, TransferChecked, TokenAccount, TokenInterface};

#[derive(Accounts)]
#[instruction(campaign_id: String)]
pub struct CreateCampaign<'info> {
    #[account(mut)]
    pub grant_provider: Signer<'info>,

    #[account(
        mut,
        constraint = provider_token_account.owner == grant_provider.key(),
        constraint = provider_token_account.mint == token_mint.key()
    )]
    pub provider_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init,
        payer = grant_provider,
        space = 8 + GrantCampaign::INIT_SPACE,
        seeds = [
            campaign_id.as_bytes(),
            grant_provider.key().as_ref(),
        ],
        bump
    )]
    pub grant_campaign: Account<'info, GrantCampaign>,
    
    #[account(
        init,
        payer = grant_provider,
        seeds = [
            grant_campaign.key().as_ref(),
            token_mint.key().as_ref()
        ],
        bump,
        token::mint = token_mint,
        token::authority = grant_campaign,
    )]
    pub campaign_vault: InterfaceAccount<'info, TokenAccount>,

    pub token_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

impl<'info> CreateCampaign<'info> {
    pub fn create_campaign(
        &mut self,
        campaign_id: String,
        total_funding: u64,
        deadline: Option<i64>,
        bump: u8
    ) -> Result<()> {
        // Transfer initial funding
        transfer_checked(
            CpiContext::new(
                self.token_program.to_account_info(),
                TransferChecked {
                    from: self.provider_token_account.to_account_info(),
                    mint: self.token_mint.to_account_info(),
                    to: self.campaign_vault.to_account_info(),
                    authority: self.grant_provider.to_account_info(),
                },
            ),
            total_funding,
            self.token_mint.decimals,
        )?;

        let campaign = &mut self.grant_campaign;
        let clock = Clock::get()?;

        // Initialize campaign state
        campaign.total_funding = total_funding;
        campaign.remaining_funding = total_funding;
        campaign.is_active = true;
        campaign.created_at = clock.unix_timestamp;
        campaign.updated_at = clock.unix_timestamp;
        campaign.deadline = deadline;
        campaign.bump = bump;
        campaign.grant_provider = self.grant_provider.key();
        campaign.campaign_id = campaign_id;

        Ok(())
    }
}
