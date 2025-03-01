import ProposalDetails from "./dialog/proposal_details";

export default function ProposalItem(){
    return (
        <div className="space-y-4 hover:opacity-80 my-2">
            <div className="border p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">Proposal Title</h3>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">Open</span>
                </div>
                <p className="text-gray-600 mb-3">Brief description of the proposal...</p>
                <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                        <span>By: 8PJF...brsZ</span>
                        <span className="mx-2">•</span>
                        <span>Submitted 2 days ago</span>
                    </div>
                    <ProposalDetails />
                </div>
            </div>
        </div>
    )
}