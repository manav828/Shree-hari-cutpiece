export interface ShiprocketCredentials {
    email: string;
    password?: string;
    token?: string;
}

export class ShiprocketService {
    private email: string;
    private password?: string;
    private token: string | null = null;
    private baseUrl = "https://apiv2.shiprocket.in/v1/external";

    constructor(credentials: ShiprocketCredentials) {
        this.email = credentials.email;
        this.password = credentials.password;
        this.token = credentials.token || null;
    }

    private async authenticate(): Promise<string> {
        if (this.token) return this.token;

        if (!this.email || !this.password) {
            throw new Error("Shiprocket credentials (email and password) are required for authentication");
        }

        try {
            const res = await fetch(`${this.baseUrl}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: this.email,
                    password: this.password,
                }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || `HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            if (data.token) {
                this.token = data.token;
                return this.token!;
            } else {
                throw new Error("Token not found in login response");
            }
        } catch (error: any) {
            console.error("Shiprocket authentication failed:", error);
            throw new Error(`Shiprocket auth failed: ${error.message}`);
        }
    }

    public async testCredentials(): Promise<boolean> {
        try {
            const token = await this.authenticate();
            return !!token;
        } catch (error) {
            console.error("Shiprocket credentials validation failed:", error);
            return false;
        }
    }

    public async createOrder(orderDetails: any): Promise<any> {
        const token = await this.authenticate();
        try {
            const res = await fetch(`${this.baseUrl}/orders/create/adhoc`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(orderDetails),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || `Shiprocket order creation failed with status: ${res.status}`);
            }

            return await res.json();
        } catch (error: any) {
            console.error("Shiprocket create order error:", error);
            throw new Error(`Shiprocket order creation failed: ${error.message}`);
        }
    }

    public async trackShipment(awbCode: string): Promise<any> {
        const token = await this.authenticate();
        try {
            const res = await fetch(`${this.baseUrl}/courier/track/awb/${awbCode}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error(`Shiprocket tracking failed with status: ${res.status}`);
            }

            return await res.json();
        } catch (error: any) {
            console.error("Shiprocket tracking error:", error);
            throw new Error(`Shiprocket tracking failed: ${error.message}`);
        }
    }

    public async checkServiceability(pickupPincode: string, deliveryPincode: string, weight: number, isCod: boolean): Promise<any> {
        const token = await this.authenticate();
        try {
            const url = `${this.baseUrl}/courier/serviceability?pickup_postcode=${pickupPincode}&delivery_postcode=${deliveryPincode}&weight=${weight}&cod=${isCod ? 1 : 0}`;
            const res = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error(`Shiprocket serviceability query failed: ${res.status}`);
            }

            return await res.json();
        } catch (error: any) {
            console.error("Shiprocket serviceability error:", error);
            throw error;
        }
    }
}
