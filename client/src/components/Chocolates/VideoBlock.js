import React from "react";
import "./VideoBlock.scss";

export default function VideoBlock({
  videoId = "BNDjHWsjHI4",
  title = "How I Make ReTreat Chocolates",
  process = [
    "Ethically sourced, organic cacao and local ingredients",
    "Stone-ground to a silky texture",
    "Low heat to protect nutrients and flavor",
    "Hand-tempered for shine and snap",
    "Reusable tins + compostable wraps for low-waste packaging",
  ],
  videoDescription = "A quick behind-the-scenes video of my small-batch, plant-based chocolate process—slow, intentional, and sustainably sourced.",
}) {
  // No autoplay, muted on load, loop enabled, controls visible, minimal branding
  const src = `https://www.youtube.com/embed/${videoId}?mute=1&loop=1&playlist=${videoId}&controls=1&modestbranding=1&rel=0`;

  return (
    <section className="video-with-details" aria-labelledby="video-with-details-title">
      <div className="video-col">
        <div className="video-frame">
          <iframe
            src={src}
            title="Chocolate Making Process"
            frameBorder="0"
            allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </div>

      <div className="details-col">
        <h2 id="video-with-details-title">{title}</h2>

        <p className="lead">{videoDescription}</p>

        <ul className="process-list">
          {process.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
