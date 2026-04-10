import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import './ChronicPainSupport.scss';

const faqItems = [
    {
        q: 'Is this a substitute for medical care or physical therapy?',
        a: 'No. I offer complementary movement and yoga-therapy-style support. I do not diagnose or treat medical conditions. Many clients also work with doctors, PTs, or mental health providers — those relationships stay central when you have them.',
    },
    {
        q: 'Do I need yoga experience?',
        a: 'No. Sessions are built around your body and capacity that day. We use pacing, props, and options so nothing is forced.',
    },
    {
        q: 'What happens in a first session?',
        a: 'We talk about your goals, history, and what tends to flare you up or help you feel better. Movement and breath are gentle and optional; you stay in charge of what you try.',
    },
    {
        q: 'Do you work online or only in Portland?',
        a: 'Both. I see people in person in the Portland, Oregon area and offer online sessions via video when that fits your life better.',
    },
    {
        q: 'What is yoga therapy, in plain language?',
        a: 'It is one-on-one work that uses yoga tools — movement, breath, rest, inquiry — chosen for you as an individual, not a generic class sequence. You can read more on our dedicated yoga therapy page.',
    },
];

export default function ChronicPainSupport() {
    const faqStructuredData = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(({ q, a }) => ({
            '@type': 'Question',
            name: q,
            acceptedAnswer: {
                '@type': 'Answer',
                text: a.replace(/<[^>]+>/g, ''),
            },
        })),
    };

    return (
        <div className="chronic-pain-page">
            <Helmet>
                <title>
                    Help for Chronic Pain — Gentle Movement &amp; Support | Portland &amp; Online | Zsuzsanna Mangu
                </title>
                <meta
                    name="description"
                    content="Struggling with chronic pain? One-on-one gentle movement, breath, and trauma-informed yoga therapy-style support in Portland, Oregon and online — pacing, choice, and props. Book a consult."
                />
                <script type="application/ld+json">{JSON.stringify(faqStructuredData)}</script>
            </Helmet>

            <h1>Help for chronic pain — gentle, one-on-one support</h1>
            <p className="chronic-pain-lead">
                If you are tired, guarded, or unsure how to move without making things worse, you are not alone. I work
                with people who live with ongoing pain and want{' '}
                <strong>supportive movement, breath, and nervous-system-friendly practices</strong> — at a pace that
                respects flares, fatigue, and real life. Based in <strong>Portland, Oregon</strong>; sessions also
                available <strong>online</strong>.
            </p>

            <div className="chronic-pain-cta">
                <p>
                    <strong>Ready to explore whether we are a fit?</strong> On the{' '}
                    <a href="/#book-section">home page</a> you can request a <strong>free 30-minute online consult</strong>
                    , or <Link to="/contact">contact me</Link> with questions. You can also check the{' '}
                    <Link to="/calendar">calendar</Link> for group options.
                </p>
            </div>

            <h2>What this work is (in words people actually search for)</h2>
            <p>
                Many people look for <strong>gentle exercise for chronic pain</strong>,{' '}
                <strong>holistic support</strong>, or <strong>mind–body approaches</strong> — not for “yoga therapy” by
                name. That is OK. What I offer is individualized, trauma-informed{' '}
                <Link to="/yoga-therapy">yoga therapy</Link>
                — one-on-one sessions where we choose small, practical tools together: movement when it helps, rest when
                it helps, breath and grounding strategies, and clear options so you stay in control.
            </p>

            <h2>Who often reaches out</h2>
            <ul>
                <li>Persistent pain that changes how you move, sleep, or work</li>
                <li>Hypermobility or EDS-aware movement needs (I am hypermobility-informed in my approach)</li>
                <li>Wanting to move but scared of flare-ups or “pushing through”</li>
                <li>Prefer a private setting over a fast-paced group class</li>
            </ul>

            <h2>What you will not get</h2>
            <p>
                No shaming, no one-size-fits-all poses, and no promises of a medical cure. I am not a physician or
                physical therapist. If something needs clinical attention, we talk about that openly.
            </p>

            <h2>Questions people ask first</h2>
            {faqItems.map(({ q, a }) => (
                <section key={q}>
                    <h3>{q}</h3>
                    <p>{a}</p>
                </section>
            ))}

            <div className="chronic-pain-cta">
                <p>
                    <Link to="/contact">Book or message me through the contact page</Link> — say a bit about your
                    situation and whether you prefer in-person (Portland area) or online.
                </p>
            </div>

            <p className="chronic-pain-disclaimer">
                This page describes educational and supportive movement services. It is not medical advice. For new or
                worsening symptoms, consult a qualified healthcare professional.
            </p>
        </div>
    );
}
