import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

// GET: Fetch all reviews (including hidden ones) for a specific product
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const productId = params.id;

        const { data, error } = await supabaseAdmin
            .from("product_reviews")
            .select("id, product_id, user_id, user_name, rating, comment_text, images, video_url, is_visible, created_at")
            .eq("product_id", productId)
            .order("created_at", { ascending: false });

        if (error) throw error;

        return NextResponse.json({ reviews: data || [] });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST: Directly add a review from the admin side for a specific product
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const productId = params.id;
        const contentType = req.headers.get("content-type") || "";

        let userName = "";
        let rating = 5;
        let commentText = "";
        let images: string[] = [];
        let videoUrl: string | null = null;
        let isVisible = true;

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            userName = String(formData.get("user_name") || "").trim();
            rating = Number(formData.get("rating") || 5);
            commentText = String(formData.get("comment_text") || "").trim();
            isVisible = formData.get("is_visible") !== "false";

            const imageFiles = formData.getAll("images").filter((f): f is File => f instanceof File);
            const videoFile = formData.get("video");

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
            userName = String(body.user_name || "").trim();
            rating = Number(body.rating || 5);
            commentText = String(body.comment_text || "").trim();
            images = Array.isArray(body.images) ? body.images : [];
            videoUrl = body.video_url || null;
            isVisible = body.is_visible !== false;
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

// PATCH: Update specific fields of a review (e.g. toggle visibility)
export async function PATCH(req: NextRequest) {
    try {
        const { reviewId, isVisible, rating, commentText, userName, productId } = body;

        if (!reviewId) {
            return NextResponse.json({ error: "Review ID is required." }, { status: 400 });
        }

        const updates: any = {};
        if (isVisible !== undefined) updates.is_visible = Boolean(isVisible);
        if (rating !== undefined) updates.rating = Number(rating);
        if (commentText !== undefined) updates.comment_text = String(commentText).trim();
        if (userName !== undefined) updates.user_name = String(userName).trim();
        if (productId !== undefined) updates.product_id = String(productId);
        
        updates.updated_at = new Date().toISOString();

        const { data, error } = await supabaseAdmin
            .from("product_reviews")
            .update(updates)
            .eq("id", reviewId)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, review: data });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// DELETE: Delete a review from the database
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const reviewId = searchParams.get("review_id");

        if (!reviewId) {
            return NextResponse.json({ error: "Review ID is required." }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from("product_reviews")
            .delete()
            .eq("id", reviewId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
