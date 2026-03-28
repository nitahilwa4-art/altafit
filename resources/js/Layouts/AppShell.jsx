import { useEffect } from 'react';
import BottomNav from '../Components/layout/BottomNav';
import TopBar from '../Components/layout/TopBar';

export default function AppShell({ children, pageMeta = {}, topBarTitle, compactTopBar = false, chatMode = false, brandMode = false, dashboardMode = false }) {
    useEffect(() => {
        const theme = pageMeta.theme ?? 'light';
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [pageMeta.theme]);

    return (
        <div className="app-shell">
            <div className="app-shell__frame">
                <TopBar calorieTarget={pageMeta.calorieTarget} title={topBarTitle} compact={compactTopBar} chatMode={chatMode} brandMode={brandMode} userInitial={pageMeta.userInitial} />
                <main className={`app-shell__content ${chatMode ? 'app-shell__content--chat' : ''} ${brandMode ? 'app-shell__content--brand' : ''} ${dashboardMode ? 'app-shell__content--dashboard' : ''}`.trim()}>{children}</main>
                <BottomNav active={pageMeta.activeNav} dashboardMode={dashboardMode} chatMode={chatMode} />
            </div>
        </div>
    );
}
