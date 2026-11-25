import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import FileViewer from '../components/FileViewer';
import toast from 'react-hot-toast';

const STEPS = [
  { id: 'basic', label: 'Basic Info', icon: '🏢' },
  { id: 'location', label: 'Location', icon: '📍' },
  { id: 'documents', label: 'Documents', icon: '📄' },
  { id: 'actions', label: 'Actions', icon: '⚡' }
];

const BuildingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [building, setBuilding] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(true);

  // viewer state for documents / images
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerFiles, setViewerFiles] = useState([]);
  const [viewerIndex, setViewerIndex] = useState(0);

  const openViewer = (fileUrl, list = [fileUrl]) => {
    setViewerFiles(list);
    const idx = list.findIndex(u => u === fileUrl);
    setViewerIndex(idx >= 0 ? idx : 0);
    setViewerOpen(true);
  };

  const closeViewer = () => setViewerOpen(false);
  const prevViewer = () => setViewerIndex(i => Math.max(i - 1, 0));
  const nextViewer = () => setViewerIndex(i => Math.min(i + 1, viewerFiles.length - 1));

  useEffect(() => {
    loadBuilding();
  }, [id]);

  const loadBuilding = async () => {
    try {
      const res = await api.get(`/admin/buildings/${id}`);
      setBuilding(res.data.data || res.data);
    } catch (e) {
      console.error('Failed to load building', e);
      toast.error('Unable to fetch building details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await api.post(`/admin/buildings/${id}/approve`, { confirmedTotalUnits: building.total_units });
      toast.success('Building approved');
      navigate('/pending-buildings');
    } catch (e) {
      console.error('Failed to approve', e);
      toast.error('Approval failed');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Enter a reason to reject');
      return;
    }
    try {
      await api.post(`/admin/buildings/${id}/reject`, { reason: rejectionReason });
      toast.success('Building rejected');
      navigate('/pending-buildings');
    } catch (e) {
      console.error('Failed to reject', e);
      toast.error('Rejection failed');
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner" /><p>Loading...</p></div>;
  if (!building) return <div className="card" style={{ textAlign: 'center', padding: 60 }}>Building not found</div>;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <button onClick={() => navigate('/pending-buildings')} style={{ padding: '8px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', marginBottom: 16 }}>
          ← Back to Pending Buildings
        </button>
        <div className="page-header">
          <div>
            <h2 className="page-header__title">{building.name}</h2>
            <p className="page-header__subtitle">{building.property_type} • {building.city}, {building.country}</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'var(--surface-alt)' }}>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
            {STEPS.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(idx)}
                style={{
                  flex: 1,
                  padding: '10px 8px',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  background: currentStep === idx ? 'var(--primary)' : 'var(--surface)',
                  color: currentStep === idx ? 'white' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: currentStep === idx ? 600 : 400,
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  boxShadow: currentStep === idx ? 'var(--shadow)' : 'none'
                }}
              >
                <span style={{ fontSize: 18 }}>{step.icon}</span>
                <span>{step.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: 24, minHeight: 400 }}>
          {currentStep === 0 && (
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ padding: 16, background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Building Name</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{building.name}</div>
                </div>
                <div style={{ padding: 16, background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Property Type</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{building.property_type}</div>
                </div>
                <div style={{ padding: 16, background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Owner</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{building.owner?.fullname || 'N/A'}</div>
                  {building.owner?.mobile && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>📞 {building.owner.mobile}</div>}
                  {building.owner?.email && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>✉️ {building.owner.email}</div>}
                </div>
                <div style={{ padding: 16, background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Total Units</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{building.total_units}</div>
                </div>
                <div style={{ padding: 16, background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Total Floors</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{building.total_floors ?? 'N/A'}</div>
                </div>
                <div style={{ padding: 16, background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Payment Cycle</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{building.payment_cycle}</div>
                </div>
                <div style={{ padding: 16, background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Default Rent</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{building.default_rent_amount != null ? `${building.default_rent_amount.toLocaleString()} ETB` : 'N/A'}</div>
                </div>
                <div style={{ padding: 16, background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Unit Distribution</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{building.unit_per_floor_distribution}</div>
                </div>
              </div>
              {building.additional_notes && (
                <div style={{ padding: 16, background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>Additional Notes</div>
                  <div style={{ color: 'var(--text-primary)', lineHeight: 1.6 }}>{building.additional_notes}</div>
                </div>
              )}
              {building.status && (
                <div style={{ marginTop: 16, padding: 16, background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>Current Status</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{building.status}</div>
                  {building.status === 'REJECTED' && building.rejection_reason && (
                    <div style={{ marginTop: 8, fontSize: 13, color: 'var(--danger)' }}>
                      Rejection reason: {building.rejection_reason}
                    </div>
                  )}
                </div>
              )}
              {building.units && building.units.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>Units ({building.units.length})</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px,1fr))', gap: 8 }}>
                    {building.units.map(u => (
                      <div key={u.id} style={{ padding: 8, background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ fontWeight: 600 }}>{u.unit_number}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Status: {u.status}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 1 && (
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ padding: 20, background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>Full Address</div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 16 }}>{building.address}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ padding: 16, background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>City</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{building.city}</div>
                </div>
                <div style={{ padding: 16, background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>State/Province</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{building.state_or_province}</div>
                </div>
                <div style={{ padding: 16, background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)', gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Country</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{building.country}</div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div style={{ display: 'grid', gap: 12 }}>
              {/* prepare list of document urls for navigation */}
              {(() => {
                const docs = [
                  building.property_deed_url,
                  building.certificate_of_title_url,
                  building.business_tin_number_url,
                ].filter(Boolean);
                return docs.map((url, idx) => {
                  const isImage = url.match(/\.(jpg|jpeg|png|gif|bmp)$/i);
                  const label =
                    url === building.property_deed_url
                      ? 'Property Deed'
                      : url === building.certificate_of_title_url
                      ? 'Certificate of Title'
                      : 'Business TIN Number';
                  const icon =
                    url === building.property_deed_url
                      ? '📄'
                      : url === building.certificate_of_title_url
                      ? '📜'
                      : '🏢';
                  return (
                    <div
                      key={idx}
                      onClick={() => openViewer(url, docs)}
                      style={{
                        padding: 16,
                        background: 'var(--surface-alt)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {isImage ? (
                        <img
                          src={url}
                          alt={label}
                          style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            background:
                              url === building.property_deed_url
                                ? 'var(--primary)'
                                : url === building.certificate_of_title_url
                                ? 'var(--secondary)'
                                : 'var(--accent)',
                            borderRadius: 'var(--radius-sm)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 24,
                            color: 'white',
                          }}
                        >
                          {icon}
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{label}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Click to view</div>
                      </div>
                      <div style={{ color: isImage ? 'var(--text-secondary)' : (url === building.property_deed_url ? 'var(--primary)' : url === building.certificate_of_title_url ? 'var(--secondary)' : 'var(--accent)') }}>→</div>
                    </div>
                  );
                });
              })()}
              {(!building.property_deed_url && !building.certificate_of_title_url && !building.business_tin_number_url) && (
                <div style={{ color: 'var(--text-secondary)' }}>No documents uploaded</div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div style={{ display: 'grid', gap: 20 }}>
              <div style={{ padding: 20, background: 'linear-gradient(135deg, var(--success) 0%, #059669 100%)', borderRadius: 'var(--radius-sm)', color: 'white' }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>✓ Approve Building</h3>
                <p style={{ margin: '0 0 16px', opacity: 0.9, fontSize: 14 }}>This will activate the building and allow the owner to add units</p>
                <button
                  onClick={handleApprove}
                  style={{ padding: '10px 24px', background: 'white', color: 'var(--success)', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
                >
                  Approve Building
                </button>
              </div>
              
              <div style={{ padding: 20, background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)', border: '2px solid var(--danger-light)' }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 18, color: 'var(--danger)' }}>✗ Reject Building</h3>
                <p style={{ margin: '0 0 16px', color: 'var(--text-secondary)', fontSize: 14 }}>Provide a reason for rejection</p>
                <textarea
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  placeholder="Enter rejection reason..."
                  style={{ width: '100%', minHeight: 100, padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginBottom: 12, fontFamily: 'inherit', fontSize: 14 }}
                />
                <button
                  onClick={handleReject}
                  disabled={!rejectionReason.trim()}
                  style={{ padding: '10px 24px', background: rejectionReason.trim() ? 'var(--danger)' : 'var(--border)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 600, cursor: rejectionReason.trim() ? 'pointer' : 'not-allowed', fontSize: 14 }}
                >
                  Reject Building
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', background: 'var(--surface-alt)' }}>
          <button
            onClick={() => setCurrentStep(prev => Math.max(prev - 1, 0))}
            disabled={currentStep === 0}
            style={{ padding: '10px 20px', background: currentStep === 0 ? 'var(--border)' : 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: currentStep === 0 ? 'not-allowed' : 'pointer', fontWeight: 500, color: 'var(--text-primary)' }}
          >
            ← Previous
          </button>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
            Step {currentStep + 1} of {STEPS.length}
          </div>
          <button
            onClick={() => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1))}
            disabled={currentStep === STEPS.length - 1}
            style={{ padding: '10px 20px', background: currentStep === STEPS.length - 1 ? 'var(--border)' : 'var(--primary)', color: currentStep === STEPS.length - 1 ? 'var(--text-secondary)' : 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: currentStep === STEPS.length - 1 ? 'not-allowed' : 'pointer', fontWeight: 500 }}
          >
            Next →
          </button>
        </div>
      </div>
      {/* viewer for docs/images */}
      <FileViewer
        open={viewerOpen}
        files={viewerFiles}
        index={viewerIndex}
        onClose={closeViewer}
        onPrev={prevViewer}
        onNext={nextViewer}
      />
    </div>
  );
};

export default BuildingDetails;
