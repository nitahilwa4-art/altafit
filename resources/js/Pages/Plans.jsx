import AppShell from '../Layouts/AppShell';
import Icon from '../Components/ui/Icon';
import SectionHeading from '../Components/ui/SectionHeading';

export default function Plans({ pageMeta, plan }) {
    return (
        <AppShell pageMeta={pageMeta} topBarTitle="Plans">
            <section className="stack-section plans-intro">
                <div className="eyebrow">Active Plan</div>
                <article className="editorial-card plan-hero plan-hero--editorial">
                    <div>
                        <h1>{plan.title}</h1>
                        <p>{plan.subtitle}</p>
                    </div>
                    <div className="plan-hero__side">
                        <strong>{plan.remaining}</strong>
                        <span>to go</span>
                    </div>
                    <div className="plan-progress">
                        <div className="plan-progress__meta"><span>Progress</span><span>{plan.progress}%</span></div>
                        <div className="plan-progress__track"><div style={{ width: `${plan.progress}%` }} /></div>
                    </div>
                </article>
            </section>

            <section className="tip-card tip-card--editorial">
                <div className="tip-card__icon"><Icon name="lightbulb" /></div>
                <div>
                    <h3>AI Tip of the Day</h3>
                    <p>{plan.tip}</p>
                </div>
            </section>

            <section className="stack-section">
                <SectionHeading title="Recommended Meals" action="View All" />
                <div className="meal-carousel">
                    {plan.meals.map((meal) => (
                        <article key={meal.name} className="meal-card meal-card--editorial">
                            <div className="meal-card__mock" />
                            <div className="meal-card__body">
                                <h3>{meal.name}</h3>
                                <div className="meal-card__stats">
                                    <div><span>Cals</span><strong>{meal.calories}</strong></div>
                                    <div><span>Protein</span><strong>{meal.protein}</strong></div>
                                    <div><span>Extra</span><strong>{meal.extra}</strong></div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section className="stack-section">
                <div className="eyebrow">Weekly Milestones</div>
                <article className="editorial-card milestone-row milestone-row--editorial">
                    {plan.milestones.map((item) => (
                        <div key={item.day} className="milestone-row__item">
                            <span>{item.day}</span>
                            <div className={`milestone-dot ${item.done ? 'is-done' : ''}`.trim()}>{item.done ? <Icon name="check" /> : null}</div>
                        </div>
                    ))}
                </article>
            </section>
        </AppShell>
    );
}
