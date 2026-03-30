import { router } from '@inertiajs/react';
import { useState } from 'react';
import AppShell from '../Layouts/AppShell';
import AnimatedNumber from '../Components/ui/AnimatedNumber';
import ConfirmDialog from '../Components/ui/ConfirmDialog';
import FlashBanner from '../Components/ui/FlashBanner';
import Icon from '../Components/ui/Icon';
import PageTransition from '../Components/ui/PageTransition';
import ProgressBar from '../Components/ui/ProgressBar';
import ProgressRing from '../Components/ui/ProgressRing';

function chartPath(data) {
    if (!data || data.length === 0) return '';
    return data.map((d, index) => `${index === 0 ? 'M' : 'L'} ${(index / (data.length - 1)) * 100},${d.y}`).join(' ');
}

function sparklinePath(weights) {
    if (!weights || weights.length < 2) return '';
    const vals = weights.map((w) => w.weight_kg);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min || 1;
    return weights.map((w, i) => {
        const x = (i / (weights.length - 1)) * 100;
        const y = 90 - (((w.weight_kg - min) / range) * 80);
        return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
    }).join(' ');
}

export default function Dashboard({ pageMeta, summary, chart, hydrationPresets = [], hydrationHistory = [], flash }) {
    const path = chartPath(chart.data || []);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [hoveredDay, setHoveredDay] = useState(null);

    const confirmDeleteWater = () => {
        if (deleteTarget) {
            router.delete(`/dashboard/hydration/${deleteTarget}`, { preserveScroll: true });
            setDeleteTarget(null);
        }
    };

    return (
        <AppShell pageMeta={pageMeta} dashboardMode>
            <FlashBanner message={flash?.success} />

            <PageTransition>
            <section className="dashboard-stitch">
                <section className="dashboard-ring-wrap">
                    <ProgressRing value={summary.ringProgress} className="dashboard-ring">
                        <div className="dashboard-ring__content">
                            <span>Remaining</span>
                            <strong><AnimatedNumber value={summary.remainingCalories} /></strong>
                            <small><AnimatedNumber value={summary.consumedCalories} /> of <AnimatedNumber value={summary.calorieTarget} /> kcal</small>
                        </div>
                    </ProgressRing>
                </section>

                <section className="dashboard-macros">
                    {[
                        ['Prot', summary.consumedProtein, summary.proteinGoal, summary.proteinPercent, 'g', 'primary'],
                        ['Carb', summary.consumedCarbs, summary.carbsGoal, summary.carbsPercent, 'g', 'secondary'],
                        ['Fat', summary.consumedFat, summary.fatGoal, summary.fatPercent, 'g', 'tertiary'],
                    ].map(([label, value, goal, percent, unit, tone]) => (
                        <article key={label} className={`dashboard-macro-card dashboard-macro-card--${tone}`}>
                            <p>{label}</p>
                            <strong><AnimatedNumber value={value} /><span>{unit}</span></strong>
                            <small>{goal}{unit} goal</small>
                            <ProgressBar value={percent} tone={tone} className="dashboard-macro-card__bar" />
                        </article>
                    ))}
                </section>

                {summary.currentStreak > 0 ? (
                    <article className="streak-card editorial-card">
                        <div className="streak-card__badge"><Icon name="local_fire_department" filled /></div>
                        <div className="streak-card__content">
                            <strong><AnimatedNumber value={summary.currentStreak} /> day streak 🔥</strong>
                            <small>Longest: {summary.longestStreak} days</small>
                        </div>
                    </article>
                ) : null}

                <section className="dashboard-progress-block">
                    <div className="dashboard-progress-head">
                        <h2>Weekly Progress</h2>
                        <span>{summary.weeklyChange}</span>
                    </div>
                    <article className="dashboard-progress-card dashboard-sparkline" data-trend={summary.weightTrendDir}>
                        <div className="dashboard-sparkline__label">
                            <small>Current Weight</small>
                            <strong>{summary.weeklyWeight}</strong>
                        </div>
                        <svg className="dashboard-sparkline__svg" viewBox="0 0 100 50" preserveAspectRatio="none">
                            <polyline
                                points={sparklinePath(summary.weightHistory)}
                                className="dashboard-sparkline__line"
                                fill="none"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <Icon name={summary.weightTrendDir ?? 'trending_flat'} className="dashboard-sparkline__icon" />
                    </article>
                    <article className="dashboard-insight-card editorial-card">
                        <div>
                            <small>Daily Average</small>
                            <strong>{summary.averageCalories} kcal</strong>
                        </div>
                        <div>
                            <small>Meals Today</small>
                            <strong>{summary.todayMealsCount}</strong>
                        </div>
                    </article>
                    <article className="dashboard-coaching-card editorial-card">
                        <div className="dashboard-coaching-card__badge"><Icon name="lightbulb" filled /></div>
                        <div className="dashboard-coaching-card__content">
                            <small>Coaching Tip</small>
                            <p>{summary.coachingTip}</p>
                            <div className="dashboard-coaching-card__actions">
                                <button type="button" className="text-button" onClick={() => router.visit('/chat')}>Open food log</button>
                                <button type="button" className="text-button" onClick={() => router.visit('/plans')}>Check plan</button>
                            </div>
                        </div>
                    </article>
                </section>

                <section className="dashboard-chart-card">
                    <div className="dashboard-chart-card__head">
                        <h3>Calorie Trend</h3>
                        <span>Last 7 days</span>
                    </div>
                    <div className="dashboard-chart">
                        <div className="dashboard-chart__ylabels">
                            {chart.yAxisLabels.map((label) => (
                                <span key={label}>{label}</span>
                            ))}
                        </div>
                        <div className="dashboard-chart__plot">
                            <div className="dashboard-chart__grid">
                                <div />
                                <div />
                                <div />
                                <div />
                            </div>
                            <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="dashboardChartGradient" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
                                        <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path d={`${path} L 100,100 L 0,100 Z`} className="dashboard-chart__area" fill="url(#dashboardChartGradient)" />
                                {chart.targetY > 0 && (
                                    <line x1="0" y1={chart.targetY} x2="100" y2={chart.targetY} className="dashboard-chart__target" strokeDasharray="2,2" />
                                )}
                                <path d={path} className="dashboard-chart__line" />
                            </svg>
                            <div className="dashboard-chart__markers">
                                {chart.data && chart.data.map((d, index) => {
                                    const x = (index / (chart.data.length - 1)) * 100;
                                    const isHovered = hoveredDay === index;
                                    return (
                                        <div 
                                            key={index} 
                                            className="dashboard-chart__point-wrap" 
                                            style={{ left: `${x}%`, top: `${d.y}%` }}
                                            onMouseEnter={() => setHoveredDay(index)}
                                            onMouseLeave={() => setHoveredDay(null)}
                                            onClick={() => setHoveredDay(isHovered ? null : index)}
                                        >
                                            <div className={`dashboard-chart__point ${d.isOver ? 'dashboard-chart__point--over' : ''}`} />
                                            <div className={`dashboard-chart__tooltip ${isHovered ? 'is-visible' : ''}`}>
                                                <strong>{d.calories}</strong> <span>kcal</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="dashboard-chart__xlabels">
                                {chart.data && chart.data.map((d, index) => (
                                    <span key={`${d.label}-${index}`} className={index === chart.data.length - 1 ? 'is-active' : ''}>{d.label}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="dashboard-hydration-wrap">
                    <article className="dashboard-hydration-card">
                        <div className="dashboard-hydration-card__left">
                            <ProgressRing value={summary.hydrationPercent} size={72} stroke={7} className="dashboard-hydration-card__ring">
                                <div className="dashboard-hydration-card__ring-inner">
                                    <strong><AnimatedNumber value={summary.hydrationCurrent} /></strong>
                                    <small>L</small>
                                </div>
                            </ProgressRing>
                            <div>
                                <h3>Hydration</h3>
                                <p>of {summary.hydrationTarget}L target</p>
                            </div>
                        </div>
                        <div className="dashboard-hydration-card__actions">
                            <button type="button" className="dashboard-hydration-card__button dashboard-hydration-card__button--soft" onClick={() => router.post('/dashboard/hydration/remove')}>
                                <Icon name="remove" />
                            </button>
                            <button type="button" className="dashboard-hydration-card__button dashboard-hydration-card__button--accent" onClick={() => router.post('/dashboard/hydration/add')}>
                                <Icon name="add" />
                            </button>
                        </div>
                    </article>

                    <article className="hydration-history-card editorial-card">
                        <div className="recent-meals-card__header">
                            <h3>Hydration Quick Add</h3>
                            <span>{hydrationPresets.length} presets</span>
                        </div>
                        <div className="hydration-preset-list">
                            {hydrationPresets.map((amount) => (
                                <button
                                    key={amount}
                                    type="button"
                                    className="hydration-preset-chip"
                                    onClick={() => router.post('/dashboard/hydration/add', { amount_ml: amount }, { preserveScroll: true })}
                                >
                                    +{amount} ml
                                </button>
                            ))}
                        </div>
                    </article>

                    <article className="hydration-history-card editorial-card">
                        <div className="recent-meals-card__header">
                            <h3>Today's Water Logs</h3>
                            <span>{hydrationHistory.length} entries</span>
                        </div>
                        {hydrationHistory.length ? (
                            <div className="hydration-history-list">
                                {hydrationHistory.map((log) => (
                                    <div key={log.id} className="hydration-history-list__item">
                                        <div>
                                            <strong>{log.amount} ml</strong>
                                            <p>Logged at {log.time}</p>
                                        </div>
                                        <button
                                            type="button"
                                            className="text-button text-button--danger"
                                            onClick={() => setDeleteTarget(log.id)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state-card">
                                <strong>No water logs yet</strong>
                                <p>Use the quick-add presets above to start tracking hydration for today.</p>
                            </div>
                        )}
                    </article>
                </section>
            </section>
            </PageTransition>

            <ConfirmDialog
                open={deleteTarget !== null}
                title="Remove Water Log"
                message="Are you sure you want to remove this hydration entry?"
                confirmLabel="Remove"
                onConfirm={confirmDeleteWater}
                onCancel={() => setDeleteTarget(null)}
            />
        </AppShell>
    );
}
