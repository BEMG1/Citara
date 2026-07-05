import type { IRule, IDocumentData, IRuleResult } from '../types';

export const referenceListRule: IRule = {
  id: 'apa7-references-exist',
  name: 'Referencias bibliográficas',
  description: 'Verifica la existencia de una sección de Referencias al final del documento.',
  weight: 30,
  evaluate: (data: IDocumentData): IRuleResult => {
    // Heuristic: Check if "Referencias" or "References" exists as a heading or near the end.
    const referencesRegex = /(?:<h[1-3][^>]*>)\s*(?:Referencias|References)\s*(?:<\/h[1-3]>)/i;
    
    // If the intelligent extractor already pulled them out, or we find a formal heading
    if (data.hasExtractedReferences || referencesRegex.test(data.html)) {
      return {
        id: 'apa7-references-exist',
        name: 'Referencias bibliográficas',
        description: 'Sección de referencias.',
        status: 'compliant',
        weight: 30
      };
    }

    // Fallback heuristic: check if word appears in the text
    if (/(Referencias|References)\b/i.test(data.text)) {
      return {
        id: 'apa7-references-exist',
        name: 'Referencias bibliográficas',
        description: 'Sección de referencias.',
        status: 'warning',
        message: 'Se mencionan referencias, pero no parece haber una sección con encabezado formal.',
        weight: 30
      };
    }

    // Check for in-text citations: either Citara markup OR plain-text APA patterns
    const hasMarkupCitations = /<mark[^>]*data-reference-id/i.test(data.html);
    // Plain-text pattern: (Author, YYYY) or (Author et al., YYYY)
    const hasPlainTextCitations = /\([A-Za-záéíóúüñÁÉÍÓÚÜÑ][A-Za-záéíóúüñÁÉÍÓÚÜÑ\s\-']+(?:et\s+al\.?)?,?\s*\d{4}[a-z]?\)/i.test(data.text);

    if (!hasMarkupCitations && !hasPlainTextCitations && !data.hasExtractedReferences) {
      return {
        id: 'apa7-references-exist',
        name: 'Referencias bibliográficas',
        description: 'Sección de referencias.',
        status: 'non-compliant',
        message: 'No se encontraron citas ni sección de Referencias en el documento.',
        weight: 30
      };
    }

    return {
      id: 'apa7-references-exist',
      name: 'Referencias bibliográficas',
      description: 'Sección de referencias.',
      status: 'non-compliant',
      message: 'No se encontró la sección de Referencias.',
      weight: 30
    };
  }
};
