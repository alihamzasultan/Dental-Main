import React, { useState } from 'react';
import { Bot, Phone, MapPin, Edit3 } from 'lucide-react';
import { useAgents, AgentRow } from '../hooks/useAgents';
import { EditAgentModal } from '../components/Agents/AgentModals';

export function Agents() {
    const { agents, count: agentCount, loading: agentsLoading, error: agentsError, updateAgent } = useAgents();
    const [selectedAgent, setSelectedAgent] = useState<AgentRow | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleEdit = (agent: AgentRow) => {
        setSelectedAgent(agent);
        setIsEditModalOpen(true);
    };

    return (
        <div className="animate-up">
            <header className="page-header" style={{ marginBottom: '28px' }}>
                <h1 className="page-title">My Agents</h1>
                <p className="page-subtitle">Manage and monitor all your linked agents.</p>
            </header>

            {/* Agents header card */}
            <div className="card" style={{ padding: '20px 24px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '42px', height: '42px', borderRadius: '10px',
                            background: 'var(--primary-light)', color: 'var(--primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Bot size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: '15px', fontWeight: 900 }}>Available Agents</div>
                            <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>
                                Agents registered in <code style={{ fontSize: '11px', background: 'var(--background)', padding: '1px 5px', borderRadius: '4px' }}>agent_location_data</code>
                            </div>
                        </div>
                    </div>
                    <div style={{
                        fontSize: '28px', fontWeight: 900,
                        color: 'var(--primary)'
                    }}>
                        {agentsLoading ? '—' : (typeof agentCount === 'number' ? agentCount : agents.length)}
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)', marginLeft: '6px' }}>agents</span>
                    </div>
                </div>
            </div>

            {/* Agents table */}
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Agent</th>
                                <th>Short Name</th>
                                <th>Phone</th>
                                <th>Location</th>
                                <th>City</th>
                                <th>Created</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {agentsLoading ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                                        Loading agents...
                                    </td>
                                </tr>
                            ) : agentsError ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--status-cancelled)', fontWeight: 800 }}>
                                        Failed to load agents: {agentsError}
                                    </td>
                                </tr>
                            ) : agents.length > 0 ? (
                                agents.map(a => (
                                    <tr key={a.id}>
                                        <td style={{ fontWeight: 800 }}>
                                            {a.company_name || `Agent #${a.id}`}
                                        </td>
                                        <td>
                                            <span style={{
                                                fontSize: '12px', fontWeight: 700,
                                                padding: '3px 8px', borderRadius: '6px',
                                                background: 'var(--background)',
                                                color: 'var(--foreground)',
                                                border: '1px solid var(--border)'
                                            }}>
                                                {a.company_name_small || '—'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                                                <Phone size={13} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                                                <span style={{ fontWeight: 600, fontSize: '13px' }}>{a.agent_phone || '—'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            {a.location_state ? (
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                    fontSize: '11px', fontWeight: 700,
                                                    padding: '4px 10px', borderRadius: '999px',
                                                    backgroundColor: 'var(--primary-light)',
                                                    color: 'var(--primary)',
                                                }}>
                                                    <MapPin size={10} />
                                                    {a.location_state}
                                                </span>
                                            ) : <span style={{ color: 'var(--muted)', fontSize: '12px' }}>—</span>}
                                        </td>
                                        <td>
                                            <span style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 600 }}>
                                                {(a as any).locaion_city || (a as any).location_city || '—'}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--muted)', fontWeight: 600, fontSize: '13px' }}>
                                            {a.created_at ? new Date(a.created_at).toLocaleDateString() : '—'}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => handleEdit(a)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        padding: '6px',
                                                        borderRadius: '6px',
                                                        color: 'var(--muted)',
                                                        transition: 'all 0.15s ease',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'var(--background)';
                                                        e.currentTarget.style.color = 'var(--primary)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                        e.currentTarget.style.color = 'var(--muted)';
                                                    }}
                                                    title="Edit Agent"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: 'var(--muted)', fontStyle: 'italic' }}>
                                        No agents found. Create one in the Agent Configuration page.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <EditAgentModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                agent={selectedAgent}
                onSave={updateAgent}
            />
        </div>
    );
}
