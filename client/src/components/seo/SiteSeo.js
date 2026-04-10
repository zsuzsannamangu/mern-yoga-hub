import React from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';

// Must match production site; override in `.env` if needed.
const SITE_URL = (process.env.REACT_APP_SITE_URL || 'https://www.yogaandchocolate.com').replace(
    /\/$/,
    ''
);

/** Every path that React Router serves as a real page (static segment). */
const RECOGNIZED_PATHS = new Set([
    '/',
    '/yoga',
    '/yoga-therapy',
    '/chronic-pain-help',
    '/calendar',
    '/chocolates',
    '/contact',
    '/cart',
    '/register',
    '/login',
    '/signup',
    '/signup-selection',
    '/aboutwebsite',
    '/verify-email',
    '/verify-login',
    '/unsubscribe',
    '/user/oauth',
]);

/** Public URLs we do not want indexed (thin / auth / utility). */
const UTILITY_NOINDEX = new Set([
    '/verify-email',
    '/verify-login',
    '/unsubscribe',
    '/login',
    '/register',
    '/cart',
]);

function isPrivatePath(pathname) {
    if (!pathname) return false;
    return pathname.startsWith('/admin') || pathname.startsWith('/user/');
}

/** Trim trailing slash for route matching (must match React Router paths exactly, including case). */
function routePathKey(pathname) {
    if (!pathname || pathname === '/') return '/';
    return pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

function buildCanonicalUrl(pathname) {
    const key = routePathKey(pathname);
    const path = key === '/' ? '/' : key.toLowerCase();
    return path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`;
}

/**
 * Single canonical + og:url for indexable marketing pages; noindex for admin/user/utility/404.
 * Query strings are ignored (canonical always matches the clean path — avoids duplicate "/yoga?..." URLs).
 */
export default function SiteSeo() {
    const { pathname } = useLocation();

    if (isPrivatePath(pathname)) {
        return (
            <Helmet>
                <meta name="robots" content="noindex,nofollow" />
            </Helmet>
        );
    }

    const pathKey = routePathKey(pathname);

    if (!RECOGNIZED_PATHS.has(pathKey)) {
        return (
            <Helmet>
                <meta name="robots" content="noindex,nofollow" />
            </Helmet>
        );
    }

    if (UTILITY_NOINDEX.has(pathKey)) {
        return (
            <Helmet>
                <meta name="robots" content="noindex,nofollow" />
            </Helmet>
        );
    }

    const canonicalUrl = buildCanonicalUrl(pathname);

    return (
        <Helmet>
            <meta name="robots" content="index,follow" />
            <link rel="canonical" href={canonicalUrl} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:site_name" content="Yoga and Chocolate | Zsuzsanna Mangu" />
        </Helmet>
    );
}
