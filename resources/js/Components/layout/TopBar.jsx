import Icon from '../ui/Icon';

export default function TopBar({ calorieTarget = 2400, title, brandMode = false, chatMode = false }) {
    if (brandMode) {
        return (
            <header className="topbar topbar--brand">
                <div className="topbar__left topbar__left--brand">
                    <button type="button" className="topbar__menu-button" aria-label="Menu">
                        <Icon name="menu" />
                    </button>
                    <div className="topbar__brand-wordmark">VITALITY</div>
                </div>
                <div className="topbar__photo topbar__photo--plain">A</div>
            </header>
        );
    }

    return (
        <header className={`topbar ${chatMode ? 'topbar--chat' : ''}`.trim()}>
            <div className="topbar__left">
                <div className={`topbar__brand-mark ${chatMode ? 'topbar__brand-mark--filled' : ''}`.trim()}>
                    <Icon name="bolt" />
                </div>
                <div className="topbar__title-only">{title ?? `${calorieTarget.toLocaleString()} kcal`}</div>
            </div>
            <div className="topbar__photo">A</div>
        </header>
    );
}
