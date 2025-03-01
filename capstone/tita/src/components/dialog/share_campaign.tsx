import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { FaShareAlt, FaCopy, FaTwitter, FaLinkedin, FaShareAltSquare } from "react-icons/fa";
import { useState } from "react";
import toast from "react-hot-toast";

interface ShareCampaignDialogProps {
    campaignUrl: string;
}

export default function ShareCampaignDialog({ campaignUrl }: ShareCampaignDialogProps) {
    const [isOpen, setIsOpen] = useState(false);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(campaignUrl);
            toast.success("URL copied to clipboard!");
        } catch (err) {
            toast.error("Failed to copy URL");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <button className="flex items-center gap-4 bg-primary text-white py-3 px-6 rounded-lg hover:opacity-50 transition-colors">
                    Share
                    <FaShareAlt className="bg-primary text-white text-2xl" />
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-gray-900">
                <DialogHeader>
                    <DialogTitle>Share Campaign</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            readOnly
                            value={campaignUrl}
                            className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md focus:outline-none"
                        />
                        <button
                            onClick={copyToClipboard}
                            className="p-2 hover:opacity-70"
                        >
                            <FaCopy className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex justify-center gap-4">
                        <button 
                            onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(campaignUrl)}`, '_blank')}
                            className="p-2 text-blue-400 hover:text-blue-600"
                        >
                            <FaTwitter className="w-6 h-6" />
                        </button>
                        <button 
                            onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(campaignUrl)}`, '_blank')}
                            className="p-2 text-blue-700 hover:text-blue-900"
                        >
                            <FaLinkedin className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}