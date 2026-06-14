import React from 'react';
import ReactDOM from 'react-dom';

export const ConfirmModal = ({ title, message, onConfirm, onCancel }) => {
    return ReactDOM.createPortal(
        <div className="omori-modal-overlay" style={{ zIndex: 99999 }}>
            <div className="omori-modal-content" style={{ maxWidth: '400px', textAlign: 'center', border: '4px solid var(--ws-black)' }}>
                <div className="omori-modal-header" style={{ justifyContent: 'center', borderBottom: 'none', paddingBottom: 0 }}>
                    <h3 style={{ fontSize: '1.5rem', margin: 0, fontFamily: 'OMORI_GAME, cursive' }}>{title}</h3>
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '1.2rem', margin: '20px 0' }}>
                    {message}
                </div>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                    <button className="omoriSubmit" onClick={onCancel} style={{ background: 'var(--ws-white)', color: 'var(--ws-black)', border: '2px solid var(--ws-black)', flex: 1 }}>
                        NO
                    </button>
                    <button className="omoriSubmit" onClick={onConfirm} style={{ background: 'var(--ws-black)', color: 'var(--ws-white)', flex: 1 }}>
                        YES
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
