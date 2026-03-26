import BottomNav from '../Components/layout/BottomNav';
import TopBar from '../Components/layout/TopBar';

export default function AppShell({ children, pageMeta = {}, topBarTitle, compactTopBar = false, chatMode = false }) {
    return (
        <div className="app-shell">
            <div className="app-shell__frame">
                <TopBar calorieTarget={pageMeta.calorieTarget} title={topBarTitle} compact={compactTopBar} />
                <main className={`app-shell__content ${chatMode ? 'app-shell__content--chat' : ''}`.trim()}>{children}</main>
                {!chatMode ? <BottomNav active={pageMeta.activeNav} /> : null}
            </div>
        </div>
    );
}
