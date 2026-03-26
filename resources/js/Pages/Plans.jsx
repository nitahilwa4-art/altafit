import AppShell from '../Layouts/AppShell';
import Icon from '../Components/ui/Icon';

export default function Plans({ pageMeta, plan }) {
    return (
        <AppShell pageMeta={pageMeta} brandMode>
            <div className="plans-stitch">
                <section className="plans-stitch__section">
                    <h2 className="plans-stitch__eyebrow">Active Plan</h2>
                    <article className="plans-stitch__hero">
                        <div className="plans-stitch__hero-top">
                            <div>
                                <h3>{plan.title}</h3>
                                <p>{plan.subtitle}</p>
                            </div>
                            <div className="plans-stitch__hero-side">
                                <strong>{plan.remaining}</strong>
                                <span>to go</span>
                            </div>
                        </div>
                        <div className="plans-stitch__progress-block">
                            <div className="plans-stitch__progress-meta"><span>Progress</span><span>{plan.progress}%</span></div>
                            <div className="plans-stitch__progress-track"><div style={{ width: `${plan.progress}%` }} /></div>
                        </div>
                    </article>
                </section>

                <section className="plans-stitch__section">
                    <article className="plans-stitch__tip-card">
                        <div className="plans-stitch__tip-icon"><Icon name="lightbulb" /></div>
                        <div>
                            <h4>AI Tip of the Day</h4>
                            <p>{plan.tip}</p>
                        </div>
                    </article>
                </section>

                <section className="plans-stitch__section">
                    <div className="plans-stitch__section-head">
                        <h2 className="plans-stitch__eyebrow">Recommended Meals</h2>
                        <button type="button">View All</button>
                    </div>
                    <div className="plans-stitch__carousel">
                        {plan.meals.map((meal) => (
                            <article key={meal.name} className="plans-stitch__meal-card">
                                <div className="plans-stitch__meal-image" />
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
                </section>

                <section className="plans-stitch__section">
                    <h2 className="plans-stitch__eyebrow">Weekly Milestones</h2>
                    <article className="plans-stitch__milestones">
                        {plan.milestones.map((item) => (
                            <div key={item.day} className="plans-stitch__milestone-item">
                                <span>{item.day}</span>
                                <div className={`plans-stitch__milestone-dot ${item.done ? 'is-done' : ''}`.trim()}>
                                    <Icon name={item.done ? 'check' : 'radio_button_unchecked'} />
                                </div>
                            </div>
                        ))}
                    </article>
                </section>
            </div>
        </AppShell>
    );
}
