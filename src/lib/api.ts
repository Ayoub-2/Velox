export interface ScanRequest {
    target_url: string;
    scan_type: 'nuclei' | 'baseline' | 'full';
}

export interface ScanResponse {
    id: string;
    target_url: string;
    scan_type: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    created_at: string;
    result?: any;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = {
    async triggerScan(targetUrl: string, scanType: string = 'nuclei'): Promise<ScanResponse> {
        const res = await fetch(`${API_BASE_URL}/scans`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target_url: targetUrl, scan_type: scanType }),
        });
        if (!res.ok) throw new Error('Failed to trigger scan');
        return res.json();
    },

    async getScans(): Promise<ScanResponse[]> {
        const res = await fetch(`${API_BASE_URL}/scans`);
        if (!res.ok) throw new Error('Failed to fetch scans');
        return res.json();
    },

    async getScan(id: string): Promise<ScanResponse> {
        const res = await fetch(`${API_BASE_URL}/scans/${id}`);
        if (!res.ok) throw new Error('Failed to fetch scan details');
        return res.json();
    }
};
