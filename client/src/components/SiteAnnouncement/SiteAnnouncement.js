import React from 'react';
import './SiteAnnouncement.scss';

const BHAKTI_CLASSES_URL = 'https://www.thebymc.com/classes';

function SiteAnnouncement() {
  return (
    <div className="workshop-announcement newyear-announcement">
      <div className="announcement-content">
        <span className="announcement-text">
          ✨ <strong>Postnatal Yoga</strong> — every Thursday, 10:30am at Bhakti Yoga and Movement Center.
          Babies welcome.
        </span>
        <a
          href={BHAKTI_CLASSES_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="announcement-link"
        >
          Details &amp; sign up
        </a>
      </div>
    </div>
  );
}

export default SiteAnnouncement;
