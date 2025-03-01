use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Proposal {
    #[max_len(32)]
    pub proposal_id: String,
    pub grant_campaign: Pubkey,
    pub applicant: Pubkey,
    pub status: ProposalStatus,
    pub ask_amount: u64, 
    pub token_mint: Pubkey,
    pub deadline: Option<i64>, //can be reclaimed by grant_provider after deadline
    pub created_at: i64,
    pub updated_at: i64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, InitSpace)]
pub enum ProposalStatus {
    Pending,
    Approved,
    Rejected,
}