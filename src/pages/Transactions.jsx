import React, { useEffect, useState } from 'react';
import api from '../api/axiosInstance';
import { formatDateTime, formatCurrency } from '../utils/helpers';
import CustomSelect from '../components/CustomSelect';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get('/admin/transactions');
                setTransactions(res.data.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filtered = transactions.filter((t) => {
        const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
        const matchSearch = !search || 
            t.unit?.toLowerCase().includes(search.toLowerCase()) || 
            t.building?.toLowerCase().includes(search.toLowerCase()) ||
            t.transactionId?.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    // Pagination logic
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentTransactions = filtered.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter]);

    const totalVolume = filtered.filter((t) => t.status === 'paid').reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    const successCount = filtered.filter((t) => t.status === 'paid').length;
    const failedCount = filtered.filter((t) => t.status === 'overdue').length;

    if (loading) return <div className="loading-container"><div className="spinner" /><p>Loading transactions...</p></div>;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2 className="page-header__title">Transactions</h2>
                    <p className="page-header__subtitle">Monitor all payment transactions on the platform</p>
                </div>
            </div>

            {/* <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
                <div className="stat-card">
                    <div className="stat-card__icon" style={{ background: '#f0fdf4', color: '#22c55e' }}>✅</div>
                    <div className="stat-card__body">
                        <div className="stat-card__value">{successCount}</div>
                        <div className="stat-card__label">Successful</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__icon" style={{ background: '#fef2f2', color: '#ef4444' }}>❌</div>
                    <div className="stat-card__body">
                        <div className="stat-card__value">{failedCount}</div>
                        <div className="stat-card__label">Failed</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__icon" style={{ background: '#eff6ff', color: '#3b82f6', fontSize: '24px', fontWeight: 'bold' }}>Br</div>
                    <div className="stat-card__body">
                        <div className="stat-card__value" style={{ fontSize: 18 }}>{formatCurrency(totalVolume)}</div>
                        <div className="stat-card__label">Total Volume</div>
                    </div>
                </div>
            </div> */}

            <div className="filter-bar">
                <div className="search-input-wrap">
                    <span className="search-icon">🔍</span>
                    <input className="form-input" placeholder="Search by unit, building, or transaction ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <CustomSelect
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    options={[
                        { value: 'ALL', label: 'All Status' },
                        { value: 'pending', label: 'Pending' },
                        { value: 'paid', label: 'Paid' },
                        { value: 'overdue', label: 'Overdue' },
                        { value: 'cancelled', label: 'Cancelled' }
                    ]}
                    style={{ width: 'auto', minWidth: '180px' }}
                />
            </div>

            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr><th>Unit</th><th>Building</th><th>Tenant</th><th>Owner</th><th>Due Date</th><th>Paid Date</th><th>Status</th><th>Payment Method</th></tr>
                    </thead>
                    <tbody>
                        {currentTransactions.length === 0 ? (
                            <tr><td colSpan="8"><div className="empty-state"><div className="empty-state__icon">💳</div><div className="empty-state__text">No transactions found</div></div></td></tr>
                        ) : currentTransactions.map((t) => (
                            <tr key={t.id}>
                                <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{t.unit || 'N/A'}</td>
                                <td style={{ fontSize: 12, color: '#475569' }}>{t.building || 'N/A'}</td>
                                <td style={{ fontSize: 12, fontFamily: 'monospace' }}>{t.tenantPhone}</td>
                                <td style={{ fontSize: 12, fontFamily: 'monospace' }}>{t.ownerPhone}</td>
                                <td style={{ fontSize: 12, color: '#94a3b8' }}>{t.dueDate || 'N/A'}</td>
                                <td style={{ fontSize: 12, color: '#94a3b8' }}>{t.paidDate || '-'}</td>
                                <td>
                                    <span className={`status-badge ${
                                        t.status === 'paid' ? 'status-active' : 
                                        t.status === 'pending' ? 'status-pending' : 
                                        'status-terminated'
                                    }`}>
                                        {t.status?.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ fontSize: 12 }}>{t.paymentMethod || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                {filtered.length > itemsPerPage && (
                    <div className="pagination">
                        <button
                            className="pagination__btn"
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                className={`pagination__btn ${currentPage === page ? 'active' : ''}`}
                                onClick={() => handlePageChange(page)}
                            >
                                {page}
                            </button>
                        ))}
                        
                        <button
                            className="pagination__btn"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                )}

                {/* Results info */}
                {filtered.length > 0 && (
                    <div className="pagination-info">
                        Showing {startIndex + 1} to {Math.min(endIndex, filtered.length)} of {filtered.length} transactions
                    </div>
                )}
            </div>
        </div>
    );
};

export default Transactions;
