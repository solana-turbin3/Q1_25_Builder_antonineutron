import { DBService } from "@/lib/services/db_service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        let id: string = req.nextUrl.searchParams.get('userId') ?? "";

        let campaigns = await DBService
            .getInstance()
            .getGrantCampaigns(id)
            
        return NextResponse.json(campaigns);
    } catch (error) {
        console.error("Error getting campaign", error);
        return NextResponse.error();
    }
}
