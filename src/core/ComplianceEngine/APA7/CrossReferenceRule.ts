import type { IRule, IDocumentData, IRuleResult, ComplianceStatus } from '../types';
import { detectAllCitedIds } from '../citationDetector';

// i18n keys used in this rule (translated in ComplianceModal via t()):
// name:    'crossRef.name'
// msg ok:  'crossRef.ok'
// msg err: 'crossRef.bothMissing' | 'crossRef.orphanCitations' | 'crossRef.unusedRefs' | 'crossRef.empty'

export const crossReferenceRule: IRule = {
  id: 'apa7-cross-reference',
  name: 'crossRef.name',
  description: 'crossRef.desc',
  weight: 20,
  evaluate: (data: IDocumentData): IRuleResult => {
    const references = data.references || [];

    // Detect cited reference IDs via:
    //  1. Citara markup: <mark data-reference-id="...">
    //  2. Figure associations via Bubble Menu
    //  3. Plain-text APA patterns: (Author, Year), (Author et al., Year), etc.
    const citedIds = detectAllCitedIds(data.html, data.text, references);

    // Auto-generated references from figures are implicitly "cited" by the figure itself
    if (data.figures) {
      data.figures.forEach(fig => {
        if (fig.copyrightAttribution) {
          citedIds.add(`fig-ref-${fig.id}`);
        }
      });
    }

    const refIds = new Set(references.map(r => r.id));

    const orphanCitations: string[] = [];
    for (const citedId of citedIds) {
      if (!refIds.has(citedId)) {
        orphanCitations.push(citedId);
      }
    }

    const unusedReferences: string[] = [];
    for (const ref of references) {
      if (!citedIds.has(ref.id)) {
        unusedReferences.push(ref.title || 'crossRef.untitled');
      }
    }

    let status: ComplianceStatus = 'compliant';
    let message = 'crossRef.ok';

    if (orphanCitations.length > 0 && unusedReferences.length > 0) {
      status = 'non-compliant';
      message = 'crossRef.bothMissing';
    } else if (orphanCitations.length > 0) {
      status = 'non-compliant';
      message = 'crossRef.orphanCitations';
    } else if (unusedReferences.length > 0) {
      status = 'warning';
      // Encode key + dynamic data separated by | so the modal can translate + append
      message = `crossRef.unusedRefs|${unusedReferences.join(', ')}`;
    } else if (citedIds.size === 0 && refIds.size === 0) {
      // No cites and no references — ReferenceRules will flag separately; mark as compliant here
      status = 'compliant';
      message = 'crossRef.empty';
    }

    return {
      id: 'apa7-cross-reference',
      name: 'crossRef.name',
      description: 'crossRef.desc',
      status,
      message,
      weight: 20
    };
  }
};
