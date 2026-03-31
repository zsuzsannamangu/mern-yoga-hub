import React from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';

// Must match production site; override in `.env` if needed.
const SITE_URL = (process.env.REACT_APP_SITE_URL || 'https://www.yogaandchocolate.com').replace(
  /\/$/,
  ''
);

function isPrivatePath(pathname) {
  if (!pathname) return false;
  return (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/user/') ||
    pathname === '/user/oauth'
  );
}

/**
 * Route-level SEO defaults: canonical + og:url on public pages; noindex on admin/user.
 * Page components can still set title/description via their own <Helmet> (they merge).
 */
export default function SiteSeo() {
  const { pathname } = useLocation();
  const isPrivate = isPrivatePath(pathname);

  if (isPrivate) {
    return (
      <Helmet>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
    );
  }

  const canonicalUrl =
    pathname === '/' ? `${SITE_URL}/` : `${SITE_URL}${pathname}`;

  return (
    <Helmet>
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="Yoga and Chocolate | Zsuzsanna Mangu" />
    </Helmet>
  );
}
