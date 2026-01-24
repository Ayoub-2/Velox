export interface DocData {
    id: string;
    title: string;
    description: string;
    category?: string;
    difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
    tags?: string[];
    contentHtml?: string;
    [key: string]: any;
}
