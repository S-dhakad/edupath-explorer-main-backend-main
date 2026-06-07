import { ContactPage } from './contact-page.schema';

export const DEFAULT_CONTACT_PAGE: Omit<ContactPage, 'key'> & { key: string } = {
  key: 'default',
  badgeText: 'Contact us',
  headingPrefix: "Let's build your",
  headingHighlight: 'next growth',
  headingSuffix: 'plan',
  description:
    'Questions about courses, affiliate partnerships, or team enrollments? Send a message and our team will respond within one business day.',
  email: 'hello@StartSuccess.app',
  phone: '+91 98765 43210',
  office: 'Bengaluru, India',
  responseTimeText: 'Average response time: under 24 hours',
  faqButtonLabel: 'Visit FAQ',
};
