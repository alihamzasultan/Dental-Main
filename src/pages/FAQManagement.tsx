import { useState, useEffect } from 'react';
import { useFAQs, FAQEntry } from '../hooks/useFAQs';
import { format } from 'date-fns';
import { Search, Plus, Edit2, Trash2, MessageSquare } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { useAuth } from '../contexts/AuthContext';

export function FAQManagement() {
    const { faqs, loading, saveFAQ, deleteFAQ } = useFAQs();
    const { role } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingFAQ, setEditingFAQ] = useState<Partial<FAQEntry> | null>(null);
    const [faqToDelete, setFaqToDelete] = useState<string | null>(null);

    const filteredFAQs = faqs.filter(f => {
        return (
            (f.question?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (f.answer?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
    });

    const handleOpenModal = (faq?: FAQEntry) => {
        setEditingFAQ(faq || { question: '', answer: '' });
        setIsModalOpen(true);
    };

    // Auto-open modal if navigated from Unanswered Questions page
    useEffect(() => {
        const prefill = sessionStorage.getItem('faqPrefill');
        if (prefill) {
            sessionStorage.removeItem('faqPrefill');
            setEditingFAQ({ question: prefill, answer: '' });
            setIsModalOpen(true);
        }
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingFAQ) {
            await saveFAQ({ ...editingFAQ, category: editingFAQ.category || 'General' });
            setIsModalOpen(false);
            setEditingFAQ(null);
        }
    };

    if (loading) return <div style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)' }}>Loading AI knowledge base...</div>;

    return (
        <div className="animate-up">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 className="page-title">AI FAQ Management</h1>
                    <p className="page-subtitle">Update and manage the knowledge base used by the AI voice agent.</p>
                </div>
                {role === 'Admin' && (
                    <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                        <Plus size={18} /> Add New Entry
                    </button>
                )}
            </header>

            <div className="table-container">
                <div className="table-header-row">
                    <div className="search-input-wrapper" style={{ flex: 1, minWidth: '200px' }}>
                        <Search className="icon" size={18} style={{ position: 'absolute', left: '12px', color: 'var(--muted)' }} />
                        <input
                            type="text"
                            placeholder="Search FAQ question or answer..."
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ padding: '20px', display: 'grid', gap: '14px' }}>
                    {filteredFAQs.length > 0 ? (
                        filteredFAQs.map(faq => (
                            <div
                                key={faq.id}
                                className="card"
                                style={{
                                    padding: '18px 20px',
                                    display: 'flex',
                                    gap: '16px',
                                    alignItems: 'flex-start',
                                    borderLeft: '3px solid var(--primary)',
                                }}
                            >
                                {/* Icon */}
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '10px',
                                    backgroundColor: 'var(--primary-light)', color: 'var(--primary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                }}>
                                    <MessageSquare size={16} />
                                </div>

                                {/* Content */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                                        <h4 style={{ fontSize: '14px', fontWeight: '700', lineHeight: '1.4', margin: 0, flex: 1, minWidth: '200px' }}>
                                            {faq.question}
                                        </h4>
                                        <span style={{ fontSize: '11px', color: 'var(--muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                            {format(new Date(faq.last_updated), 'MMM dd, yyyy')}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.6', marginTop: '6px' }}>
                                        {faq.answer}
                                    </p>
                                </div>

                                {/* Actions */}
                                {role === 'Admin' && (
                                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                        <button
                                            onClick={() => handleOpenModal(faq)}
                                            className="btn"
                                            title="Edit"
                                            style={{ padding: '7px', backgroundColor: 'var(--input)', color: 'var(--muted)' }}
                                        >
                                            <Edit2 size={15} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setFaqToDelete(faq.id);
                                                setIsDeleteModalOpen(true);
                                            }}
                                            className="btn"
                                            title="Delete"
                                            style={{ padding: '7px', backgroundColor: 'var(--status-cancelled-bg)', color: 'var(--status-cancelled)' }}
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '64px', textAlign: 'center', color: 'var(--muted)', fontStyle: 'italic' }}>
                            No FAQ entries found. Click "Add New Entry" to get started.
                        </div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingFAQ?.id ? 'Edit FAQ Entry' : 'Add FAQ Entry'}
            >
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div className="input-group">
                        <label className="input-label">Question</label>
                        <input
                            className="search-input"
                            style={{ paddingLeft: '16px' }}
                            placeholder="What should the AI respond to?"
                            value={editingFAQ?.question || ''}
                            onChange={(e) => setEditingFAQ({ ...editingFAQ, question: e.target.value })}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label">AI Answer</label>
                        <textarea
                            className="search-input"
                            style={{ paddingLeft: '16px', height: 'auto', minHeight: '130px', paddingTop: '12px', resize: 'vertical' }}
                            placeholder="How should the AI answer this question?"
                            value={editingFAQ?.answer || ''}
                            onChange={(e) => setEditingFAQ({ ...editingFAQ, answer: e.target.value })}
                            required
                        />
                    </div>
                    <div className="modal-footer" style={{ borderTop: 'none', marginTop: 0, padding: 0 }}>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn" style={{ border: '1px solid var(--border)', backgroundColor: 'transparent' }}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Save Entry
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setFaqToDelete(null);
                }}
                onConfirm={async () => {
                    if (faqToDelete) {
                        await deleteFAQ(faqToDelete);
                    }
                }}
                title="Delete FAQ Entry"
                message="Are you sure you want to delete this FAQ entry? This action cannot be undone and the AI will no longer be able to use this information."
                confirmText="Delete Now"
                cancelText="Keep Entry"
                type="danger"
            />
        </div>
    );
}
