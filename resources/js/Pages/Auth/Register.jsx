import { useForm } from '@inertiajs/react';
import { useState } from 'react';

function FieldError({ message }) {
    if (!message) return null;
    return <small className="field-error">{message}</small>;
}

export default function Register({ activityOptions = [], goalOptions = [], dietaryOptions = [], cuisineOptions = [] }) {
    const [step, setStep] = useState(1);
    const [prefTab, setPrefTab] = useState('restrictions');

    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        age: '',
        height_cm: '',
        gender: '',
        activity_level: 'light',
        weight_goal: 'maintain',
        current_weight: '',
        goal_weight: '',
        hydration_goal_ml: '2500',
        dietary_restrictions: [],
        food_preferences: [],
    });

    const [newFoodTag, setNewFoodTag] = useState('');
    const [customTags, setCustomTags] = useState([]);

    const canCalc = form.data.age && form.data.height_cm && form.data.gender && form.data.current_weight;

    const previewCalc = () => {
        const w = parseFloat(form.data.current_weight) || 70;
        const h = parseInt(form.data.height_cm) || 170;
        const a = parseInt(form.data.age) || 25;
        const g = form.data.gender || 'prefer_not';
        const base = (10 * w) + (6.25 * h) - (5 * a) + (g === 'male' ? 5 : g === 'female' ? -161 : -78);
        const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, very_active: 1.725, extra_active: 1.9 };
        const goalAdjust = { lose: -500, maintain: 0, gain: 300 };
        const tdee = base * (multipliers[form.data.activity_level] || 1.375) + (goalAdjust[form.data.weight_goal] || 0);
        const protein = Math.round(w * (form.data.weight_goal === 'lose' ? 2.0 : form.data.weight_goal === 'gain' ? 2.2 : 1.8));
        const fat = Math.round(w * 0.9);
        const carbs = Math.max(0, Math.round((tdee - protein * 4 - fat * 9) / 4));
        return { calories: Math.max(500, Math.round(tdee)), protein, carbs, fat };
    };

    const preview = canCalc ? previewCalc() : null;

    const toggleRestriction = (val) => {
        const cur = form.data.dietary_restrictions || [];
        form.setData('dietary_restrictions', cur.includes(val) ? cur.filter((v) => v !== val) : [...cur, val]);
    };

    const toggleCuisine = (val) => {
        const cur = form.data.food_preferences || [];
        form.setData('food_preferences', cur.includes(val) ? cur.filter((v) => v !== val) : [...cur, val]);
    };

    const addTag = () => {
        const tag = newFoodTag.trim();
        if (!tag || (form.data.food_preferences || []).includes(tag)) { setNewFoodTag(''); return; }
        form.setData('food_preferences', [...(form.data.food_preferences || []), tag]);
        setCustomTags((p) => [...p.filter((t) => t !== tag), tag]);
        setNewFoodTag('');
    };

    const removeTag = (tag) => {
        form.setData('food_preferences', (form.data.food_preferences || []).filter((t) => t !== tag));
        setCustomTags((p) => p.filter((t) => t !== tag));
    };

    const submit = (event) => {
        event.preventDefault();
        form.post('/register');
    };

    return (
        <main className="guest-shell">
            <div className="login-card register-card">
                <div className="login-card__brand">
                    <h1 className="brand-wordmark" style={{ fontSize: '28px' }}>ALTA<span>FIT</span></h1>
                    <p>Create your account</p>
                </div>

                <div className="register-steps">
                    <button type="button" className={`register-step ${step === 1 ? 'is-active' : ''}`} onClick={() => setStep(1)}><span>Account</span></button>
                    <div className="register-step__divider" />
                    <button type="button" className={`register-step ${step === 2 ? 'is-active' : ''}`} onClick={() => setStep(2)}><span>Personal</span></button>
                    <div className="register-step__divider" />
                    <button type="button" className={`register-step ${step === 3 ? 'is-active' : ''}`} onClick={() => setStep(3)}><span>Targets</span></button>
                </div>

                <form onSubmit={submit} className="login-form">

                    {step === 1 && (
                        <div className="register-step-panel">
                            <div className="form-group">
                                <label htmlFor="name">Full Name</label>
                                <input id="name" type="text" className={`form-input ${form.errors?.name ? 'is-invalid' : ''}`} autoComplete="name" placeholder="e.g. Elena Marchetti" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                                <FieldError message={form.errors.name} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email address</label>
                                <input id="email" type="email" className={`form-input ${form.errors?.email ? 'is-invalid' : ''}`} autoComplete="username" placeholder="you@example.com" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />
                                <FieldError message={form.errors.email} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input id="password" type="password" className={`form-input ${form.errors?.password ? 'is-invalid' : ''}`} autoComplete="new-password" placeholder="Min. 8 characters" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} />
                                <FieldError message={form.errors.password} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password_confirmation">Confirm Password</label>
                                <input id="password_confirmation" type="password" className="form-input" autoComplete="new-password" placeholder="Repeat your password" value={form.data.password_confirmation} onChange={(e) => form.setData('password_confirmation', e.target.value)} />
                            </div>
                            <button type="button" className="button button--primary w-full" onClick={() => setStep(2)}>Next: Personal Info</button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="register-step-panel">
                            <p className="register-step-hint">Your personal data helps AI tailor nutrition recommendations.</p>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="age">Age (years)</label>
                                    <input id="age" type="number" min="10" max="120" className="form-input" placeholder="e.g. 28" value={form.data.age} onChange={(e) => form.setData('age', e.target.value)} />
                                    <FieldError message={form.errors.age} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="height_cm">Height (cm)</label>
                                    <input id="height_cm" type="number" min="80" max="300" className="form-input" placeholder="e.g. 170" value={form.data.height_cm} onChange={(e) => form.setData('height_cm', e.target.value)} />
                                    <FieldError message={form.errors.height_cm} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="gender">Gender</label>
                                <select id="gender" className="form-input" value={form.data.gender} onChange={(e) => form.setData('gender', e.target.value)}>
                                    <option value="">Select (optional)</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                    <option value="prefer_not">Prefer not to say</option>
                                </select>
                                <FieldError message={form.errors.gender} />
                            </div>
                            <div className="register-step-actions">
                                <button type="button" className="ghost-cta" onClick={() => setStep(1)}>Back</button>
                                <button type="button" className="button button--primary" style={{ flex: 2 }} onClick={() => setStep(3)}>Next: Set Targets</button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="register-step-panel">
                            <p className="register-step-hint">Set your activity level and goal — targets are auto-calculated.</p>

                            <div className="form-group">
                                <label htmlFor="activity_level">Activity Level</label>
                                <select id="activity_level" className="form-input" value={form.data.activity_level} onChange={(e) => form.setData('activity_level', e.target.value)}>
                                    {activityOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label} — {opt.desc}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="weight_goal">Weight Goal</label>
                                <select id="weight_goal" className="form-input" value={form.data.weight_goal} onChange={(e) => form.setData('weight_goal', e.target.value)}>
                                    {goalOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label} ({opt.desc})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="current_weight">Current Weight (kg)</label>
                                    <input id="current_weight" type="number" step="0.1" className="form-input" placeholder="e.g. 72.5" value={form.data.current_weight} onChange={(e) => form.setData('current_weight', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="goal_weight">Goal Weight (kg)</label>
                                    <input id="goal_weight" type="number" step="0.1" className="form-input" placeholder="e.g. 68.0" value={form.data.goal_weight} onChange={(e) => form.setData('goal_weight', e.target.value)} />
                                </div>
                            </div>

                            {preview && (
                                <div className="pref-computed-card">
                                    <div className="pref-computed-card__head"><span>Calculated Estimate</span></div>
                                    <div className="pref-computed-card__grid">
                                        <div><strong>{preview.calories.toLocaleString()}</strong><small> kcal/day</small></div>
                                        <div><strong>{preview.protein}g</strong><small> protein</small></div>
                                        <div><strong>{preview.carbs}g</strong><small> carbs</small></div>
                                        <div><strong>{preview.fat}g</strong><small> fat</small></div>
                                    </div>
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="hydration_goal_ml">Hydration Goal (ml)</label>
                                <input id="hydration_goal_ml" type="number" className="form-input" value={form.data.hydration_goal_ml} onChange={(e) => form.setData('hydration_goal_ml', e.target.value)} />
                            </div>

                            {/* Dietary Restrictions */}
                            <div className="pref-dietary-section">
                                <div className="pref-dietary-tabs">
                                    <button type="button" className={`pref-dietary-tab ${prefTab === 'restrictions' ? 'is-active' : ''}`} onClick={() => setPrefTab('restrictions')}>Restrictions</button>
                                    <button type="button" className={`pref-dietary-tab ${prefTab === 'cuisines' ? 'is-active' : ''}`} onClick={() => setPrefTab('cuisines')}>Cuisines</button>
                                </div>
                                {prefTab === 'restrictions' && (
                                    <div className="pref-checkbox-grid">
                                        {dietaryOptions.map((opt) => (
                                            <label key={opt.value} className="pref-checkbox-item">
                                                <input type="checkbox" checked={(form.data.dietary_restrictions || []).includes(opt.value)} onChange={() => toggleRestriction(opt.value)} />
                                                <span>{opt.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                                {prefTab === 'cuisines' && (
                                    <div className="pref-cuisine-section">
                                        <div className="pref-checkbox-grid">
                                            {cuisineOptions.map((c) => (
                                                <label key={c} className="pref-checkbox-item">
                                                    <input type="checkbox" checked={(form.data.food_preferences || []).includes(c)} onChange={() => toggleCuisine(c)} />
                                                    <span>{c}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <div className="pref-tag-input-row">
                                            <input type="text" className="form-input" placeholder="Add custom cuisine or food..." value={newFoodTag} onChange={(e) => setNewFoodTag(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); }}} />
                                            <button type="button" className="pref-tag-add-btn" onClick={addTag}>Add</button>
                                        </div>
                                        {customTags.length > 0 && (
                                            <div className="pref-tag-list">
                                                {customTags.map((tag) => (
                                                    <span key={tag} className="pref-tag">{tag}<button type="button" onClick={() => removeTag(tag)}>×</button></span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="register-step-actions">
                                <button type="button" className="ghost-cta" onClick={() => setStep(2)}>Back</button>
                                <button type="submit" className="button button--primary" style={{ flex: 2 }} disabled={form.processing}>
                                    {form.processing ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </div>
                        </div>
                    )}
                </form>

                <p className="login-footer">
                    Already have an account?{' '}
                    <a href="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>Sign in</a>
                </p>
            </div>
        </main>
    );
}
