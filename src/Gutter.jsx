import { useRef, useCallback } from 'react';

export default function Gutter({ start, count }) {
    const lines = Array.from({ length: count }, (_, i) => start + i);
    const ref = useRef(null);

    const setActive = useCallback((index) => {
        if (!ref.current) return;
        const spans = ref.current.querySelectorAll('.ln');
        spans.forEach((s, i) => s.classList.toggle('ln-active', i === index));
    }, []);

    const clearActive = useCallback(() => {
        if (!ref.current) return;
        ref.current.querySelectorAll('.ln').forEach(s => s.classList.remove('ln-active'));
    }, []);

    return (
        <div className="gutter" ref={ref}>
            {lines.map(n => (
                <span className="ln" key={n}>{n}</span>
            ))}
        </div>
    );
}
