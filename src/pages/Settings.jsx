import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { getSettings, updateSettings } from '../api/settings';
import api from '../api/axiosInstance';

const Settings = () => {
    const [settings, setSettings] = useState(null);
    const [templates, setTemplates] = useState([]);
    const [activeTab, setActiveTab] = useState('payment');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const { register, handleSubmit, reset } = useForm();

    useEffect(() => {
        const load = async () => {
            try {
                const [sRes, tRes] = await Promise.all([
                    api.get('/admin/settings'),
                    api.get('/admin/notification-templates'),
                ]);
                const settingsData = sRes.data.data;
                setSettings(settingsData);
                setTemplates(tRes.data.data || []);
                reset({
                    dueDay: settingsData.paymentCycle?.dueDay,
                    gracePeriodDays: settingsData.paymentCycle?.grace_period_days,
                    lateFeePercentage: settingsData.paymentCycle?.late_payment_fee,
                    rentDueReminderDays: settingsData.notifications?.rentDueReminderDays,
                    emailEnabled: settingsData.notifications?.notification_email_enabled === 'true',
                    smsEnabled: settingsData.notifications?.notification_sms_enabled === 'true',
                    inAppEnabled: settingsData.notifications?.inAppEnabled,
                    maintenanceMode: settingsData.system?.maintenance_mode === 'true',
                    maxLoginAttempts: settingsData.system?.maxLoginAttempts,
                    sessionTimeout: settingsData.system?.session_timeout_minutes,
                    twoFactorAuth: settingsData.system?.twoFactorAuth,
                });
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const onSubmit = async (data) => {
        setSaving(true);
        try {
            const updated = {
                paymentCycle: {
                    ...settings.paymentCycle,
                    dueDay: Number(data.dueDay),
                    grace_period_days: Number(data.gracePeriodDays),
                    late_payment_fee: parseFloat(data.lateFeePercentage),
                },
                notifications: {
                    rentDueReminderDays: Number(data.rentDueReminderDays),
                    notification_email_enabled: String(Boolean(data.emailEnabled)),
                    notification_sms_enabled: String(Boolean(data.smsEnabled)),
                    inAppEnabled: Boolean(data.inAppEnabled),
                },
                system: {
                    ...settings.system,
                    maintenance_mode: String(Boolean(data.maintenanceMode)),
                    maxLoginAttempts: Number(data.maxLoginAttempts),
                    session_timeout_minutes: Number(data.sessionTimeout),
                    twoFactorAuth: Boolean(data.twoFactorAuth),
                },
            };
            await api.put('/admin/settings', updated);
            setSettings(updated);
            setSuccessMsg('Settings saved successfully!');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="loading-container"><div className="spinner" /><p>Loading settings...</p></div>;

    return (
        <div>
            {successMsg && <div className="alert alert-success">✅ {successMsg}</div>}

            <div className="page-header">
                <div>
                    <h2 className="page-header__title">System Settings</h2>
                    <p className="page-header__subtitle">Configure platform-wide parameters</p>
                </div>
            </div>

            <div className="tabs">
                {[
                    { key: 'payment', label: '💳 Payment Cycles' },
                    { key: 'notifications', label: '🔔 Notifications' },
                    { key: 'system', label: '⚙️ System Parameters' },
                    { key: 'templates', label: '📝 Templates' },
                ].map(({ key, label }) => (
                    <button key={key} className={`tab-btn ${activeTab === key ? 'active' : ''}`} onClick={() => setActiveTab(key)}>
                        {label}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                {activeTab === 'payment' && (
                    <div className="card" style={{ maxWidth: 600 }}>
                        <h3 className="card__title" style={{ marginBottom: 20 }}>Payment Cycle Configuration</h3>
                        <div className="form-group">
                            <label className="form-label">Rent Due Day (of month)</label>
                            <input type="number" className="form-input" {...register('dueDay')} min="1" max="31" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Grace Period (days)</label>
                            <input type="number" className="form-input" {...register('gracePeriodDays')} min="0" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Late Fee (%)</label>
                            <input type="number" step="0.1" className="form-input" {...register('lateFeePercentage')} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Currency</label>
                            <input className="form-input" value={settings?.paymentCycle?.currency || 'ETB'} disabled style={{ background: '#f8fafc', cursor: 'not-allowed' }} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Accepted Payment Methods</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {settings?.paymentCycle?.paymentMethods?.map((m) => (
                                    <span key={m} className="status-badge status-active">{m}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="card" style={{ maxWidth: 600 }}>
                        <h3 className="card__title" style={{ marginBottom: 20 }}>Notification Settings</h3>
                        <div className="form-group">
                            <label className="form-label">Rent Due Reminder (days before)</label>
                            <input type="number" className="form-input" {...register('rentDueReminderDays')} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
                            {[
                                { key: 'emailEnabled', label: '📧 Email Notifications' },
                                { key: 'smsEnabled', label: '📱 SMS Notifications' },
                                { key: 'inAppEnabled', label: '🔔 In-App Notifications' },
                            ].map(({ key, label }) => (
                                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', fontSize: 15, fontWeight: 500, color: '#0f172a' }}>
                                    <input type="checkbox" {...register(key)} style={{ width: 18, height: 18, accentColor: '#6366f1' }} />
                                    {label}
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'system' && (
                    <div className="card" style={{ maxWidth: 600 }}>
                        <h3 className="card__title" style={{ marginBottom: 20 }}>System Parameters</h3>
                        <div className="alert alert-warning" style={{ marginBottom: 20 }}>
                            ⚠️ Changing these settings affects all platform users immediately.
                        </div>
                        <div className="form-group">
                            <label className="form-label">Max Login Attempts</label>
                            <input type="number" className="form-input" {...register('maxLoginAttempts')} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Session Timeout (minutes)</label>
                            <input type="number" className="form-input" {...register('sessionTimeout')} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
                            {[
                                { key: 'maintenanceMode', label: '🔧 Maintenance Mode' },
                                { key: 'twoFactorAuth', label: '🔐 Two-Factor Authentication' },
                            ].map(({ key, label }) => (
                                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', fontSize: 15, fontWeight: 500, color: '#0f172a' }}>
                                    <input type="checkbox" {...register(key)} style={{ width: 18, height: 18, accentColor: '#6366f1' }} />
                                    {label}
                                </label>
                            ))}
                        </div>
                        <div style={{ marginTop: 16, padding: '14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13, color: '#64748b' }}>
                            <strong>App Version:</strong> {settings?.system?.appVersion} &nbsp;|&nbsp;
                            <strong>API Rate Limit:</strong> {settings?.system?.apiRateLimit} req/min
                        </div>
                    </div>
                )}

                {activeTab === 'templates' && (
                    <div>
                        <div className="alert alert-info">📝 Notification templates are managed on the Notifications page.</div>
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Type</th><th>Status</th><th>Channels</th><th>Repeat</th><th>Template</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {templates.map((t) => (
                                        <tr key={t.id}>
                                            <td><span className="status-badge status-pending">{t.type}</span></td>
                                            <td>{t.status}</td>
                                            <td>{t.channels?.join(', ')}</td>
                                            <td><span className={`status-badge ${t.repeatNotifying === 'ENABLED' ? 'status-active' : 'status-default'}`}>{t.repeatNotifying}</span></td>
                                            <td style={{ maxWidth: 260, fontSize: 12, color: '#64748b' }}>{t.formatWithPlaceholder}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab !== 'templates' && (
                    <div style={{ marginTop: 24 }}>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? '⏳ Saving...' : '💾 Save Settings'}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default Settings;
