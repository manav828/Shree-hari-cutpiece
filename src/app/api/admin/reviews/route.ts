import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

// GET: Fetch reviews across all products, optionally filtered by product_id
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const productId = searchParams.get("product_id");

        let query = supabaseAdmin
            .from("product_reviews")
            .select(`
                id,
                product_id,
                user_id,
                user_name,
                rating,
                comment_text,
                images,
                video_url,
                is_visible,
                created_at,
                products ( id, name, slug )
            `);

        if (productId) {
            query = query.eq("product_id", productId);
        }

        const { data, error } = await query.order("created_at", { ascending: false });

        if (error) throw error;

        return NextResponse.json({ reviews: data || [] });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST: Add a review from the admin side selecting a specific product
export async function POST(req: NextRequest) {
    try {
        const contentType = req.headers.get("content-type") || "";

        let productId = "";
        let userName = "";
        let rating = 5;
        let commentText = "";
        let images: string[] = [];
        let videoUrl: string | null = null;
        let isVisible = true;

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            productId = String(formData.get("product_id") || "").trim();
            userName = String(formData.get("user_name") || "").trim();
            rating = Number(formData.get("rating") || 5);
            commentText = String(formData.get("comment_text") || "").trim();
            isVisible = formData.get("is_visible") !== "false";

            const imageFiles = formData.getAll("images").filter((f): f is File => f instanceof File);
            const videoFile = formData.get("video");

            if (!productId) {
                return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
            }

            const stamp = Date.now();

            // Upload images
            for (let i = 0; i < imageFiles.length; i++) {
                const file = imageFiles[i];
                const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
                const safeExt = (ext || "jpg").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
                const filePath = `reviews/admin-${productId}-${stamp}-${i + 1}.${safeExt}`;

                const { error: uploadError } = await supabaseAdmin.storage
                    .from("cms-assets")
                    .upload(filePath, file, {
                        upsert: false,
                        contentType: file.type || "image/jpeg",
                    });

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabaseAdmin.storage
                    .from("cms-assets")
                    .getPublicUrl(filePath);

                images.push(publicUrlData.publicUrl);
            }

            // Upload video
            if (videoFile instanceof File) {
                const ext = videoFile.name.includes(".") ? videoFile.name.split(".").pop() : "mp4";
                const safeExt = (ext || "mp4").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
                const filePath = `reviews/admin-${productId}-${stamp}-video.${safeExt}`;

                const { error: uploadError } = await supabaseAdmin.storage
                    .from("cms-assets")
                    .upload(filePath, videoFile, {
                        upsert: false,
                        contentType: videoFile.type || "video/mp4",
                    });

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabaseAdmin.storage
                    .from("cms-assets")
                    .getPublicUrl(filePath);

                videoUrl = publicUrlData.publicUrl;
            }
        } else {
            const body = await req.json();
            productId = String(body.product_id || "").trim();
            userName = String(body.user_name || "").trim();
            rating = Number(body.rating || 5);
            commentText = String(body.comment_text || "").trim();
            images = Array.isArray(body.images) ? body.images : [];
            videoUrl = body.video_url || null;
            isVisible = body.is_visible !== false;
        }

        if (!productId) {
            return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
        }
        if (!userName) {
            return NextResponse.json({ error: "User name is required." }, { status: 400 });
        }
        if (Number.isNaN(rating) || rating < 1 || rating > 5) {
            return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
        }
        if (!commentText) {
            return NextResponse.json({ error: "Comment text is required." }, { status: 400 });
        }

        const { data: reviewRow, error: insertError } = await supabaseAdmin
            .from("product_reviews")
            .insert({
                product_id: productId,
                user_name: userName,
                rating,
                comment_text: commentText,
                images,
                video_url: videoUrl,
                is_visible: isVisible,
            })
            .select()
            .single();

        if (insertError) throw insertError;

        return NextResponse.json({ success: true, review: reviewRow });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
