import { useState, useEffect } from 'react';
import { AgentRow } from '../../hooks/useAgents';
import { Modal } from '../ui/Modal';
import { Bot, Phone, MapPin, Building2, Type, Globe, CheckCircle2, X } from 'lucide-react';

interface EditAgentModalProps {
    isOpen: boolean;
    onClose: () => void;
    agent: AgentRow | null;
    onSave: (id: number, updates: Partial<AgentRow>) => Promise<any>;
}

export function EditAgentModal({ isOpen, onClose, agent, onSave }: EditAgentModalProps) {
    const [formData, setFormData] = useState<Partial<AgentRow>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (agent) {
            setFormData({
                company_name: agent.company_name || '',
                company_name_small: agent.company_name_small || '',
                agent_phone: agent.agent_phone || '',
                location_state: agent.location_state || '',
                locaion_city: (agent as any).locaion_city || (agent as any).location_city || '',
            });
        }
    }, [agent]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agent) return;
        
        setIsSubmitting(true);
        try {
            await onSave(agent.id, formData);
            onClose();
        } catch (err) {
            console.error(err);
            alert('Failed to update agent');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Agent Settings">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
                
                {/* Section: Agent Identity */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                        <Building2 size={16} style={{ color: 'var(--primary)' }} />
                        <h4 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', fontWeight: 700 }}>Agent Identity & Branding</h4>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                        <PremiumInput 
                            label="Company Full Name" 
                            icon={<Building2 size={18} />}
                            placeholder="e.g. Acme Dental Clinic"
                            value={formData.company_name || ''} 
                            onChange={(val) => setFormData({ ...formData, company_name: val })} 
                        />
                        <PremiumInput 
                            label="Short Branding" 
                            icon={<Type size={18} />}
                            placeholder="ACME"
                            value={formData.company_name_small || ''} 
                            onChange={(val) => setFormData({ ...formData, company_name_small: val })} 
                        />
                    </div>
                </div>

                {/* Section: Connectivity & Network */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                        <Globe size={16} style={{ color: 'var(--primary)' }} />
                        <h4 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', fontWeight: 700 }}>Communication & Deployment</h4>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <PremiumInput 
                            label="Agent Phone Number" 
                            icon={<Phone size={18} />}
                            placeholder="+1 (555) 000-0000"
                            value={formData.agent_phone || ''} 
                            onChange={(val) => setFormData({ ...formData, agent_phone: val })} 
                        />
                        <PremiumInput 
                            label="Location State" 
                            icon={<MapPin size={18} />}
                            placeholder="e.g. California"
                            value={formData.location_state || ''} 
                            onChange={(val) => setFormData({ ...formData, location_state: val })} 
                        />
                        <PremiumInput 
                            label="Service City" 
                            icon={<MapPin size={18} />}
                            placeholder="e.g. Los Angeles"
                            value={(formData as any).locaion_city || ''} 
                            onChange={(val) => setFormData({ ...formData, locaion_city: val } as any)} 
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div style={{ 
                    marginTop: '8px', 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    gap: '12px',
                    padding: '20px 0 0',
                    borderTop: '1px solid var(--border)' 
                }}>
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="btn" 
                        style={{ 
                            padding: '10px 20px', 
                            borderRadius: 'var(--radius)',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: 'var(--foreground)',
                            backgroundColor: 'transparent',
                            border: '1px solid var(--border)',
                            transition: 'all 0.2s'
                        }}
                    >
                        Dismiss
                    </button>
                    <button 
                        type="submit" 
                        disabled={isSubmitting} 
                        className="btn btn-primary" 
                        style={{ 
                            padding: '10px 28px', 
                            borderRadius: 'var(--radius)',
                            fontSize: '14px',
                            fontWeight: 600,
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '10px',
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                            transition: 'all 0.2s'
                        }}
                    >
                        {isSubmitting ? 'Syncing...' : (
                            <>
                                <CheckCircle2 size={18} />
                                Save Configuration
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

interface PremiumInputProps {
    label: string;
    value: string;
    onChange: (val: string) => void;
    icon: React.ReactNode;
    placeholder?: string;
    type?: string;
}

function PremiumInput({ label, value, onChange, icon, placeholder, type = 'text' }: PremiumInputProps) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <label style={{ 
                fontSize: '12px', 
                fontWeight: 600, 
                color: isFocused ? 'var(--primary)' : 'var(--muted)',
                transition: 'color 0.2s'
            }}>
                {label}
            </label>
            <div style={{ 
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--input)',
                borderRadius: 'var(--radius)',
                border: '1.5px solid',
                borderColor: isFocused ? 'var(--primary)' : 'transparent',
                transition: 'all 0.2s',
                boxShadow: isFocused ? '0 0 0 4px var(--ring)' : 'none'
            }}>
                <div style={{ 
                    padding: '0 12px', 
                    color: isFocused ? 'var(--primary)' : 'var(--muted-foreground)',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'color 0.2s'
                }}>
                    {icon}
                </div>
                <input 
                    type={type} 
                    placeholder={placeholder}
                    value={value}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onChange={(e) => onChange(e.target.value)}
                    style={{ 
                        width: '100%',
                        padding: '12px 12px 12px 0',
                        border: 'none',
                        backgroundColor: 'transparent',
                        outline: 'none',
                        fontSize: '14px',
                        color: 'var(--foreground)',
                        fontWeight: 500
                    }}
                />
            </div>
        </div>
    );
}
