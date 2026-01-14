export interface DocData {
    id: string;
    title: string;
    description: string;
    category?: string;
    tags?: string[];
    contentHtml?: string;
    [key: string]: any;
}
