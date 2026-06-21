import type { IRule, IRuleResult, IDocumentData } from '@/core/ComplianceEngine/types';

export const FigureCitedInTextRule: IRule = {
  id: 'apa7-figure-cited',
  name: 'Figure Cited in Text',
  description: 'That at least one textual reference to the figure exists within the document.',
  weight: 10,
  evaluate: (data: IDocumentData): IRuleResult => {
    if (!data.figures || data.figures.length === 0) {
      return {
        id: 'apa7-figure-cited',
        name: 'Figure Cited in Text',
        description: 'That at least one textual reference to the figure exists within the document.',
        status: 'not-applicable',
        weight: 10,
      };
    }

    const text = data.text.toLowerCase();
    const uncitedFigures = data.figures.filter(f => {
      const num = f.number;
      // Usamos word boundaries para evitar que "Figura 1" coincida con "Figura 10"
      const regex1 = new RegExp(`\\bfigura\\s+${num}\\b`, 'gi');
      const regex2 = new RegExp(`\\bfig\\.\\s*${num}\\b`, 'gi');
      
      // Si el Custom Node de la figura tuviera salida de texto, esto fallaría,
      // pero en TipTap los nodos atom:true no inyectan texto a menos que se les diga,
      // así que el texto de data.text solo contiene lo que el usuario escribió.
      return !(regex1.test(text) || regex2.test(text));
    });

    if (uncitedFigures.length > 0) {
      const msgs = uncitedFigures.map(f => `La Figura ${f.number || '?'} existe en el documento pero nunca se menciona en el texto.`);
      return {
        id: 'apa7-figure-cited',
        name: 'Figure Cited in Text',
        description: 'That at least one textual reference to the figure exists within the document.',
        status: 'non-compliant',
        message: msgs.join(' '),
        weight: 10,
      };
    }

    return {
      id: 'apa7-figure-cited',
      name: 'Figure Cited in Text',
      description: 'That at least one textual reference to the figure exists within the document.',
      status: 'compliant',
      weight: 10,
    };
  }
};
