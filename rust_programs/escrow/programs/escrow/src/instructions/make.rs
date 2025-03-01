use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface, TransferChecked, transfer_checked};

use crate::state::EscrowState;

#[derive(Accounts)]
#[instruction(seed: u64)]
pub struct Make<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,

    pub mint_a: InterfaceAccount<'info, Mint>,
    pub mint_b: InterfaceAccount<'info, Mint>,

    #[account(
        mut, 
        associated_token::mint=mint_a, 
        associated_token::authority=maker
    )]
    pub maker_mint_a_ata: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init, 
        payer=maker,
        space=EscrowState::INIT_SPACE + 8,
        seeds=[b"escrow", maker.key().as_ref(), seed.to_le_bytes().as_ref()],
        bump
    )]
    pub escrow: Account<'info, EscrowState>,

    #[account(
        init, 
        associated_token::mint=mint_a, 
        associated_token::authority=escrow, 
        payer=maker
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,  
}

impl<'info> Make<'info>{
    pub fn init_escrow_state(
        &mut self,
        seed: u64,
        receive_amount: u64,
        bumps: MakeBumps,
    )-> Result<()>{
        self.escrow.set_inner(
            EscrowState{
                receive_amount,
                seed,
                bump: bumps.escrow,
                maker: self.maker.key(),
                mint_a: self.mint_a.key(),
                mint_b: self.mint_b.key(),
            }
        );

        Ok(())
    }

    pub fn deposit(&mut self, amount: u64) -> Result<()>{
        // Transfer tokens from maker to escrow
        let cpi_accounts = TransferChecked {
            from: self.maker_mint_a_ata.to_account_info(),
            to: self.vault.to_account_info(),
            authority: self.maker.to_account_info(),
            mint: self.mint_a.to_account_info(),
        };
        
        let cpi_program = self.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        transfer_checked(cpi_ctx, amount, self.mint_a.decimals)?;

        Ok(())                                                                                   
    }
}