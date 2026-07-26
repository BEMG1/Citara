import type { INormEngine } from '../types';
import { upelMarginsRule, upelLineSpacingRule } from './UPELFormatRules';
import { upelReferenceListRule, upelInTextCitationsRule } from './UPELReferenceRules';
import { upelChapterHeadingRule, upelSubtitleHeadingRule } from './UPELHeadingRules';
import { upelLongCitationRule } from './UPELCitationRules';
import { upelTableFormatRule, upelFigureFormatRule } from './UPELObjectRules';
import { upelCoverPageRule } from './UPELCoverPageRules';

export const upelEngine: INormEngine = {
  format: 'upel',
  rules: [
    upelCoverPageRule,
    upelMarginsRule,
    upelLineSpacingRule,
    upelReferenceListRule,
    upelInTextCitationsRule,
    upelChapterHeadingRule,
    upelSubtitleHeadingRule,
    upelLongCitationRule,
    upelTableFormatRule,
    upelFigureFormatRule
  ]
};
