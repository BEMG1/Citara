import type { INormEngine } from '../types';
import { allowedFontsRule } from './FontRules';
import { correctMarginsRule, doubleSpacingRule } from './PageRules';
import { headingHierarchyRule } from './HeadingRules';
import { referenceListRule } from './ReferenceRules';
import { coverPageRule } from './CoverPageRules';
import { crossReferenceRule } from './CrossReferenceRule';

export const apa7Engine: INormEngine = {
  format: 'apa7',
  rules: [
    allowedFontsRule,
    correctMarginsRule,
    doubleSpacingRule,
    headingHierarchyRule,
    referenceListRule,
    coverPageRule,
    crossReferenceRule
  ]
};
