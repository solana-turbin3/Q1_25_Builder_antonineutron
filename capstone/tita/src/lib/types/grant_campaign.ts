
export interface GrantCampaign {
    id: string;
    creator: string;
    title: string;
    description: string;
    image: string;
    amount?: number;
    currency: string;
    deadline: string;
    txHash: string;
    createdAt?: string;
    updatedAt?: string;
}