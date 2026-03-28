import { useEffect, useState } from 'react';

export default function FlashBanner({ message, duration = 4000 }) {
    const [visible, setVisible] = useState(Boolean(message));
    const [closing, setClosing] = useState(false);

    useEffect(() => {
        if (!message) return undefined;
        setVisible(true);
        setClosing(false);

        const closeTimer = setTimeout(() => setClosing(true), duration);
        const hideTimer = setTimeout(() => setVisible(false), duration + 350);

        return () => {
            clearTimeout(closeTimer);
            clearTimeout(hideTimer);
        };
    }, [message, duration]);

    if (!message || !visible) return null;

    return <div className={`flash-banner ${closing ? 'flash-banner--closing' : 'flash-banner--open'}`.trim()}>{message}</div>;
}
