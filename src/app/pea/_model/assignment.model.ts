export interface ProcessedAssignment {
  record: {
    total: number;
    success: number;
    failed: number;
  };
  processedUrl: string;
}
