import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, RotateCcw, MessageSquare, Info, Type, Calendar, MessageCircle, Star } from 'lucide-react';
import { useSMSTemplates, SMSTemplate } from '../hooks/useSMSTemplates';
import { TokenEditor } from '../components/shared/TokenEditor';

const TEMPLATE_CATEGORIES = [
    {
        id: 'appointment_mgmt',
        name: 'Appointment Management',
        icon: <Calendar size={18} />,
        templates: ['appointment_confirmation', 'appointment_rescheduled', 'appointment_cancelled']
    },
    {
        id: 'reminders_responses',
        name: 'Reminder & SMS Response',
        icon: <MessageSquare size={18} />,
        templates: ['appointment_reminder', 'appointment_reminder2', 'sms_confirmation_success', 'sms_cancellation_success', 'sms_fallback']
    },
    {
        id: 'feedback',
        name: 'Post-Visit Feedback',
        icon: <Star size={18} />,
        templates: ['post_visit_feedback', 'positive_feedback', 'negative_feedback']
    }
];

export function SMSTemplates() {
    const { templates, loading, error, updateTemplate, refresh } = useSMSTemplates();
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [smsText, setSmsText] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const selectedTemplate = templates.find(t => t.template_id === selectedTemplateId);

    useEffect(() => {
        if (templates.length > 0 && !selectedTemplateId) {
            // Default to first appointment_reminder or first available
            const defaultId = templates.find(t => t.template_id === 'appointment_reminder')?.template_id || templates[0].template_id;
            setSelectedTemplateId(defaultId);
            const template = templates.find(t => t.template_id === defaultId);
            if (template) setSmsText(template.sms_text);
        }
    }, [templates, selectedTemplateId]);

    const handleSelectTemplate = (id: string) => {
        setSelectedTemplateId(id);
        const template = templates.find(t => t.template_id === id);
        if (template) {
            setSmsText(template.sms_text);
        }
    };

    const handleSave = async () => {
        if (!selectedTemplateId) return;
        
        setIsSaving(true);
        setSaveStatus(null);
        
        const { error } = await updateTemplate(selectedTemplateId, smsText);
        
        if (error) {
            setSaveStatus({ type: 'error', message: `SMS template update failed: ${error}` });
        } else {
            setSaveStatus({ type: 'success', message: 'SMS template updated successfully' });
            setTimeout(() => setSaveStatus(null), 3000);
        }
        setIsSaving(false);
    };

    const handleReset = () => {
        const template = templates.find(t => t.template_id === selectedTemplateId);
        if (template) {
            setSmsText(template.sms_text);
        }
    };

    const renderPreview = (text: string) => {
        if (!text) return '';
        return text
            .replace(/\{\{\s*\$json\['Customer Name'\]\s*\}\}/g, 'John Doe')
            .replace(/\{\{\s*\$\('Get row\(s\) in sheet'\)\.item\.json\['Customer Name'\]\s*\}\}/g, 'John Doe')
            .replace(/\{\{\s*\$\('Code in JavaScript'\)\.item\.json\.customer_name\.charAt\(0\)\.toUpperCase\(\) \+ \$\('Code in JavaScript'\)\.item\.json\.customer_name\.slice\(1\)\s*\}\}/g, 'John Doe')
            .replace(/\{\{\s*DateTime\.fromISO\(.*?\)\.toFormat\(.*?\)\s*\}\}/g, 'Oct 24, 2024 at 10:30 AM')
            .replace(/\{\{\s*\$\('Get row\(s\) in sheet1'\)\.first\(\)\.json\['Customer Name'\]\s*\}\}/g, 'John Doe')
            .replace(/\{\{\s*\$\('Get row\(s\) in sheet1'\)\.first\(\)\.json\['Booking Date'\]\s*\}\}/g, 'Oct 24, 2024')
            .replace(/\{\{\s*\$\('Get row\(s\) in sheet'\)\.first\(\)\.json\['Customer Name'\]\s*\}\}/g, 'John Doe')
            .replace(/\{\{\s*\$\('Get row\(s\) in sheet'\)\.first\(\)\.json\['Reason for visit'\]\s*\}\}/g, 'Teeth Cleaning');
    };

    if (loading && templates.length === 0) {
        return (
            <div style={{ padding: '48px', textAlign: 'center' }}>
                <div className="sidebar-logo" style={{ width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}>
                    <RotateCcw size={24} />
                </div>
                <p style={{ color: 'var(--muted)', fontWeight: '600' }}>Loading templates...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '48px', textAlign: 'center' }}>
                <p style={{ color: '#ef4444', marginBottom: '16px', fontWeight: '600' }}>Error loading templates: {error}</p>
                <button onClick={() => refresh()} className="btn btn-primary">Retry</button>
            </div>
        );
    }

    return (
        <div className="animate-up">
            <header className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                        width: '40px', height: '40px', borderRadius: '10px', 
                        backgroundColor: 'var(--primary-light)', color: 'var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <SettingsIcon size={20} />
                    </div>
                    <div>
                        <h1 className="page-title">SMS Template Settings</h1>
                        <p className="page-subtitle">Configure and customize automated SMS notifications by category.</p>
                    </div>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 340px', gap: '24px', alignItems: 'start' }}>
                {/* Sidebar Navigation */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {TEMPLATE_CATEGORIES.map(category => (
                        <div key={category.id} className="card" style={{ padding: '12px', background: 'var(--card-bg)' }}>
                            <div style={{ 
                                display: 'flex', alignItems: 'center', gap: '8px', 
                                padding: '8px', color: 'var(--muted)', 
                                fontSize: '11px', fontWeight: '800', 
                                textTransform: 'uppercase', letterSpacing: '0.05em',
                                marginBottom: '4px' 
                            }}>
                                {category.icon}
                                {category.name}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                {category.templates.map(tid => {
                                    const t = templates.find(tmp => tmp.template_id === tid);
                                    if (!t) return null;
                                    const isActive = selectedTemplateId === tid;
                                    return (
                                        <button
                                            key={tid}
                                            onClick={() => handleSelectTemplate(tid)}
                                            style={{
                                                padding: '10px 12px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                background: isActive ? 'var(--primary-light)' : 'transparent',
                                                color: isActive ? 'var(--primary)' : 'var(--foreground)',
                                                fontSize: '13px',
                                                fontWeight: isActive ? '700' : '500',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                outline: 'none'
                                            }}
                                            className={isActive ? '' : 'nav-item-hover'}
                                        >
                                            {t.template_name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Editor Section */}
                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '4px' }}>{selectedTemplate?.template_name || 'Select a template'}</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ 
                                    padding: '2px 8px', borderRadius: '4px', 
                                    backgroundColor: 'var(--primary-light)', color: 'var(--primary)',
                                    fontSize: '10px', fontWeight: '800', textTransform: 'uppercase'
                                }}>
                                    Active Template
                                </span>
                                <p style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: '600' }}>ID: {selectedTemplateId}</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                SMS Template
                            </label>
                            <div style={{ 
                                display: 'flex', alignItems: 'center', gap: '4px', 
                                fontSize: '12px', fontWeight: '700', 
                                color: smsText.length > 160 ? '#ef4444' : 'var(--muted)' 
                            }}>
                                <Type size={14} />
                                {smsText.length} / 160
                            </div>
                        </div>
                        <TokenEditor
                            value={smsText}
                            onChange={(val) => setSmsText(val)}
                            placeholder="Enter SMS message content..."
                        />
                    </div>

                    {saveStatus && (
                        <div className="animate-in" style={{ 
                            padding: '14px 18px', borderRadius: '10px', marginBottom: '20px',
                            backgroundColor: saveStatus.type === 'success' ? 'var(--status-completed-bg)' : 'rgba(239, 68, 68, 0.1)',
                            color: saveStatus.type === 'success' ? 'var(--status-completed)' : '#ef4444',
                            fontSize: '14px', fontWeight: '600', border: `1px solid ${saveStatus.type === 'success' ? 'var(--status-completed)' : '#ef4444'}`,
                            display: 'flex', alignItems: 'center', gap: '10px'
                        }}>
                            {saveStatus.type === 'success' ? <Info size={18} /> : <RotateCcw size={18} />}
                            {saveStatus.message}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button 
                            className="btn btn-primary" 
                            style={{ flex: 1, height: '48px', fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }} 
                            onClick={handleSave} 
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <div className="sidebar-logo" style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite', margin: 0 }}>
                                        <RotateCcw size={16} />
                                    </div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save
                                </>
                            )}
                        </button>
                        <button 
                            className="btn" 
                            style={{ padding: '0 24px', height: '48px', border: '1px solid var(--border)', background: 'transparent', display: 'flex', alignItems: 'center', gap: '8px' }} 
                            onClick={handleReset} 
                            disabled={isSaving}
                        >
                            <RotateCcw size={18} />
                            Reset
                        </button>
                    </div>
                </div>

                {/* Info & Preview Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                            <MessageCircle size={18} style={{ color: 'var(--primary)' }} />
                            <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Live Preview</h3>
                        </div>
                        <div style={{ 
                            position: 'relative', padding: '20px', backgroundColor: 'var(--input)',
                            borderRadius: '18px', border: '1px solid var(--border)', minHeight: '140px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                        }}>
                            <div style={{ fontSize: '14px', color: 'var(--foreground)', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                                {renderPreview(smsText)}
                            </div>
                            <div style={{ 
                                position: 'absolute', bottom: '-8px', left: '24px', 
                                width: '16px', height: '16px', backgroundColor: 'var(--input)', 
                                borderLeft: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
                                transform: 'rotate(45deg)'
                            }}></div>
                        </div>
                        <p style={{ marginTop: '24px', fontSize: '12px', color: 'var(--muted)', textAlign: 'center', fontWeight: '500' }}>
                            Preview replaces variables with sample data for verification.
                        </p>
                    </div>

                </div>
            </div>

            <style>{`
                .nav-item-btn:hover {
                    background-color: var(--primary-light) !important;
                    color: var(--primary) !important;
                }
                .nav-item-hover:hover {
                    background-color: var(--card-bg-hover) !important;
                    transform: translateX(4px);
                }
            `}</style>
        </div>
    );
}
