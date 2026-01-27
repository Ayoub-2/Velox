export interface ScanRequest {
    target_url: string;
    scan_type: 'nuclei' | 'baseline' | 'full';
    options?: {
        auth_headers?: Record<string, string>;
        rate_limit?: number;
        [key: string]: any;
    };
}

export interface ScanResponse {
    id: string;
    target_url: string;
    scan_type: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    created_at: string;
    result?: any;
    options?: any;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = {
    async triggerScan(targetUrl: string, scanType: string = 'nuclei', options?: Record<string, any>): Promise<ScanResponse> {
        const payload: ScanRequest = {
            target_url: targetUrl,
            scan_type: scanType as any,
            options
        };

        const res = await fetch(`${API_BASE_URL}/scans`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.detail || 'Failed to trigger scan');
        }
        return res.json();
    },

    async getScans(): Promise<ScanResponse[]> {
        const res = await fetch(`${API_BASE_URL}/scans`);
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.detail || 'Failed to fetch scans');
        }
        return res.json();
    },

    async getScan(id: string): Promise<ScanResponse> {
        const res = await fetch(`${API_BASE_URL}/scans/${id}`);
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.detail || 'Failed to fetch scan details');
        }
        return res.json();
    },

    async getDashboardStats(): Promise<any> {
        const res = await fetch(`${API_BASE_URL}/stats/summary`);
        if (!res.ok) throw new Error('Failed to fetch stats');
        return res.json();
    },

    async getFindingTrend(days: number = 7): Promise<any[]> {
        const res = await fetch(`${API_BASE_URL}/stats/trend?days=${days}`);
        if (!res.ok) throw new Error('Failed to fetch trend');
        return res.json();
    }
};
