import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = '600px' }: ModalProps) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="modal-overlay animate-in">
            <div className="modal-content" style={{ maxWidth: maxWidth }}>
                <header className="modal-header">
                    <h3 style={{ fontSize: '18px', fontWeight: '800' }}>{title}</h3>
                    <button
                        onClick={onClose}
                        className="btn"
                        style={{ padding: '8px', backgroundColor: 'transparent', color: 'var(--muted)' }}
                    >
                        <X size={20} />
                    </button>
                </header>
                <div className="modal-body no-scrollbar">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}
