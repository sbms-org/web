import React, { useEffect, useState } from 'react';
import { getAuditLogs } from '../api/auditLogs';
import { formatDateTime, getStatusClass } from '../utils/helpers';
import CustomSelect from '../components/CustomSelect';

const ACTION_TYPES = ['ALL', 'USER_CREATED', 'BUILDING_UPDATED', 'PAYMENT_PROCESSED', 'SETTINGS_UPDATED', 'NOTIFICATION_SENT', 'REPORT_GENERATED', 'SYSTEM_ACTION'];

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState('ALL');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(15);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await getAuditLogs();
                setLogs(res.data.data || res.data);
            } catch (e) {
                setError('Failed to load audit logs');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    useEffect(() => {
        let data = logs;
        if (actionFilter !== 'ALL') data = data.filter((l) => l.action === actionFilter);
        if (dateFrom) data = data.filter((l) => new Date(l.created_at) >= new Date(dateFrom));
        if (dateTo) data = data.filter((l) => new Date(l.created_at) <= new Date(dateTo + 'T23:59:59'));
        if (search) {
            const q = search.toLowerCase();
            data = data.filter((l) =>
                l.phoneNumber?.toLowerCase().includes(q) ||
                l.user_id?.toLowerCase().includes(q) ||
                l.action?.toLowerCase().includes(q) ||
                l.entity?.toLowerCase().includes(q) ||
                l.details?.toLowerCase().includes(q) ||
                l.ip_address?.includes(q)
            );
        }
        setFiltered(data);
        setCurrentPage(1); // Reset to first page when filters change
    }, [logs, actionFilter, dateFrom, dateTo, search]);

    // Pagination logic
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentLogs = filtered.slice(startIndex, endIndex);

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

    const clearFilters = () => {
        setSearch(''); setActionFilter('ALL'); setDateFrom(''); setDateTo('');
    };

    if (loading) return <div className="loading-container"><div className="spinner" /><p>Loading audit logs...</p></div>;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2 className="page-header__title">Audit Logs</h2>
                    <p className="page-header__subtitle">Track all system activities and user actions ({logs.length} total records)</p>
                </div>
                <button className="btn btn-secondary" onClick={clearFilters}>🔄 Clear Filters</button>
            </div>

            {error && <div className="alert alert-error">⚠️ {error}</div>}

            <div className="filter-bar">
                <div className="search-input-wrap">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Search phone, action, role, IP..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <CustomSelect
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value)}
                    options={ACTION_TYPES.map(a => ({ value: a, label: a === 'ALL' ? 'All Actions' : a }))}
                    style={{ width: 'auto', minWidth: '180px' }}
                />
                <input type="date" className="form-input" style={{ width: 'auto' }} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} title="From date" />
                <input type="date" className="form-input" style={{ width: 'auto' }} value={dateTo} onChange={(e) => setDateTo(e.target.value)} title="To date" />
            </div>

            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Phone Number</th>
                            <th>Role</th>
                            <th>Action</th>
                            <th>Description</th>
                            <th>IP Address</th>
                            <th>Status</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentLogs.length === 0 ? (
                            <tr><td colSpan="7"><div className="empty-state"><div className="empty-state__icon">📋</div><div className="empty-state__text">No audit logs match your filters</div></div></td></tr>
                        ) : (
                            currentLogs.map((log, i) => (
                                <tr key={log.id}>
                                    <td style={{ fontWeight: 500, fontSize: 12 }}>{log.phoneNumber}</td>
                                    <td>
                                        <span className={`status-badge ${
                                            log.userRole === 'admin' ? 'status-terminated' : 
                                            log.userRole === 'owner' ? 'status-pending' : 
                                            log.userRole === 'tenant' ? 'status-active' : 'status-default'
                                        }`} style={{ fontSize: 11 }}>
                                            {log.userRole?.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="status-badge status-pending" style={{ fontSize: 11 }}>
                                            {log.action || 'N/A'}
                                        </span>
                                    </td>
                                    <td style={{ maxWidth: 260, fontSize: 12, color: '#64748b' }}>{log.entity} - {log.details}</td>
                                    <td style={{ fontSize: 11, fontFamily: 'monospace', color: '#64748b' }}>{log.ip_address}</td>
                                    <td>
                                        <span className="status-badge status-active" style={{ fontSize: 11 }}>
                                            SUCCESS
                                        </span>
                                    </td>
                                    <td style={{ fontSize: 11, color: '#64748b' }}>{formatDateTime(log.created_at)}</td>
                                </tr>
                            ))
                        )}
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
            </div>

            {/* Results info */}
            <div className="pagination-info">
                Showing {startIndex + 1} to {Math.min(endIndex, filtered.length)} of {filtered.length} entries
            </div>
        </div>
    );
};

export default AuditLogs;
