import { Connection } from "@solana/web3.js";

export const APP_NAME = "TITA";

export const GRANT_CAMPAIGN_TABLE = "grant_campaigns";
export const GRANT_PROPOSAL_TABLE = "grant_proposals";
export const GRANT_MILESTONES_TABLE = "grant_milestones";


export const HELIUS_ENDPOINT = "https://devnet.helius-rpc.com/?api-key=" + process.env.NEXT_PUBLIC_HELIUS_API_KEY;
// https://mainnet.helius-rpc.com/?api-key=ammmmmm

export const APP_CONNECTION: Connection = new Connection(HELIUS_ENDPOINT, "confirmed");
