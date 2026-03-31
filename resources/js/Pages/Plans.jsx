import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppShell from '../Layouts/AppShell';
import ConfirmDialog from '../Components/ui/ConfirmDialog';
import FlashBanner from '../Components/ui/FlashBanner';
import Icon from '../Components/ui/Icon';
import PageTransition from '../Components/ui/PageTransition';
import ProgressBar from '../Components/ui/ProgressBar';

function FieldError({ message }) {
    if (!message) return null;
    return <small className="field-error">{message}</small>;
}

export default function Plans({ pageMeta, plansList = [], plan, newPlanForm, flash }) {
    const form = useForm(plan.form);
    const milestoneForm = useForm(plan.newMilestone);
    const createPlanForm = useForm(newPlanForm);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [editingPlan, setEditingPlan] = useState(null); // null | 'active' | 'new'
    const [expandedSection, setExpandedSection] = useState(null);

    const dailyScoreValue = plan.dailyScore;
    const calorieRingValue = plan.todayMacros?.calorieTarget > 0
        ? Math.min(Math.round((plan.todayMacros.calories / plan.todayMacros.calorieTarget) * 100), 100)
        : 0;

    // ── Smart form helpers ──
    const applyGoalTarget = (setter, target, pct) => {
        const t = parseFloat(target) || 0;
        setter('goal_target', target);
        if (t > 0) setter('goal_remaining', String(Math.max(0, t * (1 - (parseFloat(pct) || 0) / 100)).toFixed(2)));
    };

    const applyProgress = (setter, pct, target) => {
        const p = Math.min(100, Math.max(0, parseFloat(pct) || 0));
        setter('progress_percent', pct);
        if ((parseFloat(target) || 0) > 0) setter('goal_remaining', String(Math.max(0, (parseFloat(target)) * (1 - p / 100)).toFixed(2)));
    };

    const applyRemaining = (setter, remaining, target) => {
        setter('goal_remaining', remaining);
        const t = parseFloat(target) || 0;
        const r = parseFloat(remaining) || 0;
        if (t > 0) setter('progress_percent', String(Math.round(Math.min(100, Math.max(0, 100 - (r / t) * 100)))));
    };

    const submit = (event) => {
        event.preventDefault();
        form.patch(`/plans/${plan.id}`, { preserveScroll: true, onSuccess: () => setEditingPlan(null) });
    };

    const submitMilestone = (event) => {
        event.preventDefault();
        milestoneForm.post(`/plans/${plan.id}/milestones`, { preserveScroll: true, onSuccess: () => { milestoneForm.reset(); setExpandedSection(null); }});
    };

    const submitNewPlan = (event) => {
        event.preventDefault();
        createPlanForm.post('/plans', { preserveScroll: true, onSuccess: () => { createPlanForm.reset(); setEditingPlan(null); }});
    };

    const confirmDelete = () => {
        if (deleteTarget?.type === 'plan') {
            router.delete(`/plans/${deleteTarget.id}`, { preserveScroll: true });
        } else if (deleteTarget?.type === 'milestone') {
            router.delete(`/plans/milestones/${deleteTarget.id}`, { preserveScroll: true });
        }
        setDeleteTarget(null);
    };

    return (
        <AppShell pageMeta={pageMeta} brandMode>
            <FlashBanner message={flash?.success} />
            <PageTransition>
            <div className="plans-stitch">

                {/* ── Hero: Progress Ring + Goal + Quick Stats ── */}
                <section className="plans-hero">
                    <div className="plans-hero__ring-wrap">
                        <div className="plans-hero__dual-ring">
                            <svg viewBox="0 0 120 120" className="plans-hero__ring-svg">
                                {/* Outer: Smart Progress */}
                                <circle cx="60" cy="60" r="52" className="plans-hero__ring-bg plans-hero__ring-bg--outer" />
                                <circle cx="60" cy="60" r="52"
                                    className="plans-hero__ring-value plans-hero__ring-value--outer"
                                    strokeDasharray={`${2 * Math.PI * 52}`}
                                    strokeDashoffset={`${2 * Math.PI * 52 * (1 - dailyScoreValue / 100)}`}
                                />
                                {/* Inner: Calorie */}
                                <circle cx="60" cy="60" r="40" className="plans-hero__ring-bg plans-hero__ring-bg--inner" />
                                <circle cx="60" cy="60" r="40"
                                    className="plans-hero__ring-value plans-hero__ring-value--inner"
                                    strokeDasharray={`${2 * Math.PI * 40}`}
                                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - calorieRingValue / 100)}`}
                                />
                            </svg>
                            <div className="plans-hero__ring-center">
                                <strong>{dailyScoreValue}%</strong>
                                <small>today</small>
                            </div>
                        </div>
                    </div>

                    <div className="plans-hero__info">
                        <div className="plans-hero__title-row">
                            <div>
                                <div className="plans-hero__direction-badge">
                                    <span className={`plans-hero__direction-dot plans-hero__direction-dot--${plan.direction || 'maintain'}`} />
                                    <span>{plan.direction === 'lose' ? 'Losing Weight' : plan.direction === 'gain' ? 'Gaining Weight' : 'Maintaining'}</span>
                                </div>
                                <h2>{plan.title}</h2>
                                <p>{plan.subtitle || 'No subtitle'}</p>
                            </div>
                        </div>

                        <div className="plans-hero__goal-row">
                            <div className="plans-hero__goal-stat">
                                <span className="plans-hero__goal-label">Goal</span>
                                <strong>{plan.goalTarget ?? '—'}</strong>
                            </div>
                            <div className="plans-hero__goal-divider" />
                            <div className="plans-hero__goal-stat">
                                <span className="plans-hero__goal-label">Remaining</span>
                                <strong className="plans-hero__goal-remaining">{plan.remaining}</strong>
                            </div>
                            <div className="plans-hero__goal-divider" />
                            <div className="plans-hero__goal-stat">
                                <span className="plans-hero__goal-label">Progress</span>
                                <strong>{plan.progress}%</strong>
                            </div>
                        </div>

                        <div className="plans-hero__progress-bar">
                            <div className="plans-hero__progress-meta">
                                <span>Goal Progress</span>
                                <span>{plan.progress}%</span>
                            </div>
                            <ProgressBar value={plan.progress} tone="primary" />
                        </div>
                    </div>

                    {/* Quick macros */}
                    {plan.todayMacros && (
                        <div className="plans-hero__macros">
                            <div className="plans-hero__macro-item">
                                <span className="plans-hero__macro-label">Today</span>
                                <strong>{plan.todayMacros.calories.toLocaleString()}</strong>
                                <small>kcal</small>
                            </div>
                            <div className="plans-hero__macro-item">
                                <span className="plans-hero__macro-label">Protein</span>
                                <strong>{plan.todayMacros.protein}g</strong>
                                <small>target {plan.todayMacros.calorieTarget?.toLocaleString()}</small>
                            </div>
                            <div className="plans-hero__macro-item">
                                <span className="plans-hero__macro-label">Meals</span>
                                <strong>{plan.todayMacros.mealCount}</strong>
                                <small>logged</small>
                            </div>
                        </div>
                    )}
                </section>

                {/* ── Insights Strip ── */}
                <section className="plans-insights">
                    {plan.insights.map((insight, i) => (
                        <article key={i} className={`plans-insight-card plans-insight-card--${insight.color}`}>
                            <div className="plans-insight-card__icon"><Icon name={insight.icon} filled /></div>
                            <div className="plans-insight-card__body">
                                <span>{insight.label}</span>
                                <strong>{insight.total !== null ? `${insight.value}/${insight.total}` : insight.value}{insight.total === 100 ? '%' : ''}</strong>
                            </div>
                            {insight.total !== null && insight.total !== 100 && (
                                <div className="plans-insight-card__bar">
                                    <div style={{ width: `${Math.min(100, (insight.value / insight.total) * 100)}%` }} />
                                </div>
                            )}
                        </article>
                    ))}
                </section>

                {/* ── Estimation Card ── */}
                {plan.estimation && (
                    <article className="plans-estimation-card editorial-card">
                        <div className="plans-estimation-card__head">
                            <div className="plans-estimation-card__icon"><Icon name="schedule" filled /></div>
                            <div>
                                <h4>Estimated Completion</h4>
                                {plan.estimation.estimated_date && (
                                    <strong className="plans-estimation-card__date">{plan.estimation.estimated_date}</strong>
                                )}
                            </div>
                            <div className={`plans-estimation-card__confidence plans-estimation-card__confidence--${plan.estimation.confidence || 'low'}`}>
                                {plan.estimation.confidence === 'high' ? 'High confidence' : plan.estimation.confidence === 'medium' ? 'Medium' : 'Low data'}
                            </div>
                        </div>
                        <div className="plans-estimation-card__stats">
                            <div className="plans-estimation-card__stat">
                                <strong>{plan.estimation.weeks_remaining ?? '—'}</strong>
                                <span>weeks left</span>
                            </div>
                            <div className="plans-estimation-card__stat">
                                <strong>{plan.estimation.days_remaining ?? '—'}</strong>
                                <span>days left</span>
                            </div>
                            {plan.estimation.weekly_rate && (
                                <div className="plans-estimation-card__stat">
                                    <strong>{plan.estimation.weekly_rate}kg</strong>
                                    <span>per week</span>
                                </div>
                            )}
                        </div>
                        {plan.estimation.reason && (
                            <p className="plans-estimation-card__reason">{plan.estimation.reason}</p>
                        )}
                    </article>
                )}

                {/* ── Tip Card ── */}
                {plan.tip && (
                    <article className="plans-tip-card editorial-card">
                        <div className="plans-tip-card__icon"><Icon name="lightbulb" filled /></div>
                        <div>
                            <h4>Plan Tip</h4>
                            <p>{plan.tip}</p>
                        </div>
                    </article>
                )}

                {/* ── All Plans List ── */}
                <section className="plans-stitch__section">
                    <div className="plans-stitch__section-head">
                        <h2 className="plans-stitch__eyebrow">Your Plans</h2>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button type="button" className="plans-edit-btn" onClick={() => setEditingPlan(editingPlan === 'active' ? null : 'active')}>
                                <Icon name={editingPlan === 'active' ? 'expand_less' : 'edit'} /><span>{editingPlan === 'active' ? 'Close' : 'Edit Plan'}</span>
                            </button>
                            <button type="button" className="plans-add-btn" onClick={() => setEditingPlan(editingPlan === 'new' ? null : 'new')}>
                                <Icon name={editingPlan === 'new' ? 'expand_less' : 'add'} /><span>{editingPlan === 'new' ? 'Close' : 'New Plan'}</span>
                            </button>
                        </div>
                    </div>

                    <div className="plans-cards-grid">
                        {plansList.length ? plansList.map((item) => (
                            <article key={item.id} className={`plans-card ${item.is_active ? 'is-active' : ''}`}>
                                <div className="plans-card__header">
                                    <div>
                                        <h3>{item.title}</h3>
                                        <p>{item.subtitle || 'No subtitle'}</p>
                                    </div>
                                    {item.is_active ? (
                                        <span className="plans-card__badge plans-card__badge--active">Active</span>
                                    ) : (
                                        <button type="button" className="plans-card__activate-btn" onClick={() => router.patch(`/plans/${item.id}/activate`, {}, { preserveScroll: true })}>
                                            Activate
                                        </button>
                                    )}
                                </div>
                                <div className="plans-card__progress">
                                    <div className="plans-card__progress-meta">
                                        <span>{item.progress}%</span>
                                        <span>{item.remaining} left</span>
                                    </div>
                                    <div className="plans-card__progress-track">
                                        <div style={{ width: `${item.progress}%` }} />
                                    </div>
                                </div>
                                <button type="button" className="plans-card__delete-btn text-button text-button--danger" onClick={() => setDeleteTarget({ type: 'plan', id: item.id, title: item.title })}>
                                    <Icon name="delete" /><span>Delete</span>
                                </button>
                            </article>
                        )) : (
                            <div className="empty-state-card">
                                <strong>No plans yet</strong>
                                <p>Create your first plan to start tracking your goal.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* ── Edit Active Plan Form ── */}
                {editingPlan === 'active' && (
                    <section className="plans-stitch__section plans-editorial-form">
                        <div className="plans-stitch__section-head">
                            <h2 className="plans-stitch__eyebrow">Edit Active Plan</h2>
                        </div>
                        <form onSubmit={submit} className="editorial-card form-grid">
                            <label><span>Plan Title</span><input value={form.data.title} onChange={(event) => form.setData('title', event.target.value)} /></label>
                            <FieldError message={form.errors.title} />
                            <label><span>Subtitle</span><input value={form.data.subtitle} onChange={(event) => form.setData('subtitle', event.target.value)} /></label>
                            <FieldError message={form.errors.subtitle} />
                            <label><span>Goal Weight ({plan.goalUnit})</span><input type="number" step="0.1" value={form.data.goal_target} onChange={(e) => applyGoalTarget(form.setData.bind(form), e.target.value, form.data.progress_percent)} /></label>
                            <FieldError message={form.errors.goal_target} />
                            <label><span>Target Date</span><input type="date" value={form.data.target_date} onChange={(e) => form.setData('target_date', e.target.value)} /></label>
                            <FieldError message={form.errors.target_date} />
                            <label><span>Weekly Rate (kg/week)</span><input type="number" step="0.1" min="0.1" max="5" value={form.data.weekly_rate} placeholder="e.g. 0.5" onChange={(e) => form.setData('weekly_rate', e.target.value)} /></label>
                            <FieldError message={form.errors.weekly_rate} />
                            <label><span>Tip</span><input value={form.data.tip} onChange={(event) => form.setData('tip', event.target.value)} /></label>
                            <FieldError message={form.errors.tip} />
                            <div className="plans-form-actions">
                                <button type="button" className="ghost-cta" onClick={() => setEditingPlan(null)}>Cancel</button>
                                <button type="submit" className="primary-cta" disabled={form.processing}>{form.processing ? 'Saving...' : 'Save Changes'}</button>
                            </div>
                        </form>
                    </section>
                )}

                {/* ── Create New Plan Form ── */}
                {editingPlan === 'new' && (
                    <section className="plans-stitch__section plans-editorial-form">
                        <div className="plans-stitch__section-head">
                            <h2 className="plans-stitch__eyebrow">Create New Plan</h2>
                        </div>
                        <form className="editorial-card form-grid" onSubmit={submitNewPlan}>
                            <label><span>Plan Title</span><input value={createPlanForm.data.title} onChange={(event) => createPlanForm.setData('title', event.target.value)} /></label>
                            <FieldError message={createPlanForm.errors.title} />
                            <label><span>Subtitle</span><input value={createPlanForm.data.subtitle} onChange={(event) => createPlanForm.setData('subtitle', event.target.value)} /></label>
                            <FieldError message={createPlanForm.errors.subtitle} />
                            <label><span>Goal Unit</span><input value={createPlanForm.data.goal_unit} onChange={(event) => createPlanForm.setData('goal_unit', event.target.value)} /></label>
                            <FieldError message={createPlanForm.errors.goal_unit} />
                            <label><span>Goal Weight</span><input type="number" step="0.1" value={createPlanForm.data.goal_target} onChange={(e) => applyGoalTarget(createPlanForm.setData.bind(createPlanForm), e.target.value, createPlanForm.data.progress_percent)} /></label>
                            <FieldError message={createPlanForm.errors.goal_target} />
                            <label><span>Target Date (optional)</span><input type="date" value={createPlanForm.data.target_date} onChange={(e) => createPlanForm.setData('target_date', e.target.value)} /></label>
                            <FieldError message={createPlanForm.errors.target_date} />
                            <label><span>Weekly Rate (kg/week)</span><input type="number" step="0.1" min="0.1" max="5" value={createPlanForm.data.weekly_rate} placeholder="Auto-calculated" onChange={(e) => createPlanForm.setData('weekly_rate', e.target.value)} /></label>
                            <FieldError message={createPlanForm.errors.weekly_rate} />
                            <label><span>Tip</span><input value={createPlanForm.data.tip} onChange={(event) => createPlanForm.setData('tip', event.target.value)} /></label>
                            <FieldError message={createPlanForm.errors.tip} />
                            <div className="plans-form-actions">
                                <button type="button" className="ghost-cta" onClick={() => setEditingPlan(null)}>Cancel</button>
                                <button type="submit" className="primary-cta" disabled={createPlanForm.processing}>{createPlanForm.processing ? 'Creating...' : 'Create Plan'}</button>
                            </div>
                        </form>
                    </section>
                )}

                {/* ── Milestones ── */}
                <section className="plans-stitch__section">
                    <div className="plans-stitch__section-head">
                        <h2 className="plans-stitch__eyebrow">Weekly Milestones</h2>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button type="button" className="plans-ai-btn" onClick={() => router.post(`/plans/${plan.id}/milestones/generate`, { weeks: 8 }, { preserveScroll: true })}>
                                <Icon name="auto_awesome" /><span>AI Generate</span>
                            </button>
                            <button type="button" className="plans-add-btn" onClick={() => setExpandedSection(expandedSection === 'milestones' ? null : 'milestones')}>
                                <Icon name={expandedSection === 'milestones' ? 'expand_less' : 'add_circle'} /><span>{expandedSection === 'milestones' ? 'Close' : 'Add'}</span>
                            </button>
                        </div>
                    </div>

                    {expandedSection === 'milestones' && (
                        <form className="editorial-card plans-milestone-form" onSubmit={submitMilestone}>
                            <div className="plans-milestone-form__row">
                                <input placeholder="e.g. Run 5km, Hit protein target 3 days" value={milestoneForm.data.label} onChange={(event) => milestoneForm.setData('label', event.target.value)} />
                                <button type="submit" className="primary-cta" disabled={milestoneForm.processing}>{milestoneForm.processing ? '...' : 'Add'}</button>
                            </div>
                            <FieldError message={milestoneForm.errors.label} />
                        </form>
                    )}

                    {plan.milestones.length ? (
                        <div className="plans-milestones-timeline">
                            {plan.milestones.map((item, i) => (
                                <div key={item.id} className={`plans-milestone-item ${item.done ? 'is-done' : ''}`}>
                                    <div className="plans-milestone-item__connector">
                                        <div className={`plans-milestone-item__dot ${item.done ? 'is-done' : ''}`}>
                                            <Icon name={item.done ? 'check' : 'radio_button_unchecked'} filled={item.done} />
                                        </div>
                                        {i < plan.milestones.length - 1 && <div className={`plans-milestone-item__line ${item.done ? 'is-done' : ''}`} />}
                                    </div>
                                    <div className="plans-milestone-item__body">
                                        <span className="plans-milestone-item__label">{item.day}</span>
                                        <button type="button" className="plans-milestone-item__toggle text-button" onClick={() => router.patch(`/plans/milestones/${item.id}/toggle`, {}, { preserveScroll: true })}>
                                            {item.done ? 'Undo' : 'Done'}
                                        </button>
                                        <button type="button" className="text-button text-button--danger" onClick={() => setDeleteTarget({ type: 'milestone', id: item.id, title: item.day })}><Icon name="delete" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state-card">
                            <strong>No milestones yet</strong>
                            <p>Add milestones to break your plan into achievable steps.</p>
                        </div>
                    )}
                </section>

                {/* ── Recommended Meals ── */}
                <section className="plans-stitch__section">
                    <div className="plans-stitch__section-head">
                        <h2 className="plans-stitch__eyebrow">Recommended Meals</h2>
                        <button type="button" onClick={() => router.visit('/chat')}>Open Chat</button>
                    </div>
                    {plan.meals.length ? (
                        <div className="plans-meals-grid">
                            {plan.meals.map((meal, i) => (
                                <article key={`${meal.name}-${i}`} className="plans-meal-card editorial-card">
                                    <div className="plans-meal-card__image">
                                        <div className={`plans-meal-card__plate plans-meal-card__plate--${i % 3}`}>
                                            <span /><span /><span />
                                        </div>
                                    </div>
                                    <div className="plans-meal-card__body">
                                        <h3>{meal.name}</h3>
                                        <div className="plans-meal-card__macros">
                                            <span><strong>{meal.calories}</strong> kcal</span>
                                            <span>{meal.protein}</span>
                                            <span>{meal.extra}</span>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state-card">
                            <strong>No recommended meals yet</strong>
                            <p>Log more meals in Chat for AI-powered recommendations.</p>
                        </div>
                    )}
                </section>

            </div>
            </PageTransition>

            <ConfirmDialog
                open={deleteTarget !== null}
                title={deleteTarget?.type === 'plan' ? 'Delete Plan' : 'Delete Milestone'}
                message={`Delete "${deleteTarget?.title ?? ''}"? This cannot be undone.`}
                confirmLabel="Delete"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </AppShell>
    );
}
