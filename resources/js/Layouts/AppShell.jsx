import BottomNav from '../Components/layout/BottomNav';
import TopBar from '../Components/layout/TopBar';

export default function AppShell({ children, pageMeta = {}, topBarTitle, compactTopBar = false, chatMode = false, brandMode = false, dashboardMode = false }) {
    return (
        <div className="app-shell">
            <div className="app-shell__frame">
                <TopBar calorieTarget={pageMeta.calorieTarget} title={topBarTitle} compact={compactTopBar} chatMode={chatMode} brandMode={brandMode} />
                <main className={`app-shell__content ${chatMode ? 'app-shell__content--chat' : ''} ${brandMode ? 'app-shell__content--brand' : ''}`.trim()}>{children}</main>
                {!chatMode ? <BottomNav active={pageMeta.activeNav} dashboardMode={dashboardMode} /> : null}
            </div>
        </div>
    );
}
