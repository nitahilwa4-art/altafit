import { router } from '@inertiajs/react';
import AppShell from '../Layouts/AppShell';
import SectionHeading from '../Components/ui/SectionHeading';
import Icon from '../Components/ui/Icon';

function chartPath(points) {
    return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${(index / (points.length - 1)) * 100},${point}`).join(' ');
}

export default function Dashboard({ pageMeta, summary, chart, hydrationHistory = [], flash }) {
    const progress = ((summary.consumedCalories / summary.calorieTarget) * 100).toFixed(0);
    const path = chartPath(chart.points);

    return (
        <AppShell pageMeta={pageMeta} compactTopBar>
            {flash?.success ? <div className="flash-banner">{flash.success}</div> : null}

            <section className="dashboard-hero">
                <section className="hero-ring">
                    <div className="hero-ring__visual">
                        <div className="hero-ring__inner">
                            <span>Remaining</span>
                            <strong>{summary.remainingCalories}</strong>
                            <small>of {summary.calorieTarget}</small>
                        </div>
                    </div>
                </section>

                <section className="macro-grid">
                    {[
                        ['Prot', summary.protein, 'g'],
                        ['Carb', summary.carbs, 'g'],
                        ['Fat', summary.fat, 'g'],
                    ].map(([label, value, unit]) => (
                        <article key={label} className="stat-card stat-card--editorial">
                            <span>{label}</span>
                            <strong>{value}<small>{unit}</small></strong>
                        </article>
                    ))}
                </section>
            </section>

            <section className="stack-section">
                <SectionHeading title="Weekly Progress" badge={summary.weeklyChange} />
                <article className="spotlight-card">
                    <div>
                        <span>Net Weight</span>
                        <strong>{summary.weeklyWeight}</strong>
                    </div>
                    <Icon name="trending_down" className="spotlight-card__icon" />
                </article>
            </section>

            <section className="editorial-card chart-card chart-card--expanded">
                <SectionHeading title="Detailed Calorie Intake" badge={`${progress}% used`} />
                <div className="chart-card__canvas">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d={`${path} L 100,100 L 0,100 Z`} className="chart-card__area" />
                        <path d={path} className="chart-card__line" />
                    </svg>
                    <div className="chart-card__labels">
                        {chart.labels.map((label, index) => <span key={`${label}-${index}`}>{label}</span>)}
                    </div>
                </div>
            </section>

            <section className="hydration-card">
                <div className="hydration-card__info">
                    <div className="hydration-card__badge"><Icon name="water_drop" /></div>
                    <div>
                        <h3>Hydration</h3>
                        <p>{summary.hydrationCurrent}L of {summary.hydrationTarget}L</p>
                    </div>
                </div>
                <div className="hydration-card__actions">
                    <button type="button" className="icon-button icon-button--soft" onClick={() => router.post('/dashboard/hydration/remove')}><Icon name="remove" /></button>
                    <button type="button" className="icon-button icon-button--accent" onClick={() => router.post('/dashboard/hydration/add')}><Icon name="add" /></button>
                </div>
            </section>

            {hydrationHistory.length ? (
                <section className="editorial-card hydration-history-card">
                    <SectionHeading title="Hydration History" badge={`${hydrationHistory.length} logs`} />
                    <div className="hydration-history-list">
                        {hydrationHistory.map((log) => (
                            <article key={log.id} className="hydration-history-list__item">
                                <div>
                                    <strong>{log.amount} ml</strong>
                                    <p>Quick hydration entry</p>
                                </div>
                                <span>{log.time}</span>
                            </article>
                        ))}
                    </div>
                </section>
            ) : null}
        </AppShell>
    );
}
