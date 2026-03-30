import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
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

    const [prefTab, setPrefTab] = useState('restrictions');
    const [recalcActivity, setRecalcActivity] = useState(profile.form.activity_level || 'light');
    const [recalcGoal, setRecalcGoal] = useState(profile.form.weight_goal || 'maintain');

    // Client-side TDEE preview (same formula as backend)
    const calcPreview = (activity, goal, weight) => {
        const w = parseFloat(weight) || 70;
        const h = parseInt(profile.form.height_cm) || 170;
        const a = parseInt(profile.form.age) || 25;
        const g = profile.form.gender || 'prefer_not';
        const base = (10 * w) + (6.25 * h) - (5 * a) + (g === 'male' ? 5 : g === 'female' ? -161 : -78);
        const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, very_active: 1.725, extra_active: 1.9 };
        const goalAdjust = { lose: -500, maintain: 0, gain: 300 };
        const tdee = base * (multipliers[activity] || 1.375) + (goalAdjust[goal] || 0);
        const protein = Math.round(w * (goal === 'lose' ? 2.0 : goal === 'gain' ? 2.2 : 1.8));
        const fat = Math.round(w * 0.9);
        const carbs = Math.max(0, Math.round((tdee - protein * 4 - fat * 9) / 4));
        return { calories: Math.max(500, Math.round(tdee)), protein, carbs, fat };
    };

    const preview = calcPreview(recalcActivity, recalcGoal, profile.form.current_weight);

    const handleRecalculate = () => {
        router.post('/profile/recalculate', {
            activity_level: recalcActivity,
            weight_goal: recalcGoal,
        }, { preserveScroll: true });
    };

    const toggleRestriction = (value) => {
        const current = form.data.dietary_restrictions || [];
        const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
        form.setData('dietary_restrictions', next);
    };

    const toggleCuisine = (value) => {
        const current = form.data.food_preferences || [];
        const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
        form.setData('food_preferences', next);
    };

    const [newTag, setNewTag] = useState('');
    const [customTags, setCustomTags] = useState(form.data.food_preferences?.filter((t) => !profile.cuisineOptions?.includes(t)) || []);

    const addCustomTag = () => {
        const tag = newTag.trim();
        if (!tag) return;
        const current = form.data.food_preferences || [];
        if (!current.includes(tag)) {
            form.setData('food_preferences', [...current, tag]);
        }
        setCustomTags((prev) => [...prev.filter((t) => t !== tag), tag]);
        setNewTag('');
    };

    const removeCustomTag = (tag) => {
        form.setData('food_preferences', (form.data.food_preferences || []).filter((t) => t !== tag));
        setCustomTags((prev) => prev.filter((t) => t !== tag));
    };

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
                                : setting.title === 'Gender'
                                    ? 'person'
                                    : setting.title === 'Age'
                                        ? 'cake'
                                        : 'straighten';

                        return (
                            <div key={setting.title} className={`settings-list__item ${setting.type === 'info' ? 'settings-list__item--static' : ''}`}>
                                <div className="settings-list__main">
                                    <div className="settings-list__icon"><Icon name={iconName} filled={setting.type === 'toggle'} /></div>
                                    <div>
                                        <h3>{setting.title}</h3>
                                        <p>{setting.description}</p>
                                    </div>
                                </div>
                                {setting.type === 'toggle'
                                    ? <button type="button" className={`toggle ${form.data.reminders_enabled ? 'is-on' : ''}`.trim()} onClick={() => form.setData('reminders_enabled', !form.data.reminders_enabled)} />
                                    : setting.type === 'info' ? null
                                    : <span className="settings-list__arrow"><Icon name="chevron_right" /></span>}
                            </div>
                        );
                    })}
                    <div className="settings-list__item settings-list__item--danger">
                        <div className="settings-list__main">
                            <div className="settings-list__icon"><Icon name="logout" filled /></div>
                            <div>
                                <h3>Logout</h3>
                                <p>Sign out of your account</p>
                            </div>
                        </div>
                        <button type="button" className="settings-list__arrow" onClick={() => router.post('/logout')}>
                            <Icon name="chevron_right" />
                        </button>
                    </div>
                </article>
            </section>

            <form className="stack-section profile-form" onSubmit={submit}>

                <section className="stack-section">
                    <div className="eyebrow">Personal Information</div>
                    <div className="form-grid editorial-card">
                        <label><span>Name</span><input value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} /></label>
                        <FieldError message={form.errors.name} />
                        <label><span>Age (years)</span><input type="number" min="10" max="120" value={form.data.age} onChange={(event) => form.setData('age', event.target.value)} /></label>
                        <FieldError message={form.errors.age} />
                        <label><span>Height (cm)</span><input type="number" min="80" max="300" value={form.data.height_cm} onChange={(event) => form.setData('height_cm', event.target.value)} /></label>
                        <FieldError message={form.errors.height_cm} />
                        <label><span>Gender</span>
                            <select value={form.data.gender} onChange={(event) => form.setData('gender', event.target.value)}>
                                <option value="">Select</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                                <option value="prefer_not">Prefer not to say</option>
                            </select>
                        </label>
                        <FieldError message={form.errors.gender} />
                    </div>
                </section>

                <section className="stack-section">
                    <div className="eyebrow">Body Composition</div>
                    <div className="form-grid editorial-card">
                        <label><span>Current Weight (kg)</span><input type="number" step="0.1" value={form.data.current_weight} onChange={(event) => form.setData('current_weight', event.target.value)} /></label>
                        <FieldError message={form.errors.current_weight} />
                        <label><span>Goal Weight (kg)</span><input type="number" step="0.1" value={form.data.goal_weight} onChange={(event) => form.setData('goal_weight', event.target.value)} /></label>
                        <FieldError message={form.errors.goal_weight} />
                    </div>
                </section>

                {/* Activity & Goal — Auto Calculate */}
                <section className="stack-section">
                    <div className="eyebrow">Activity & Goal</div>
                    <div className="form-grid editorial-card">
                        <label><span>Activity Level</span>
                            <select
                                value={recalcActivity}
                                onChange={(e) => setRecalcActivity(e.target.value)}
                                className="form-input"
                            >
                                {(profile.activityOptions || []).map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label} — {opt.desc}</option>
                                ))}
                            </select>
                        </label>
                        <label><span>Weight Goal</span>
                            <select
                                value={recalcGoal}
                                onChange={(e) => setRecalcGoal(e.target.value)}
                                className="form-input"
                            >
                                {(profile.goalOptions || []).map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label} ({opt.desc})</option>
                                ))}
                            </select>
                        </label>
                    </div>

                    {/* Preview card */}
                    <div className="pref-computed-card">
                        <div className="pref-computed-card__head">
                            <span>TDEE Estimate</span>
                            {!profile.canAutoCalculate && (
                                <small className="pref-computed-card__hint">Fill age, height, gender to preview</small>
                            )}
                        </div>
                        <div className="pref-computed-card__grid">
                            <div><strong>{preview.calories.toLocaleString()}</strong><small> kcal/day</small></div>
                            <div><strong>{preview.protein}g</strong><small> protein</small></div>
                            <div><strong>{preview.carbs}g</strong><small> carbs</small></div>
                            <div><strong>{preview.fat}g</strong><small> fat</small></div>
                        </div>
                        <p className="pref-computed-card__note">
                            Based on Mifflin-St Jeor formula. Fill all personal fields for accurate results.
                        </p>
                    </div>

                    <button type="button" className="primary-cta" onClick={handleRecalculate}>
                        Recalculate Targets
                    </button>
                </section>

                {/* Dietary Preferences */}
                <section className="stack-section">
                    <div className="eyebrow">Dietary Preferences</div>
                    <div className="editorial-card pref-dietary-card">
                        <div className="pref-dietary-tabs">
                            <button type="button" className={`pref-dietary-tab ${prefTab === 'restrictions' ? 'is-active' : ''}`} onClick={() => setPrefTab('restrictions')}>Restrictions</button>
                            <button type="button" className={`pref-dietary-tab ${prefTab === 'cuisines' ? 'is-active' : ''}`} onClick={() => setPrefTab('cuisines')}>Cuisines</button>
                        </div>

                        {prefTab === 'restrictions' && (
                            <div className="pref-checkbox-grid">
                                {(profile.dietaryOptions || []).map((opt) => (
                                    <label key={opt.value} className="pref-checkbox-item">
                                        <input
                                            type="checkbox"
                                            checked={(form.data.dietary_restrictions || []).includes(opt.value)}
                                            onChange={() => toggleRestriction(opt.value)}
                                        />
                                        <span>{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {prefTab === 'cuisines' && (
                            <div className="pref-cuisine-section">
                                <div className="pref-checkbox-grid">
                                    {(profile.cuisineOptions || []).map((cuisine) => (
                                        <label key={cuisine} className="pref-checkbox-item">
                                            <input
                                                type="checkbox"
                                                checked={(form.data.food_preferences || []).includes(cuisine)}
                                                onChange={() => toggleCuisine(cuisine)}
                                            />
                                            <span>{cuisine}</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="pref-tag-input-row">
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Add custom food or cuisine..."
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomTag(); } }}
                                    />
                                    <button type="button" className="pref-tag-add-btn" onClick={addCustomTag}>Add</button>
                                </div>
                                {customTags.length > 0 && (
                                    <div className="pref-tag-list">
                                        {customTags.map((tag) => (
                                            <span key={tag} className="pref-tag">
                                                {tag}
                                                <button type="button" onClick={() => removeCustomTag(tag)}>×</button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                <section className="stack-section">
                    <div className="eyebrow">Nutrition Targets</div>
                    <div className="form-grid editorial-card">
                        <label><span>Daily Calorie Goal (kcal)</span><input type="number" value={form.data.daily_calorie_goal} onChange={(event) => form.setData('daily_calorie_goal', event.target.value)} /></label>
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
                </section>

                <button type="submit" className="primary-cta" disabled={form.processing}>{form.processing ? 'Saving Profile...' : 'Save Changes'}</button>
                <button type="button" className="ghost-cta" onClick={() => router.visit('/dashboard')}>Back to Dashboard</button>
            </form>
            </PageTransition>
        </AppShell>
    );
}
