import React from "react";
import "./VideoBlock.scss";

export default function VideoBlock({ videoId = "BNDjHWsjHI4", title = "How I Make My Chocolates", creditName, creditUrl }) {
  const src =
    `https://www.youtube.com/embed/${videoId}` +
    `?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0`;

  return (
    <section className="video-section" aria-labelledby="video-title">
      <h2 id="video-title" className="video-title">{title}</h2>
      <div className="video-wrapper">
        <iframe
          src={src}
          title={title}
          frameBorder="0"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
      {(creditName || creditUrl) && (
        <p className="video-credit">
          Video by{" "}
          {creditName && creditUrl ? (
            <a href={creditUrl} target="_blank" rel="noopener noreferrer">{creditName}</a>
          ) : creditUrl ? (
            <a href={creditUrl} target="_blank" rel="noopener noreferrer">{creditUrl}</a>
          ) : (
            creditName
          )}
        </p>
      )}
    </section>
  );
}
