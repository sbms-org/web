import React, { useEffect, useState } from 'react';
import { getReports } from '../api/reports';
import { formatCurrency } from '../utils/helpers';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exportMsg, setExportMsg] = useState('');
    const [chartData, setChartData] = useState({});

    useEffect(() => {
        const load = async () => {
            try {
                generateReportCharts([]);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const generateReportCharts = (reportsData) => {
        setChartData({
            rentCollectionTrend: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Collection Rate (%)',
                    data: [85, 88, 82, 90, 87, 92, 89, 91, 86, 88, 90, 93],
                    borderColor: '#06b6d4',
                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            overdueAnalysis: {
                labels: ['0-30 Days', '31-60 Days', '61-90 Days', '90+ Days'],
                datasets: [{
                    data: [45, 25, 20, 10],
                    backgroundColor: ['#fbbf24', '#f59e0b', '#d97706', '#dc2626'],
                    borderWidth: 0
                }]
            },
            ownerStatusDistribution: {
                labels: ['Active', 'Suspended', 'Terminated', 'Pending'],
                datasets: [{
                    data: [75, 15, 5, 5],
                    backgroundColor: ['#06b6d4', '#f59e0b', '#ef4444', '#6b7280'],
                    borderWidth: 0
                }]
            },
            monthlyRevenue: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Revenue (ETB K)',
                    data: [5040, 5670, 5376, 6090, 5796, 6384],
                    backgroundColor: '#7c3aed',
                    borderColor: '#7c3aed',
                    borderWidth: 2
                }]
            },
            paymentMethods: {
                labels: ['Bank Transfer', 'Credit Card', 'Cash', 'Check'],
                datasets: [{
                    data: [40, 35, 15, 10],
                    backgroundColor: ['#06b6d4', '#7c3aed', '#10b981', '#f59e0b'],
                    borderWidth: 0
                }]
            },
            tenantActivity: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [
                    {
                        label: 'New Tenants',
                        data: [12, 8, 15, 10],
                        backgroundColor: '#06b6d4'
                    },
                    {
                        label: 'Departures',
                        data: [5, 3, 8, 6],
                        backgroundColor: '#ef4444'
                    }
                ]
            }
        });
    };

    const handleExport = (format, reportTitle) => {
        setExportMsg(`✅ ${reportTitle} exported as ${format} (mock)`);
        setTimeout(() => setExportMsg(''), 3000);
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 10,
                    font: {
                        size: 9
                    },
                    boxWidth: 10
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#374151',
                borderWidth: 1,
                titleFont: {
                    size: 10
                },
                bodyFont: {
                    size: 9
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 8
                    },
                    maxRotation: 45
                }
            },
            y: {
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                    font: {
                        size: 8
                    }
                }
            }
        },
        elements: {
            point: {
                radius: 2,
                hoverRadius: 3
            },
            line: {
                borderWidth: 2
            }
        }
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 8,
                    font: {
                        size: 8
                    },
                    boxWidth: 8
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#374151',
                borderWidth: 1,
                titleFont: {
                    size: 9
                },
                bodyFont: {
                    size: 8
                }
            }
        },
        cutout: '60%'
    };

    if (loading) return <div className="loading-container"><div className="spinner" /><p>Loading reports...</p></div>;

    const rentReport = reports.find((r) => r.type === 'RENT_COLLECTION');
    const overdueReport = reports.find((r) => r.type === 'OVERDUE_PAYMENTS');
    const ownerReport = reports.find((r) => r.type === 'OWNER_ACTIVITY');

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2 className="page-header__title">📊 Reports & Analytics</h2>
                    <p className="page-header__subtitle">Comprehensive insights with interactive visualizations</p>
                </div>
            </div>

            {exportMsg && <div className="alert alert-success">{exportMsg}</div>}

            {/* Analytics Charts Section */}
            <div className="analytics-grid" style={{ marginBottom: '2rem' }}>
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>📈 Rent Collection Trend</h3>
                    </div>
                    <div className="chart-container">
                        <Line data={chartData.rentCollectionTrend || { labels: [], datasets: [] }} options={chartOptions} />
                    </div>
                </div>

                <div className="chart-card">
                    <div className="chart-header">
                        <h3>⏰ Overdue Analysis</h3>
                    </div>
                    <div className="chart-container">
                        <Doughnut data={chartData.overdueAnalysis || { labels: [], datasets: [] }} options={doughnutOptions} />
                    </div>
                </div>

                <div className="chart-card">
                    <div className="chart-header">
                        <h3>👥 Owner Status Distribution</h3>
                    </div>
                    <div className="chart-container">
                        <Pie data={chartData.ownerStatusDistribution || { labels: [], datasets: [] }} options={doughnutOptions} />
                    </div>
                </div>

                <div className="chart-card">
                    <div className="chart-header">
                        <h3>💸 Monthly Revenue</h3>
                    </div>
                    <div className="chart-container">
                        <Bar data={chartData.monthlyRevenue || { labels: [], datasets: [] }} options={chartOptions} />
                    </div>
                </div>

                <div className="chart-card">
                    <div className="chart-header">
                        <h3>💳 Payment Methods</h3>
                    </div>
                    <div className="chart-container">
                        <Doughnut data={chartData.paymentMethods || { labels: [], datasets: [] }} options={doughnutOptions} />
                    </div>
                </div>

                <div className="chart-card">
                    <div className="chart-header">
                        <h3>🏠 Tenant Activity</h3>
                    </div>
                    <div className="chart-container">
                        <Bar data={chartData.tenantActivity || { labels: [], datasets: [] }} options={chartOptions} />
                    </div>
                </div>
            </div>

            {/* Rent Collection */}
            {rentReport && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                        <div>
                            <h3 className="card__title">💸 {rentReport.title}</h3>
                            <p className="card__subtitle">Period: {rentReport.period}</p>
                        </div>
                        <div className="action-btns">
                            <button className="btn btn-secondary btn-sm" onClick={() => handleExport('PDF', rentReport.title)}>📄 Export PDF</button>
                            <button className="btn btn-success btn-sm" onClick={() => handleExport('Excel', rentReport.title)}>📊 Export Excel</button>
                        </div>
                    </div>
                    <div className="stats-grid" style={{ marginBottom: 0 }}>
                        <div className="stat-card">
                            <div className="stat-card__icon" style={{ background: '#eff6ff', color: '#3b82f6', fontSize: '24px', fontWeight: 'bold' }}>Br</div>
                            <div className="stat-card__body">
                                <div className="stat-card__value" style={{ fontSize: 20 }}>{formatCurrency(rentReport.totalExpected)}</div>
                                <div className="stat-card__label">Total Expected</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card__icon" style={{ background: '#f0fdf4', color: '#22c55e' }}>✅</div>
                            <div className="stat-card__body">
                                <div className="stat-card__value" style={{ fontSize: 20 }}>{formatCurrency(rentReport.totalCollected)}</div>
                                <div className="stat-card__label">Total Collected</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card__icon" style={{ background: '#fffbeb', color: '#f59e0b' }}>📈</div>
                            <div className="stat-card__body">
                                <div className="stat-card__value" style={{ fontSize: 20 }}>{rentReport.collectionRate}%</div>
                                <div className="stat-card__label">Collection Rate</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card__icon" style={{ background: '#fef2f2', color: '#ef4444' }}>⚠️</div>
                            <div className="stat-card__body">
                                <div className="stat-card__value" style={{ fontSize: 20 }}>{formatCurrency(rentReport.overdueAmount)}</div>
                                <div className="stat-card__label">Overdue Amount</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card__icon" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>👥</div>
                            <div className="stat-card__body">
                                <div className="stat-card__value" style={{ fontSize: 20 }}>{rentReport.payingTenants}/{rentReport.totalTenants}</div>
                                <div className="stat-card__label">Paying / Total Tenants</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Overdue Payments */}
            {overdueReport && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                        <div>
                            <h3 className="card__title">⚠️ {overdueReport.title}</h3>
                            <p className="card__subtitle">Period: {overdueReport.period}</p>
                        </div>
                        <div className="action-btns">
                            <button className="btn btn-secondary btn-sm" onClick={() => handleExport('PDF', overdueReport.title)}>📄 Export PDF</button>
                            <button className="btn btn-success btn-sm" onClick={() => handleExport('Excel', overdueReport.title)}>📊 Export Excel</button>
                        </div>
                    </div>
                    <div className="stats-grid" style={{ marginBottom: 0 }}>
                        <div className="stat-card">
                            <div className="stat-card__icon" style={{ background: '#fef2f2', color: '#ef4444', fontSize: '24px', fontWeight: 'bold' }}>Br</div>
                            <div className="stat-card__body">
                                <div className="stat-card__value" style={{ fontSize: 20 }}>{formatCurrency(overdueReport.totalOverdue)}</div>
                                <div className="stat-card__label">Total Overdue</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card__icon" style={{ background: '#fffbeb', color: '#f59e0b' }}>📋</div>
                            <div className="stat-card__body">
                                <div className="stat-card__value" style={{ fontSize: 20 }}>{overdueReport.overdueCount}</div>
                                <div className="stat-card__label">Overdue Cases</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card__icon" style={{ background: '#f8fafc', color: '#64748b' }}>📅</div>
                            <div className="stat-card__body">
                                <div className="stat-card__value" style={{ fontSize: 20 }}>{overdueReport.avgOverdueDays}</div>
                                <div className="stat-card__label">Avg Overdue Days</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card__icon" style={{ background: '#fef2f2', color: '#ef4444' }}>🚨</div>
                            <div className="stat-card__body">
                                <div className="stat-card__value" style={{ fontSize: 20 }}>{overdueReport.highRiskTenants}</div>
                                <div className="stat-card__label">High-Risk Tenants</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Owner Activity */}
            {ownerReport && (
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                        <div>
                            <h3 className="card__title">👥 {ownerReport.title}</h3>
                            <p className="card__subtitle">Period: {ownerReport.period}</p>
                        </div>
                        <div className="action-btns">
                            <button className="btn btn-secondary btn-sm" onClick={() => handleExport('PDF', ownerReport.title)}>📄 Export PDF</button>
                            <button className="btn btn-success btn-sm" onClick={() => handleExport('Excel', ownerReport.title)}>📊 Export Excel</button>
                        </div>
                    </div>
                    <div className="stats-grid" style={{ marginBottom: 0 }}>
                        {[
                            { label: 'Active Owners', value: ownerReport.activeOwners, icon: '✅', bg: '#f0fdf4', c: '#22c55e' },
                            { label: 'Suspended', value: ownerReport.suspendedOwners, icon: '⏸', bg: '#fffbeb', c: '#f59e0b' },
                            { label: 'Terminated', value: ownerReport.terminatedOwners, icon: '🚫', bg: '#fef2f2', c: '#ef4444' },
                            { label: 'New This Month', value: ownerReport.newOwnersThisMonth, icon: '🆕', bg: '#eff6ff', c: '#3b82f6' },
                        ].map(({ label, value, icon, bg, c }) => (
                            <div key={label} className="stat-card">
                                <div className="stat-card__icon" style={{ background: bg, color: c }}>{icon}</div>
                                <div className="stat-card__body">
                                    <div className="stat-card__value" style={{ fontSize: 20 }}>{value}</div>
                                    <div className="stat-card__label">{label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
