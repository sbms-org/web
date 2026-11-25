import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const PendingBuildings = () => {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadBuildings();
  }, []);

  const loadBuildings = async () => {
    try {
      const res = await api.get('/admin/buildings/pending');
      setBuildings(res.data.data || []);
    } catch (e) {
      toast.error('Failed to load buildings');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner" /><p>Loading...</p></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-header__title">Pending Building Approvals</h2>
          <p className="page-header__subtitle">{buildings.length} buildings awaiting review</p>
        </div>
      </div>

      {buildings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h3 style={{ marginBottom: 8 }}>No Pending Buildings</h3>
          <p style={{ color: 'var(--text-secondary)' }}>All building submissions have been reviewed</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Building Name</th>
                <th>Owner</th>
                <th>Property Type</th>
                <th>Location</th>
                <th>Units</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {buildings.map(b => (
                <tr key={b.id}>
                  <td><strong>{b.name}</strong></td>
                  <td>{b.owner?.fullname || 'N/A'}</td>
                  <td>{b.property_type}</td>
                  <td>{b.city}, {b.country}</td>
                  <td>{b.total_units}</td>
                  <td>{formatDate(b.created_at)}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn btn-sm btn-primary" onClick={() => navigate(`/building/${b.id}/details`)}>
                      View
                    </button>
                    <button
                      className="btn btn-sm btn-success"
                      style={{ marginLeft: 4 }}
                      onClick={async () => {
                        try {
                          await api.post(`/admin/buildings/${b.id}/approve`, { confirmedTotalUnits: b.total_units });
                          setBuildings(prev => prev.filter(x => x.id !== b.id));
                          toast.success('Building approved');
                        } catch (e) {
                          toast.error('Approval failed');
                        }
                      }}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      style={{ marginLeft: 4 }}
                      onClick={async () => {
                        const reason = prompt('Enter rejection reason:');
                        if (!reason) return;
                        try {
                          await api.post(`/admin/buildings/${b.id}/reject`, { reason });
                          setBuildings(prev => prev.filter(x => x.id !== b.id));
                          toast.success('Building rejected');
                        } catch (e) {
                          toast.error('Rejection failed');
                        }
                      }}
                    >
                      Reject
                    </button>
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

export default PendingBuildings;
