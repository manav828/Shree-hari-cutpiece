import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { decrypt } from "./encryption";
import { ShiprocketService } from "./ShiprocketService";
import { DelhiveryService } from "./DelhiveryService";

export type ShippingProvider = "manual" | "shiprocket" | "delhivery";

export class ShippingManager {
    private static async getSetting(key: string, defaultValue: string = ""): Promise<string> {
        try {
            const { data, error } = await supabaseAdmin
                .from("site_settings")
                .select("value")
                .eq("key", key)
                .single();

            if (error || !data) return defaultValue;
            
            let val = data.value;
            if (typeof val === "string") {
                try {
                    val = JSON.parse(val);
                } catch {
                    // Ignore
                }
            }
            return String(val ?? defaultValue);
        } catch (e) {
            console.error(`Error loading setting ${key}:`, e);
            return defaultValue;
        }
    }

    public static async getActiveProvider(): Promise<ShippingProvider> {
        const provider = await this.getSetting("shipping_provider", "manual");
        const clean = provider.toLowerCase().trim();
        if (clean === "shiprocket" || clean === "delhivery") {
            return clean as ShippingProvider;
        }
        return "manual";
    }

    public static async getService(): Promise<ShiprocketService | DelhiveryService | null> {
        const provider = await this.getActiveProvider();

        if (provider === "shiprocket") {
            const email = await this.getSetting("shipping_shiprocket_email");
            const encryptedPassword = await this.getSetting("shipping_shiprocket_password");
            const password = decrypt(encryptedPassword);
            
            return new ShiprocketService({
                email,
                password,
            });
        }

        if (provider === "delhivery") {
            const encryptedToken = await this.getSetting("shipping_delhivery_token");
            const token = decrypt(encryptedToken);
            const sandboxStr = await this.getSetting("shipping_delhivery_sandbox", "false");
            const sandbox = sandboxStr === "true";

            return new DelhiveryService({
                token,
                sandbox,
            });
        }

        return null; // Manual
    }

    public static async createShipment(shipmentDetails: {
        orderId: string;
        orderNumber: string;
        customerName: string;
        phone: string;
        addressLine1: string;
        addressLine2?: string;
        city: string;
        state: string;
        pincode: string;
        amount: number;
        weight?: number; // in kg
        items: Array<{ name: string; quantity: number; price: number }>;
    }): Promise<{ success: boolean; trackingId?: string; rawResponse?: any; error?: string }> {
        const provider = await this.getActiveProvider();
        const service = await this.getService();

        if (provider === "manual" || !service) {
            // Manual shipping returns a success placeholder requiring AWB manual input
            return {
                success: true,
                error: "Manual provider selected. Please input tracking details manually."
            };
        }

        try {
            if (service instanceof ShiprocketService) {
                // Map to Shiprocket payload structure
                const shiprocketPayload = {
                    order_id: shipmentDetails.orderNumber,
                    order_date: new Date().toISOString().split("T")[0],
                    pickup_location: "Primary",
                    billing_customer_name: shipmentDetails.customerName.split(" ")[0] || "Customer",
                    billing_last_name: shipmentDetails.customerName.split(" ").slice(1).join(" ") || "Customer",
                    billing_address: shipmentDetails.addressLine1,
                    billing_address_2: shipmentDetails.addressLine2 || "",
                    billing_city: shipmentDetails.city,
                    billing_pincode: shipmentDetails.pincode,
                    billing_state: shipmentDetails.state,
                    billing_country: "India",
                    billing_email: "customer@example.com", // Fallback
                    billing_phone: shipmentDetails.phone,
                    shipping_is_billing: true,
                    order_items: shipmentDetails.items.map(item => ({
                        name: item.name,
                        sku: item.name.substring(0, 10),
                        units: item.quantity,
                        selling_price: item.price,
                    })),
                    payment_method: "Prepaid",
                    sub_total: shipmentDetails.amount,
                    length: 10,
                    width: 10,
                    height: 10,
                    weight: shipmentDetails.weight || 0.5,
                };

                const response = await service.createOrder(shiprocketPayload);
                return {
                    success: true,
                    trackingId: response.shipment_id || response.order_id,
                    rawResponse: response,
                };
            }

            if (service instanceof DelhiveryService) {
                // Map to Delhivery payload structure
                const delhiveryPayload = {
                    shipments: [
                        {
                            name: shipmentDetails.customerName,
                            add: `${shipmentDetails.addressLine1} ${shipmentDetails.addressLine2 || ""}`,
                            pin: shipmentDetails.pincode,
                            phone: shipmentDetails.phone,
                            payment_mode: "Prepaid",
                            client: "Shree Hari Cut Piece",
                            order: shipmentDetails.orderNumber,
                            amount: shipmentDetails.amount,
                            total_amount: shipmentDetails.amount,
                            weight: (shipmentDetails.weight || 0.5) * 1000, // Delhivery expects weight in grams
                            products_desc: shipmentDetails.items.map(i => i.name).join(", "),
                        }
                    ],
                    pickup_location: {
                        name: "Warehouse",
                    }
                };

                const response = await service.createShipment(delhiveryPayload);
                return {
                    success: response.success ?? true,
                    trackingId: response.packages?.[0]?.waybill || response.waybill,
                    rawResponse: response,
                };
            }

            return { success: false, error: "Unsupported active shipping service" };
        } catch (error: any) {
            console.error("Create shipment operation failed:", error);
            return {
                success: false,
                error: error.message || "Shipment creation failed"
            };
        }
    }

