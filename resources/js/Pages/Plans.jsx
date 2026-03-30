import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppShell from '../Layouts/AppShell';
import ConfirmDialog from '../Components/ui/ConfirmDialog';
import FlashBanner from '../Components/ui/FlashBanner';
import Icon from '../Components/ui/Icon';
import PageTransition from '../Components/ui/PageTransition';

function FieldError({ message }) {
    if (!message) return null;
    return <small className="field-error">{message}</small>;
}

export default function Plans({ pageMeta, plansList = [], plan, newPlanForm, flash }) {
    const form = useForm(plan.form);
    const milestoneForm = useForm(plan.newMilestone);
    const createPlanForm = useForm(newPlanForm);
    const [deleteTarget, setDeleteTarget] = useState(null);

    // Smart form: auto-calculate Remaining ↔ Progress from Goal Target
    const applyGoalTargetToCreate = (target) => {
        const t = parseFloat(target) || 0;
        const pct = parseFloat(createPlanForm.data.progress_percent) || 0;
        createPlanForm.setData('goal_target', target);
        if (t > 0 && pct >= 0) {
            createPlanForm.setData('goal_remaining', String(Math.max(0, t * (1 - pct / 100)).toFixed(2)));
        }
    };

    const applyProgressToCreate = (pct) => {
        const t = parseFloat(createPlanForm.data.goal_target) || 0;
        const p = Math.min(100, Math.max(0, parseFloat(pct) || 0));
        createPlanForm.setData('progress_percent', pct);
        if (t > 0) {
            createPlanForm.setData('goal_remaining', String(Math.max(0, t * (1 - p / 100)).toFixed(2)));
        }
    };

    const applyRemainingToCreate = (remaining) => {
        const t = parseFloat(createPlanForm.data.goal_target) || 0;
        const r = parseFloat(remaining) || 0;
        createPlanForm.setData('goal_remaining', remaining);
        if (t > 0) {
            const p = Math.min(100, Math.max(0, 100 - (r / t) * 100));
            createPlanForm.setData('progress_percent', String(Math.round(p)));
        }
    };

    // Smart form for Edit Active Plan (prefilled)
    const applyGoalTargetToEdit = (target) => {
        const t = parseFloat(target) || 0;
        const pct = parseFloat(form.data.progress_percent) || 0;
        form.setData('goal_target', target);
        if (t > 0 && pct >= 0) {
            form.setData('goal_remaining', String(Math.max(0, t * (1 - pct / 100)).toFixed(2)));
        }
    };

    const applyProgressToEdit = (pct) => {
        const t = parseFloat(form.data.goal_target) || 0;
        const p = Math.min(100, Math.max(0, parseFloat(pct) || 0));
        form.setData('progress_percent', pct);
        if (t > 0) {
            form.setData('goal_remaining', String(Math.max(0, t * (1 - p / 100)).toFixed(2)));
        }
    };

    const applyRemainingToEdit = (remaining) => {
        const t = parseFloat(form.data.goal_target) || 0;
        const r = parseFloat(remaining) || 0;
        form.setData('goal_remaining', remaining);
        if (t > 0) {
            const p = Math.min(100, Math.max(0, 100 - (r / t) * 100));
            form.setData('progress_percent', String(Math.round(p)));
        }
    };

    const submit = (event) => {
        event.preventDefault();
        form.patch(`/plans/${plan.id}`, { preserveScroll: true });
    };

    const submitMilestone = (event) => {
        event.preventDefault();
        milestoneForm.post(`/plans/${plan.id}/milestones`, { preserveScroll: true, onSuccess: () => milestoneForm.reset() });
    };

    const submitNewPlan = (event) => {
        event.preventDefault();
        createPlanForm.post('/plans', { preserveScroll: true, onSuccess: () => createPlanForm.reset() });
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
                <section className="plans-stitch__section">
                    <div className="plans-stitch__section-head">
                        <h2 className="plans-stitch__eyebrow">Your Plans</h2>
                        <button type="button">{plansList.length} total</button>
                    </div>
                    <div className="plans-list-card editorial-card">
                        {plansList.length ? plansList.map((item) => (
                            <div key={item.id} className={`plans-list-item ${item.is_active ? 'is-active' : ''}`}>
                                <div>
                                    <strong>{item.title}</strong>
                                    <p>{item.subtitle || 'No subtitle'} · {item.remaining}</p>
                                </div>
                                <div className="plans-list-item__actions">
                                    <span>{item.progress}%</span>
                                    {!item.is_active ? (
                                        <button type="button" className="text-button" onClick={() => router.patch(`/plans/${item.id}/activate`, {}, { preserveScroll: true })}>Set Active</button>
                                    ) : (
                                        <span className="plans-list-item__badge">Active</span>
                                    )}
                                    <button type="button" className="text-button text-button--danger" onClick={() => setDeleteTarget({ type: 'plan', id: item.id, title: item.title })}>Delete</button>
                                </div>
                            </div>
                        )) : (
                            <div className="empty-state-card">
                                <strong>No plans yet</strong>
                                <p>Create your first plan below to start tracking a concrete target.</p>
                            </div>
                        )}
                    </div>
                </section>

                <section className="plans-stitch__section">
                    <h2 className="plans-stitch__eyebrow">Active Plan</h2>
                    <article className="plans-stitch__hero">
                        <div className="plans-stitch__hero-top">
                            <div className="plans-stitch__hero-copy">
                                <h3>{plan.title}</h3>
                                <p>{plan.subtitle}</p>
                            </div>
                            <div className="plans-stitch__hero-side">
                                <strong>{plan.remaining}</strong>
                                <span>to go</span>
                            </div>
                        </div>
                        <div className="plans-stitch__progress-block">
                            <div className="plans-stitch__progress-meta"><span>Manual Progress</span><span>{plan.progress}%</span></div>
                            <div className="plans-stitch__progress-track"><div style={{ width: `${plan.progress}%` }} /></div>
                        </div>
                        <div className="plans-stitch__progress-block">
                            <div className="plans-stitch__progress-meta"><span>Smart Progress</span><span>{plan.smartProgress}%</span></div>
                            <div className="plans-stitch__progress-track plans-stitch__progress-track--smart"><div style={{ width: `${plan.smartProgress}%` }} /></div>
                        </div>
                        <div className="plans-smart-insights">
                            <div className="plans-smart-insight"><span>Milestones</span><strong>{plan.insights.milestones}</strong></div>
                            <div className="plans-smart-insight"><span>Meals</span><strong>{plan.insights.meals}</strong></div>
                            <div className="plans-smart-insight"><span>Hydration</span><strong>{plan.insights.hydration}</strong></div>
                        </div>
                    </article>
                </section>

                <section className="plans-stitch__section">
                    <article className="plans-stitch__tip-card">
                        <div className="plans-stitch__tip-icon"><Icon name="lightbulb" filled /></div>
                        <div className="plans-stitch__tip-copy">
                            <h4>Today's Plan Tip</h4>
                            <p>{plan.tip}</p>
                        </div>
                    </article>
                </section>

                <section className="plans-stitch__section">
                    <div className="plans-stitch__section-head">
                        <h2 className="plans-stitch__eyebrow">Recommended Meals</h2>
                        <button type="button" onClick={() => router.visit('/chat')}>Open Chat</button>
                    </div>
                    {plan.meals.length ? (
                        <div className="plans-stitch__carousel">
                            {plan.meals.map((meal, index) => (
                                <article key={meal.name} className="plans-stitch__meal-card">
                                    <div className={`plans-stitch__meal-image plans-stitch__meal-image--${index % 3}`}>
                                        <div className="plans-stitch__meal-plating">
                                            <span className="plans-stitch__meal-accent plans-stitch__meal-accent--one" />
                                            <span className="plans-stitch__meal-accent plans-stitch__meal-accent--two" />
                                            <span className="plans-stitch__meal-accent plans-stitch__meal-accent--three" />
                                        </div>
                                    </div>
                                    <div className="plans-stitch__meal-body">
                                        <h3>{meal.name}</h3>
                                        <div className="plans-stitch__meal-stats">
                                            <div>
                                                <p>Cals</p>
                                                <strong>{meal.calories}</strong>
                                            </div>
                                            <div>
                                                <p>Protein</p>
                                                <strong>{meal.protein}</strong>
                                            </div>
                                            <div>
                                                <p>{meal.extra.includes('Carbs') ? 'Carbs' : 'Fat'}</p>
                                                <strong>{meal.extra.split(' ')[0]}</strong>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state-card editorial-card">
                            <strong>No recommended meals yet</strong>
                            <p>Log more meals in Chat and Altafit will start surfacing useful recommendations here.</p>
                        </div>
                    )}
                </section>

                <section className="plans-stitch__section plans-editorial-form">
                    <div className="plans-stitch__section-head">
                        <h2 className="plans-stitch__eyebrow">Create New Plan</h2>
                        <button type="button" onClick={() => createPlanForm.reset()}>Reset</button>
                    </div>
                    <form className="editorial-card form-grid" onSubmit={submitNewPlan}>
                        <label><span>Plan Title</span><input value={createPlanForm.data.title} onChange={(event) => createPlanForm.setData('title', event.target.value)} /></label>
                        <FieldError message={createPlanForm.errors.title} />
                        <label><span>Subtitle</span><input value={createPlanForm.data.subtitle} onChange={(event) => createPlanForm.setData('subtitle', event.target.value)} /></label>
                        <FieldError message={createPlanForm.errors.subtitle} />
                        <label><span>Goal Unit</span><input value={createPlanForm.data.goal_unit} onChange={(event) => createPlanForm.setData('goal_unit', event.target.value)} /></label>
                        <FieldError message={createPlanForm.errors.goal_unit} />
                        <label><span>Goal Target</span><input type="number" step="0.1" value={createPlanForm.data.goal_target} onChange={(event) => applyGoalTargetToCreate(event.target.value)} /></label>
                        <FieldError message={createPlanForm.errors.goal_target} />
                        <label><span>Remaining</span><input type="number" step="0.1" value={createPlanForm.data.goal_remaining} onChange={(event) => applyRemainingToCreate(event.target.value)} /></label>
                        <FieldError message={createPlanForm.errors.goal_remaining} />
                        <label><span>Progress (%)</span><input type="number" min="0" max="100" value={createPlanForm.data.progress_percent} onChange={(event) => applyProgressToCreate(event.target.value)} /></label>
                        <FieldError message={createPlanForm.errors.progress_percent} />
                        <label><span>Tip</span><input value={createPlanForm.data.tip} onChange={(event) => createPlanForm.setData('tip', event.target.value)} /></label>
                        <FieldError message={createPlanForm.errors.tip} />
                        <button type="submit" className="primary-cta" disabled={createPlanForm.processing}>{createPlanForm.processing ? 'Creating Plan...' : 'Create Plan'}</button>
                    </form>
                </section>

                <section className="plans-stitch__section plans-editorial-form">
                    <div className="plans-stitch__section-head">
                        <h2 className="plans-stitch__eyebrow">Edit Active Plan</h2>
                        <button type="button" onClick={() => form.reset()}>Reset</button>
                    </div>
                    <form className="editorial-card form-grid" onSubmit={submit}>
                        <label><span>Plan Title</span><input value={form.data.title} onChange={(event) => form.setData('title', event.target.value)} /></label>
                        <FieldError message={form.errors.title} />
                        <label><span>Subtitle</span><input value={form.data.subtitle} onChange={(event) => form.setData('subtitle', event.target.value)} /></label>
                        <FieldError message={form.errors.subtitle} />
                        <label><span>Goal Target ({plan.goalUnit})</span><input type="number" step="0.1" value={form.data.goal_target} onChange={(event) => applyGoalTargetToEdit(event.target.value)} /></label>
                        <FieldError message={form.errors.goal_target} />
                        <label><span>Remaining ({plan.goalUnit})</span><input type="number" step="0.1" value={form.data.goal_remaining} onChange={(event) => applyRemainingToEdit(event.target.value)} /></label>
                        <FieldError message={form.errors.goal_remaining} />
                        <label><span>Progress (%)</span><input type="number" min="0" max="100" value={form.data.progress_percent} onChange={(event) => applyProgressToEdit(event.target.value)} /></label>
                        <FieldError message={form.errors.progress_percent} />
                        <label><span>Tip</span><input value={form.data.tip} onChange={(event) => form.setData('tip', event.target.value)} /></label>
                        <FieldError message={form.errors.tip} />
                        <button type="submit" className="primary-cta" disabled={form.processing}>{form.processing ? 'Saving Plan...' : 'Save Plan Changes'}</button>
                    </form>
                </section>

                <section className="plans-stitch__section plans-editorial-form">
                    <div className="plans-stitch__section-head">
                        <h2 className="plans-stitch__eyebrow">Weekly Milestones</h2>
                        <button type="button">Manage</button>
                    </div>
                    <form className="editorial-card plans-milestone-form" onSubmit={submitMilestone}>
                        <div className="plans-milestone-form__row">
                            <input placeholder="Add milestone label" value={milestoneForm.data.label} onChange={(event) => milestoneForm.setData('label', event.target.value)} />
                            <button type="submit" className="text-button" disabled={milestoneForm.processing}>{milestoneForm.processing ? 'Adding...' : 'Add'}</button>
                        </div>
                        <FieldError message={milestoneForm.errors.label} />
                    </form>
                    {plan.milestones.length ? (
                        <article className="plans-stitch__milestones">
                            {plan.milestones.map((item) => (
                                <div key={item.id} className="plans-stitch__milestone-stack">
                                    <button
                                        type="button"
                                        className="plans-stitch__milestone-button"
                                        onClick={() => router.patch(`/plans/milestones/${item.id}/toggle`, {}, { preserveScroll: true })}
                                    >
                                        <div className="plans-stitch__milestone-item">
                                            <span>{item.day}</span>
                                            <div className={`plans-stitch__milestone-dot ${item.done ? 'is-done' : ''}`.trim()}>
                                                <Icon name={item.done ? 'check' : 'radio_button_unchecked'} filled={item.done} />
                                            </div>
                                        </div>
                                    </button>
                                    <button type="button" className="text-button text-button--danger" onClick={() => setDeleteTarget({ type: 'milestone', id: item.id, title: item.day })}>Delete</button>
                                </div>
                            ))}
                        </article>
                    ) : (
                        <div className="empty-state-card editorial-card">
                            <strong>No milestones yet</strong>
                            <p>Add a few milestone labels to break your plan into smaller wins.</p>
                        </div>
                    )}
                </section>
            </div>
            </PageTransition>

            <ConfirmDialog
                open={deleteTarget !== null}
                title={deleteTarget?.type === 'plan' ? 'Delete Plan' : 'Delete Milestone'}
                message={`Are you sure you want to delete "${deleteTarget?.title ?? ''}"? This action cannot be undone.`}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </AppShell>
    );
}
