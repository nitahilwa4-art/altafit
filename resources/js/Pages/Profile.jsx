import { router, useForm } from '@inertiajs/react';
import AppShell from '../Layouts/AppShell';
import FlashBanner from '../Components/ui/FlashBanner';
import Icon from '../Components/ui/Icon';
import PageTransition from '../Components/ui/PageTransition';

function FieldError({ message }) {
    if (!message) return null;
    return <small className="field-error">{message}</small>;
}

export default function Profile({ pageMeta, profile, flash }) {
    const form = useForm(profile.form);
    const isDark = pageMeta.theme === 'dark';

    const submit = (event) => {
        event.preventDefault();
        form.post('/profile', { preserveScroll: true });
    };

    return (
        <AppShell pageMeta={pageMeta} brandMode>
            <FlashBanner message={flash?.success} />

            <PageTransition>
            <section className="profile-header profile-header--animated">
                <div className="profile-header__avatar">
                    <div className="avatar avatar--lg">{pageMeta.userInitial ?? 'A'}</div>
                    <button type="button" className="profile-header__edit"><Icon name="edit" filled /></button>
                </div>
                <h1>{profile.name}</h1>
                <p>{profile.weight} · Goal: {profile.goalWeight}</p>
                <small className="profile-header__goal-delta">{profile.goalDelta}</small>
            </section>

            <section className="profile-stats profile-stats--wide profile-stats--animated">
                <article className="editorial-card compact-stat">
                    <div className="compact-stat__icon"><Icon name="local_fire_department" filled /></div>
                    <span>Daily Target</span>
                    <strong>{profile.dailyTarget}</strong>
                </article>
                <article className="editorial-card compact-stat">
                    <div className="compact-stat__icon"><Icon name="water_drop" filled /></div>
                    <span>Hydration</span>
                    <strong>{profile.hydrationTarget}</strong>
                </article>
                <article className="editorial-card compact-stat">
                    <div className="compact-stat__icon"><Icon name="restaurant" filled /></div>
                    <span>Protein Goal</span>
                    <strong>{profile.macroTargets.protein}</strong>
                </article>
                <article className="editorial-card compact-stat">
                    <div className="compact-stat__icon"><Icon name="grain" filled /></div>
                    <span>Carb Goal</span>
                    <strong>{profile.macroTargets.carbs}</strong>
                </article>
                <article className="editorial-card compact-stat compact-stat--wide">
                    <div className="compact-stat__icon"><Icon name="opacity" filled /></div>
                    <span>Fat Goal</span>
                    <strong>{profile.macroTargets.fat}</strong>
                </article>
            </section>

            <section className="stack-section">
                <div className="eyebrow">Preferences</div>
                <article className="settings-list editorial-card">
                    <div className="settings-list__item">
                        <div className="settings-list__main">
                            <div className="settings-list__icon"><Icon name={isDark ? 'dark_mode' : 'light_mode'} filled /></div>
                            <div>
                                <h3>Dark Mode</h3>
                                <p>{isDark ? 'Dark theme is active' : 'Light theme is active'}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            className={`toggle ${isDark ? 'is-on' : ''}`}
                            onClick={() => router.post('/profile/theme', {}, { preserveScroll: true })}
                        />
                    </div>
                    {profile.settings.map((setting) => {
                        const iconName = setting.title === 'Smart Reminders'
                            ? 'notifications_active'
                            : setting.title === 'Apple Health Sync'
                                ? 'sync'
                                : 'straighten';

                        return (
                            <div key={setting.title} className="settings-list__item">
                                <div className="settings-list__main">
                                    <div className="settings-list__icon"><Icon name={iconName} filled={setting.type === 'toggle'} /></div>
                                    <div>
                                        <h3>{setting.title}</h3>
                                        <p>{setting.description}</p>
                                    </div>
                                </div>
                                {setting.type === 'toggle'
                                    ? <button type="button" className={`toggle ${form.data.reminders_enabled ? 'is-on' : ''}`.trim()} onClick={() => form.setData('reminders_enabled', !form.data.reminders_enabled)} />
                                    : <span className="settings-list__arrow"><Icon name="chevron_right" /></span>}
                            </div>
                        );
                    })}
                </article>
            </section>

            <form className="stack-section profile-form" onSubmit={submit}>
                <div className="form-grid editorial-card">
                    <label><span>Name</span><input value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} /></label>
                    <FieldError message={form.errors.name} />
                    <label><span>Current Weight</span><input type="number" step="0.1" value={form.data.current_weight} onChange={(event) => form.setData('current_weight', event.target.value)} /></label>
                    <FieldError message={form.errors.current_weight} />
                    <label><span>Goal Weight</span><input type="number" step="0.1" value={form.data.goal_weight} onChange={(event) => form.setData('goal_weight', event.target.value)} /></label>
                    <FieldError message={form.errors.goal_weight} />
                    <label><span>Daily Calorie Goal</span><input type="number" value={form.data.daily_calorie_goal} onChange={(event) => form.setData('daily_calorie_goal', event.target.value)} /></label>
                    <FieldError message={form.errors.daily_calorie_goal} />
                    <label><span>Protein Goal (g)</span><input type="number" value={form.data.protein_goal_g} onChange={(event) => form.setData('protein_goal_g', event.target.value)} /></label>
                    <FieldError message={form.errors.protein_goal_g} />
                    <label><span>Carb Goal (g)</span><input type="number" value={form.data.carbs_goal_g} onChange={(event) => form.setData('carbs_goal_g', event.target.value)} /></label>
                    <FieldError message={form.errors.carbs_goal_g} />
                    <label><span>Fat Goal (g)</span><input type="number" value={form.data.fat_goal_g} onChange={(event) => form.setData('fat_goal_g', event.target.value)} /></label>
                    <FieldError message={form.errors.fat_goal_g} />
                    <label><span>Hydration Goal (ml)</span><input type="number" value={form.data.hydration_goal_ml} onChange={(event) => form.setData('hydration_goal_ml', event.target.value)} /></label>
                    <FieldError message={form.errors.hydration_goal_ml} />
                </div>
                <button type="submit" className="primary-cta" disabled={form.processing}>{form.processing ? 'Saving Profile...' : 'Save Changes'}</button>
                <button type="button" className="ghost-cta" onClick={() => router.visit('/dashboard')}>Back to Dashboard</button>
            </form>
            </PageTransition>
        </AppShell>
    );
}
