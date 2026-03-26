import { Link } from '@inertiajs/react';
import Icon from '../ui/Icon';

const items = [
    { key: 'dashboard', label: 'Dashboard', href: routeName('dashboard.index', '/dashboard'), icon: 'dashboard' },
    { key: 'chat', label: 'Chat', href: routeName('chat.index', '/chat'), icon: 'forum' },
    { key: 'plans', label: 'Plans', href: routeName('plans.index', '/plans'), icon: 'event_note' },
    { key: 'profile', label: 'Profile', href: routeName('profile.index', '/profile'), icon: 'person' },
];

function routeName(_name, fallback) {
    return fallback;
}

export default function BottomNav({ active }) {
    return (
        <nav className="bottom-nav">
            {items.map((item) => (
                <Link key={item.key} href={item.href} className={`bottom-nav__item ${active === item.key ? 'is-active' : ''}`.trim()}>
                    <Icon name={item.icon} />
                    <span>{item.label}</span>
                </Link>
            ))}
        </nav>
    );
}
