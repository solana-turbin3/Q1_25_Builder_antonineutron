use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Milestone {
    pub milestone_id: u8,
    pub proposal: Pubkey,
    pub amount: u64,
    pub created_at: i64,
    pub updated_at: i64,
    pub bump: u8,
    #[max_len(124)]
    pub proof_uri: String,
    pub status: MilestoneStatus,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, InitSpace)]
pub enum MilestoneStatus {
    Pending,
    Completed,
    Approved,
    Rejected,
}