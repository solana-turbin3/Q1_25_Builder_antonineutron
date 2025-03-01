import { DBService } from "@/lib/services/db_service";
import { GrantCampaign } from "@/lib/types/grant_campaign";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
    try {
        let id: string = req.nextUrl.searchParams.get('id') ?? "";

        let campaign = await DBService
            .getInstance()
            .getGrantCampaign(id)
            
        return NextResponse.json(campaign[0]);
    } catch (error) {
        console.error("Error getting campaign", error);
        return NextResponse.error();
    }
}

export async function POST(req: NextRequest) {
    const formData = await req.json();
    try {
        const grantCampaign: GrantCampaign = formData as any as GrantCampaign;

        await DBService
            .getInstance()
            .saveGrantCampaign(grantCampaign);

        return NextResponse.json({ message: "Saved" })
    } catch (error) {
        console.error("Error saving campaign: ", error);
        return NextResponse.error();
    }
}