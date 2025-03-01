use anchor_lang::prelude::*;

#[error_code]
pub enum TitaErrorCode {
    #[msg("Insufficient funds for your ask")]
    InsufficientFunds,

    #[msg("An error occured while calculating balance")]
    CalculationError,

    #[msg("No remaining funds")]
    NoRemainingFunds,

    #[msg("Only grant provider can approve or reject milestone")]
    OnlyGrantProviderCanApproveMilestone,

    #[msg("Deadline not exceeded")]
    DeadlineNotExceeded,

    #[msg("No deadline set")]
    NoDeadlineSet,

    #[msg("Deadline exceeded")]
    DeadlineExceeded,

    #[msg("Invalid status transition")]
    InvalidStatusTransition
}