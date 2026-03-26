import Icon from '../ui/Icon';

export default function TopBar({ calorieTarget = 2400, title, compact = false }) {
    return (
        <header className={`topbar ${compact ? 'topbar--compact' : ''}`.trim()}>
            <div className="topbar__left">
                <div className="topbar__brand-mark">
                    <Icon name="bolt" />
                </div>
                <div>
                    <div className="topbar__eyebrow">Altafit</div>
                    <div className="topbar__title">{title ?? `${calorieTarget.toLocaleString()} kcal`}</div>
                </div>
            </div>
            <div className="avatar avatar--sm" aria-hidden="true">A</div>
        </header>
    );
}
