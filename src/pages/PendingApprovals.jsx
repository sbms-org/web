import React, { useEffect, useState } from 'react';
import api from '../api/axiosInstance';
import { formatDate, getStatusClass } from '../utils/helpers';
import toast from 'react-hot-toast';

const PendingApprovals = () => {
    const [owners, setOwners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);

    useEffect(() => {
        loadPendingOwners();
    }, []);

    const loadPendingOwners = async () => {
        try {
            const res = await api.get('/admin/owners/pending');
            setOwners(res.data.data || []);
        } catch (e) {
            toast.error('Failed to load pending approvals');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (owner) => {
        setProcessing(owner.id);
        try {
            const res = await api.post(`/admin/owners/${owner.id}/approve`);
            toast.success(`Approved: ${owner.fullName}`);
            const removedId = res.data?.data?.id || owner.id;
            setOwners((prev) => prev.filter((o) => o.id !== removedId));
        } catch (e) {
            toast.error('Failed to approve');
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (owner) => {
        setProcessing(owner.id);
        try {
            const res = await api.post(`/admin/owners/${owner.id}/reject`);
            toast.success(`Rejected: ${owner.fullName}`);
            const removedId = res.data?.data?.id || owner.id;
            setOwners((prev) => prev.filter((o) => o.id !== removedId));
        } catch (e) {
            toast.error('Failed to reject');
        } finally {
            setProcessing(null);
        }
    };

    const handleApproveAll = async () => {
        for (const owner of owners) {
            await handleApprove(owner);
        }
    };

    if (loading) return <div className="loading-container"><div className="spinner" /><p>Loading pending approvals...</p></div>;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2 className="page-header__title">Pending Approvals</h2>
                    <p className="page-header__subtitle">Approve or reject new building owner registrations ({owners.length} pending)</p>
                </div>
                {owners.length > 0 && (
                    <button className="btn btn-primary" onClick={handleApproveAll} disabled={!!processing}>
                        ✓ Approve All
                    </button>
                )}
            </div>

            {owners.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 60 }}>
                    <div className="empty-state__icon" style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                    <h3 style={{ marginBottom: 8, color: 'var(--text-primary)' }}>No Pending Approvals</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>All owner registrations have been reviewed. New registrations will appear here.</p>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Owner</th>
                                <th>Mobile Number</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Requested</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {owners.map((owner) => (
                                <tr key={owner.id}>
                                    <td>
                                        <div className="owner-cell">
                                            <div>
                                                <p className="owner-name">{owner.fullName}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{owner.mobileNumber}</td>
                                    <td>{owner.email}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(owner.status)}`}>
                                            {owner.status}
                                        </span>
                                    </td>
                                    <td>{formatDate(owner.requestedAt)}</td>
                                    <td>
                                        <div className="action-btns">
                                            <button
                                                className="btn btn-success btn-sm"
                                                onClick={() => handleApprove(owner)}
                                                disabled={processing === owner.id}
                                            >
                                                {processing === owner.id ? '⏳' : '✓'} Approve
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleReject(owner)}
                                                disabled={processing === owner.id}
                                            >
                                                {processing === owner.id ? '⏳' : '✗'} Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default PendingApprovals;
