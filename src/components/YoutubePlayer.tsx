import React from 'react';

const YouTubePlayer = ({ videoId, h = "800px", start }: { videoId: string, h: string, start?: number | null }) => {

    // https://www.npmjs.com/package/js-video-url-parser ?

    return (
        <iframe
            width="100%"
            height={h}
            src={`https://www.youtube.com/embed/${videoId}${start ? "?start="+start : ""}`}
            title={`YouTube video player ${videoId+start}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen>
        </iframe>
    );
};

export default YouTubePlayer;
