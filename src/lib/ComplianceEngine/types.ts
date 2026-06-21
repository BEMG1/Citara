import type { CitationFormat } from '@/utils/citationFormats';

export type ComplianceStatus = 'compliant' | 'non-compliant' | 'warning' | 'not-applicable';

export interface IRuleResult {
  id: string;
  name: string;
  description: string;
  status: ComplianceStatus;
  message?: string;
  weight: number; // For score calculation, e.g., some rules are more critical
}

export interface IDocumentData {
  html: string;
  text: string;
  arrayBuffer?: ArrayBuffer;
  isNormalized?: boolean;
  hasExtractedCoverPage?: boolean;
  hasExtractedReferences?: boolean;
  references?: import('@/utils/referenceUtils').IReference[];
  // We can add more extracted metadata here later (e.g., from docx or jszip)
}

export interface IRule {
  id: string;
  name: string;
  description: string;
  weight: number;
  evaluate: (data: IDocumentData) => IRuleResult;
}

export interface INormEngine {
  format: CitationFormat;
  rules: IRule[];
}

export interface ComplianceReport {
  format: CitationFormat;
  score: number; // 0 to 100
  compliantElements: IRuleResult[];
  missingElements: IRuleResult[];
  warnings: IRuleResult[];
  isNormalizable: boolean;
}
