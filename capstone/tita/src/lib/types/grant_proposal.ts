import { GrantMilestone } from "./grant_milestones";

export interface GrantProposal {
    id: string;
    campaignId: string;
    proposer: string; // address of proposer creator
    title: string;
    description: string;
    amount: number;
    currency: string;
    txHash: string;
    status: 'pending' | 'approved' | 'rejected';
    milestones: GrantMilestone[];
    createdAt: string;
    updatedAt: string;
}