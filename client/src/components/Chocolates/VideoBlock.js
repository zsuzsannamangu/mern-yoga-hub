import React from "react";
import "./VideoBlock.scss";

export default function VideoBlock() {
  const videoId = "BNDjHWsjHI4";
  const src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0&showinfo=0`;

  return (
    <div className="video-block">
      <iframe
        src={src}
        title="Customer Story Video"
        frameBorder="0"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}
