export default function Icon({ name, className = '', filled = false }) {
    return (
        <span
            className={`icon-glyph material-symbols-outlined ${filled ? 'icon-glyph--filled' : ''} ${className}`.trim()}
            aria-hidden="true"
        >
            {name}
        </span>
    );
}