    public static async trackShipment(trackingIdOrAwb: string): Promise<{ success: boolean; status?: string; details?: any; error?: string }> {
        const provider = await this.getActiveProvider();
        const service = await this.getService();

        if (provider === "manual" || !service) {
            return {
                success: true,
                status: "Manual Tracking",
                details: { info: "Track this package manually on your carrier's website." }
            };
        }

        try {
            if (service instanceof ShiprocketService) {
                const response = await service.trackShipment(trackingIdOrAwb);
                return {
                    success: true,
                    status: response.tracking_data?.shipment_status || "Unknown",
                    details: response,
                };
            }

            if (service instanceof DelhiveryService) {
                const response = await service.trackShipment(trackingIdOrAwb);
                const packageInfo = response.ShipmentData?.[0]?.Shipment;
                return {
                    success: true,
                    status: packageInfo?.Status?.Status || "Unknown",
                    details: response,
                };
            }

            return { success: false, error: "Unsupported active shipping service" };
        } catch (error: any) {
            console.error("Track shipment operation failed:", error);
            return {
                success: false,
                error: error.message || "Tracking failed"
            };
        }
    }

    public static async calculateCheckoutShipping(pincode: string, state: string, weightKg: number, isCod: boolean): Promise<{
        success: boolean;
        rate: number;
        estimatedDays: number;
        codAvailable: boolean;
        provider: string;
        error?: string;
    }> {
        const provider = await this.getActiveProvider();
        const service = await this.getService();

        // Standard defaults
        const defaultRate = 99;
        const defaultDays = 5;

        if (provider === "manual" || !service) {
            return {
                success: true,
                rate: defaultRate,
                estimatedDays: defaultDays,
                codAvailable: true,
                provider: "manual"
            };
        }

        try {
            if (service instanceof ShiprocketService) {
                const pickupPincode = await this.getSetting("shipping_pickup_pincode", "395003");
                const response = await service.checkServiceability(pickupPincode, pincode, weightKg, isCod);
                
                const data = response.data;
                if (data && data.available_courier_companies && data.available_courier_companies.length > 0) {
                    const couriers = data.available_courier_companies;
                    const cheapest = couriers.reduce((prev: any, curr: any) => 
                        Number(prev.freight_charge) < Number(curr.freight_charge) ? prev : curr
                    );

                    return {
                        success: true,
                        rate: Math.ceil(Number(cheapest.freight_charge)),
                        estimatedDays: cheapest.etd_hours ? Math.ceil(cheapest.etd_hours / 24) : defaultDays,
                        codAvailable: cheapest.cod === 1,
                        provider: "shiprocket"
                    };
                }
            }

            if (service instanceof DelhiveryService) {
                const response = await service.checkServiceability(pincode);
                
                const pinData = response.delivery_codes?.[0]?.postal_code;
                if (pinData) {
                    const codAvailable = pinData.cod === "Y";
                    return {
                        success: true,
                        rate: defaultRate,
                        estimatedDays: pinData.estimated_delivery_days || defaultDays,
                        codAvailable,
                        provider: "delhivery"
                    };
                }
            }

            return {
                success: false,
                rate: defaultRate,
                estimatedDays: defaultDays,
                codAvailable: true,
                provider,
                error: "Pincode not serviceable by logistics partner."
            };

        } catch (error: any) {
            console.error("Live shipping calculation failed:", error);
            return {
                success: true,
                rate: defaultRate,
                estimatedDays: defaultDays,
                codAvailable: true,
                provider,
                error: error.message || "Live rates API unreachable. Fallback applied."
            };
        }
    }
}
