import { useState } from 'react';
import { useUnansweredQuestions } from '../hooks/useUnansweredQuestions';
import { format } from 'date-fns';
import { Search, Phone, Plus, AlertCircle } from 'lucide-react';

export function UnansweredQuestions() {
    const { questions, loading } = useUnansweredQuestions();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredQuestions = questions.filter(q => {
        return (
            (q.question?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            q.caller_number.includes(searchTerm)
        );
    });

    const handleAddToFAQ = (question: string) => {
        // Navigate to FAQ page and pass pre-filled question via a custom event
        const params = new URLSearchParams({ prefillQuestion: question });
        window.dispatchEvent(new CustomEvent('navigate', { detail: 'faq' }));
        // Store in sessionStorage so FAQManagement can pick it up
        sessionStorage.setItem('faqPrefill', question);
    };

    if (loading) return <div style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)' }}>Loading unanswered questions...</div>;

    return (
        <div className="animate-up">
            <header className="page-header">
                <h1 className="page-title">AI Unanswered Questions</h1>
                <p className="page-subtitle">Review questions the AI could not handle and update the knowledge base.</p>
            </header>

            <div className="table-container">
                <div className="table-header-row">
                    <div className="search-input-wrapper">
                        <Search className="icon" size={18} style={{ position: 'absolute', left: '12px', color: 'var(--muted)' }} />
                        <input
                            type="text"
                            placeholder="Search by question or number..."
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: '140px' }}>Date</th>
                                <th style={{ width: '150px' }}>Caller</th>
                                <th>Unanswered Question</th>
                                <th style={{ width: '130px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredQuestions.length > 0 ? (
                                filteredQuestions.map((q) => (
                                    <tr key={q.id}>
                                        <td style={{ verticalAlign: 'top' }}>
                                            <span style={{ fontSize: '13px', fontWeight: '600' }}>
                                                {format(new Date(q.created_at), 'MMM dd, HH:mm')}
                                            </span>
                                        </td>
                                        <td style={{ verticalAlign: 'top' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Phone size={14} style={{ color: 'var(--muted)' }} />
                                                <span style={{ fontSize: '13px' }}>{q.caller_number}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <p style={{ fontWeight: '700', fontSize: '14px', lineHeight: '1.4' }}>"{q.question}"</p>
                                        </td>
                                        <td style={{ textAlign: 'right', verticalAlign: 'top' }}>
                                            <button
                                                onClick={() => handleAddToFAQ(q.question)}
                                                className="btn btn-primary"
                                                style={{ padding: '6px 12px', fontSize: '12px' }}
                                            >
                                                <Plus size={14} />
                                                Add to FAQ
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '64px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', color: 'var(--muted)' }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--input)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <AlertCircle size={24} />
                                            </div>
                                            <p style={{ fontStyle: 'italic' }}>No unanswered questions found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card bg-status-booked-bg" style={{ marginTop: '24px', border: '1px dashed var(--status-booked)', display: 'flex', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--status-booked)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <AlertCircle size={24} />
                </div>
                <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--foreground)' }}>Proactive Knowledge Management</h4>
                    <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
                        Adding unanswered questions to the FAQ database helps the AI handle future calls more effectively, reducing the need for clinical staff transfers.
                    </p>
                </div>
            </div>
        </div>
    );
}
