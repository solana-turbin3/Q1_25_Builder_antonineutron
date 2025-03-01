"use client"

import { useEffect, useState } from 'react'
import { ExistingCampaignsLayout } from './existing_campaigns'
import { NoCampaignsLayout } from './no_campaigns'
import { useWallet } from '@solana/wallet-adapter-react'
import { FaCircleNotch } from "react-icons/fa"
import toast from 'react-hot-toast'
import useCamapign from '@/lib/hooks/use_campaign'

export function BaseCampaignsLayout() {
    const {publicKey} = useWallet();
    const {campaigns, loading, fetchCampaigns} = useCamapign()

    useEffect(() => {
        if(publicKey){
            fetchCampaigns(publicKey!.toString());
        }
    }, [publicKey])

    return (
        <div>
            {
                campaigns.length > 0 ? (
                    <ExistingCampaignsLayout 
                        campaigns={campaigns}/>
                ) : (
                    <NoCampaignsLayout />
                )
            }
            {
                loading && (
                    <div>
                        <FaCircleNotch className="animate-spin text-xl mx-auto" />
                    </div>
                )
            }
        </div>
    )
}