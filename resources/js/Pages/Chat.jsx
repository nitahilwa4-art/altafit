import { router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AppShell from '../Layouts/AppShell';
import Icon from '../Components/ui/Icon';

export default function Chat({ pageMeta, chat, flash }) {
    const form = useForm({ message: chat.draft ?? '' });
    const [selectedMealId, setSelectedMealId] = useState(chat.editingMeal ?? chat.recentMeals?.[0]?.id ?? null);
    const editingMeal = chat.recentMeals?.find((meal) => meal.id === selectedMealId) ?? null;
    const editForm = useForm({
        description: editingMeal?.description ?? '',
        calories: editingMeal?.calories ?? 0,
        protein_g: editingMeal?.protein ?? 0,
        carbs_g: editingMeal?.carbs ?? 0,
        fat_g: editingMeal?.fat ?? 0,
        fiber_g: editingMeal?.fiber ?? 0,
    });

    useEffect(() => {
        if (!editingMeal) return;
        editForm.setData({
            description: editingMeal.description,
            calories: editingMeal.calories,
            protein_g: editingMeal.protein,
            carbs_g: editingMeal.carbs,
            fat_g: editingMeal.fat,
            fiber_g: editingMeal.fiber,
        });
    }, [selectedMealId]);

    const submit = (event) => {
        event.preventDefault();
        form.post('/chat/log', { preserveScroll: true, onSuccess: () => form.reset() });
    };

    const submitEdit = (event) => {
        event.preventDefault();
        if (!editingMeal) return;
        editForm.patch(`/chat/log/${editingMeal.id}`, { preserveScroll: true });
    };

    return (
        <AppShell pageMeta={pageMeta} topBarTitle="2,400 kcal" chatMode>
            <div className="chat-stitch">
                {flash?.success ? <div className="flash-banner">{flash.success}</div> : null}

                <div className="chat-stitch__timestamp">{chat.timestamp}</div>

                <div className="chat-stitch__row chat-stitch__row--assistant">
                    <div className="chat-stitch__bubble chat-stitch__bubble--assistant">
                        <p>{chat.messages?.[0]?.content ?? "Hello! I'm your Altafit AI. Ready to log your lunch?"}</p>
                    </div>
                </div>

                <div className="chat-stitch__row chat-stitch__row--user">
                    <div className="chat-stitch__bubble chat-stitch__bubble--user">
                        <p>{chat.messages?.[1]?.content ?? 'Logging 2 tacos and a side of guacamole.'}</p>
                    </div>
                </div>

                <div className="chat-stitch__row chat-stitch__row--assistant chat-stitch__row--wide">
                    <section className="chat-stitch__analysis">
                        <div className="chat-stitch__analysis-title"><Icon name="check_circle" /> <span>{chat.analysis.title}</span></div>
                        <div className="chat-stitch__analysis-grid">
                            <article>
                                <span>Protein</span>
                                <div><strong>{chat.analysis.protein}</strong><small>g</small></div>
                            </article>
                            <article>
                                <span>Carbs</span>
                                <div><strong>{chat.analysis.carbs}</strong><small>g</small></div>
                            </article>
                        </div>
                        <div className="chat-stitch__analysis-meta">
                            <div><i className="dot dot--secondary" /> <span>Fats: {chat.analysis.fat}g</span></div>
                            <div><i className="dot dot--tertiary" /> <span>Fiber: {chat.analysis.fiber}g</span></div>
                        </div>
                        <div className="chat-stitch__analysis-footer">
                            <p>{chat.analysis.note}</p>
                            <strong>{chat.analysis.calories} kcal</strong>
                        </div>
                    </section>
                </div>

                <div className="chat-stitch__chips">
                    {chat.chips.map((chip, index) => (
                        <button key={chip} className={`chat-stitch__chip ${index === 0 ? 'is-primary' : ''}`.trim()} type="button">{chip}</button>
                    ))}
                </div>

                <div className="chat-stitch__row chat-stitch__row--user">
                    <div className="chat-stitch__photo-card">
                        <div className="chat-stitch__photo-mock" />
                        <p>{chat.photoPrompt}</p>
                    </div>
                </div>

                {chat.recentMeals?.length ? (
                    <section className="recent-meals-card editorial-card">
                        <div className="recent-meals-card__header">
                            <h3>Recent Logs</h3>
                            <span>{chat.recentMeals.length} items</span>
                        </div>
                        <div className="recent-meals-list">
                            {chat.recentMeals.map((meal) => (
                                <article key={meal.id} className={`recent-meals-list__item ${selectedMealId === meal.id ? 'is-selected' : ''}`}>
                                    <div>
                                        <strong>{meal.description}</strong>
                                        <p>Saved at {meal.time}</p>
                                    </div>
                                    <div className="recent-meals-list__actions">
                                        <span>{meal.calories} kcal</span>
                                        <div className="recent-meals-list__buttons">
                                            <button type="button" className="text-button" onClick={() => setSelectedMealId(meal.id)}>Select</button>
                                            <button type="button" className="text-button text-button--danger" onClick={() => router.delete(`/chat/log/${meal.id}`, { preserveScroll: true })}>Delete</button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                ) : null}

                {editingMeal ? (
                    <form className="editorial-card meal-edit-card" onSubmit={submitEdit}>
                        <div className="recent-meals-card__header">
                            <h3>Edit Meal</h3>
                            <span>ID {editingMeal.id}</span>
                        </div>
                        <div className="form-grid">
                            <label><span>Description</span><input value={editForm.data.description} onChange={(event) => editForm.setData('description', event.target.value)} /></label>
                            <label><span>Calories</span><input type="number" value={editForm.data.calories} onChange={(event) => editForm.setData('calories', event.target.value)} /></label>
                            <label><span>Protein</span><input type="number" value={editForm.data.protein_g} onChange={(event) => editForm.setData('protein_g', event.target.value)} /></label>
                            <label><span>Carbs</span><input type="number" value={editForm.data.carbs_g} onChange={(event) => editForm.setData('carbs_g', event.target.value)} /></label>
                            <label><span>Fat</span><input type="number" value={editForm.data.fat_g} onChange={(event) => editForm.setData('fat_g', event.target.value)} /></label>
                            <label><span>Fiber</span><input type="number" value={editForm.data.fiber_g} onChange={(event) => editForm.setData('fiber_g', event.target.value)} /></label>
                        </div>
                        <button type="submit" className="primary-cta">Save Meal Changes</button>
                    </form>
                ) : null}
            </div>

            <div className="chat-stitch__composer-wrap">
                <form className="chat-stitch__composer" onSubmit={submit}>
                    <button type="button" className="chat-stitch__composer-icon"><Icon name="add_circle" /></button>
                    <input type="text" placeholder="Tell me what you ate..." value={form.data.message} onChange={(event) => form.setData('message', event.target.value)} />
                    <div className="chat-stitch__composer-actions">
                        <button type="button" className="chat-stitch__composer-icon"><Icon name="photo_camera" /></button>
                        <button type="submit" className="chat-stitch__composer-send" disabled={form.processing || !form.data.message.trim()}><Icon name="arrow_upward" /></button>
                    </div>
                </form>
            </div>
        </AppShell>
    );
}
