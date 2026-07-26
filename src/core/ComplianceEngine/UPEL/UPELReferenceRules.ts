import type { IRule, IDocumentData, IRuleResult } from '../types';

export const upelReferenceListRule: IRule = {
  id: 'upel-references-exist',
  name: 'Referencias bibliográficas',
  description: 'Verifica la existencia de una sección de Referencias al final del documento según normas UPEL.',
  weight: 15,
  evaluate: (data: IDocumentData): IRuleResult => {
    // Heuristic: Check if "Referencias" or "References" exists as a heading or near the end.
    const referencesRegex = /(?:<h[1-3][^>]*>)\s*(?:Referencias|References)\s*(?:<\/h[1-3]>)/i;
    
    // If the intelligent extractor already pulled them out, or we find a formal heading
    if (data.hasExtractedReferences || referencesRegex.test(data.html)) {
      return {
        id: 'upel-references-exist',
        name: 'Referencias bibliográficas',
        description: 'Sección de referencias.',
        status: 'compliant',
        weight: 15
      };
    }

    // Fallback heuristic: check if word appears in the text
    if (/(Referencias|References)\b/i.test(data.text)) {
      return {
        id: 'upel-references-exist',
        name: 'Referencias bibliográficas',
        description: 'Sección de referencias.',
        status: 'warning',
        message: 'Se mencionan referencias, pero no parece haber una sección con encabezado formal.',
        weight: 15
      };
    }

    return {
      id: 'upel-references-exist',
      name: 'Referencias bibliográficas',
      description: 'Sección de referencias.',
      status: 'non-compliant',
      message: 'No se encontró la sección de Referencias requerida por UPEL.',
      weight: 15
    };
  }
};

export const upelInTextCitationsRule: IRule = {
  id: 'upel-in-text-citations',
  name: 'Citas en el texto',
  description: 'Verifica que existan citas en el texto correspondientes a las referencias.',
  weight: 15,
  evaluate: (data: IDocumentData): IRuleResult => {
    const hasMarkupCitations = /<mark[^>]*data-reference-id/i.test(data.html);
    const hasPlainTextCitations = /\([A-Za-záéíóúüñÁÉÍÓÚÜÑ][A-Za-záéíóúüñÁÉÍÓÚÜÑ\s\-']+(?:et\s+al\.?)?,?\s*\d{4}[a-z]?\)/i.test(data.text);
    const hasCitations = hasMarkupCitations || hasPlainTextCitations;

    if (hasCitations) {
      return {
        id: 'upel-in-text-citations',
        name: 'Citas en el texto',
        description: 'Citas dentro del documento.',
        status: 'compliant',
        weight: 15
      };
    }

    return {
      id: 'upel-in-text-citations',
      name: 'Citas en el texto',
      description: 'Citas dentro del documento.',
      status: 'non-compliant',
      message: 'No se encontraron citas en el texto del documento.',
      weight: 15
    };
  }
};
