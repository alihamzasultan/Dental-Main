import { useState, useEffect, useMemo } from 'react';
import { useAgentData, AgentData } from '../hooks/useAgentData';
import { Save, Shield, MapPin, Building2, Phone, List, History, Clock, CheckCircle2, Home, AlertCircle, Info, Sparkles, Type, Search, ShoppingCart, Loader2, Key, MessageSquare, Mic, Image as ImageIcon, Printer, Globe, PackageOpen, Zap, Rocket } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLocations } from '../contexts/LocationContext';

const COUNTRIES = [
    { code: 'GB', name: 'United Kingdom', prefix: '+44' },
    { code: 'US', name: 'United States', prefix: '+1' },
    { code: 'CA', name: 'Canada', prefix: '+1' },
    { code: 'AU', name: 'Australia', prefix: '+61' },
];

export function ModifyAgent() {
    const { lastSubmission, loading, createAgentEntry } = useAgentData();
    const { role } = useAuth();
    const { selectedLocation } = useLocations();
    const isAdmin = role === 'Admin';

    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    
    // Twilio/Vapi States
    const [showNumberSearch, setShowNumberSearch] = useState(false);
    const [provisionMode, setProvisionMode] = useState<'search' | 'inventory'>('search');
    const [isSearching, setIsSearching] = useState(false);
    const [isConnectingVapi, setIsConnectingVapi] = useState(false);
    const [vapiConnected, setVapiConnected] = useState(false);

    const [allNumbers, setAllNumbers] = useState<any[]>([]); 
    const [inventoryNumbers, setInventoryNumbers] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIso, setSelectedIso] = useState('GB');
    const [isBuying, setIsBuying] = useState<string | null>(null);

    const [formData, setFormData] = useState<AgentData>({
        location_state: 'United Kingdom',
        locaion_city: selectedLocation?.city || 'Global',
        company_name: 'Dental Ai UK',
        company_name_small: 'Dental Ai',
        company_contact: '',
        company_address: '',
        agent_phone: ''
    });

    useEffect(() => {
        if (lastSubmission) {
            setFormData({
                location_state: lastSubmission.location_state,
                locaion_city: lastSubmission.locaion_city,
                company_name: lastSubmission.company_name || 'Dental Ai UK',
                company_name_small: lastSubmission.company_name_small || 'Dental Ai',
                company_contact: lastSubmission.company_contact,
                company_address: lastSubmission.company_address || '',
                agent_phone: lastSubmission.agent_phone
            });
        }
    }, [lastSubmission]);

    useEffect(() => {
        if (showNumberSearch) {
            if (provisionMode === 'search' && allNumbers.length === 0) {
                handleSearchNumbers('');
            } else if (provisionMode === 'inventory' && inventoryNumbers.length === 0) {
                fetchInventory();
            }
        }
    }, [showNumberSearch, provisionMode]);

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const fetchInventory = async () => {
        if (!isAdmin) return;
        setIsSearching(true);
        try {
            const response = await fetch(`/api/twilio/inventory`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Inventory failed');

            const twilioList = data.twilio || [];
            const vapiList = data.vapi || [];

            const numbers = twilioList.map((n: any) => {
                const vapiMatch = vapiList.find((v: any) => v.number === n.phone_number);
                return {
                    id: n.sid,
                    number: n.phone_number,
                    friendlyName: n.friendly_name,
                    type: 'Purchased',
                    capabilities: {
                        voice: n.capabilities?.voice ?? true,
                        sms: n.capabilities?.SMS ?? true,
                        mms: n.capabilities?.MMS ?? false,
                        fax: n.capabilities?.fax ?? false
                    },
                    locality: n.locality || 'Unknown',
                    region: n.region || 'Unknown',
                    assistantId: vapiMatch?.assistantId || null,
                    vapiName: vapiMatch?.name || null
                };
            });
            setInventoryNumbers(numbers);
        } catch (err: any) {
            setErrorMessage('Inventory Load Error: ' + err.message);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchNumbers = async (queryOverride?: string) => {
        if (!isAdmin) return;
        setIsSearching(true);
        try {
            const query = queryOverride !== undefined ? queryOverride : searchQuery;
            const countryPrefix = COUNTRIES.find(c => c.code === selectedIso)?.prefix || '';
            const cleanQuery = query.replace(countryPrefix, '').replace(/\D/g, '');

            const response = await fetch(`/api/twilio/search?areaCode=${cleanQuery}&isoCode=${selectedIso}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Twilio Error');

            const numbers = (data.available_phone_numbers || []).map((n: any) => ({
                id: n.phone_number,
                number: n.phone_number,
                friendlyName: n.friendly_name,
                type: 'Available',
                price: selectedIso === 'US' ? '$1.15' : '£0.80', 
                capabilities: {
                    voice: n.capabilities?.voice ?? false,
                    sms: n.capabilities?.SMS ?? false,
                    mms: n.capabilities?.MMS ?? false,
                    fax: n.capabilities?.fax ?? false
                },
                addressRequirement: n.address_requirements || 'None',
                locality: n.locality || 'Multiple',
                region: n.region || selectedIso
            }));

            setAllNumbers(numbers);
        } catch (err: any) {
            setErrorMessage('Twilio Error: ' + err.message);
        } finally {
            setIsSearching(false);
        }
    };

    const handleConnectVapi = async () => {
        if (!formData.agent_phone || !isAdmin) return;
        
        setIsConnectingVapi(true);
        setErrorMessage(null);
        setVapiConnected(false);

        try {
            const assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID;
            if (!assistantId || assistantId === 'your_assistant_id_here') {
                throw new Error("VAPI Assistant ID not configured in .env file.");
            }

            console.log(`Connecting ${formData.agent_phone} to Vapi Assistant: ${assistantId}`);
            
            const response = await fetch(`/api/vapi/connect`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phoneNumber: formData.agent_phone,
                    assistantId: assistantId,
                    name: `Dashboard Agent: ${formData.company_name_small}`
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Vapi deployment failed');

            setVapiConnected(true);
            
            if (data._reconnected) {
                setSuccessMessage(`Notice: Number was already in Vapi. It has been successfully re-linked to this agent.`);
            } else {
                setSuccessMessage(`Success! Agent ${formData.agent_phone} is now linked to Vapi for inbound calls.`);
            }
            
            console.log('Vapi integration complete:', data);

            // AUTO-SYNC TO DATABASE: Save clinical metadata to Supabase automatically upon deployment
            console.log('Auto-syncing business metadata to database...');
            await createAgentEntry(formData);
            
        } catch (err: any) {
            console.error('Vapi Error:', err);
            setErrorMessage('Vapi Deployment Error: ' + err.message);
        } finally {
            setIsConnectingVapi(false);
        }
    };

    const filteredNumbers = useMemo(() => {
        const source = provisionMode === 'search' ? allNumbers : inventoryNumbers;
        if (!searchQuery) return source;
        const cleanQuery = searchQuery.replace(/\+/g, '').replace(/\D/g, '');
        return source.filter(num => num.number.replace(/\D/g, '').includes(cleanQuery));
    }, [searchQuery, allNumbers, inventoryNumbers, provisionMode]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAdmin) return;
        if (!formData.agent_phone) {
            setErrorMessage('Please select or buy a phone number first.');
            return;
        }
        setIsSaving(true);
        const { error } = await createAgentEntry(formData);
        if (error) {
            setErrorMessage('Save Error: ' + error.message);
        } else {
            setSuccessMessage('Agent configuration synced to database!');
        }
        setIsSaving(false);
    };

    const handleSelectExisting = (num: string) => {
        setFormData({ ...formData, agent_phone: num });
        setShowNumberSearch(false);
        setVapiConnected(false);
        setSuccessMessage(`Selected existing number: ${num}`);
    };

    const handleBuyNumber = async (num: string) => {
        if (!isAdmin) return;
        if (!confirm(`Confirm purchase of ${num}?`)) return;
        setIsBuying(num);
        try {
            const response = await fetch(`/api/twilio/buy`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber: num })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Purchase failed');

            setFormData({ ...formData, agent_phone: data.phone_number });
            setShowNumberSearch(false);
            setVapiConnected(false);
            setSuccessMessage(`Number ${data.phone_number} purchased successfully!`);
        } catch (err: any) {
            setErrorMessage('Purchase Failed: ' + err.message);
        } finally {
            setIsBuying(null);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
            <Loader2 className="spinner" size={40} style={{ color: 'var(--primary)' }} />
        </div>
    );

    return (
        <div className="animate-up" style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
                        <Building2 size={24} style={{ color: 'var(--primary)' }} /> Agent Configuration
                    </h1>
                    <p className="page-subtitle">Assign phone numbers and sync location data to AI agents.</p>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px', marginBottom: '32px' }}>
                <form onSubmit={handleSave} style={{ display: 'grid', gap: '24px' }}>
                    <div className="card" style={{ padding: '32px', position: 'relative' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                            <div className="group">
                                <label className="input-label">Company Name</label>
                                <input className="search-input" style={{ height: '48px' }} value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} required />
                            </div>
                            <div className="group">
                                <label className="input-label">Company Name (Short)</label>
                                <input className="search-input" style={{ height: '48px' }} value={formData.company_name_small} onChange={(e) => setFormData({ ...formData, company_name_small: e.target.value })} required />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                            <div className="group">
                                <label className="input-label">Location State</label>
                                <input className="search-input" style={{ height: '48px' }} value={formData.location_state} onChange={(e) => setFormData({ ...formData, location_state: e.target.value })} required />
                            </div>
                            <div className="group">
                                <label className="input-label">Location City</label>
                                <input className="search-input" style={{ height: '48px' }} value={formData.locaion_city} onChange={(e) => setFormData({ ...formData, locaion_city: e.target.value })} required />
                            </div>
                        </div>

                        <div className="group" style={{ marginBottom: '32px' }}>
                            <label className="input-label">Company Address</label>
                            <textarea className="search-input" style={{ padding: '12px 16px', height: '80px', resize: 'none' }} value={formData.company_address} onChange={(e) => setFormData({ ...formData, company_address: e.target.value })} required />
                        </div>

                        {/* VAPI DEPLOYMENT BLOCK */}
                        <div style={{ marginBottom: '32px', padding: '24px', backgroundColor: 'var(--background)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div>
                                    <label className="input-label" style={{ margin: 0 }}>Active Agent Phone</label>
                                    <div style={{ fontSize: '18px', fontWeight: '800', color: formData.agent_phone ? 'var(--primary)' : 'var(--muted)', marginTop: '4px' }}>
                                        {formData.agent_phone || 'None Selected'}
                                    </div>
                                </div>
                                {formData.agent_phone && !vapiConnected && (
                                    <button 
                                        type="button" 
                                        onClick={handleConnectVapi}
                                        disabled={isConnectingVapi}
                                        className="btn btn-primary"
                                        style={{ height: '44px', background: 'linear-gradient(135deg, #FF4F81 0%, #FF814F 100%)', border: 'none', color: 'white', fontWeight: '700', padding: '0 20px' }}
                                    >
                                        {isConnectingVapi ? <Loader2 size={18} className="spinner" /> : <><Rocket size={18} style={{ marginRight: '8px' }} /> Deploy to Vapi</>}
                                    </button>
                                )}
                                {vapiConnected && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-completed)', fontWeight: '700', fontSize: '14px' }}>
                                        <Zap size={18} fill="currentColor" /> Live on Vapi
                                    </div>
                                )}
                            </div>
                            {formData.agent_phone && !vapiConnected && (
                                <p style={{ fontSize: '11px', color: 'var(--muted)', margin: 0 }}>
                                    Detected number. Click <b>Deploy to Vapi</b> to automatically link this number to your AI assistant.
                                </p>
                            )}
                        </div>
                    </div>
                </form>

                <div style={{ display: 'grid', gap: '24px' }}>
                    <div className="card" style={{ padding: '24px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <PackageOpen size={16} /> Current Live Sync
                        </h4>
                        {lastSubmission ? (
                            <div style={{ display: 'grid', gap: '12px' }}>
                                <div style={{ padding: '12px', backgroundColor: 'var(--background)', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Clinic Name</div>
                                    <div style={{ fontSize: '13px', fontWeight: '700' }}>{lastSubmission.company_name}</div>
                                </div>
                                <div style={{ padding: '12px', backgroundColor: 'var(--background)', borderRadius: '8px', borderLeft: '3px solid var(--primary)' }}>
                                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Live Agent Phone</div>
                                    <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--primary)' }}>{lastSubmission.agent_phone}</div>
                                </div>
                            </div>
                        ) : <p style={{ fontSize: '13px', color: 'var(--muted)' }}>No sync data found.</p>}
                    </div>

                    {(successMessage || errorMessage) && (
                        <div className="animate-in" style={{ padding: '20px', borderRadius: '16px', backgroundColor: errorMessage ? 'var(--status-cancelled-bg)' : 'var(--status-completed-bg)', color: errorMessage ? 'var(--status-cancelled)' : 'var(--status-completed)', border: '1px solid var(--border)', fontWeight: '700', fontSize: '14px' }}>
                            {successMessage || errorMessage}
                        </div>
                    )}
                </div>
            </div>

            {/* PHONE MANAGEMENT AREA */}
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '32px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0, color: 'var(--foreground)' }}>Twilio & Vapi Phone Management</h2>
                            <p style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '4px' }}>Purchase numbers from Twilio and instantly bridge them to Vapi agents.</p>
                        </div>
                        <button onClick={() => setShowNumberSearch(!showNumberSearch)} className="btn btn-secondary" style={{ padding: '0 24px', height: '44px' }}>
                            {showNumberSearch ? 'Hide Panel' : 'Manage Phone Inventory'}
                        </button>
                    </div>

                    {showNumberSearch && (
                        <div style={{ display: 'flex', gap: '32px', marginTop: '32px' }}>
                            <button onClick={() => setProvisionMode('search')} style={{ background: 'none', border: 'none', padding: '8px 0', borderBottom: provisionMode === 'search' ? '2px solid var(--primary)' : '2px solid transparent', color: provisionMode === 'search' ? 'var(--primary)' : 'var(--muted)', fontWeight: '700', cursor: 'pointer' }}>Search Store</button>
                            <button onClick={() => setProvisionMode('inventory')} style={{ background: 'none', border: 'none', padding: '8px 0', borderBottom: provisionMode === 'inventory' ? '2px solid var(--primary)' : '2px solid transparent', color: provisionMode === 'inventory' ? 'var(--primary)' : 'var(--muted)', fontWeight: '700', cursor: 'pointer' }}>My Inventory</button>
                        </div>
                    )}
                </div>

                {showNumberSearch && (
                    <div className="animate-in" style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                            {provisionMode === 'search' && (
                                <select className="search-input" style={{ width: '180px', height: '48px' }} value={selectedIso} onChange={(e) => setSelectedIso(e.target.value)}>
                                    {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                                </select>
                            )}
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                                <input className="search-input" style={{ height: '48px', paddingLeft: '48px' }} placeholder={provisionMode === 'search' ? "Search by area code or digits..." : "Filter purchased inventory..."} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                            </div>
                            {provisionMode === 'search' && (
                                <button onClick={() => handleSearchNumbers()} disabled={isSearching} className="btn btn-primary" style={{ padding: '0 32px' }}>
                                    {isSearching ? <Loader2 className="spinner" /> : 'Search Store'}
                                </button>
                            )}
                        </div>

                        <div style={{ borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ backgroundColor: 'var(--background)', fontSize: '12px', color: 'var(--muted)' }}>
                                    <tr>
                                        <th style={{ padding: '16px 24px' }}>Phone Number</th>
                                        <th style={{ padding: '16px 24px' }}>Vapi Sync</th>
                                        <th style={{ padding: '16px 24px' }}>Capabilities</th>
                                        <th style={{ padding: '16px 24px' }}>Price/Status</th>
                                        <th style={{ padding: '16px 24px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredNumbers.map((res: any) => (
                                        <tr key={res.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ fontWeight: '800', fontSize: '15px' }}>{res.number}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{res.locality}, {res.region}</div>
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                {res.assistantId ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FF4F81', fontSize: '12px', fontWeight: '800' }}>
                                                            <Zap size={14} fill="currentColor" /> LINKED
                                                        </div>
                                                        <div style={{ fontSize: '10px', color: 'var(--muted)', background: 'var(--background)', padding: '2px 8px', borderRadius: '4px', display: 'inline-block' }}>
                                                            {res.vapiName || res.assistantId}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div style={{ fontSize: '11px', color: 'var(--muted)', fontStyle: 'italic' }}>Not connected</div>
                                                )}
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ display: 'flex', gap: '12px' }}>
                                                    {res.capabilities.voice && <Mic size={14} style={{ color: 'var(--primary)' }} />}
                                                    {res.capabilities.sms && <MessageSquare size={14} style={{ color: 'var(--primary)' }} />}
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 24px', fontWeight: '700' }}>{provisionMode === 'inventory' ? 'Active' : res.price}</td>
                                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                                {provisionMode === 'inventory' ? (
                                                    <button onClick={() => handleSelectExisting(res.number)} className="btn btn-primary" style={{ padding: '8px 16px' }}>Use Number</button>
                                                ) : (
                                                    <button onClick={() => handleBuyNumber(res.number)} disabled={isBuying !== null} className="btn btn-primary" style={{ padding: '8px 16px' }}>
                                                        {isBuying === res.number ? <Loader2 className="spinner" /> : 'Purchase'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
