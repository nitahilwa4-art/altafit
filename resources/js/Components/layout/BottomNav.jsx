import { Link } from '@inertiajs/react';
import Icon from '../ui/Icon';

const items = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { key: 'chat', label: 'Chat', href: '/chat', icon: 'forum' },
    { key: 'plans', label: 'Plans', href: '/plans', icon: 'event_note' },
    { key: 'profile', label: 'Profile', href: '/profile', icon: 'person' },
];

export default function BottomNav({ active, dashboardMode = false }) {
    return (
        <nav className={`bottom-nav ${dashboardMode ? 'bottom-nav--dashboard' : ''}`.trim()}>
            {items.map((item) => (
                <Link key={item.key} href={item.href} className={`bottom-nav__item ${active === item.key ? 'is-active' : ''}`.trim()}>
                    <Icon name={dashboardMode && item.key === 'dashboard' ? 'add_circle' : item.icon} />
                    <span>{dashboardMode && item.key === 'dashboard' ? 'Log' : item.label}</span>
                </Link>
            ))}
        </nav>
    );
}
