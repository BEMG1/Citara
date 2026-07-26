import type { CitationFormat } from '@/core/citationFormats';
import type { ComplianceReport, IDocumentData, INormEngine } from './types';
import { apa7Engine } from './APA7/index.ts';
import { apa6Engine } from './APA6/index.ts';
import { ieeeEngine } from './IEEE/index.ts';
import { upelEngine } from './UPEL/index.ts';

const engines: Record<CitationFormat, INormEngine> = {
  apa7: apa7Engine,
  apa6: apa6Engine,
  ieee: ieeeEngine,
  upel: upelEngine,
};

export class ComplianceEngine {
  /**
   * Analyzes a document against a specific formatting norm.
   * @param data The extracted document data (html, text, buffer)
   * @param format The target citation format
   * @returns A detailed compliance report
   */
  static analyzeDocument(data: IDocumentData, format: CitationFormat): ComplianceReport {
    const engine = engines[format];
    
    if (!engine) {
      throw new Error(`Norm engine for format ${format} not found.`);
    }

    const results = engine.rules.map(rule => rule.evaluate(data));

    const compliantElements = results.filter(r => r.status === 'compliant');
    const missingElements = results.filter(r => r.status === 'non-compliant');
    const warnings = results.filter(r => r.status === 'warning');

    // Calculate score based on weights — skip 'not-applicable' rules entirely
    const applicableResults = results.filter(r => r.status !== 'not-applicable');
    const totalWeight = applicableResults.reduce((sum, r) => sum + r.weight, 0);
    const earnedWeight = applicableResults.reduce((sum, r) => {
      if (r.status === 'compliant') return sum + r.weight;
      if (r.status === 'warning') return sum + (r.weight * 0.5); // Partial credit for warnings
      return sum;
    }, 0);

    const score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 100;


    // Evaluamos normalizabilidad estrictamente por el umbral del 75%
    const isNormalizable = data.isNormalized === true || score >= 75;

    return {
      format,
      score,
      compliantElements,
      missingElements,
      warnings,
      isNormalizable
    };
  }
}
