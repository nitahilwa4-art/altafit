import { useEffect, useMemo, useState } from 'react';

export default function AnimatedNumber({ value = 0, duration = 700, decimals = 0, suffix = '' }) {
    const target = useMemo(() => Number(value) || 0, [value]);
    const [displayValue, setDisplayValue] = useState(target);

    useEffect(() => {
        const start = performance.now();
        const initial = displayValue;
        let frame;

        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const next = initial + ((target - initial) * eased);
            setDisplayValue(next);

            if (progress < 1) {
                frame = requestAnimationFrame(tick);
            }
        };

        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [target]);

    return `${displayValue.toFixed(decimals)}${suffix}`;
}
