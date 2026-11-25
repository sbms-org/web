import React, { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiDownload } from 'react-icons/fi';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';
import CustomSelect from '../components/CustomSelect';

const PaymentMethods = () => {
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [filteredMethods, setFilteredMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingMethod, setEditingMethod] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'BANK',
        account_number: '',
        account_name: '',
        bank_name: '',
        provider: '',
        instructions: '',
        account_number_hint: '',
        account_name_hint: '',
        mobile_number_hint: ''
    });

    useEffect(() => {
        loadPaymentMethods();
    }, []);

    useEffect(() => {
        filterMethods();
    }, [search, paymentMethods]);

    const loadPaymentMethods = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/payment-methods');
            setPaymentMethods(response.data.data);
        } catch (error) {
            console.error('Error loading payment methods:', error);
            toast.error('Failed to load payment methods');
        } finally {
            setLoading(false);
        }
    };

    const filterMethods = () => {
        if (!search) {
            setFilteredMethods(paymentMethods);
            return;
        }

        const query = search.toLowerCase();
        const filtered = paymentMethods.filter(method =>
            method.name?.toLowerCase().includes(query) ||
            method.bank_name?.toLowerCase().includes(query) ||
            method.account_number?.toLowerCase().includes(query) ||
            method.type?.toLowerCase().includes(query)
        );
        setFilteredMethods(filtered);
    };

    const handleExport = () => {
        toast.success('Export feature coming soon');
    };

    const handleOpenCreate = () => {
        setEditingMethod(null);
        setFormData({
            name: '',
            type: 'BANK',
            account_number: '',
            account_name: '',
            bank_name: '',
            provider: '',
            instructions: '',
            account_number_hint: '',
            account_name_hint: '',
            mobile_number_hint: ''
        });
        setShowModal(true);
    };

    const handleOpenEdit = (method) => {
        setEditingMethod(method);
        setFormData({
            name: method.name || '',
            type: method.type || 'BANK',
            account_number: method.account_number || '',
            account_name: method.account_name || '',
            bank_name: method.bank_name || '',
            provider: method.provider || '',
            instructions: method.instructions || '',
            account_number_hint: method.account_number_hint || '',
            account_name_hint: method.account_name_hint || '',
            mobile_number_hint: method.mobile_number_hint || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.type) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            if (editingMethod) {
                await api.put(`/admin/payment-methods/${editingMethod.id}`, formData);
                toast.success('Payment method updated successfully!');
            } else {
                await api.post('/admin/payment-methods', formData);
                toast.success('Payment method added successfully!');
            }
            setShowModal(false);
            loadPaymentMethods();
        } catch (error) {
            console.error('Error saving payment method:', error);
            toast.error('Failed to save payment method');
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;

        try {
            await api.delete(`/admin/payment-methods/${deleteTarget.id}`);
            toast.success('Payment method deleted successfully!');
            setShowDeleteModal(false);
            setDeleteTarget(null);
            loadPaymentMethods();
        } catch (error) {
            console.error('Error deleting payment method:', error);
            toast.error('Failed to delete payment method');
        }
    };

    const toggleStatus = async (method) => {
        try {
            await api.patch(`/admin/payment-methods/${method.id}/toggle`);
            toast.success(`Payment method ${method.is_active ? 'disabled' : 'enabled'}!`);
            loadPaymentMethods();
        } catch (error) {
            console.error('Error toggling status:', error);
            toast.error('Failed to update status');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading payment methods...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2 className="page-header__title">Payment Methods, {paymentMethods.length} Supported Banks</h2>
                    <p className="page-header__subtitle">
                        Manage all Bank Payment Methods for Tenants. Showing Account number format related to a bank.
                    </p>
                </div>
                <div className="action-btns">
                    <button className="btn btn-secondary" onClick={handleExport}>
                        <FiDownload /> Export
                    </button>
                    <button className="btn btn-primary" onClick={handleOpenCreate}>
                        <FiPlus /> Add New Bank Support
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="filter-bar">
                    <div className="search-input-wrap">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-secondary">
                        🛠️ SUPPORT
                    </button>
                </div>

                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Bank Name</th>
                                <th>Hint/Format</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMethods.length === 0 ? (
                                <tr>
                                    <td colSpan="5">
                                        <div className="empty-state">
                                            <div className="empty-state__icon">🏦</div>
                                            <div className="empty-state__text">
                                                {search ? 'No payment methods match your search' : 'No payment methods found'}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredMethods.map((method) => (
                                    <tr key={method.id}>
                                        <td>
                                            <span style={{ fontWeight: 600, color: '#0f172a' }}>
                                                {method.name}
                                            </span>
                                        </td>
                                        <td>{method.bank_name || method.provider || 'N/A'}</td>
                                        <td style={{ fontFamily: 'monospace', fontSize: 13, color: '#64748b' }}>
                                            {method.account_number_hint || method.mobile_number_hint || 'N/A'}
                                        </td>
                                        <td>
                                            <span className={`status-badge ${method.is_active ? 'status-active' : 'status-suspended'
                                                }`}>
                                                {method.is_active ? 'ACTIVE' : 'INACTIVE'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-btns">
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => handleOpenEdit(method)}
                                                    title="Edit"
                                                >
                                                    <FiEdit2 size={14} />
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => {
                                                        setDeleteTarget(method);
                                                        setShowDeleteModal(true);
                                                    }}
                                                    title="Delete"
                                                >
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {filteredMethods.length > 0 && (
                    <div style={{ marginTop: 16, fontSize: 13, color: '#94a3b8', textAlign: 'right' }}>
                        Showing {filteredMethods.length} of {paymentMethods.length} entries
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal__header">
                            <h2 className="modal__title">
                                {editingMethod ? 'Edit Payment Method' : 'Add New Bank Support'}
                            </h2>
                            <button className="modal__close" onClick={() => setShowModal(false)}>
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Display Name *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., Commercial Bank of Ethiopia"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Payment Type *</label>
                                <CustomSelect
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    options={[
                                        { value: 'BANK', label: 'BANK' },
                                        { value: 'MOBILE_MONEY', label: 'MOBILE_MONEY' },
                                        { value: 'CASH', label: 'CASH' }
                                    ]}
                                />
                            </div>

                            {formData.type === 'BANK' && (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">Bank Name</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="e.g., Commercial Bank of Ethiopia"
                                            value={formData.bank_name}
                                            onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Account Number Hint</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="e.g., 1000XXXXXXXXX"
                                            value={formData.account_number_hint}
                                            onChange={(e) => setFormData({ ...formData, account_number_hint: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Account Name Hint</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="e.g., John Doe"
                                            value={formData.account_name_hint}
                                            onChange={(e) => setFormData({ ...formData, account_name_hint: e.target.value })}
                                        />
                                    </div>
                                </>
                            )}

                            {formData.type === 'MOBILE_MONEY' && (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">Provider</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="e.g., Telebirr"
                                            value={formData.provider}
                                            onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Mobile Number Hint</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="e.g., 09XXXXXXXX"
                                            value={formData.mobile_number_hint}
                                            onChange={(e) => setFormData({ ...formData, mobile_number_hint: e.target.value })}
                                        />
                                    </div>
                                </>
                            )}

                            <div className="form-group">
                                <label className="form-label">Instructions / Additional Info</label>
                                <textarea
                                    className="form-input"
                                    rows="3"
                                    placeholder="Any notes or instructions..."
                                    value={formData.instructions}
                                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="modal__footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingMethod ? 'Update' : 'Add'} Bank Support
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && deleteTarget && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal__header">
                            <h2 className="modal__title">Confirm Delete</h2>
                            <button className="modal__close" onClick={() => setShowDeleteModal(false)}>
                                ×
                            </button>
                        </div>
                        <div className="confirm-message">
                            Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
                            This action cannot be undone.
                        </div>
                        <div className="modal__footer">
                            <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" onClick={handleDelete}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentMethods;
