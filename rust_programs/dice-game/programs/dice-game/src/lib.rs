pub mod constants;
pub mod error;
pub mod contexts;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use contexts::*;
pub use state::*;

declare_id!("6p8SqTtFeKS4hGuqYRnetaGN71BxXQhnDGzxBiVcsz7q");

#[program]
pub mod dice_game {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        initialize::handler(ctx)
    }
}
