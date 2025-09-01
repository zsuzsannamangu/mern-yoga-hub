import React from "react";
import "./VideoBlock.scss";

export default function VideoBlock({
    videoId = "BNDjHWsjHI4",
    title = "How I Make ReTreat Chocolates",
    process = [
        "Grind pure cacao paste from cacao beans.",
        "Gently melt the cacao butter.",
        "Add farm-sourced organic maple sugar.",
        "Incorporate organic Madagascar Bourbon vanilla powder.",
        "Sprinkle in Oregon sea salt.",
        "Slowly combine the cacao paste with the melted cacao butter and sugar.",
        "Carefully monitor the temperature by hand.",
        "Polish the molds and prepare the toppings.",
        "Fill the molds with the chocolate.",
        "Add toppings.",
        "Let the chocolates harden naturally.",
        "Remove them from the molds, clean the tins, and place the chocolates inside.",
    ],
    videoDescription = "A behind-the-scenes video of my small-batch, plant-based chocolate process—slow and intentional.",
}) {
    const src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0&showinfo=0`;

    return (
        <section className="video-with-details" aria-labelledby="video-with-details-title">
            <div className="video-col">
                <div className="video-frame">
                    <iframe
                        src={src}
                        title="Chocolate Making Process"
                        frameBorder="0"
                        allow="autoplay; encrypted-media; picture-in-picture"
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
