import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../api/axiosInstance';
import { formatDateTime } from '../utils/helpers';
import CustomSelect from '../components/CustomSelect';

const NOTIF_TYPES = ['APP_UPDATE', 'TRANSACTION', 'LOGGED_IN', 'DUE_RENT', 'RECEIPT', 'PAID', 'REVOKE_TENANT', 'PASSWORD', 'APP_UPDATE_FORCE'];

const Notifications = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editTemplate, setEditTemplate] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [successMsg, setSuccessMsg] = useState('');
    const [saving, setSaving] = useState(false);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

    const load = async () => {
        try {
            const res = await api.get('/admin/notification-templates');
            setTemplates(res.data.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

    const filtered = templates.filter((t) => {
        const matchType = typeFilter === 'ALL' || t.template_key?.toLowerCase().includes(typeFilter.toLowerCase());
        const matchSearch = !search || 
            t.template_key?.toLowerCase().includes(search.toLowerCase()) ||
            t.title?.toLowerCase().includes(search.toLowerCase()) ||
            t.message_template?.toLowerCase().includes(search.toLowerCase());
        return matchType && matchSearch;
    });

    const openEdit = (t) => {
        setEditTemplate(t);
        setValue('template_key', t.template_key);
        setValue('title', t.title);
        setValue('message_template', t.message_template);
        setValue('target_role', t.target_role);
        setValue('is_active', t.is_active);
        setShowModal(true);
    };

    const onSubmitCreate = async (data) => {
        setSaving(true);
        try {
            await api.post('/admin/notification-templates', { 
                template_key: data.template_key,
                title: data.title,
                message_template: data.message_template,
                target_role: data.target_role || 'tenant',
                is_active: true
            });
            showSuccess('Template created!');
            setShowModal(false); 
            reset();
            load();
        } finally { setSaving(false); }
    };

    const onSubmitEdit = async (data) => {
        setSaving(true);
        try {
            await api.put(`/admin/notification-templates/${editTemplate.id}`, { 
                template_key: data.template_key,
                title: data.title,
                message_template: data.message_template,
                target_role: data.target_role,
                is_active: data.is_active
            });
            showSuccess('Template updated!');
            setEditTemplate(null); 
            reset();
            load();
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        setSaving(true);
        try {
            await api.delete(`/admin/notification-templates/${deleteTarget.id}`);
            showSuccess('Template deleted!');
            setDeleteTarget(null); load();
        } finally { setSaving(false); }
    };

    if (loading) return <div className="loading-container"><div className="spinner" /><p>Loading...</p></div>;

    const TemplateForm = ({ onSubmit: onFormSubmit, submitLabel }) => (
        <form onSubmit={handleSubmit(onFormSubmit)}>
            <div className="form-group">
                <label className="form-label">Template Key *</label>
                <input className={`form-input ${errors.template_key ? 'error' : ''}`} {...register('template_key', { required: 'Required' })} placeholder="e.g. payment_due_5days" />
                {errors.template_key && <p className="form-error">{errors.template_key.message}</p>}
            </div>
            <div className="form-group">
                <label className="form-label">Title *</label>
                <input className={`form-input ${errors.title ? 'error' : ''}`} {...register('title', { required: 'Required' })} placeholder="e.g. Payment Due in 5 Days" />
                {errors.title && <p className="form-error">{errors.title.message}</p>}
            </div>
            <div className="form-group">
                <label className="form-label">Message Template *</label>
                <textarea className={`form-textarea ${errors.message_template ? 'error' : ''}`} {...register('message_template', { required: 'Required' })} placeholder="Use {{variable_name}} for placeholders. e.g. Your rent of ETB {{amount}} is due on {{due_date}}" rows={4} />
                {errors.message_template && <p className="form-error">{errors.message_template.message}</p>}
            </div>
            <div className="form-group">
                <label className="form-label">Target Role *</label>
                <select className="form-input" {...register('target_role')}>
                    <option value="tenant">Tenant</option>
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                    <option value="all">All</option>
                </select>
            </div>
            <div className="form-group">
                <label className="form-label">
                    <input type="checkbox" {...register('is_active')} style={{ marginRight: '8px' }} />
                    Active
                </label>
            </div>
            <div className="modal__footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setEditTemplate(null); reset(); }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : submitLabel}</button>
            </div>
        </form>
    );

    return (
        <div>
            {successMsg && <div className="alert alert-success">✅ {successMsg}</div>}
            <div className="page-header">
                <div>
                    <h2 className="page-header__title">Notification Templates</h2>
                    <p className="page-header__subtitle">Manage system notification messages</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setShowModal(true); reset(); }}>+ New Template</button>
            </div>

            <div className="filter-bar">
                <div className="search-input-wrap">
                    <span className="search-icon">🔍</span>
                    <input className="form-input" placeholder="Search templates..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <CustomSelect
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    options={[
                        { value: 'ALL', label: 'All Types' },
                        ...NOTIF_TYPES.map(t => ({ value: t, label: t }))
                    ]}
                    style={{ width: 'auto', minWidth: '180px' }}
                />
            </div>

            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Template Key</th>
                            <th>Title</th>
                            <th>Message</th>
                            <th>Target Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan="6"><div className="empty-state"><div className="empty-state__icon">🔔</div><div className="empty-state__text">No templates found</div></div></td></tr>
                        ) : filtered.map((t) => (
                            <tr key={t.id}>
                                <td><span className="status-badge status-pending">{t.template_key}</span></td>
                                <td style={{ fontSize: 13, color: '#475569' }}>{t.title}</td>
                                <td style={{ maxWidth: 320, fontSize: 13, color: '#64748b' }}>{t.message_template}</td>
                                <td><span className="status-badge status-default">{t.target_role}</span></td>
                                <td><span className={`status-badge ${t.is_active ? 'status-active' : 'status-inactive'}`}>{t.is_active ? 'Active' : 'Inactive'}</span></td>
                                <td>
                                    <div className="action-btns">
                                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(t)}>✏️ Edit</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(t)}>🗑 Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal__header">
                            <h3 className="modal__title">New Notification Template</h3>
                            <button className="modal__close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <TemplateForm onSubmit={onSubmitCreate} submitLabel="Create Template" />
                    </div>
                </div>
            )}

            {editTemplate && (
                <div className="modal-overlay" onClick={() => setEditTemplate(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal__header">
                            <h3 className="modal__title">Edit Template</h3>
                            <button className="modal__close" onClick={() => setEditTemplate(null)}>×</button>
                        </div>
                        <TemplateForm onSubmit={onSubmitEdit} submitLabel="Save Changes" />
                    </div>
                </div>
            )}

            {deleteTarget && (
                <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal__header">
                            <h3 className="modal__title" style={{ color: '#dc2626' }}>Delete Template</h3>
                            <button className="modal__close" onClick={() => setDeleteTarget(null)}>×</button>
                        </div>
                        <p className="confirm-message">Are you sure you want to delete the <strong>{deleteTarget.template_key}</strong> template? This action cannot be undone.</p>
                        <div className="modal__footer">
                            <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={handleDelete} disabled={saving}>{saving ? 'Deleting...' : 'Delete'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;
