import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

/**
 * Shown for unknown client-side routes. Avoids an empty main area (soft-404 signal to crawlers).
 */
export default function NotFound() {
    return (
        <div
            className="not-found-page"
            style={{
                padding: '2.5rem 1.25rem',
                maxWidth: '36rem',
                margin: '0 auto',
                textAlign: 'center',
            }}
        >
            <Helmet>
                <title>Page not found | Yoga and Chocolate</title>
                <meta
                    name="description"
                    content="The page you requested is not available. Return to the homepage to explore yoga classes, therapy, and small-batch chocolates."
                />
                <meta name="robots" content="noindex,nofollow" />
            </Helmet>
            <h1 className="section-title" style={{ marginBottom: '0.75rem' }}>
                Page not found
            </h1>
            <p style={{ lineHeight: 1.6, marginBottom: '1.25rem' }}>
                We can&apos;t find that URL. It may have been moved, removed, or typed incorrectly.
            </p>
            <p>
                <Link to="/">Back to home</Link>
            </p>
        </div>
    );
}
