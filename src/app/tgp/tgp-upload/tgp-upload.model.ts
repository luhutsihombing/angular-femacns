export interface TgpUpload {
    achievementNational: number;
    month: string;
    targetNational: number;
    year: number;
}

export interface TgpProcess {
    countError: number;
    countSuccess: number;
    errorResult: Array<{ rowNum: number; errorMessage: string }>;
    headerId: string;
    total: number;
}
