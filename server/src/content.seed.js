import { getContent, setContent } from './db.js';

const seed = {
  branding: {
    siteName: 'Aurelia Gold',
    tagline: 'Fine gold, made for your everyday.',
    supportEmail: 'hello@aureliagold.com',
    supportPhone: '+1 (800) 555-0148',
    address: 'New York, NY',
    primaryColor: '#b18a4a',
    footerNote: '© Aurelia Gold. Thoughtfully made, forever yours.'
  },
  nav: {
    links: [
      { label: 'Shop', href: '/shop' },
      { label: 'Our story', href: '/about' },
      { label: 'Help', href: '/faq' },
      { label: 'Contact', href: '/contact' }
    ],
    ctaPrimary: 'Sign in',
    ctaSecondary: 'Create account'
  },
  hero: {
    eyebrow: 'Solid gold. Thoughtfully made.',
    heading: 'A little gold. A lot of meaning.',
    subheading: 'Jewelry to mark your moments, made in the gold you love and designed to last a lifetime.',
    primaryCta: 'Explore the collection',
    secondaryCta: 'Our story',
    statLabels: ['Solid gold', 'Complimentary shipping', 'Easy returns'],
    statValues: ['14k–22k', 'Over $150', '30 days']
  },
  security: {
    heading: 'Made to feel like you.',
    intro: 'Beautifully considered pieces, designed to become part of your everyday.',
    items: [
      { title: 'Gold that lasts', body: 'Every piece is crafted in solid gold, never plated or filled.' },
      { title: 'Made with intention', body: 'Small details and thoughtful finishing make each piece special.' }
    ]
  },
  features: {
    heading: 'Your gold, your way.',
    intro: 'Explore classic purities and find the warmth that feels right for you.',
    items: [
      { title: '14k gold', body: 'A durable everyday favorite with a lovely golden glow.' },
      { title: '18k gold', body: 'A richer color and a little extra luxury in every detail.' },
      { title: '22k gold', body: 'An unmistakably warm, traditional gold tone.' }
    ]
  },
  plans: {
    heading: 'A little something for every day.',
    intro: 'From timeless essentials to pieces made for celebrating.',
    cards: [
      { name: 'Everyday', price: '14k', period: 'solid gold', blurb: 'Made for everyday wear.', perks: ['Durable gold', 'Thoughtful details'], featured: false },
      { name: 'Signature', price: '18k', period: 'solid gold', blurb: 'A little extra golden glow.', perks: ['Rich gold color', 'Forever kind of quality'], featured: true },
      { name: 'Heirloom', price: '22k', period: 'solid gold', blurb: 'Traditional warmth, made modern.', perks: ['Rich, warm tone', 'A piece to treasure'], featured: false }
    ]
  },
  testimonials: {
    heading: 'Little moments, lasting memories.',
    items: [
      { quote: 'It is the first piece I reach for every morning. Beautiful quality and so easy to wear.', name: 'Olivia R.', role: 'Aurelia customer' },
      { quote: 'The perfect gift to mark a milestone. The details and packaging made it feel so special.', name: 'Maya L.', role: 'Aurelia customer' },
      { quote: 'I love knowing it is solid gold. It feels personal, timeless, and truly worth keeping.', name: 'Jordan P.', role: 'Aurelia customer' }
    ]
  },
  faq: {
    heading: 'Questions, answered.',
    items: [
      { q: 'Is your jewelry solid gold?', a: 'Yes. Every Aurelia piece is crafted from solid gold in the karat shown on its product page. We do not sell gold-plated or gold-filled jewelry.' },
      { q: 'What is the difference between 14k, 18k and 22k?', a: '14k gold is especially durable for everyday wear. 18k has a richer gold color, while 22k offers a deeper, traditional warmth.' },
      { q: 'How much is shipping?', a: 'Complimentary shipping is included on orders over $150. Shipping is $12 for orders below that amount.' },
      { q: 'Can I return an item?', a: 'Unworn pieces may be returned within 30 days of delivery. Contact our team and we will help you get started.' },
      { q: 'How can I care for my jewelry?', a: 'Store each piece separately in a dry place and gently clean it with a soft jewelry cloth.' }
    ]
  },
  about: {
    heading: 'Gold with a little more meaning.',
    paragraphs: [
      'Aurelia Gold is for the everyday moments worth keeping. We believe fine jewelry should feel personal, comfortable, and made to be part of your story.',
      'Our collection is crafted in solid 14k, 18k, and 22k gold. Each piece is selected with care, finished with intention, and designed to be worn and loved for years.'
    ],
    values: [
      { title: 'Considered quality', body: 'Solid gold, thoughtful craftsmanship, and details worth noticing.' },
      { title: 'Made to be kept', body: 'Timeless pieces to celebrate your milestones and your everyday.' }
    ]
  },
  contact: {
    heading: 'We’re here to help.',
    intro: 'Questions about a piece, your order, or finding the right karat? Our team would love to help.',
    successMessage: 'Thank you for reaching out. Our team will be in touch soon.'
  }
};

export function seedContent(force = false) {
  const existingBrand = getContent('branding');
  const migratePlaceholder = existingBrand?.siteName === 'Your Company';
  for (const [key, body] of Object.entries(seed)) {
    if (force || migratePlaceholder || !getContent(key)) setContent(key, body);
  }
}
