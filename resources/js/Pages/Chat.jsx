import { router, useForm } from '@inertiajs/react';
import AppShell from '../Layouts/AppShell';
import Icon from '../Components/ui/Icon';

export default function Chat({ pageMeta, chat, flash }) {
    const form = useForm({ message: chat.draft ?? '' });

    const submit = (event) => {
        event.preventDefault();
        form.post('/chat/log', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    return (
        <AppShell pageMeta={pageMeta} topBarTitle="2,400 kcal" chatMode>
            <div className="chat-page">
                {flash?.success ? <div className="flash-banner">{flash.success}</div> : null}
                <div className="chat-timestamp">{chat.timestamp}</div>

                {chat.messages.map((message) => (
                    <div key={message.id} className={`message-row message-row--${message.role}`}>
                        <div className={`message-bubble message-bubble--${message.role}`}>
                            {message.content}
                        </div>
                    </div>
                ))}

                <section className="analysis-card">
                    <div className="analysis-card__title"><Icon name="check_circle" /> {chat.analysis.title}</div>
                    <div className="analysis-grid">
                        <article><span>Protein</span><strong>{chat.analysis.protein}g</strong></article>
                        <article><span>Carbs</span><strong>{chat.analysis.carbs}g</strong></article>
                    </div>
                    <div className="analysis-meta">
                        <span>Fats: {chat.analysis.fat}g</span>
                        <span>Fiber: {chat.analysis.fiber}g</span>
                        {chat.analysis.confidence ? <span>Confidence: {Math.round(chat.analysis.confidence * 100)}%</span> : null}
                    </div>
                    <div className="analysis-footer">
                        <p>{chat.analysis.note}</p>
                        <strong>{chat.analysis.calories} kcal</strong>
                    </div>
                </section>

                <div className="chip-row">
                    {chat.chips.map((chip) => <button key={chip} className="chip" type="button">{chip}</button>)}
                </div>

                {chat.recentMeals?.length ? (
                    <section className="recent-meals-card editorial-card">
                        <div className="recent-meals-card__header">
                            <h3>Recent Logs</h3>
                            <span>{chat.recentMeals.length} items</span>
                        </div>
                        <div className="recent-meals-list">
                            {chat.recentMeals.map((meal) => (
                                <article key={meal.id} className="recent-meals-list__item">
                                    <div>
                                        <strong>{meal.description}</strong>
                                        <p>Saved at {meal.time}</p>
                                    </div>
                                    <div className="recent-meals-list__actions">
                                        <span>{meal.calories} kcal</span>
                                        <button type="button" className="text-button text-button--danger" onClick={() => router.delete(`/chat/log/${meal.id}`, { preserveScroll: true })}>Delete</button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                ) : null}

                <div className="message-row message-row--user">
                    <div className="photo-card">
                        <div className="photo-card__mock" />
                        <p>{chat.photoPrompt}</p>
                    </div>
                </div>
            </div>

            <div className="chat-composer-wrap">
                <form className="chat-composer" onSubmit={submit}>
                    <button type="button" className="composer-icon"><Icon name="add_circle" /></button>
                    <input type="text" placeholder="Tell me what you ate..." value={form.data.message} onChange={(event) => form.setData('message', event.target.value)} />
                    <button type="button" className="composer-icon"><Icon name="photo_camera" /></button>
                    <button type="submit" className="composer-send" disabled={form.processing || !form.data.message.trim()}><Icon name="arrow_upward" /></button>
                </form>
            </div>
        </AppShell>
    );
}
