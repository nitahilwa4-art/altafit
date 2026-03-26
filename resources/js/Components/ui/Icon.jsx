const icons = {
    bolt: '⚡',
    add_circle: '+',
    insights: '◔',
    description: '▤',
    person: '◡',
    water_drop: '💧',
    trending_down: '↘',
    menu: '☰',
    forum: '◌',
    dashboard: '◫',
    event_note: '▣',
    check: '✓',
    check_circle: '✓',
    lightbulb: '✦',
    local_fire_department: '🔥',
    notifications_active: '🔔',
    sync: '↻',
    straighten: '↔',
    chevron_right: '›',
    edit: '✎',
    remove: '–',
    add: '+',
    photo_camera: '⌁',
    arrow_upward: '↑',
};

export default function Icon({ name, className = '' }) {
    return <span className={`icon-glyph ${className}`.trim()}>{icons[name] ?? '•'}</span>;
}
