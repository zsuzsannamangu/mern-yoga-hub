/**
 * Page-level SEO copy (titles & descriptions). Written as natural sentences;
 * phrases reflect common searches (Portland yoga, private sessions, retreats, chocolate).
 */

export const SEO_SITE_HOST = (process.env.REACT_APP_SITE_URL || 'https://www.yogaandchocolate.com').replace(
    /\/$/,
    ''
);

export const seo = {
    home: {
        title: 'Yoga and Chocolate | Zsuzsanna Mangu — Portland Yoga, Therapy & ReTreat Chocolates',
        description:
            'Portland yoga and chocolate workshops (chakra-themed restorative yoga + tasting), group classes, yoga therapy, and ReTreat small-batch chocolates. Upcoming yoga–chocolate events at Portland studios — details and registration on the Yoga page.',
    },
    yoga: {
        title: 'Yoga & Chocolate Workshop Portland | Classes & Private Yoga — Zsuzsanna Mangu',
        description:
            'Yoga and chocolate workshop in Portland: restorative yoga, meditation, and handcrafted chakra chocolates. Upcoming dates with The People\'s Yoga and Firelight Yoga — register through the host studio. Plus group classes, private yoga, and trauma-informed teaching.',
    },
    yogaTherapy: {
        title: 'Portland Yoga Therapy | One-on-One Sessions & Online — Zsuzsanna Mangu',
        description:
            'Portland yoga therapy and online sessions: personalized breathwork, somatic movement, and adaptive yoga for stress, anxiety, chronic pain, and hypermobility. In-person in NW Portland; book one-on-one yoga therapy.',
    },
    chocolates: {
        title: 'ReTreat Chocolates Portland | Zsuzsanna Mangu — Vegan Cacao, Zero-Waste Tins',
        description:
            'ReTreat Chocolates by Zsuzsanna Mangu: Portland-made, small-batch vegan chocolate from organic or ceremonial cacao. Soy-free, palm-oil free, hand-packed in reusable tins. Also: Portland yoga and chocolate workshops pairing tasting with restorative practice.',
    },
    calendar: {
        title: 'Yoga Calendar Portland & Online | Classes, Workshops & Yoga–Chocolate Events',
        description:
            'Portland and online yoga calendar: weekly classes, workshops, and special events including yoga and chocolate experiences. See dates and how to sign up.',
    },
    contact: {
        title: 'Contact | Private Yoga in Portland, Yoga Therapy & Chocolate — Zsuzsanna Mangu',
        description:
            'Questions about private yoga, yoga therapy, yoga and chocolate workshops in Portland, ReTreat chocolate orders, or collaborations — get in touch.',
    },
};
