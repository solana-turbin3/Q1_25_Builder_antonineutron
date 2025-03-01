import { SUPABASE_CLIENT } from "@/supabaseconfig";
import { SupabaseClient } from "@supabase/supabase-js";
import { GrantCampaign } from "../types/grant_campaign";
import { GRANT_CAMPAIGN_TABLE } from "../app_constants";
import { objectToSnake } from "ts-case-convert";

export class DBService {
    private static instance: DBService;
    private client: Promise<SupabaseClient>;

    private constructor() {
        this.client = SUPABASE_CLIENT;
    }

    public static getInstance(): DBService {
        if (!DBService.instance) {
            DBService.instance = new DBService();
        }
        return DBService.instance;
    }

    public async saveGrantCampaign(grantCampaign: GrantCampaign): Promise<void> {
        // Implement the logic to save a grant Campaign
        try {
            const { data, error } = await (await this.client)
                .from(GRANT_CAMPAIGN_TABLE)
                .insert(objectToSnake(grantCampaign)); //format object keys to snake_case

            if (error) {
                throw error;
            }
        } catch (error) {
            console.error("Error saving campaign to DB:", error);
            throw error;
        }

    }

    public async getGrantCampaigns(userAddress: string): Promise<GrantCampaign[]> {
        // Implement the logic to get all grant Campaigns
        try {
            const { data, error } = await (await this.client)
                .from(GRANT_CAMPAIGN_TABLE)
                .select("*")
                .eq("creator", userAddress);

            if (error) {
                throw error;
            }
            return data as GrantCampaign[];
        } catch (error) {
            console.error("Error getting campaign from DB:", error);
            throw error;
        }
    }


    public async getGrantCampaign(id: string): Promise<GrantCampaign[]> {
        // Implement the logic to get all grant Campaigns
        try {
            const { data, error } = await (await this.client)
                .from(GRANT_CAMPAIGN_TABLE)
                .select("*")
                .eq("id", id);

            if (error) {
                throw error;
            }
            return data as GrantCampaign[];
        } catch (error) {
            console.error("Error getting campaign from DB:", error);
            throw error;
        }
    }

    public async saveGrantProposal() {

    }

    public async fetchGrantProposals() {
         
    }
}