// submit.js
import React, { useState, useRef } from 'react';
import { useStore } from './store';
import sparkleGif from './assets/images/sparkle.gif';
import shineAudio from './assets/audio/shine.ogg';

export const SubmitButton = () => {
    const [showSparkle, setShowSparkle] = useState(false);
    const nodes = useStore((state) => state.nodes);
    const audioRef = useRef(null);

    const handleClick = () => {
        if (nodes.length > 0) {
            setShowSparkle(true);
            if (audioRef.current) {
                audioRef.current.volume = 0.2;
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(e => console.error("Audio play failed:", e));
            }
            setTimeout(() => {
                setShowSparkle(false);
            }, 1000); // 1 second animation
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            <audio ref={audioRef} src={shineAudio} preload="auto" />
            <button type="button" className="omoriSubmit" onClick={handleClick}>Submit</button>
            {showSparkle && <img src={sparkleGif} alt="" className="omoriSparkle" />}
        </div>
    );
}
