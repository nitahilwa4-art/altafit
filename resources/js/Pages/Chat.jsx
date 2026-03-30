import { router, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import AppShell from '../Layouts/AppShell';
import ConfirmDialog from '../Components/ui/ConfirmDialog';
import FlashBanner from '../Components/ui/FlashBanner';
import Icon from '../Components/ui/Icon';
import PageTransition from '../Components/ui/PageTransition';

function FieldError({ message }) {
    if (!message) return null;
    return <small className="field-error">{message}</small>;
}

export default function Chat({ pageMeta, chat, flash }) {
    const form = useForm({ message: chat.draft ?? '', meal_type: chat.mealTypes?.[1] ?? 'Lunch', notes: '' });
    const [selectedMealId, setSelectedMealId] = useState(chat.editingMeal ?? chat.recentMeals?.[0]?.id ?? null);
    const editingMeal = chat.recentMeals?.find((meal) => meal.id === selectedMealId) ?? null;
    const editForm = useForm({
        description: editingMeal?.description ?? '',
        meal_type: editingMeal?.meal_type ?? 'Meal',
        notes: editingMeal?.notes ?? '',
        calories: editingMeal?.calories ?? 0,
        protein_g: editingMeal?.protein ?? 0,
        carbs_g: editingMeal?.carbs ?? 0,
        fat_g: editingMeal?.fat ?? 0,
        fiber_g: editingMeal?.fiber ?? 0,
    });

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('');
    const [photoDialog, setPhotoDialog] = useState(null); // { name, preview, type }
    const fileInputRef = useRef(null);

    const filteredMeals = useMemo(() => {
        let meals = chat.recentMeals ?? [];
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            meals = meals.filter((m) => m.description.toLowerCase().includes(q) || (m.notes && m.notes.toLowerCase().includes(q)));
        }
        if (filterType) {
            meals = meals.filter((m) => m.meal_type === filterType);
        }
        return meals;
    }, [chat.recentMeals, searchQuery, filterType]);

    useEffect(() => {
        if (!editingMeal) return;
        editForm.clearErrors();
        editForm.setData({
            description: editingMeal.description,
            meal_type: editingMeal.meal_type,
            notes: editingMeal.notes ?? '',
            calories: editingMeal.calories,
            protein_g: editingMeal.protein,
            carbs_g: editingMeal.carbs,
            fat_g: editingMeal.fat,
            fiber_g: editingMeal.fiber,
        });
    }, [selectedMealId]);

    const submit = (event) => {
        event.preventDefault();
        form.post('/chat/log', { preserveScroll: true, onSuccess: () => form.reset('message', 'notes') });
    };

    const submitEdit = (event) => {
        event.preventDefault();
        if (!editingMeal) return;
        editForm.patch(`/chat/log/${editingMeal.id}`, { preserveScroll: true });
    };

    const confirmDelete = () => {
        if (deleteTarget) {
            router.delete(`/chat/log/${deleteTarget.id}`, { preserveScroll: true });
            setDeleteTarget(null);
        }
    };

    const handlePhotoButton = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const isImage = file.type.startsWith('image/');
        const preview = isImage ? URL.createObjectURL(file) : null;
        setPhotoDialog({
            name: file.name,
            preview,
            type: isImage ? 'image' : 'file',
            size: (file.size / 1024).toFixed(1) + ' KB',
        });
        event.target.value = '';
    };

    const confirmPhoto = () => {
        if (photoDialog) {
            form.setData('message', `Photo: ${photoDialog.name} — OCR analysis pending backend integration.`);
            setPhotoDialog(null);
        }
    };

    return (
        <AppShell pageMeta={pageMeta} topBarTitle={`${pageMeta.calorieTarget?.toLocaleString?.() ?? pageMeta.calorieTarget} kcal target`} chatMode>
            <FlashBanner message={flash?.success} />
            <PageTransition>
            <div className="chat-stitch">

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
                        <div className="chat-stitch__analysis-title"><Icon name="check_circle" filled /> <span>{chat.analysis.title}</span><span className={`confidence-badge confidence-badge--${chat.analysis.confidenceLevel ?? 'medium'}`}>{chat.analysis.confidenceLabel ?? 'Medium confidence'}</span></div>
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
                        <button
                            key={chip}
                            className={`chat-stitch__chip ${index === 0 ? 'is-primary' : ''}`.trim()}
                            type="button"
                            onClick={() => {
                                if (chip === 'Add to Daily Log' && chat.messages?.[1]?.content) {
                                    form.setData('message', chat.messages[1].content);
                                }
                                if (chip === 'Adjust Quantities' && editingMeal) {
                                    setSelectedMealId(editingMeal.id);
                                }
                                if (chip === 'View Recipes') {
                                    form.setData('message', 'Give me recipe ideas similar to this meal');
                                    form.setData('notes', 'Need recipe ideas for this meal');
                                }
                            }}
                        >
                            {chip}
                        </button>
                    ))}
                </div>

                <div className="chat-stitch__row chat-stitch__row--user">
                    <div className="chat-stitch__photo-card">
                        <div className="chat-stitch__photo-mock">
                            <div className="chat-stitch__photo-plate">
                                <span className="chat-stitch__photo-leaf chat-stitch__photo-leaf--one" />
                                <span className="chat-stitch__photo-leaf chat-stitch__photo-leaf--two" />
                                <span className="chat-stitch__photo-topping chat-stitch__photo-topping--one" />
                                <span className="chat-stitch__photo-topping chat-stitch__photo-topping--two" />
                                <span className="chat-stitch__photo-topping chat-stitch__photo-topping--three" />
                            </div>
                        </div>
                        <p>{chat.photoPrompt}</p>
                    </div>
                </div>

                <section className="recent-meals-card editorial-card">
                    <div className="recent-meals-card__header">
                        <h3>Recent Logs</h3>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span>{chat.recentMeals?.length ?? 0} items</span>
                            <button type="button" className="chat-export-btn" title="Export CSV" onClick={() => window.location.href = '/chat/export'}>
                                <Icon name="download" />
                            </button>
                        </div>
                    </div>
                    <div className="recent-meals-card__filters">
                        <input
                            type="text"
                            placeholder="Search meals..."
                            className="recent-meals-card__search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <select
                            className="recent-meals-card__filter-select"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="">All Types</option>
                            {chat.mealTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                    {filteredMeals.length ? (
                        <div className="recent-meals-list">
                            {filteredMeals.map((meal) => (
                                <article key={meal.id} className={`recent-meals-list__item ${selectedMealId === meal.id ? 'is-selected' : ''}`}>
                                    <div className="recent-meals-list__copy">
                                        <strong>{meal.description}</strong>
                                        <p>{meal.meal_type} · {meal.time}</p>
                                        {meal.notes ? <p className="recent-meals-list__notes">{meal.notes}</p> : null}
                                    </div>
                                    <div className="recent-meals-list__actions">
                                        <span className="recent-meals-list__calories">{meal.calories} kcal</span>
                                        <div className="recent-meals-list__buttons">
                                            <button type="button" className="text-button" onClick={() => setSelectedMealId(meal.id)}>Select</button>
                                            <button type="button" className="text-button text-button--danger" onClick={() => setDeleteTarget(meal)}>Delete</button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state-card">
                            <strong>{searchQuery || filterType ? 'No matching meals' : 'No meal logs yet'}</strong>
                            <p>{searchQuery || filterType ? 'Try adjusting your search or filter.' : 'Start by typing what you ate in the composer below. Altafit will estimate the nutrition for you.'}</p>
                        </div>
                    )}
                </section>

                {editingMeal ? (
                    <form className="editorial-card meal-edit-card" onSubmit={submitEdit}>
                        <div className="recent-meals-card__header">
                            <h3>Edit Meal</h3>
                            <span>ID {editingMeal.id}</span>
                        </div>
                        <div className="form-grid">
                            <label><span>Description</span><input value={editForm.data.description} onChange={(event) => editForm.setData('description', event.target.value)} /></label>
                            <FieldError message={editForm.errors.description} />
                            <label><span>Meal Type</span><select value={editForm.data.meal_type} onChange={(event) => editForm.setData('meal_type', event.target.value)}>{chat.mealTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
                            <FieldError message={editForm.errors.meal_type} />
                            <label><span>Notes</span><input value={editForm.data.notes} onChange={(event) => editForm.setData('notes', event.target.value)} /></label>
                            <FieldError message={editForm.errors.notes} />
                            <label><span>Calories</span><input type="number" value={editForm.data.calories} onChange={(event) => editForm.setData('calories', event.target.value)} /></label>
                            <FieldError message={editForm.errors.calories} />
                            <label><span>Protein</span><input type="number" value={editForm.data.protein_g} onChange={(event) => editForm.setData('protein_g', event.target.value)} /></label>
                            <FieldError message={editForm.errors.protein_g} />
                            <label><span>Carbs</span><input type="number" value={editForm.data.carbs_g} onChange={(event) => editForm.setData('carbs_g', event.target.value)} /></label>
                            <FieldError message={editForm.errors.carbs_g} />
                            <label><span>Fat</span><input type="number" value={editForm.data.fat_g} onChange={(event) => editForm.setData('fat_g', event.target.value)} /></label>
                            <FieldError message={editForm.errors.fat_g} />
                            <label><span>Fiber</span><input type="number" value={editForm.data.fiber_g} onChange={(event) => editForm.setData('fiber_g', event.target.value)} /></label>
                            <FieldError message={editForm.errors.fiber_g} />
                        </div>
                        <button type="submit" className="primary-cta" disabled={editForm.processing}>{editForm.processing ? 'Saving Meal...' : 'Save Meal Changes'}</button>
                    </form>
                ) : null}
            </div>
            </PageTransition>

            <div className="chat-stitch__composer-wrap">
                <form className="chat-stitch__composer chat-stitch__composer--stacked" onSubmit={submit}>
                    <div className="chat-stitch__composer-top">
                        <button type="button" className="chat-stitch__composer-icon"><Icon name="add_circle" /></button>
                        <input type="text" placeholder="Tell me what you ate..." value={form.data.message} onChange={(event) => form.setData('message', event.target.value)} />
                        <div className="chat-stitch__composer-actions">
                            <button type="button" className="chat-stitch__composer-icon" onClick={handlePhotoButton} title="Attach photo"><Icon name="photo_camera" /></button>
                            <button type="submit" className="chat-stitch__composer-send" disabled={form.processing || !form.data.message.trim()}>{form.processing ? <span className="button-spinner" /> : <Icon name="arrow_upward" />}</button>
                        </div>
                    </div>
                    <FieldError message={form.errors.message} />
                    <div className="chat-stitch__composer-bottom">
                        <select value={form.data.meal_type} onChange={(event) => form.setData('meal_type', event.target.value)}>
                            {chat.mealTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                        </select>
                        <input type="text" placeholder="Optional notes" value={form.data.notes} onChange={(event) => form.setData('notes', event.target.value)} />
                    </div>
                    <FieldError message={form.errors.meal_type || form.errors.notes} />
                </form>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />

            {photoDialog && (
                <div className="chat-stitch__photo-dialog">
                    <div className="chat-stitch__photo-dialog__backdrop" onClick={() => setPhotoDialog(null)} />
                    <div className="chat-stitch__photo-dialog__card editorial-card">
                        <div className="recent-meals-card__header">
                            <h3>Photo Selected</h3>
                            <span className={`chat-stitch__photo-dialog__badge chat-stitch__photo-dialog__badge--${photoDialog.type}`}>
                                {photoDialog.type === 'image' ? 'Image' : 'File'}
                            </span>
                        </div>
                        {photoDialog.preview ? (
                            <img src={photoDialog.preview} alt="Preview" className="chat-stitch__photo-dialog__preview" />
                        ) : (
                            <div className="chat-stitch__photo-dialog__file-preview">
                                <Icon name="attach_file" />
                                <strong>{photoDialog.name}</strong>
                                <small>{photoDialog.size}</small>
                            </div>
                        )}
                        <p className="chat-stitch__photo-dialog__note">
                            OCR analysis will be available once the vision backend is connected.
                        </p>
                        <div className="chat-stitch__photo-dialog__actions">
                            <button type="button" className="ghost-cta" onClick={() => setPhotoDialog(null)}>Cancel</button>
                            <button type="button" className="primary-cta" onClick={confirmPhoto}>Log from Photo</button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={deleteTarget !== null}
                title="Delete Meal"
                message={`Delete "${deleteTarget?.description ?? ''}"? This will remove it from your daily totals.`}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </AppShell>
    );
}
