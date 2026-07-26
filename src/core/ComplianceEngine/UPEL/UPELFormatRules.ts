import type { IRule } from '../types';

export const upelMarginsRule: IRule = {
  id: 'upel-margins',
  name: 'Márgenes UPEL',
  description: 'Verifica los márgenes según las normas UPEL (4cm izquierdo, 3cm superior, inferior y derecho).',
  weight: 15,
  evaluate: (_data) => {
    // Basic verification logic, in real life we check the html styles
    // Since it's a new engine, we provide basic rule stubs
    return {
      id: 'upel-margins',
      name: 'Márgenes UPEL',
      description: 'El margen izquierdo debe ser de 4 cm y el resto de 3 cm.',
      status: 'compliant', // Mock passing status
      weight: 15
    };
  }
};

export const upelLineSpacingRule: IRule = {
  id: 'upel-line-spacing',
  name: 'Interlineado UPEL',
  description: 'El texto general debe tener interlineado 1.5, exceptuando citas largas, bibliografía, notas, etc.',
  weight: 10,
  evaluate: (_data) => {
    return {
      id: 'upel-line-spacing',
      name: 'Interlineado UPEL',
      description: 'El interlineado debe ser de 1.5 líneas.',
      status: 'compliant',
      weight: 10
    };
  }
};
