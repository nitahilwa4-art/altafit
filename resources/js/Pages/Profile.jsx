import { useForm } from '@inertiajs/react';
import AppShell from '../Layouts/AppShell';
import Icon from '../Components/ui/Icon';

export default function Profile({ pageMeta, profile, flash }) {
    const form = useForm(profile.form);

    const submit = (event) => {
        event.preventDefault();
        form.post('/profile', { preserveScroll: true });
    };

    return (
        <AppShell pageMeta={pageMeta} topBarTitle="Profile & Goals">
            {flash?.success ? <div className="flash-banner">{flash.success}</div> : null}

            <section className="profile-header">
                <div className="profile-header__avatar">
                    <div className="avatar avatar--lg">A</div>
                    <button type="button" className="profile-header__edit"><Icon name="edit" /></button>
                </div>
                <h1>{profile.name}</h1>
                <p>{profile.weight} · Goal: {profile.goalWeight}</p>
            </section>

            <section className="profile-stats">
                <article className="editorial-card compact-stat"><span><Icon name="local_fire_department" /> Daily Target</span><strong>{profile.dailyTarget}</strong></article>
                <article className="editorial-card compact-stat"><span><Icon name="water_drop" /> Hydration</span><strong>{profile.hydrationTarget}</strong></article>
            </section>

            <section className="stack-section">
                <div className="eyebrow">System Settings</div>
                <article className="settings-list editorial-card">
                    {profile.settings.map((setting) => (
                        <div key={setting.title} className="settings-list__item">
                            <div>
                                <h3>{setting.title}</h3>
                                <p>{setting.description}</p>
                            </div>
                            {setting.type === 'toggle' ? <button type="button" className={`toggle ${form.data.reminders_enabled ? 'is-on' : ''}`.trim()} onClick={() => form.setData('reminders_enabled', !form.data.reminders_enabled)} /> : <span className="settings-list__arrow">›</span>}
                        </div>
                    ))}
                </article>
            </section>

            <form className="stack-section profile-form" onSubmit={submit}>
                <div className="form-grid editorial-card">
                    <label><span>Name</span><input value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} /></label>
                    <label><span>Current Weight</span><input type="number" step="0.1" value={form.data.current_weight} onChange={(event) => form.setData('current_weight', event.target.value)} /></label>
                    <label><span>Goal Weight</span><input type="number" step="0.1" value={form.data.goal_weight} onChange={(event) => form.setData('goal_weight', event.target.value)} /></label>
                    <label><span>Daily Calorie Goal</span><input type="number" value={form.data.daily_calorie_goal} onChange={(event) => form.setData('daily_calorie_goal', event.target.value)} /></label>
                    <label><span>Hydration Goal (ml)</span><input type="number" value={form.data.hydration_goal_ml} onChange={(event) => form.setData('hydration_goal_ml', event.target.value)} /></label>
                </div>
                <button type="submit" className="primary-cta" disabled={form.processing}>Save Changes</button>
                <button type="button" className="ghost-cta">Log Out</button>
            </form>
        </AppShell>
    );
}
