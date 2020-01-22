export interface Tgp {
    data: {
        month: number;
        year: number;
        achievement: number;
        id: string;
        uploadDetails: Array<{
            year: number;
            month: string;
            branchCode: string;
            branchProfability: number;
            couponPeremployee: number;
            seqNo: number;
            errorMessage: string;
            success: boolean;
        }>,
        target: number;
    };
}
