import { useState, useEffect } from 'react';
import { AgentRow } from '../../hooks/useAgents';
import { Modal } from '../ui/Modal';
import { Bot, Phone, MapPin, Building2, Type } from 'lucide-react';

interface EditAgentModalProps {
    isOpen: boolean;
    onClose: () => void;
    agent: AgentRow | null;
    onSave: (id: number, updates: Partial<AgentRow>) => Promise<void>;
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
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Agent Configuration">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                    <InputGroup 
                        label="Company Full Name" 
                        icon={<Building2 size={16} />}
                        value={formData.company_name || ''} 
                        onChange={(val) => setFormData({ ...formData, company_name: val })} 
                    />
                    <InputGroup 
                        label="Short Name (Small)" 
                        icon={<Type size={16} />}
                        value={formData.company_name_small || ''} 
                        onChange={(val) => setFormData({ ...formData, company_name_small: val })} 
                    />
                    <InputGroup 
                        label="Agent Phone Number" 
                        icon={<Phone size={16} />}
                        value={formData.agent_phone || ''} 
                        onChange={(val) => setFormData({ ...formData, agent_phone: val })} 
                    />
                    <InputGroup 
                        label="Location State" 
                        icon={<MapPin size={16} />}
                        value={formData.location_state || ''} 
                        onChange={(val) => setFormData({ ...formData, location_state: val })} 
                    />
                    <InputGroup 
                        label="City" 
                        icon={<MapPin size={16} />}
                        value={(formData as any).locaion_city || ''} 
                        onChange={(val) => setFormData({ ...formData, locaion_city: val } as any)} 
                    />
                </div>

                <div className="modal-footer" style={{ marginTop: '12px' }}>
                    <button type="button" onClick={onClose} className="btn" style={{ padding: '10px 24px', border: '1px solid var(--border)', backgroundColor: 'transparent' }}>Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isSubmitting ? 'Saving...' : (
                            <>
                                <Bot size={18} />
                                Save Updates
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

function InputGroup({ label, value, onChange, icon, type = 'text' }: { label: string, value: string, onChange: (val: string) => void, icon?: React.ReactNode, type?: string }) {
    return (
        <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {icon}
                {label}
            </label>
            <input 
                type={type} 
                className="search-input" 
                style={{ paddingLeft: '16px' }} 
                value={value} 
                onChange={(e) => onChange(e.target.value)} 
            />
        </div>
    );
}
