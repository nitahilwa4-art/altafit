import { Link } from '@inertiajs/react';
import Icon from '../ui/Icon';

const items = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { key: 'chat', label: 'Chat', href: '/chat', icon: 'forum' },
    { key: 'plans', label: 'Plans', href: '/plans', icon: 'event_note' },
    { key: 'profile', label: 'Profile', href: '/profile', icon: 'person' },
];

export default function BottomNav({ active, dashboardMode = false, chatMode = false }) {
    return (
        <nav className={`bottom-nav ${dashboardMode ? 'bottom-nav--dashboard' : ''} ${chatMode ? 'bottom-nav--chat' : ''}`.trim()}>
            {items.map((item) => {
                const icon = dashboardMode && item.key === 'dashboard' ? 'add_circle' : item.icon;
                const label = dashboardMode && item.key === 'dashboard' ? 'Log' : item.label;

                return (
                    <Link key={item.key} href={item.href} className={`bottom-nav__item ${active === item.key ? 'is-active' : ''}`.trim()}>
                        <Icon name={icon} />
                        <span>{label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
