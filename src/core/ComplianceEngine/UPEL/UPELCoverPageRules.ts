import type { IRule, IDocumentData, IRuleResult } from '../types';

export const upelCoverPageRule: IRule = {
  id: 'upel-cover-page',
  name: 'Portada UPEL',
  description: 'Verifica la existencia y formato de la portada (título, autor, tutor, institución).',
  weight: 20,
  evaluate: (data: IDocumentData): IRuleResult => {
    if (data.hasExtractedCoverPage) {
      return {
        id: 'upel-cover-page',
        name: 'Portada UPEL',
        description: 'Portada estructurada UPEL.',
        status: 'compliant',
        weight: 20
      };
    }

    const textLines = data.text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (textLines.length < 5) {
      return {
        id: 'upel-cover-page',
        name: 'Portada incompleta',
        description: 'Requisitos de portada.',
        status: 'non-compliant',
        message: 'El documento es demasiado corto o no tiene portada clara.',
        weight: 20
      };
    }

    const htmlFirstHeadingIndex = data.html.indexOf('<h');
    if (htmlFirstHeadingIndex === -1) {
       return {
        id: 'upel-cover-page',
        name: 'Portada incompleta',
        description: 'Requisitos de portada.',
        status: 'warning',
        message: 'No se pudo verificar claramente la estructura de la portada.',
        weight: 20
      };
    }

    return {
      id: 'upel-cover-page',
      name: 'Portada',
      description: 'Requisitos de portada.',
      status: 'warning',
      message: 'Falta usar el apartado de \'Portada\' para estructurar la portada UPEL de forma correcta.',
      weight: 20
    };
  }
};

