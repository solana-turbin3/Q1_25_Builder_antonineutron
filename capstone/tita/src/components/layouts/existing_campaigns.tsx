"use client"

import { GrantCampaign } from "@/lib/types/grant_campaign"
import CampaignItem from "../campaign_item"
import Link from "next/link"
import CreateCampaign from "../dialog/create_campaign"

interface ExistingCampaignsLayoutProps {
    campaigns: GrantCampaign[]
}

export function ExistingCampaignsLayout({campaigns} : ExistingCampaignsLayoutProps) {
    return (
        <div>
            <div className="mb-8">
                <div className='font-bold text-2xl'>YOUR CAMPAIGNS</div>
            </div>
            <div className="grid grid-cols-3 gap-6">
                {
                    campaigns.map((campaign, index) => (
                        <Link href={`/campaign/${campaign.id}`} key={index}>
                            <CampaignItem grantCampaign={campaign} />
                        </Link>
                    ))
                }
            </div>
            <div className="fixed bottom-8 right-8">
                <CreateCampaign />
            </div>
        </div>
    )
}