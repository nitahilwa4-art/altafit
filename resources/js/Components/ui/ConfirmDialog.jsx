import { useState, useEffect } from 'react';
import Icon from './Icon';

export default function ConfirmDialog({ open, title = 'Confirm', message, confirmLabel = 'Delete', onConfirm, onCancel }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (open) {
            requestAnimationFrame(() => setVisible(true));
        } else {
            setVisible(false);
        }
    }, [open]);

    if (!open) return null;

    return (
        <div className={`confirm-overlay ${visible ? 'is-visible' : ''}`} onClick={onCancel}>
            <div className={`confirm-dialog ${visible ? 'is-visible' : ''}`} onClick={(e) => e.stopPropagation()}>
                <div className="confirm-dialog__icon">
                    <Icon name="warning" filled />
                </div>
                <h3 className="confirm-dialog__title">{title}</h3>
                <p className="confirm-dialog__message">{message}</p>
                <div className="confirm-dialog__actions">
                    <button type="button" className="confirm-dialog__cancel" onClick={onCancel}>Cancel</button>
                    <button type="button" className="confirm-dialog__confirm" onClick={onConfirm}>{confirmLabel}</button>
                </div>
            </div>
        </div>
    );
}
