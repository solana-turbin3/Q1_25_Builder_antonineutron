"use client"

import ShareCampaignDialog from "@/components/dialog/share_campaign";
import ProposalItem from "@/components/proposal_item";
import useCamapign from "@/lib/hooks/use_campaign";
import { GrantCampaign } from "@/lib/types/grant_campaign";
import { getDaysLeft, truncateAddress } from "@/lib/utils";
import { useWallet } from "@solana/wallet-adapter-react";
import Image from 'next/image';
import { useEffect } from "react";
import { FaCircleNotch, FaShareAltSquare } from "react-icons/fa";
// import { getDaysLeft, truncateAddress } from '@/lib/utils';

interface UsersCampaignPageProps {
    params: { id: string };
}

export default function UsersCampaignPage({ params }: UsersCampaignPageProps) {
    const {fetchCampaign, campaign, loading} = useCamapign();

    useEffect(()=>{
        fetchCampaign(params.id);
    },[])

    return (
        <div>
            {
                loading && (
                    <div className="min-h-[90vh] flex justify-center items-center">
                        <FaCircleNotch className="text-4xl animate-spin mx-auto" />
                    </div>
                )
            }
            {
                campaign && (
                    <div className="container mx-auto px-4 py-8">
                        {/* Hero Section */}
                        {/* <div className="relative w-full h-64 rounded-lg overflow-hidden mb-8">
                <Image 
                    src="/placeholder.jpg"
                    alt="Campaign banner"
                    fill
                    className="object-cover"
                />
            </div> */}

                        {/* Campaign Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Main Content */}
                            <div className="md:col-span-2">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h1 className="text-3xl font-bold mb-4">{campaign.title}</h1>
                                        <p className="text-gray-600 mb-6">
                                            {campaign.description}
                                        </p>
                                    </div>
                                    <ShareCampaignDialog
                                        campaignUrl={"tita.com/campaign/"+campaign.id} />
                                </div>

                                {/* Tabs */}
                                <div className="border-b border-gray-200 mb-6">
                                    <nav className="-mb-px flex space-x-8">
                                        <a href="#" className="border-b-2 border-primary py-4 px-1">
                                            Proposals
                                        </a>
                                        {/* <a href="#" className="text-gray-500 hover:text-gray-700 py-4 px-1">
                                Milestones
                            </a> */}
                                    </nav>
                                </div>

                                {/* Tab Content */}
                                <div className="min-h-[400px]">
                                    {/* Proposals or Milestones list */}
                                    <ProposalItem />
                                </div>
                            </div>

                            {/* Sidebar */}
                            <div className="bg-gray-200 p-6 rounded-lg shadow-md h-fit sticky top-7">
                                <div className="mb-6">
                                    <span className="text-3xl font-bold">{campaign.amount} {campaign.currency}</span>
                                    <div className="mt-2 bg-white rounded-full">
                                        <div className="bg-primary h-2 rounded-full w-1/2"></div>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Created by</span>
                                        <span className="font-medium">
                                            {truncateAddress(campaign.creator)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Time left</span>
                                        <span className="font-medium">{getDaysLeft(campaign.deadline)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total proposals</span>
                                        <span className="font-medium">10</span>
                                    </div>
                                </div>

                                <button className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary transition-colors">
                                    Apply for Grant
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
}
