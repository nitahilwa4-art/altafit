export default function ProgressRing({ value = 0, size = 208, stroke = 12, className = '', children }) {
    const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
    const radius = (size / 2) - stroke;
    const circumference = 2 * Math.PI * radius;
    const dashoffset = circumference - ((safeValue / 100) * circumference);

    return (
        <div className={`progress-ring ${className}`.trim()} style={{ width: size, height: size }}>
            <svg className="progress-ring__svg" viewBox={`0 0 ${size} ${size}`}>
                <circle className="progress-ring__bg" cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} />
                <circle
                    className="progress-ring__value"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={stroke}
                    style={{ strokeDasharray: circumference, strokeDashoffset: dashoffset }}
                />
            </svg>
            <div className="progress-ring__content">{children}</div>
        </div>
    );
}
