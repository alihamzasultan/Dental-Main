import React, { useState } from 'react';
import { Modal } from './Modal';
import { AlertTriangle, Info, HelpCircle } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger'
}: ConfirmationModalProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleConfirm = async () => {
        setIsProcessing(true);
        try {
            await onConfirm();
            onClose();
        } catch (error) {
            console.error('Confirmation action failed:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'danger': return <AlertTriangle size={32} />;
            case 'warning': return <HelpCircle size={32} />;
            case 'info': return <Info size={32} />;
            default: return <AlertTriangle size={32} />;
        }
    };

    const getColor = () => {
        switch (type) {
            case 'danger': return '#ef4444';
            case 'warning': return '#f59e0b';
            case 'info': return 'var(--primary)';
            default: return '#ef4444';
        }
    };

    const getBgColor = () => {
        switch (type) {
            case 'danger': return 'rgba(239, 68, 68, 0.1)';
            case 'warning': return 'rgba(245, 158, 11, 0.1)';
            case 'info': return 'var(--primary-light)';
            default: return 'rgba(239, 68, 68, 0.1)';
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="400px">
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ 
                    width: '64px', height: '64px', borderRadius: '50%', 
                    backgroundColor: getBgColor(), color: getColor(), 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' 
                }}>
                    {getIcon()}
                </div>
                <div>
                    <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>{title}</h4>
                    <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: '1.5' }}>{message}</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        onClick={onClose} 
                        className="btn" 
                        style={{ flex: 1, padding: '12px', border: '1px solid var(--border)', backgroundColor: 'transparent' }}
                    >
                        {cancelText}
                    </button>
                    <button 
                        onClick={handleConfirm} 
                        disabled={isProcessing} 
                        className="btn" 
                        style={{ 
                            flex: 1, padding: '12px', 
                            backgroundColor: getColor(), color: 'white' 
                        }}
                    >
                        {isProcessing ? 'Processing...' : confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
