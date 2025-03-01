import { GrantCampaign } from "@/lib/types/grant_campaign";
import { getDaysLeft, truncateAddress } from "@/lib/utils";

interface CampaignItemProps {
    grantCampaign: GrantCampaign
}

const CampaignItem = ({ grantCampaign }: CampaignItemProps) => {
    
    return (
        <div className="bg-gray-200 rounded-lg shadow-md hover:shadow-lg hover:opacity-80 transition-shadow duration-300 overflow-hidden">
            
            {/* Content */}
            <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{grantCampaign.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                    {grantCampaign.description}
                </p>
                
                {/* Amount */}
                <div className="flex items-center mb-4">
                    <div className="bg-blue-100 rounded-full p-2">
                        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <span className="ml-2 text-2xl font-bold text-gray-700">
                        {grantCampaign.amount} {grantCampaign.currency}
                    </span>
                </div>

                {/* Stats */}
                <div className="flex justify-between items-center text-sm text-gray-500 border-t pt-4">
                    <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span title={new Date(grantCampaign.deadline).toLocaleString()}>
                            {getDaysLeft(grantCampaign.deadline)}
                        </span>
                    </div>
                    {/* <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span>20 Applicants</span>
                    </div> */}
                    {
                        grantCampaign.txHash && (
                            <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M12 8v4l3 3" />
                                </svg>
                                <span title={grantCampaign.txHash}>
                                    Trx Hash: {truncateAddress(grantCampaign.txHash)}
                                </span>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    );
};

export default CampaignItem;