import React from 'react';
import { Link } from 'react-router-dom';
import './SiteAnnouncement.scss';

const HYPERMOBILITY_SECTION_PATH = '/yoga?section=hypermobility';

function SiteAnnouncement() {
  return (
    <div className="workshop-announcement newyear-announcement">
      <div className="announcement-content">
        <span className="announcement-text">
          ✨ <strong>Yoga with Hypermobility and EDS Series</strong> — every other Saturday,
          6:30–7:45pm at Heart Spring Health Clinic
        </span>
        <Link to={HYPERMOBILITY_SECTION_PATH} className="announcement-link">
          Details &amp; sign up
        </Link>
      </div>
    </div>
  );
}

export default SiteAnnouncement;
export { HYPERMOBILITY_SECTION_PATH };
