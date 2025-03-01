import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export default function ProposalDetails() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { publicKey } = useWallet();

    const mockProposal = {
        title: "Build NFT Marketplace",
        description: "Create a decentralized NFT marketplace on Solana",
        amount: 5000,
        currency: "USDC",
        status: "pending",
        proposer: "8PJFAdH2RJ2v1zdME3HU477yvHf7LRheLWd3xxeSbrsZ"
    };

    const mockMilestones = [
        {
            id: "1",
            description: "Smart Contract Development",
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: "completed",
            amount: 2500
        },
        {
            id: "2",
            description: "Frontend Integration",
            deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            status: "pending",
            amount: 2500
        }
    ];

    const handleMilestoneAction = async (milestoneId: string, action: 'approve' | 'reject') => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API call
            console.log(`Milestone ${milestoneId} ${action}ed`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="hover:bg-primary">View Details</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-gray-200 dark:bg-gray-950">
                <DialogHeader>
                    <DialogTitle>Proposal Details</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <h3 className="font-semibold">{mockProposal.title}</h3>
                        <p className="text-sm text-gray-600">{mockProposal.description}</p>
                        <div className="mt-2 flex items-center gap-2">
                            <Badge variant="outline">
                                {mockProposal.amount} {mockProposal.currency}
                            </Badge>
                            <Badge variant="outline">
                                Status: {mockProposal.status}
                            </Badge>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-semibold">Milestones</h4>
                        {mockMilestones.map((milestone) => (
                            <div key={milestone.id} className="border p-4 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium">{milestone.description}</p>
                                        <p className="text-sm text-gray-600">
                                            Deadline: {milestone.deadline.toLocaleDateString()}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Amount: {milestone.amount} {mockProposal.currency}
                                        </p>
                                    </div>
                                    <Badge>{milestone.status}</Badge>
                                </div>
                                
                                {milestone.status === 'completed' && (
                                    <div className="mt-4 flex gap-2">
                                        <Button
                                            onClick={() => handleMilestoneAction(milestone.id, 'approve')}
                                            disabled={loading}
                                            className="bg-primary hover:opacity-70 text-white"
                                        >
                                            <FaCheckCircle className="mr-2" />
                                            Approve
                                        </Button>
                                        <Button
                                            onClick={() => handleMilestoneAction(milestone.id, 'reject')}
                                            disabled={loading}
                                            className="text-white hover:opacity-70"
                                            variant="destructive"
                                        >
                                            <FaTimesCircle className="mr-2" />
                                            Reject
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}