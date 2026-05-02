import { URLS } from './constants.js';
import type {
    NmsEnvironment,
    NmsClientOptions,
    NmsResponseFormat,
    NotamClassification,
    NotamFeature,
    NmsLocationSeriesResponse,
    NmsNotamResponse,
    NmsInitialLoadResponse,
    NmsChecklistResponse
} from './types.js';

export class NmsClient {
    private token: string | null = null;
    private tokenExpiry = 0;
    private environment: NmsEnvironment;

    constructor(private readonly options: NmsClientOptions) {
        this.environment = options.environment ?? "production";
    }

    private async _refreshToken(): Promise<void> {
        const body = new URLSearchParams({
            grant_type: "client_credentials"
        });

        const response = await fetch(URLS[this.environment].auth, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization":
                    "Basic " +
                    Buffer.from(
                        `${this.options.clientId}:${this.options.clientSecret}`
                    ).toString("base64")
            },
            body: body.toString()
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Token request failed: ${response.status} - ${errText}`);
        }

        const data = await response.json() as {
            access_token: string;
            expires_in: number;
        };

        this.token = data.access_token;
        this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    }

    private async _getToken(): Promise<string> {
        if (!this.token || Date.now() >= this.tokenExpiry) {
            await this._refreshToken();
        }
        return this.token!;
    }

    /**
     * Helper to make API requests with automatic token insertion
     */
    private async _request<T>(endpoint: string, options?: RequestInit, customHeaders?: Record<string, string>, returnAs: 'json' | 'response' = 'json'): Promise<T> {
        const token = await this._getToken();
        const url = new URL(`${URLS[this.environment].api}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`);

        const headers = new Headers(options?.headers || {});
        headers.set("Authorization", `Bearer ${token}`);
        if (!headers.has("Accept")) {
            headers.set("Accept", "application/json");
        }

        if (customHeaders) {
            for (const [key, value] of Object.entries(customHeaders)) {
                headers.set(key, value);
            }
        }

        const response = await fetch(url.toString(), {
            ...options,
            headers
        });

        if (!response.ok && response.status !== 307) {
            const errText = await response.text();
            throw new Error(`NMS API request failed: ${response.status} ${response.statusText} - ${errText}`);
        }

        if (returnAs === 'response') {
            return response as unknown as T;
        }

        if (response.status === 307) {
            // Can be returned for relative URLs (allowRedirect false)
            return response.json() as Promise<T>;
        }

        return response.json() as Promise<T>;
    }

    private _buildQueryString(params: Record<string, any>): string {
        const queryParams = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined) {
                queryParams.append(key, String(value));
            }
        }
        const str = queryParams.toString();
        return str ? `?${str}` : "";
    }

    // --- Endpoints --- //

    /**
     * Proxies access to binary data to support a streamed data response.
     */
    public async getContent(token: string): Promise<Response> {
        return this._request<Response>(`/v1/content/${encodeURIComponent(token)}`, undefined, undefined, 'response');
    }

    /**
     * Returns a set of Location-Series data.
     */
    public async getLocationSeries(params?: { lastUpdatedDate?: string }): Promise<NmsLocationSeriesResponse> {
        return this._request<NmsLocationSeriesResponse>(`/v1/locationseries${this._buildQueryString(params || {})}`);
    }

    /**
     * Returns a partial set of NOTAM data based on the provided query parameters.
     */
    public async getFilteredNotams(
        nmsResponseFormat: NmsResponseFormat,
        params?: {
            accountability?: string;
            allowRedirect?: boolean;
            classification?: NotamClassification;
            effectiveEndDate?: string;
            effectiveStartDate?: string;
            feature?: NotamFeature;
            freeText?: string;
            nmsId?: string;
            lastUpdatedDate?: string;
            latitude?: number;
            location?: string;
            longitude?: number;
            notamNumber?: string;
            radius?: number;
        }
    ): Promise<NmsNotamResponse | NmsInitialLoadResponse> {
        return this._request<NmsNotamResponse | NmsInitialLoadResponse>(
            `/v1/notams${this._buildQueryString(params || {})}`,
            undefined,
            { nmsResponseFormat }
        );
    }

    /**
     * Returns checklist formatted subset of NOTAM data based on the provided query parameters.
     */
    public async getNotamsChecklist(params?: {
        accountability?: string;
        classification?: NotamClassification;
        location?: string;
    }): Promise<NmsChecklistResponse> {
        return this._request<NmsChecklistResponse>(`/v1/notams/checklist${this._buildQueryString(params || {})}`);
    }

    /**
     * Returns either a binary file or relative content path referencing a compressed initial load file.
     */
    public async getInitialLoad(params?: { allowRedirect?: boolean }): Promise<NmsInitialLoadResponse | Response> {
        // If allowRedirect is implicitly or explicitly true, fetch might follow it automatically
        // Returning as Response allows handling binary stream.
        return this._request<NmsInitialLoadResponse | Response>(`/v1/notams/il${this._buildQueryString(params || {})}`, undefined, undefined, 'json'); // Fallback json as per 307
    }

    /**
     * Returns either a binary file or relative content path referencing a compressed initial load file by classification.
     */
    public async getInitialLoadByClassification(
        classification: NotamClassification,
        params?: { allowRedirect?: boolean }
    ): Promise<NmsInitialLoadResponse | Response> {
        return this._request<NmsInitialLoadResponse | Response>(
            `/v1/notams/il/${encodeURIComponent(classification)}${this._buildQueryString(params || {})}`
        );
    }
}
