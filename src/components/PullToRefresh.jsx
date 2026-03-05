import React, { useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";

/**
 * Wraps children and shows a pull-to-refresh indicator.
 * onRefresh: () => void — called when user pulls far enough.
 */
export default function PullToRefresh({ children, onRefresh }) {
    const [pulling, setPulling] = useState(false);
    const [pullY, setPullY] = useState(0);
    const startY = useRef(null);
    const THRESHOLD = 70;

    const onTouchStart = (e) => {
        if (window.scrollY === 0) startY.current = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
        if (startY.current === null) return;
        const dy = e.touches[0].clientY - startY.current;
        if (dy > 0 && window.scrollY === 0) {
            setPulling(true);
            setPullY(Math.min(dy, THRESHOLD + 20));
        }
    };

    const onTouchEnd = () => {
        if (pullY >= THRESHOLD) onRefresh();
        startY.current = null;
        setPulling(false);
        setPullY(0);
    };

    const progress = Math.min(pullY / THRESHOLD, 1);

    return (
        <div
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={{ touchAction: "pan-y" }}
        >
            {pulling && (
                <div
                    className="flex items-center justify-center overflow-hidden transition-all"
                    style={{ height: pullY }}
                >
                    <RefreshCw
                        className="text-amber-500"
                        style={{
                            width: 22, height: 22,
                            transform: `rotate(${progress * 360}deg)`,
                            opacity: progress,
                            transition: "transform 0.05s linear",
                        }}
                    />
                </div>
            )}
            {children}
        </div>
    );
}
