import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { getAuthenticatedUserId } from "@/lib/apiAuth";

// GET: Fetch all active/visible reviews for a product
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const productId = searchParams.get("product_id");

        if (!productId) {
            return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from("product_reviews")
            .select("id, product_id, user_id, user_name, rating, comment_text, images, video_url, created_at")
            .eq("product_id", productId)
            .eq("is_visible", true)
            .order("created_at", { ascending: false });

        if (error) throw error;

        return NextResponse.json({ reviews: data || [] });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST: Add a new user review (verifying purchase and settings)
export async function POST(req: NextRequest) {
    try {
        // 1. Check if user reviews are allowed globally
        const { data: settingsData, error: settingsError } = await supabaseAdmin
            .from("site_settings")
            .select("value")
            .eq("key", "allow_user_reviews")
            .maybeSingle();

        if (settingsError) throw settingsError;

        let allowUserReviews = true; // default to true
        if (settingsData?.value) {
            const clean = String(settingsData.value).replace(/"/g, "").trim().toLowerCase();
            allowUserReviews = clean === "true" || clean === "1";
        }

        if (!allowUserReviews) {
            return NextResponse.json({ error: "Customer review submissions are currently disabled." }, { status: 403 });
        }

        // 2. Authenticate the user
        const { userId, error: authError } = await getAuthenticatedUserId(req);
        if (!userId) {
            return NextResponse.json({ error: authError || "Unauthorized." }, { status: 401 });
        }

        // Parse multi-part form data
        const formData = await req.formData();
        const productId = String(formData.get("product_id") || "").trim();
        const userName = String(formData.get("user_name") || "").trim();
        const rating = Number(formData.get("rating") || 5);
        const commentText = String(formData.get("comment_text") || "").trim();

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

        // 3. Verify user actually purchased the product
        // Check if there is an order with status paid or delivered (or any order) containing this product
        const { data: orderData, error: orderError } = await supabaseAdmin
            .from("orders")
            .select("id, order_items(product_id)")
            .eq("user_id", userId)
            .is("order_items.deleted_at", null); // checking if table exists

        // Query directly with join since we want to be precise:
        const { data: purchaseRecord, error: purchaseError } = await supabaseAdmin
            .from("order_items")
            .select("id, orders!inner(user_id)")
            .eq("orders.user_id", userId)
            .eq("product_id", productId)
            .limit(1);

        if (purchaseError) throw purchaseError;

        if (!purchaseRecord || purchaseRecord.length === 0) {
            return NextResponse.json({ error: "You must purchase this product to leave a review." }, { status: 403 });
        }

        // 4. Handle media uploads
        const imageFiles = formData.getAll("images").filter((f): f is File => f instanceof File);
        const videoFile = formData.get("video");

        if (imageFiles.length > 2) {
            return NextResponse.json({ error: "Maximum of 2 images allowed." }, { status: 400 });
        }

        const uploadedImages: string[] = [];
        const stamp = Date.now();

        // Upload images
        for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
            const safeExt = (ext || "jpg").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
            const filePath = `reviews/${userId}-${productId}-${stamp}-${i + 1}.${safeExt}`;

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

            uploadedImages.push(publicUrlData.publicUrl);
        }

        // Upload video (if any)
        let uploadedVideoUrl = null;
        if (videoFile instanceof File) {
            const ext = videoFile.name.includes(".") ? videoFile.name.split(".").pop() : "mp4";
            const safeExt = (ext || "mp4").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
            const filePath = `reviews/${userId}-${productId}-${stamp}-video.${safeExt}`;

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

            uploadedVideoUrl = publicUrlData.publicUrl;
        }

        // 5. Insert the review
        const { data: reviewRow, error: insertError } = await supabaseAdmin
            .from("product_reviews")
            .insert({
                product_id: productId,
                user_id: userId,
                user_name: userName,
                rating,
                comment_text: commentText,
                images: uploadedImages,
                video_url: uploadedVideoUrl,
                is_visible: true, // Visible by default when submitted by a customer
            })
            .select()
            .single();

        if (insertError) throw insertError;

        return NextResponse.json({ success: true, review: reviewRow });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
