import { useForm } from '@inertiajs/react';
import { useState } from 'react';

function FieldError({ message }) {
    if (!message) return null;
    return <small className="field-error">{message}</small>;
}

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        current_weight: '',
        goal_weight: '',
        daily_calorie_goal: '2000',
        protein_goal_g: '100',
        carbs_goal_g: '200',
        fat_goal_g: '60',
        hydration_goal_ml: '2500',
    });

    const [step, setStep] = useState(1);

    const submit = (e) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <main className="guest-shell">
            <div className="login-card register-card">
                <div className="login-card__brand">
                    <h1 className="brand-wordmark" style={{ fontSize: '28px' }}>ALTA<span>FIT</span></h1>
                    <p>Create your account</p>
                </div>

                <div className="register-steps">
                    <button type="button" className={`register-step ${step === 1 ? 'is-active' : ''}`} onClick={() => setStep(1)}>
                        <span>Account</span>
                    </button>
                    <div className="register-step__divider" />
                    <button type="button" className={`register-step ${step === 2 ? 'is-active' : ''}`} onClick={() => setStep(2)}>
                        <span>Targets</span>
                    </button>
                </div>

                <form onSubmit={submit} className="login-form">

                    {step === 1 && (
                        <div className="register-step-panel">
                            <div className="form-group">
                                <label htmlFor="name">Full Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    className={`form-input ${errors.name ? 'is-invalid' : ''}`}
                                    autoComplete="name"
                                    placeholder="e.g. Elena Marchetti"
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                <FieldError message={errors.name} />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email address</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    className={`form-input ${errors.email ? 'is-invalid' : ''}`}
                                    autoComplete="username"
                                    placeholder="you@example.com"
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                <FieldError message={errors.email} />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    className={`form-input ${errors.password ? 'is-invalid' : ''}`}
                                    autoComplete="new-password"
                                    placeholder="Min. 8 characters"
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                <FieldError message={errors.password} />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password_confirmation">Confirm Password</label>
                                <input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    className="form-input"
                                    autoComplete="new-password"
                                    placeholder="Repeat your password"
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                />
                            </div>

                            <button type="button" className="button button--primary w-full" onClick={() => setStep(2)}>
                                Next: Set Your Targets
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="register-step-panel">
                            <p className="register-step-hint">Set your initial goals — you can adjust these anytime in your profile.</p>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="current_weight">Current Weight (kg)</label>
                                    <input id="current_weight" type="number" step="0.1" value={data.current_weight} className="form-input" placeholder="e.g. 72.5" onChange={(e) => setData('current_weight', e.target.value)} />
                                    <FieldError message={errors.current_weight} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="goal_weight">Goal Weight (kg)</label>
                                    <input id="goal_weight" type="number" step="0.1" value={data.goal_weight} className="form-input" placeholder="e.g. 68.0" onChange={(e) => setData('goal_weight', e.target.value)} />
                                    <FieldError message={errors.goal_weight} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="daily_calorie_goal">Daily Calorie Target (kcal)</label>
                                <input id="daily_calorie_goal" type="number" value={data.daily_calorie_goal} className="form-input" onChange={(e) => setData('daily_calorie_goal', e.target.value)} />
                            </div>

                            <div className="form-row form-row-- thirds">
                                <div className="form-group">
                                    <label htmlFor="protein_goal_g">Protein (g)</label>
                                    <input id="protein_goal_g" type="number" value={data.protein_goal_g} className="form-input" onChange={(e) => setData('protein_goal_g', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="carbs_goal_g">Carbs (g)</label>
                                    <input id="carbs_goal_g" type="number" value={data.carbs_goal_g} className="form-input" onChange={(e) => setData('carbs_goal_g', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="fat_goal_g">Fat (g)</label>
                                    <input id="fat_goal_g" type="number" value={data.fat_goal_g} className="form-input" onChange={(e) => setData('fat_goal_g', e.target.value)} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="hydration_goal_ml">Hydration Goal (ml)</label>
                                <input id="hydration_goal_ml" type="number" value={data.hydration_goal_ml} className="form-input" onChange={(e) => setData('hydration_goal_ml', e.target.value)} />
                            </div>

                            <div className="register-step-actions">
                                <button type="button" className="ghost-cta" onClick={() => setStep(1)}>Back</button>
                                <button type="submit" className="button button--primary" disabled={processing} style={{ flex: 2 }}>
                                    {processing ? 'Creating account...' : 'Create Account'}
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
