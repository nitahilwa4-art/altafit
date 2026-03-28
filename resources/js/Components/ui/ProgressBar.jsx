export default function ProgressBar({ value = 0, tone = 'primary', className = '' }) {
    const safeValue = Math.max(0, Math.min(100, Number(value) || 0));

    return (
        <div className={`progress-bar progress-bar--${tone} ${className}`.trim()}>
            <div className="progress-bar__fill" style={{ width: `${safeValue}%` }} />
        </div>
    );
}
