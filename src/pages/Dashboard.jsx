import React, { useState, useEffect } from 'react';
import { FiUsers, FiHome, FiClock, FiDollarSign } from 'react-icons/fi';
import api from '../api/axiosInstance';
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
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import './Dashboard.css';

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

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOwners: 0,
    totalBuildings: 0,
    pendingApprovals: 0,
    monthlyRevenue: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    latePaymentRate: { labels: [], datasets: [] },
    paymentProcessingTime: { labels: [], datasets: [] },
    activeTenants: { labels: [], datasets: [] },
    revenuePerBuilding: { labels: [], datasets: [] },
    rejectionRate: { labels: [], datasets: [] },
    weeklyActivity: { labels: [], datasets: [] },
    recurringRevenue: { labels: [], datasets: [] },
    paymentVolume: { labels: [], datasets: [] },
    transactionSuccess: { labels: [], datasets: [] },
    paymentMethods: { labels: [], datasets: [] },
    revenue: { labels: [], datasets: [] },
    occupancyRate: { labels: [], datasets: [] },
    buildingTypes: { labels: [], datasets: [] }
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats, audit logs, and chart data
      const [dashboardRes, logsRes, chartsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/audit-logs'),
        api.get('/admin/charts')
      ]);
      
      const dashboardData = dashboardRes.data.data;
      const logs = logsRes.data.data;
      const charts = chartsRes.data.data;
      
      setStats({
        totalOwners: dashboardData.totalOwners,
        totalBuildings: dashboardData.totalBuildings,
        pendingApprovals: dashboardData.pendingApprovals,
        monthlyRevenue: dashboardData.monthlyRevenue
      });
      
      setRecentActivity(logs.slice(0, 5));
      
      // Process chart data
      processChartData(charts);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      generateChartData(); // Fallback to mock data
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (charts) => {
    // Revenue chart
    const revenueLabels = charts.revenue.map(r => {
      const [year, month] = r.month.split('-');
      return new Date(year, month - 1).toLocaleDateString('en', { month: 'short' });
    });
    const revenueValues = charts.revenue.map(r => parseFloat(r.revenue) || 0);

    // Late payment rate chart
    const lateLabels = charts.latePayments.map(r => {
      const [year, month] = r.month.split('-');
      return new Date(year, month - 1).toLocaleDateString('en', { month: 'short' });
    });
    const lateRates = charts.latePayments.map(r => {
      const total = parseInt(r.total) || 1;
      const late = parseInt(r.late) || 0;
      return ((late / total) * 100).toFixed(1);
    });

    // Occupancy rate chart
    const occupancyLabels = charts.occupancy.map(r => {
      const [year, month] = r.month.split('-');
      return new Date(year, month - 1).toLocaleDateString('en', { month: 'short' });
    });
    const occupancyRates = charts.occupancy.map(r => {
      const total = parseInt(r.total_units) || 1;
      const occupied = parseInt(r.occupied) || 0;
      return ((occupied / total) * 100).toFixed(1);
    });

    // Building types chart
    const buildingLabels = charts.buildingTypes.map(b => b.type || 'Unknown');
    const buildingCounts = charts.buildingTypes.map(b => parseInt(b.count) || 0);

    // Active tenants
    const tenantLabels = charts.activeTenants?.map(t => {
      const [year, month] = t.month.split('-');
      return new Date(year, month - 1).toLocaleDateString('en', { month: 'short' });
    }) || [];
    const tenantCounts = charts.activeTenants?.map(t => parseInt(t.count) || 0) || [];

    // Revenue per building
    const buildingRevenueLabels = charts.revenuePerBuilding?.map(b => b.name) || [];
    const buildingRevenueValues = charts.revenuePerBuilding?.map(b => parseFloat(b.revenue) / 1000 || 0) || [];

    // Rejection rate
    const rejectionLabels = charts.rejectionRate?.map(r => {
      const [year, month] = r.month.split('-');
      return new Date(year, month - 1).toLocaleDateString('en', { month: 'short' });
    }) || [];
    const rejectionRates = charts.rejectionRate?.map(r => {
      const total = parseInt(r.total) || 1;
      const rejected = parseInt(r.rejected) || 0;
      return ((rejected / total) * 100).toFixed(1);
    }) || [];

    // Weekly activity
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const weeklyLabels = dayOrder.map(d => d.substring(0, 3));
    const weeklyData = dayOrder.map(day => {
      const found = charts.weeklyActivity?.find(w => w.day === day);
      return found ? parseInt(found.count) : 0;
    });

    // Payment methods
    const methodLabels = charts.paymentMethods?.map(m => m.method || 'Unknown') || [];
    const methodCounts = charts.paymentMethods?.map(m => parseInt(m.count) || 0) || [];

    // Payment volume
    const volumeLabels = charts.paymentVolume?.map(v => {
      const [year, month] = v.month.split('-');
      return new Date(year, month - 1).toLocaleDateString('en', { month: 'short' });
    }) || [];
    const volumeCounts = charts.paymentVolume?.map(v => parseInt(v.count) || 0) || [];

    setChartData({
      latePaymentRate: {
        labels: lateLabels,
        datasets: [{
          label: 'Late Payment Rate (%)',
          data: lateRates,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      revenue: {
        labels: revenueLabels,
        datasets: [{
          label: 'Revenue (ETB)',
          data: revenueValues,
          backgroundColor: '#10b981',
          borderColor: '#10b981',
          borderWidth: 1
        }]
      },
      occupancyRate: {
        labels: occupancyLabels,
        datasets: [{
          label: 'Occupancy Rate (%)',
          data: occupancyRates,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      buildingTypes: {
        labels: buildingLabels,
        datasets: [{
          label: 'Buildings',
          data: buildingCounts,
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
          borderWidth: 0
        }]
      },
      paymentProcessingTime: { labels: [], datasets: [] },
      activeTenants: {
        labels: tenantLabels,
        datasets: [{
          label: 'Active Tenants',
          data: tenantCounts,
          borderColor: '#7c3aed',
          backgroundColor: 'rgba(124, 58, 237, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      recurringRevenue: { labels: [], datasets: [] },
      revenuePerBuilding: {
        labels: buildingRevenueLabels,
        datasets: [{
          label: 'Revenue (ETB K)',
          data: buildingRevenueValues,
          borderColor: '#06b6d4',
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      rejectionRate: {
        labels: rejectionLabels,
        datasets: [{
          label: 'Rejection Rate (%)',
          data: rejectionRates,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      weeklyActivity: {
        labels: weeklyLabels,
        datasets: [{
          label: 'Payments',
          data: weeklyData,
          backgroundColor: '#7c3aed'
        }]
      },
      paymentMethods: {
        labels: methodLabels,
        datasets: [{
          data: methodCounts,
          backgroundColor: ['#7c3aed', '#06b6d4', '#f59e0b', '#ef4444'],
          borderWidth: 0
        }]
      },
      paymentVolume: {
        labels: volumeLabels,
        datasets: [{
          label: 'Payment Volume',
          data: volumeCounts,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      transactionSuccess: { labels: [], datasets: [] }
    });
  };

  const generateChartData = () => {
    setChartData({
      latePaymentRate: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Late Payment Rate (%)',
          data: [5, 12, 8, 15, 22, 18, 25, 20, 16, 12, 8, 14],
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      paymentProcessingTime: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
        datasets: [{
          label: 'Processing Time (hours)',
          data: [24, 18, 22, 16, 20, 14],
          borderColor: '#06b6d4',
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      activeTenants: {
        labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
        datasets: [
          {
            label: 'Active Tenants',
            data: [320, 380, 420, 350, 480, 520, 580],
            borderColor: '#7c3aed',
            backgroundColor: 'rgba(124, 58, 237, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Paying Tenants',
            data: [280, 340, 380, 320, 440, 480, 520],
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      revenuePerBuilding: {
        labels: ['Building A', 'Building B', 'Building C', 'Building D', 'Building E', 'Building F'],
        datasets: [{
          label: 'Revenue (ETB K)',
          data: [1890, 2184, 1596, 2562, 1764, 2310],
          borderColor: '#06b6d4',
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      rejectionRate: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Rejection Rate (%)',
          data: [8, 12, 6, 15, 9, 11],
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      weeklyActivity: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Rent',
            data: [45, 38, 42, 51, 48, 35, 28],
            backgroundColor: '#7c3aed'
          },
          {
            label: 'Late',
            data: [12, 8, 15, 18, 22, 10, 5],
            backgroundColor: '#06b6d4'
          }
        ]
      },
      recurringRevenue: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [{
          label: 'Recurring Revenue (ETB K)',
          data: [7560, 9240, 8190, 10080],
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      paymentVolume: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Payment Volume',
          data: [85, 120, 95, 140, 110, 125],
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      transactionSuccess: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
        datasets: [{
          label: 'Success Rate',
          data: [850, 920, 780, 1050, 890, 960],
          borderColor: '#06b6d4',
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      paymentMethods: {
        labels: ['Credit Card', 'Bank Transfer', 'AMEX Bank', 'Charge'],
        datasets: [{
          data: [35, 25, 20, 20],
          backgroundColor: ['#7c3aed', '#06b6d4', '#f59e0b', '#ef4444'],
          borderWidth: 0
        }]
      }
    });
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 12,
          font: {
            size: 10
          },
          boxWidth: 12
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#374151',
        borderWidth: 1,
        titleFont: {
          size: 11
        },
        bodyFont: {
          size: 10
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
            size: 9
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
            size: 9
          }
        }
      }
    },
    elements: {
      point: {
        radius: 2,
        hoverRadius: 4
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
    cutout: '60%'
  };

  const formatCurrency = (amount) => {
    // Format with Br symbol for Ethiopian Birr
    return `Br ${Number(amount).toLocaleString('en-ET', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h2 className="page-header__title"> Analytical Metrics</h2>
        <p className="page-header__subtitle">Real-time insights and performance analytics</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <FiUsers size={24} />
          </div>
          <div className="stat-card__body">
            <div className="stat-card__value">{stats.totalOwners}</div>
            <div className="stat-card__label">Total Owners</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
            <FiHome size={24} />
          </div>
          <div className="stat-card__body">
            <div className="stat-card__value">{stats.totalBuildings}</div>
            <div className="stat-card__label">Total Buildings</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon" style={{ background: '#fffbeb', color: '#d97706' }}>
            <FiClock size={24} />
          </div>
          <div className="stat-card__body">
            <div className="stat-card__value">{stats.pendingApprovals}</div>
            <div className="stat-card__label">Pending Approvals</div>
          </div>
        </div>

        {/* <div className="stat-card">
          <div className="stat-card__icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
            <span style={{ fontSize: '24px', fontWeight: 'bold' }}>Br</span>
          </div>
          <div className="stat-card__body">
            <div className="stat-card__value">{formatCurrency(stats.monthlyRevenue)}</div>
            <div className="stat-card__label">Monthly Revenue</div>
          </div>
        </div> */}
      </div>

      {/* Analytics Charts Grid */}
      <div className="analytics-grid">
        {/* Row 1 */}
        {chartData.latePaymentRate?.labels?.length > 0 && (
        <div className="chart-card">
          <div className="chart-header">
            <h3>Late Payment Rate</h3>
          </div>
          <div className="chart-container">
            <Line data={chartData.latePaymentRate} options={chartOptions} />
          </div>
        </div>
        )}

        <div className="chart-card">
          <div className="chart-header">
            <h3>Average Payment Processing Time</h3>
          </div>
          <div className="chart-container">
            <Line data={chartData.paymentProcessingTime} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Active Tenants vs Paying Tenants</h3>
          </div>
          <div className="chart-container">
            <Line data={chartData.activeTenants} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Recurring Revenue per Owner</h3>
          </div>
          <div className="chart-container">
            <Line data={chartData.recurringRevenue} options={chartOptions} />
          </div>
        </div>

        {/* Row 2 */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Revenue Per Building</h3>
          </div>
          <div className="chart-container">
            <Line data={chartData.revenuePerBuilding} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Receipt Rejection Rate</h3>
          </div>
          <div className="chart-container">
            <Line data={chartData.rejectionRate} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Weekly Activity</h3>
          </div>
          <div className="chart-container">
            <Bar data={chartData.weeklyActivity} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Payment Method Distribution</h3>
          </div>
          <div className="chart-container">
            <Doughnut data={chartData.paymentMethods} options={doughnutOptions} />
          </div>
        </div>

        {/* Row 3 */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Total Payment Volume</h3>
          </div>
          <div className="chart-container">
            <Line data={chartData.paymentVolume} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Successful vs Failed Transactions</h3>
          </div>
          <div className="chart-container">
            <Line data={chartData.transactionSuccess} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-header">
          <h2 className="section-title">Recent Activity</h2>
        </div>
        
        {recentActivity.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">📋</div>
            <div className="empty-state__text">No recent activity</div>
          </div>
        ) : (
          <div className="activity-list">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-item__icon">
                  ✅
                </div>
                <div className="activity-item__content">
                  <div className="activity-item__title">{activity.details || activity.description}</div>
                  <div className="activity-item__meta">
                    <span>{activity.phoneNumber || activity.user || 'System'}</span>
                    <span>•</span>
                    <span>{formatDate(activity.created_at || activity.timestamp)}</span>
                  </div>
                </div>
                <div className="status-badge status-active">
                  {activity.action || 'SUCCESS'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
