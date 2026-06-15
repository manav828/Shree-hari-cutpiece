export interface DelhiveryCredentials {
    token: string;
    sandbox?: boolean;
}

export class DelhiveryService {
    private token: string;
    private baseUrl: string;

    constructor(credentials: DelhiveryCredentials) {
        this.token = credentials.token;
        this.baseUrl = credentials.sandbox 
            ? "https://staging-express.delhivery.com" 
            : "https://track.delhivery.com";
    }

    public async testCredentials(): Promise<boolean> {
        if (!this.token) return false;
        try {
            // Send a lightweight GET request to check authentication
            const res = await fetch(`${this.baseUrl}/api/v1/packages/json/`, {
                method: "GET",
                headers: {
                    "Authorization": `Token ${this.token}`,
                    "Content-Type": "application/json",
                },
            });

            // If we get an unauthorized status (like 401 or 403), the credentials are invalid
            if (res.status === 401 || res.status === 403) {
                return false;
            }

            // Since it's a packages API without params, it may return 200 or 400 with a structure,
            // but as long as it's not unauthorized, the token itself is valid/active.
            return res.status !== 401 && res.status !== 403;
        } catch (error) {
            console.error("Delhivery credentials validation failed:", error);
            return false;
        }
    }

    public async createShipment(shipmentDetails: any): Promise<any> {
        try {
            // Delhivery cmu API expects urlencoded json payload or raw json depending on endpoint.
            // CMU create endpoint: /api/cmu/create.json
            const formBody = new URLSearchParams();
            formBody.append("format", "json");
            formBody.append("data", JSON.stringify(shipmentDetails));

            const res = await fetch(`${this.baseUrl}/api/cmu/create.json`, {
                method: "POST",
                headers: {
                    "Authorization": `Token ${this.token}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: formBody,
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText || `Delhivery error status: ${res.status}`);
            }

            return await res.json();
        } catch (error: any) {
            console.error("Delhivery create shipment failed:", error);
            throw new Error(`Delhivery shipment creation failed: ${error.message}`);
        }
    }

    public async trackShipment(waybill: string): Promise<any> {
        try {
            const res = await fetch(`${this.baseUrl}/api/v1/packages/json/?waybill=${waybill}`, {
                method: "GET",
                headers: {
                    "Authorization": `Token ${this.token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) {
                throw new Error(`Delhivery tracking error status: ${res.status}`);
            }

            return await res.json();
        } catch (error: any) {
            console.error("Delhivery tracking failed:", error);
            throw new Error(`Delhivery tracking failed: ${error.message}`);
        }
    }

    public async checkServiceability(pincode: string): Promise<any> {
        try {
            const res = await fetch(`${this.baseUrl}/c/api/pin-codes/json/?pincode_list=${pincode}`, {
                method: "GET",
                headers: {
                    "Authorization": `Token ${this.token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) {
                throw new Error(`Delhivery serviceability check failed: ${res.status}`);
            }

            return await res.json();
        } catch (error: any) {
            console.error("Delhivery serviceability check error:", error);
            throw error;
        }
    }
}
