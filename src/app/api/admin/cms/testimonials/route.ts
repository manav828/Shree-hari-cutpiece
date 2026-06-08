import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from("testimonials")
            .select("*")
            .order("sort_order", { ascending: true });

        if (error) throw error;

        return NextResponse.json({ items: data ?? [] });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load testimonials";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, quote, name, location, avatar, rating, sort_order } = body;

        if (!quote?.trim()) return NextResponse.json({ error: "Quote is required." }, { status: 400 });
        if (!name?.trim()) return NextResponse.json({ error: "Name is required." }, { status: 400 });
        if (!location?.trim()) return NextResponse.json({ error: "Location is required." }, { status: 400 });
        if (!avatar?.trim()) return NextResponse.json({ error: "Avatar URL is required." }, { status: 400 });

        const payload: Record<string, any> = {
            quote: quote.trim(),
            name: name.trim(),
            location: location.trim(),
            avatar: avatar.trim(),
            rating: Number(rating || 5),
            sort_order: Number(sort_order || 0),
            updated_at: new Date().toISOString()
        };

        if (id) {
            payload.id = id;
        }

        const { data, error } = await supabaseAdmin
            .from("testimonials")
            .upsert(payload, { onConflict: "id" })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, item: data });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to save testimonial";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Testimonial ID is required." }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from("testimonials")
            .delete()
            .eq("id", id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to delete testimonial";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
