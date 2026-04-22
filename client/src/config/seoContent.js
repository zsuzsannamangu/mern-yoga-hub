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
            'Yoga and chocolate in Portland, Oregon: trauma-informed classes, yoga therapy, private yoga sessions, workshops (including retreat-style yoga and chocolate), and small-batch ReTreat chocolates. Book a session!',
    },
    yoga: {
        title: 'Portland Yoga Classes & Private Yoga | Workshops, Retreat Yoga & Chocolate Events',
        description:
            'Group and private yoga classes in Portland, OR and online — vinyasa, restorative, adaptive and chair yoga, yoga and chocolate workshops, and retreat-style events around PDX. Trauma-informed teaching.',
    },
    yogaTherapy: {
        title: 'Portland Yoga Therapy | One-on-One Sessions & Online — Zsuzsanna Mangu',
        description:
            'Portland yoga therapy and online sessions: personalized breathwork, somatic movement, and adaptive yoga for stress, anxiety, chronic pain, and hypermobility. In-person in NW Portland; book one-on-one yoga therapy.',
    },
    chocolates: {
        title: 'ReTreat Chocolates Portland | Zsuzsanna Mangu — Vegan Cacao, Zero-Waste Tins',
        description:
            'ReTreat Chocolates by Zsuzsanna Mangu: Portland-made, small-batch vegan chocolate from organic or ceremonial cacao. Soy-free, palm-oil free, hand-packed in reusable tins. Sold through Yoga and Chocolate in Portland, Oregon.',
    },
    calendar: {
        title: 'Yoga Calendar Portland & Online | Classes, Workshops & Retreat Yoga Events',
        description:
            'Upcoming yoga classes, workshops, and retreat yoga events in the Portland area and online. Browse the schedule for PDX studios, special events, and yoga-and-chocolate offerings.',
    },
    contact: {
        title: 'Contact | Private Yoga in Portland, Yoga Therapy & Chocolate — Zsuzsanna Mangu',
        description:
            'Reach out to book private yoga classes in Portland, yoga therapy, workshop questions, ReTreat chocolate orders, or collaborations. Questions welcome.',
    },
};
