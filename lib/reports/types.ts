// ============================================================================
// BU Trade — Listing Moderation & Violation Categories
// ============================================================================

export const REPORT_VIOLATION_CATEGORIES = [
  'Prohibited item',
  'Counterfeit/fake',
  'Inappropriate behavior/harassment',
  'Wrong category/spam',
  'Misleading price/condition',
  'Safety concern',
] as const;

export type ReportViolationCategory = (typeof REPORT_VIOLATION_CATEGORIES)[number];

export interface CategoryInfo {
  category: ReportViolationCategory;
  title: string;
  description: string;
  hint: string;
}

export const REPORT_CATEGORY_DESCRIPTIONS: Record<
  ReportViolationCategory,
  { description: string; hint: string }
> = {
  'Prohibited item': {
    description:
      'Alcohol, tobacco/vapes, narcotics, weapons, exam question papers, hostel property, or hazardous items.',
    hint: 'Strictly prohibited by Bennett University campus regulations.',
  },
  'Counterfeit/fake': {
    description:
      'Knockoff goods, fake branded items, pirated software, or non-genuine merchandise.',
    hint: 'Misrepresents authenticity or intellectual property.',
  },
  'Inappropriate behavior/harassment': {
    description:
      'Offensive language, harassment, discrimination, or inappropriate photos/text.',
    hint: 'Violates student code of conduct.',
  },
  'Wrong category/spam': {
    description:
      'Repetitive listings, commercial business advertisements, or misclassified category.',
    hint: 'Clogs the feed and reduces marketplace quality.',
  },
  'Misleading price/condition': {
    description:
      'Bait-and-switch pricing, concealed major defects, wrong item condition, or deceptive descriptions.',
    hint: 'Disclose accurate wear and battery health.',
  },
  'Safety concern': {
    description:
      'Requests to meet in secluded/unauthorized areas, demands for advance payments, or suspected scams.',
    hint: 'Violates safe campus transaction protocols.',
  },
};
