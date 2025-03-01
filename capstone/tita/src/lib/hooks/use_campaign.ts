import { useState } from "react"
import toast from "react-hot-toast"
import { GrantCampaign } from "../types/grant_campaign"

export default function useCamapign() {
    const [campaign, setCampaign] = useState<GrantCampaign | null>(null)
    const [campaigns, setCampaigns] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchCampaigns = async (address: string) => {
        setLoading(true)

        try {
            const response = await fetch(`/api/user/grants?userId=${address}`)
            const data = await response.json()
            setCampaigns(data)
        } catch (error) {
            console.error("Error fetching campaigns: ", error);
            toast.success("Error fetching campaigns");
        } finally {
            setLoading(false)
        }
    }

    const fetchCampaign = async (id: string)=>{
        setLoading(true)
        try {
            const response = await fetch(`/api/grant?id=${id}`)
            const data = await response.json();
            
            setCampaign(data)
        } catch (error) {
            console.error("Error fetching campaign: ", error);
            toast.success("Error fetching campaign");
        } finally {
            setLoading(false)
        }
    }


    return { fetchCampaigns, fetchCampaign, campaign, campaigns, loading }
}