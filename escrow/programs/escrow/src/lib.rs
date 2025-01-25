use anchor_lang::prelude::*;

pub mod instructions;
use instructions::*;

pub mod state;
use state::*;

declare_id!("nWxDUmQRpZ9ncQjqE7CBKPexRm58fbF86E5gCp2cxdz");

#[program]
pub mod escrow {
    use super::*;

    pub fn make(ctx: Context<Make>, seed:u64, receive_amount: u64, deposit_amount: u64)->Result<()>{
        ctx.accounts.init_escrow_state(seed, receive_amount, ctx.bumps);
        ctx.accounts.deposit(deposit_amount);

        
        Ok(())
    }

    pub fn take(ctx: Context<Take>)->Result<()>{
        ctx.accounts.withdraw()?;
        ctx.accounts.close()?;

        Ok(())
    }

    pub fn refund(ctx: Context<RefundOffer>) -> Result<()> {
        ctx.accounts.withdraw_and_close_vault()?;
        Ok(())
    }
}
