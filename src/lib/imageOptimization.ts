/**
 * Client-side Image Optimization Utility
 * Handles resizing, compression, and thumbnail generation in the browser.
 */

export function getThumbnailUrl(url: string | null | undefined): string {
    if (!url) return "";
    // If it's a Supabase storage url, doesn't already contain _thumb, and is not a legacy/default products folder image
    if (url.includes("/product-images/") && !url.includes("_thumb.") && !url.includes("/product-images/products/")) {
        const lastDot = url.lastIndexOf(".");
        if (lastDot !== -1) {
            return url.substring(0, lastDot) + "_thumb" + url.substring(lastDot);
        }
    }
    return url;
}

export function processImageForUpload(file: File): Promise<{ large: File; thumbnail: File }> {
    return new Promise((resolve) => {
        // If it's not an image (or is a GIF/SVG that shouldn't be compressed), return as-is
        if (!file.type.startsWith("image/") || file.type.includes("gif") || file.type.includes("svg")) {
            resolve({ large: file, thumbnail: file });
            return;
        }

        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(img.src);

            const resizeAndCompress = (maxDim: number, quality: number, suffix: string): Promise<File> => {
                return new Promise((res) => {
                    let width = img.width;
                    let height = img.height;

                    // Maintain aspect ratio
                    if (width > maxDim || height > maxDim) {
                        if (width > height) {
                            height = Math.round((height * maxDim) / width);
                            width = maxDim;
                        } else {
                            width = Math.round((width * maxDim) / height);
                            height = maxDim;
                        }
                    }

                    const canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    
                    if (ctx) {
                        // Fill white background to avoid black background on transparent PNG conversion to JPEG
                        ctx.fillStyle = "#FFFFFF";
                        ctx.fillRect(0, 0, width, height);
                        ctx.drawImage(img, 0, 0, width, height);
                    }

                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                const nameParts = file.name.split(".");
                                const ext = nameParts.pop();
                                const baseName = nameParts.join(".");
                                // Keep original extension to match naming
                                const newName = `${baseName}${suffix}.${ext}`;
                                const newFile = new File([blob], newName, { type: "image/jpeg" });
                                res(newFile);
                            } else {
                                res(file);
                            }
                        },
                        "image/jpeg",
                        quality
                    );
                });
            };

            // large is the unmodified original file (ZERO quality loss / original resolution)
            // thumbnail is resized to max 600px width with 85% quality to look crisp on high-DPI screens
            resizeAndCompress(600, 0.85, "_thumb")
                .then((thumbnail) => {
                    resolve({ large: file, thumbnail });
                })
                .catch((err) => {
                    console.error("Error generating thumbnail:", err);
                    resolve({ large: file, thumbnail: file });
                });
        };

        img.onerror = (err) => {
            console.error("Failed to load image for compression:", err);
            resolve({ large: file, thumbnail: file });
        };
    });
}
