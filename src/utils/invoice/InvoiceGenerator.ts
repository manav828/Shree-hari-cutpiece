import { jsPDF } from "jspdf";
import { formatPrice } from "@/lib/utils";

import { Order as InvoiceOrder } from "@/context/AuthContext";

export function generateInvoicePDF(order: InvoiceOrder) {
    // Standard A4 size: 210mm x 297mm
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    // Color Palette
    const primaryColor = [159, 63, 41]; // accent brand color: #9f3f29
    const darkGray = [28, 28, 25];      // text-foreground
    const lightGray = [122, 111, 104];  // text-secondary
    const backgroundNeutral = [250, 248, 245]; // beige shade: #faf8f5
    const borderNeutral = [220, 212, 204];      // light border

    // Helper functions
    const drawDivider = (y: number) => {
        doc.setDrawColor(borderNeutral[0], borderNeutral[1], borderNeutral[2]);
        doc.setLineWidth(0.3);
        doc.line(15, y, 195, y);
    };

    // --- Header ---
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(15, 15, 180, 8, "F");

    // Company Title & Branding
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("SHREE HARI CUTPIECE", 15, 33);

    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.text("Premium Fabrics & Cutpieces", 15, 38);

    // Invoice Meta (Top Right)
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("INVOICE", 195, 33, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Invoice No: #${order.order_number}`, 195, 38, { align: "right" });
    
    const formattedDate = new Date(order.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
    doc.text(`Date: ${formattedDate}`, 195, 43, { align: "right" });

    drawDivider(48);

    // --- Customer & Merchant Info Blocks ---
    // Merchant Info (Left)
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Merchant Details", 15, 55);

    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Shree Hari Cutpiece", 15, 60);
    doc.text("Surat, Gujarat, India", 15, 65);
    doc.text("Email: support@shreeharicutpiece.com", 15, 70);

    // Customer Info (Right)
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text("Billed To (Customer)", 110, 55);

    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFont("helvetica", "normal");
    doc.text(`Phone: ${order.phone}`, 110, 60);
    
    // Wrap address text beautifully
    const addressLines = doc.splitTextToSize(order.address, 85);
    doc.text(addressLines, 110, 65);

    // Compute dynamic y space taken by customer address
    const addressBlockHeight = addressLines.length * 5 + 65;
    const yStartTable = Math.max(85, addressBlockHeight + 10);

    // --- Order Summary Specs Bar ---
    doc.setFillColor(248, 245, 242);
    doc.rect(15, yStartTable - 6, 180, 10, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text("Payment Method", 20, yStartTable);
    doc.text("Payment Status", 80, yStartTable);
    doc.text("Order Status", 140, yStartTable);

    doc.setFont("helvetica", "normal");
    doc.text(order.paymentMethod, 20, yStartTable + 4);
    doc.text(order.paymentStatus.toUpperCase(), 80, yStartTable + 4);
    doc.text(order.status.toUpperCase(), 140, yStartTable + 4);

    // --- Table of Items ---
    const tableHeaderY = yStartTable + 15;
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(15, tableHeaderY, 180, 8, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Item Description", 18, tableHeaderY + 5.5);
    doc.text("Unit Mode", 110, tableHeaderY + 5.5);
    doc.text("Qty / M", 135, tableHeaderY + 5.5, { align: "right" });
    doc.text("Unit Price", 160, tableHeaderY + 5.5, { align: "right" });
    doc.text("Total", 192, tableHeaderY + 5.5, { align: "right" });

    let currentY = tableHeaderY + 8;
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFont("helvetica", "normal");

    order.items.forEach((item, index) => {
        // Alternating background colors for rows
        if (index % 2 === 0) {
            doc.setFillColor(253, 251, 248);
            doc.rect(15, currentY, 180, 12, "F");
        }
        
        // Draw row bottom border
        doc.setDrawColor(240, 235, 230);
        doc.line(15, currentY + 12, 195, currentY + 12);

        // Product Name (wrapped text to prevent overflow)
        doc.setFont("helvetica", "bold");
        const displayName = item.product_name;
        const nameLines = doc.splitTextToSize(displayName, 90);
        
        if (nameLines.length > 1) {
            doc.text(nameLines[0] + "...", 18, currentY + 5);
        } else {
            doc.text(displayName, 18, currentY + 5);
        }

        // Subtext: Color/Options
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
        const optionsText = [
            item.color_name ? `Color: ${item.color_name}` : "",
            item.selling_mode ? `Mode: ${item.selling_mode}` : ""
        ].filter(Boolean).join(" | ");
        doc.text(optionsText, 18, currentY + 9);

        // Unit Mode, Quantity, Rate, Total
        doc.setFontSize(9);
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        doc.text(item.selling_mode === "meter" ? "Per Meter" : "Per Piece", 110, currentY + 7);
        doc.text(String(item.quantity_or_meters), 135, currentY + 7, { align: "right" });
        doc.text(formatPrice(item.price_per_unit), 160, currentY + 7, { align: "right" });
        doc.text(formatPrice(item.price_per_unit * item.quantity_or_meters), 192, currentY + 7, { align: "right" });

        currentY += 12;
    });

    // --- Totals Section ---
    currentY += 5;
    
    // Check page overflow
    if (currentY > 240) {
        doc.addPage();
        currentY = 20;
    }

    const subtotal = order.total - order.shippingCost;
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text("Subtotal:", 155, currentY, { align: "right" });
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(formatPrice(subtotal), 192, currentY, { align: "right" });

    currentY += 6;
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text("Shipping:", 155, currentY, { align: "right" });
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(order.shippingCost === 0 ? "FREE" : formatPrice(order.shippingCost), 192, currentY, { align: "right" });

    currentY += 8;
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(130, currentY - 5, 65, 8, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Grand Total:", 155, currentY, { align: "right" });
    doc.text(formatPrice(order.total), 192, currentY, { align: "right" });

    // --- Terms / Thank You Footer ---
    const footerY = 275;
    drawDivider(footerY - 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text("Terms & Conditions:", 15, footerY - 3);
    doc.text("1. All items are packaged securely. Contact support on WhatsApp within 7 days for any returns.", 15, footerY + 1);
    doc.text("2. This is a computer-generated invoice and requires no physical signature.", 15, footerY + 5);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Thank you for shopping with Shree Hari Cutpiece!", 195, footerY + 5, { align: "right" });

    // Save PDF
    doc.save(`invoice_${order.order_number}.pdf`);
}
