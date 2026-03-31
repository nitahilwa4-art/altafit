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
    const [showPlanForm, setShowPlanForm] = useState(false);
    const [planFormMode, setPlanFormMode] = useState('new'); // 'new' | 'edit'
    const [expandedSection, setExpandedSection] = useState(null);
    const [milestones, setMilestones] = useState(plan.milestones);

    const dailyScoreValue = plan.dailyScore;
    const calorieRingValue = plan.todayMacros?.calorieTarget > 0
        ? Math.min(Math.round((plan.todayMacros.calories / plan.todayMacros.calorieTarget) * 100), 100)
        : 0;

    const applyGoalTarget = (setter, target, pct) => {
        const t = parseFloat(target) || 0;
        setter('goal_target', target);
        if (t > 0) setter('goal_remaining', String(Math.max(0, t * (1 - (parseFloat(pct) || 0) / 100)).toFixed(2)));
    };

    const openEditPlan = () => {
        form.reset();
        setPlanFormMode('edit');
        setShowPlanForm(true);
        setExpandedSection(null);
    };

    const openNewPlan = () => {
        createPlanForm.reset();
        setPlanFormMode('new');
        setShowPlanForm(true);
        setExpandedSection(null);
    };

    const closePlanForm = () => {
        setShowPlanForm(false);
        setPlanFormMode('new');
    };

    const submitPlan = (event) => {
        event.preventDefault();
        if (planFormMode === 'edit') {
            form.patch(`/plans/${plan.id}`, { preserveScroll: true, onSuccess: closePlanForm });
        } else {
            createPlanForm.post('/plans', { preserveScroll: true, onSuccess: closePlanForm });
        }
    };

    const submitMilestone = () => {
        const label = milestoneForm.data.label.trim();
        if (!label) return;
        const originalLabel = milestoneForm.data.label;
        milestoneForm.setData('label', '');
        fetch(`/plans/${plan.id}/milestones`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]')?.content },
            body: JSON.stringify({ label }),
        }).then(res => res.json()).then(data => {
            if (data.success) {
                setMilestones(prev => [...prev, data.milestone]);
                setExpandedSection(null);
            }
        }).catch(() => {
            milestoneForm.setData('label', originalLabel);
        });
    };

    const confirmDelete = () => {
        if (deleteTarget?.type === 'plan') {
            router.delete(`/plans/${deleteTarget.id}`, { preserveScroll: true });
        } else if (deleteTarget?.type === 'milestone') {
            const id = deleteTarget.id;
            fetch(`/plans/milestones/${id}`, {
                method: 'DELETE',
                headers: { 'X-Requested-With': 'XMLHttpRequest', 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]')?.content },
            }).then(() => {
                setMilestones(prev => prev.filter(m => m.id !== id));
            });
        }
        setDeleteTarget(null);
    };

    return (
        <AppShell pageMeta={pageMeta} brandMode>
            <FlashBanner message={flash?.success} />
            <PageTransition>
            <div className="plans-stitch">

                {/* ── Hero ── */}
                <section className="plans-hero">
                    <div className="plans-hero__ring-wrap">
                        <div className="plans-hero__dual-ring">
                            <svg viewBox="0 0 120 120" className="plans-hero__ring-svg">
                                <circle cx="60" cy="60" r="52" className="plans-hero__ring-bg plans-hero__ring-bg--outer" />
                                <circle cx="60" cy="60" r="52"
                                    className="plans-hero__ring-value plans-hero__ring-value--outer"
                                    strokeDasharray={`${2 * Math.PI * 52}`}
                                    strokeDashoffset={`${2 * Math.PI * 52 * (1 - dailyScoreValue / 100)}`}
                                />
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
                                    <span>{plan.direction === 'lose' ? 'Menurunkan Berat' : plan.direction === 'gain' ? 'Menaikkan Berat' : 'Mempertahankan'}</span>
                                </div>
                                <h2>{plan.title}</h2>
                                <p>{plan.subtitle || 'Tidak ada deskripsi'}</p>
                            </div>
                            <button type="button" className="plans-hero__edit-btn" onClick={openEditPlan}>
                                <Icon name="edit" /><span>Edit Plan</span>
                            </button>
                        </div>

                        <div className="plans-hero__goal-row">
                            <div className="plans-hero__goal-stat">
                                <span className="plans-hero__goal-label">Target</span>
                                <strong>{plan.goalTarget ?? '—'}</strong>
                            </div>
                            <div className="plans-hero__goal-divider" />
                            <div className="plans-hero__goal-stat">
                                <span className="plans-hero__goal-label">Sisa</span>
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

                    {plan.todayMacros && (
                        <div className="plans-hero__macros">
                            <div className="plans-hero__macro-item">
                                <span className="plans-hero__macro-label">Hari ini</span>
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
                                <h4>Estimasi Selesai</h4>
                                {plan.estimation.estimated_date && (
                                    <strong className="plans-estimation-card__date">{plan.estimation.estimated_date}</strong>
                                )}
                            </div>
                            <div className={`plans-estimation-card__confidence plans-estimation-card__confidence--${plan.estimation.confidence || 'low'}`}>
                                {plan.estimation.confidence === 'high' ? 'Akurat' : plan.estimation.confidence === 'medium' ? 'Cukup' : 'Kurang data'}
                            </div>
                        </div>
                        <div className="plans-estimation-card__stats">
                            <div className="plans-estimation-card__stat">
                                <strong>{plan.estimation.weeks_remaining ?? '—'}</strong>
                                <span>minggu lagi</span>
                            </div>
                            <div className="plans-estimation-card__stat">
                                <strong>{plan.estimation.days_remaining ?? '—'}</strong>
                                <span>hari lagi</span>
                            </div>
                            {plan.estimation.weekly_rate && (
                                <div className="plans-estimation-card__stat">
                                    <strong>{plan.estimation.weekly_rate}kg</strong>
                                    <span>per minggu</span>
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

                {/* ── Milestones ── */}
                <section className="plans-stitch__section plans-milestones-section">
                    <div className="plans-stitch__section-head">
                        <h2 className="plans-stitch__eyebrow">Minggu Milestone</h2>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button type="button" className="plans-ai-btn" onClick={() => router.post(`/plans/${plan.id}/milestones/generate`, { weeks: 8 }, { preserveScroll: true })}>
                                <Icon name="auto_awesome" /><span>AI Generate</span>
                            </button>
                            <button type="button" className="plans-add-btn" style={{ background: '#10b981', color: '#fff', border: '2px solid #065f46' }} onClick={() => { setExpandedSection(expandedSection === 'milestones' ? null : 'milestones'); setShowPlanForm(false); }}>
                                <Icon name={expandedSection === 'milestones' ? 'expand_less' : 'add_circle'} /><span>{expandedSection === 'milestones' ? 'Tutup' : 'Tambah'}</span>
                            </button>
                        </div>
                    </div>

                    {expandedSection === 'milestones' && (
                        <div style={{ background: '#10b981', color: '#fff', borderRadius: '12px', padding: '14px 16px', marginTop: '8px', display: 'flex', gap: '10px', alignItems: 'center', minHeight: '60px' }}>
                            <span style={{ flex: 1, fontSize: '14px', fontWeight: '700' }}>Ketik milestone:</span>
                            <input
                                style={{ flex: 2, padding: '9px 14px', border: '2px solid #fff', borderRadius: '10px', background: '#fff', fontSize: '14px', outline: 'none', color: '#000' }}
                                placeholder="Contoh: Lari 5km..."
                                value={milestoneForm.data.label}
                                onChange={(event) => milestoneForm.setData('label', event.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && submitMilestone()}
                            />
                            <button type="button" style={{ padding: '9px 20px', background: '#fff', color: '#10b981', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '14px' }} onClick={submitMilestone} disabled={milestoneForm.processing}>
                                {milestoneForm.processing ? '...' : 'Simpan'}
                            </button>
                        </div>
                    )}

                    {milestones.length ? (
                        <div className="plans-milestones-timeline">
                            {milestones.map((item, i) => (
                                <div key={item.id} className={`plans-milestone-item ${item.done ? 'is-done' : ''}`}>
                                    <div className="plans-milestone-item__connector">
                                        <div className={`plans-milestone-item__dot ${item.done ? 'is-done' : ''}`}>
                                            <Icon name={item.done ? 'check' : 'radio_button_unchecked'} filled={item.done} />
                                        </div>
                                        {i < milestones.length - 1 && <div className={`plans-milestone-item__line ${item.done ? 'is-done' : ''}`} />}
                                    </div>
                                    <div className="plans-milestone-item__body">
                                        <span className="plans-milestone-item__label">{item.day}</span>
                                        <button type="button" className="plans-milestone-item__toggle text-button" onClick={() => {
                                            setMilestones(prev => prev.map(m => m.id === item.id ? { ...m, done: !m.done } : m));
                                            fetch(`/plans/milestones/${item.id}/toggle`, { method: 'PATCH', headers: { 'X-Requested-With': 'XMLHttpRequest', 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]')?.content } });
                                        }}>
                                            {item.done ? 'Batal' : 'Selesai'}
                                        </button>
                                        <button type="button" className="text-button text-button--danger" onClick={() => setDeleteTarget({ type: 'milestone', id: item.id, title: item.day })}><Icon name="delete" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : !expandedSection && (
                        <div className="empty-state-card">
                            <strong>Belum ada milestone</strong>
                            <p>Klik "Tambah" untuk input manual atau "AI Generate" untuk auto-generate 8 milestone.</p>
                        </div>
                    )}
                </section>

                {/* ── Plans List + Form — SATU section ── */}
                <section className="plans-stitch__section">
                    {!showPlanForm ? (
                        <>
                            <div className="plans-stitch__section-head">
                                <h2 className="plans-stitch__eyebrow">Semua Plans</h2>
                                <button type="button" className="plans-add-btn" onClick={openNewPlan}>
                                    <Icon name="add" /><span>Plan Baru</span>
                                </button>
                            </div>
                            <div className="plans-cards-grid">
                                {plansList.length ? plansList.map((item) => (
                                    <article key={item.id} className={`plans-card ${item.is_active ? 'is-active' : ''}`}>
                                        <div className="plans-card__header">
                                            <div>
                                                <h3>{item.title}</h3>
                                                <p>{item.subtitle || 'Tidak ada deskripsi'}</p>
                                            </div>
                                            {item.is_active ? (
                                                <span className="plans-card__badge plans-card__badge--active">Aktif</span>
                                            ) : (
                                                <button type="button" className="plans-card__activate-btn" onClick={() => router.patch(`/plans/${item.id}/activate`, {}, { preserveScroll: true })}>
                                                    Aktifkan
                                                </button>
                                            )}
                                        </div>
                                        <div className="plans-card__progress">
                                            <div className="plans-card__progress-meta">
                                                <span>{item.progress}%</span>
                                                <span>{item.remaining} sisa</span>
                                            </div>
                                            <div className="plans-card__progress-track">
                                                <div style={{ width: `${item.progress}%` }} />
                                            </div>
                                        </div>
                                        <button type="button" className="plans-card__delete-btn text-button text-button--danger" onClick={() => setDeleteTarget({ type: 'plan', id: item.id, title: item.title })}>
                                            <Icon name="delete" /><span>Hapus</span>
                                        </button>
                                    </article>
                                )) : (
                                    <div className="empty-state-card">
                                        <strong>Belum ada plan</strong>
                                        <p>Klik "Plan Baru" untuk buat plan pertamamu.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="plans-stitch__section-head">
                                <h2 className="plans-stitch__eyebrow">{planFormMode === 'edit' ? 'Edit Plan' : 'Plan Baru'}</h2>
                                <button type="button" className="plans-add-btn" onClick={closePlanForm}>
                                    <Icon name="close" /><span>Tutup</span>
                                </button>
                            </div>
                            {planFormMode === 'edit' ? (
                                <form onSubmit={submitPlan} className="editorial-card form-grid">
                                    <label><span>Judul Plan</span><input value={form.data.title} onChange={(event) => form.setData('title', event.target.value)} /></label>
                                    <FieldError message={form.errors.title} />
                                    <label><span>Deskripsi</span><input value={form.data.subtitle} onChange={(event) => form.setData('subtitle', event.target.value)} /></label>
                                    <FieldError message={form.errors.subtitle} />
                                    <label><span>Target Berat ({plan.goalUnit})</span><input type="number" step="0.1" value={form.data.goal_target} onChange={(e) => applyGoalTarget(form.setData.bind(form), e.target.value, form.data.progress_percent)} /></label>
                                    <FieldError message={form.errors.goal_target} />
                                    <label><span>Tanggal Target</span><input type="date" value={form.data.target_date} onChange={(e) => form.setData('target_date', e.target.value)} /></label>
                                    <FieldError message={form.errors.target_date} />
                                    <label><span>Rencana per Minggu (kg)</span><input type="number" step="0.1" min="0.1" max="5" value={form.data.weekly_rate} placeholder="Contoh: 0.5" onChange={(e) => form.setData('weekly_rate', e.target.value)} /></label>
                                    <FieldError message={form.errors.weekly_rate} />
                                    <label><span>Tips</span><input value={form.data.tip} onChange={(event) => form.setData('tip', event.target.value)} /></label>
                                    <FieldError message={form.errors.tip} />
                                    <div className="plans-form-actions">
                                        <button type="button" className="ghost-cta" onClick={closePlanForm}>Batal</button>
                                        <button type="submit" className="primary-cta" disabled={form.processing}>{form.processing ? 'Menyimpan...' : 'Simpan'}</button>
                                    </div>
                                </form>
                            ) : (
                                <form className="editorial-card form-grid" onSubmit={submitPlan}>
                                    <label><span>Judul Plan</span><input value={createPlanForm.data.title} onChange={(event) => createPlanForm.setData('title', event.target.value)} /></label>
                                    <FieldError message={createPlanForm.errors.title} />
                                    <label><span>Deskripsi</span><input value={createPlanForm.data.subtitle} onChange={(event) => createPlanForm.setData('subtitle', event.target.value)} /></label>
                                    <FieldError message={createPlanForm.errors.subtitle} />
                                    <label><span>Satuan</span><input value={createPlanForm.data.goal_unit} onChange={(event) => createPlanForm.setData('goal_unit', event.target.value)} /></label>
                                    <FieldError message={createPlanForm.errors.goal_unit} />
                                    <label><span>Target Berat</span><input type="number" step="0.1" value={createPlanForm.data.goal_target} onChange={(e) => applyGoalTarget(createPlanForm.setData.bind(createPlanForm), e.target.value, createPlanForm.data.progress_percent)} /></label>
                                    <FieldError message={createPlanForm.errors.goal_target} />
                                    <label><span>Tanggal Target (opsional)</span><input type="date" value={createPlanForm.data.target_date} onChange={(e) => createPlanForm.setData('target_date', e.target.value)} /></label>
                                    <FieldError message={createPlanForm.errors.target_date} />
                                    <label><span>Rencana per Minggu (kg)</span><input type="number" step="0.1" min="0.1" max="5" value={createPlanForm.data.weekly_rate} placeholder="Auto-calculated" onChange={(e) => createPlanForm.setData('weekly_rate', e.target.value)} /></label>
                                    <FieldError message={createPlanForm.errors.weekly_rate} />
                                    <label><span>Tips</span><input value={createPlanForm.data.tip} onChange={(event) => createPlanForm.setData('tip', event.target.value)} /></label>
                                    <FieldError message={createPlanForm.errors.tip} />
                                    <div className="plans-form-actions">
                                        <button type="button" className="ghost-cta" onClick={closePlanForm}>Batal</button>
                                        <button type="submit" className="primary-cta" disabled={createPlanForm.processing}>{createPlanForm.processing ? 'Membuat...' : 'Buat Plan'}</button>
                                    </div>
                                </form>
                            )}
                        </>
                    )}
                </section>

                {/* ── Recommended Meals ── */}
                <section className="plans-stitch__section">
                    <div className="plans-stitch__section-head">
                        <h2 className="plans-stitch__eyebrow">Rekomendasi Meals</h2>
                        <button type="button" onClick={() => router.visit('/chat')}>Buka Chat</button>
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
                            <strong>Belum ada rekomendasi</strong>
                            <p>Log lebih banyak meals di Chat untuk rekomendasi AI.</p>
                        </div>
                    )}
                </section>

                <ConfirmDialog
                    isOpen={!!deleteTarget}
                    title={deleteTarget?.type === 'plan' ? 'Hapus Plan?' : 'Hapus Milestone?'}
                    message={deleteTarget?.type === 'plan'
                        ? `Yakin hapus plan "${deleteTarget?.title}"?`
                        : `Yakin hapus milestone "${deleteTarget?.title}"?`}
                    confirmLabel="Hapus"
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            </div>
            </PageTransition>
        </AppShell>
    );
}
