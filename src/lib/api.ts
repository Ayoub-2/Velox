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

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Session Management (Client-Side Only)
const getSessionId = () => {
    if (typeof window === 'undefined') return ''; // Server-side safety
    let sid = localStorage.getItem('velox_session_id');
    if (!sid) {
        sid = Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('velox_session_id', sid);
    }
    return sid;
};

const getHeaders = (base: Record<string, string> = {}) => {
    const headers = { ...base };
    const sid = getSessionId();
    if (sid) {
        headers['X-Session-ID'] = sid;
    }
    const token = localStorage.getItem('velox_access_token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export const apiClient = {
    async triggerScan(targetUrl: string, scanType: string = 'nuclei', options?: Record<string, any>): Promise<ScanResponse> {
        const payload: ScanRequest = {
            target_url: targetUrl,
            scan_type: scanType as any,
            options
        };

        const res = await fetch(`${API_BASE_URL}/scans`, {
            method: 'POST',
            headers: getHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.detail || 'Failed to trigger scan');
        }
        return res.json();
    },

    async getScans(): Promise<ScanResponse[]> {
        const res = await fetch(`${API_BASE_URL}/scans`, {
            headers: getHeaders()
        });
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.detail || 'Failed to fetch scans');
        }
        return res.json();
    },

    async getScan(id: string): Promise<ScanResponse> {
        const res = await fetch(`${API_BASE_URL}/scans/${id}`, { headers: getHeaders() });
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.detail || 'Failed to fetch scan details');
        }
        return res.json();
    },

    async getDashboardStats(): Promise<any> {
        const res = await fetch(`${API_BASE_URL}/stats/summary`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch stats');
        return res.json();
    },

    async getFindingTrend(days: number = 7): Promise<any[]> {
        const res = await fetch(`${API_BASE_URL}/stats/trend?days=${days}`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch trend');
        return res.json();
    },

    async getKbArticles(): Promise<any[]> {
        const res = await fetch(`${API_BASE_URL}/kb`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch KB articles');
        return res.json();
    },

    async getKbArticle(slug: string): Promise<any> {
        const res = await fetch(`${API_BASE_URL}/kb/${slug}`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch KB article');
        return res.json();
    },

    async matchKbArticle(query: string): Promise<any> {
        const res = await fetch(`${API_BASE_URL}/kb/match?q=${encodeURIComponent(query)}`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to match KB article');
        return res.json();
    }
};
