
export interface GrantMilestone {
    id: string;
    proposalId: string;
    description: string;
    deadline: string;
    address: string;
    txHash: string;
    status: 'pending' | 'completed' |'approved' | 'rejected';
    createdAt: string;
    updatedAt: string;
}