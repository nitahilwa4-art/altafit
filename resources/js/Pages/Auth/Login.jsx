import { useForm, Head } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: 'elena@altafit.local',
        password: 'password',
        remember: true,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <main className="guest-shell">
            <Head title="Log in" />

            <div className="login-card">
                <div className="login-card__brand">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22L4 12... (this is just for aesthetics, imagine Altafit logo here)"/>
                        {/* We use the simple typography brand of Altafit */}
                    </svg>
                    <h1 className="brand-wordmark" style={{ fontSize: '32px' }}>ALTA<span>FIT</span></h1>
                    <p>Nutrition & Habit Tracker</p>
                </div>

                <form onSubmit={submit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Email address</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className={`form-input ${errors.email ? 'is-invalid' : ''}`}
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        {errors.email && <span className="form-error">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="form-input"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                    </div>

                    <div className="form-group row">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                            />
                            <span>Keep me logged in</span>
                        </label>
                    </div>

                    <button className="button button--primary w-full" disabled={processing}>
                        Log in
                    </button>

                    <p className="login-footer">
                        Mock Credentials: <br/> <strong>elena@altafit.local / password</strong>
                    </p>
                </form>

                <p className="login-footer">
                    Don't have an account?{' '}
                    <a href="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>Create one</a>
                </p>
            </div>
        </main>
    );
}
