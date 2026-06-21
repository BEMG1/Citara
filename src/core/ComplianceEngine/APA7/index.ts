import type { INormEngine } from '../types';
import { allowedFontsRule } from './FontRules';
import { correctMarginsRule, doubleSpacingRule } from './PageRules';
import { headingHierarchyRule } from './HeadingRules';
import { referenceListRule } from './ReferenceRules';
import { coverPageRule } from './CoverPageRules';
import { crossReferenceRule } from './CrossReferenceRule';
import { FigureHasTitleRule } from './rules/figures/FigureHasTitleRule';
import { FigureHasNoteRule } from './rules/figures/FigureHasNoteRule';
import { FigureAttributionHasReferenceRule } from './rules/figures/FigureAttributionHasReferenceRule';
import { FigureCitedInTextRule } from './rules/figures/FigureCitedInTextRule';
import { NoMissingFiguresRule } from './rules/figures/NoMissingFiguresRule';

export const apa7Engine: INormEngine = {
  format: 'apa7',
  rules: [
    allowedFontsRule,
    correctMarginsRule,
    doubleSpacingRule,
    headingHierarchyRule,
    referenceListRule,
    coverPageRule,
    crossReferenceRule,
    FigureHasTitleRule,
    FigureHasNoteRule,
    FigureAttributionHasReferenceRule,
    FigureCitedInTextRule,
    NoMissingFiguresRule
  ]
};
