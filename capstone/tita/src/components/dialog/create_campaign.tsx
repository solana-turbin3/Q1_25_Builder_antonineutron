import { GrantCampaign } from "@/lib/types/grant_campaign";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, Transaction, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from 'uuid';
import { getTitaProgram, TITA_PROGRAM_ID } from "@project/anchor";
import { AnchorProvider, BN } from "@coral-xyz/anchor";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { APP_CONNECTION } from "@/lib/app_constants";

const TOKEN_OPTIONS = [
    { symbol: "SOL", name: "Solana", address: "So11111111111111111111111111111111111111112" },
    { symbol: "USDC", name: "USD Coin", address: "61DVYzrDYcAqx8oVQ8jixoEYfGhLz1dvmcYic3qJEzYU" }
];

// Add initial state constant
const INITIAL_STATE: GrantCampaign = {
    id: uuidv4().slice(0, 12),
    creator: "",
    title: "",
    description: "",
    image: "",
    currency: "",
    deadline: "",
    txHash: "",
};

interface ValidationErrors {
    title?: string;
    description?: string;
    amount?: string;
    currency?: string;
    deadline?: string;
}

export default function CreateCampaign() {
    // const { connection } = useConnection();
    const connection = APP_CONNECTION;
    const { publicKey, sendTransaction, wallet } = useWallet();
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState<GrantCampaign>(INITIAL_STATE);
    const [errors, setErrors] = useState<ValidationErrors>({});

    const resetForm = () => {
        setFormData({
            ...INITIAL_STATE,
            id: uuidv4().slice(0, 18)
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};
        
        if (!formData.title.trim()) {
            newErrors.title = "Title is required";
        }
        
        if (!formData.description.trim()) {
            newErrors.description = "Description is required";
        }
        
        if (!formData.amount || formData.amount <= 0) {
            newErrors.amount = "Valid amount is required";
        }
        
        if (!formData.currency) {
            newErrors.currency = "Currency selection is required";
        }
        
        if (!formData.deadline) {
            newErrors.deadline = "Deadline is required";
        } else {
            const deadlineDate = new Date(formData.deadline);
            if (deadlineDate <= new Date()) {
                newErrors.deadline = "Deadline must be in the future";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!publicKey) return;
        
        if (!validateForm()) {
            toast.error("Please fill all required fields");
            return;
        }

        setIsLoading(true);
        try {
            let trxHash = await signCreateTransaction();
            if(!trxHash){
                toast.error("Transaction failed");
                return;
            }

            await saveGrantToDB();
            setIsOpen(false);
            resetForm();
            // const latestBlockhash = await connection.getLatestBlockhash();

            // const message = new TransactionMessage({
            //     payerKey: publicKey,
            //     recentBlockhash: latestBlockhash.blockhash,
            //     instructions: [], // Add instructions here
            // }).compileToV0Message();

            // const transaction = new VersionedTransaction(message);

            // const signature = await sendTransaction(transaction, connection);
            // await connection.confirmTransaction(signature);

        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const signCreateTransaction = async (): Promise<string> => {
        const instructions = [];
        
        const selectedToken = new PublicKey(TOKEN_OPTIONS.find(t => t.symbol === formData.currency)!.address);
        console.log(publicKey!.toBuffer());
        console.log(Buffer.from(formData.id));
        const [campaignPda] = PublicKey.findProgramAddressSync(
            [Buffer.from(formData.id), publicKey!.toBuffer()],
            TITA_PROGRAM_ID
        );

        const [campaignVaultPda] = PublicKey.findProgramAddressSync(
            [campaignPda.toBuffer(), selectedToken.toBuffer()],
            TITA_PROGRAM_ID
        );

        const providerTokenAccount = await getAssociatedTokenAddress(
            selectedToken,
            publicKey!
        );

        // let provider = new AnchorProvider(connection, wallet!, {"skipPreflight": true});

        instructions.push(
            await getTitaProgram({ connection } as any).methods
                .createCampaign(
                    formData.id,
                    new BN(formData.amount!),
                    new BN(new Date(formData.deadline).getTime() / 1000)
                ).accountsPartial({
                    grantProvider: publicKey!,
                    providerTokenAccount: providerTokenAccount,
                    grantCampaign: campaignPda,
                    campaignVault: campaignVaultPda,
                    tokenMint: selectedToken,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                }).instruction()
        )

        const blockhash = await connection.getLatestBlockhash();
        
        // create v0 compatible message
        const messageV0 = new TransactionMessage({
            instructions,
            payerKey: publicKey!,
            recentBlockhash: blockhash.blockhash,
        }).compileToV0Message();

        const transferTransaction = new VersionedTransaction(messageV0);

        // sign transaction
        if (!sendTransaction) {
            throw new Error("Wallet doesn't support transaction signing!");
        }
        console.log('connection', connection)
        try{
            const hash = await sendTransaction(transferTransaction, connection);
            console.log("hash", hash);
            return hash;
        }catch(e){
            toast.error("Transaction failed");
            console.log(e)
        }
        return "";
    }

    const saveGrantToDB = async () => {
        // set creator to public key
        // make post request to api/user/
        try {
            const response = await axios.post(
                'api/grant',
                JSON.stringify({
                    ...formData,
                    creator: publicKey?.toString()
                }),
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            console.log('Campaign saved:', response.data);
            toast.success('Campaign created successfully');
        } catch (error) {
            console.error('Error saving campaign:', error);
        }
    }

    return (
        <div>
            <Dialog 
                open={isOpen} 
                onOpenChange={(open) => {
                    setIsOpen(open);
                    if (!open) resetForm();
                }}
            >
                <DialogTrigger asChild>
                    <button className='btn btn-primary my-4 text-white'>
                        Create Campaign
                    </button>
                </DialogTrigger>
                <DialogContent
                    className="sm:max-w-[425px] bg-gray-200 dark:bg-gray-900">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>CREATE CAMPAIGN</DialogTitle>
                            <DialogDescription>
                                Create a new grant campaign by providing the required details below.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col space-y-2 my-6">
                            <div className="">
                                <input
                                    id="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Campaign title"
                                    className={`w-full p-2 border rounded-md ${errors.title ? 'border-red-500' : ''}`}
                                    required
                                />
                                {errors.title && <span className="text-red-500 text-sm">{errors.title}</span>}
                            </div>
                            <div className="">
                                <textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Campaign description"
                                    className={`w-full p-2 border rounded-md ${errors.description ? 'border-red-500' : ''}`}
                                    required
                                />
                                {errors.description && <span className="text-red-500 text-sm">{errors.description}</span>}
                            </div>
                            <div className="">
                                <input
                                    id="deadline"
                                    type="datetime-local"
                                    value={formData.deadline}
                                    onChange={handleChange}
                                    className={`w-full p-2 border rounded-md ${errors.deadline ? 'border-red-500' : ''}`}
                                    required
                                />
                                {errors.deadline && <span className="text-red-500 text-sm">{errors.deadline}</span>}
                            </div>
                            <div className="">
                                <input
                                    id="amount"
                                    type="number"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    placeholder="Total funding amount"
                                    min="0"
                                    step="1"
                                    className={`w-full p-2 border rounded-md ${errors.amount ? 'border-red-500' : ''}`}
                                    required
                                />
                                {errors.amount && <span className="text-red-500 text-sm">{errors.amount}</span>}
                            </div>
                            <div className="">
                                <select
                                    id="currency"
                                    value={formData.currency}
                                    onChange={handleChange}
                                    className={`w-full p-2 border rounded-md ${errors.currency ? 'border-red-500' : ''}`}
                                    required
                                >
                                    <option value="">Select Token</option>
                                    {TOKEN_OPTIONS.map((token) => (
                                        <option key={token.symbol} value={token.symbol}>
                                            {token.symbol} - {token.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.currency && <span className="text-red-500 text-sm">{errors.currency}</span>}
                            </div>
                        </div>
                        <DialogFooter>
                            <button
                                type="submit"
                                onClick={handleSubmit}
                                className="btn btn-primary mt-4 text-white"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Creating...' : 'Create Campaign'}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}