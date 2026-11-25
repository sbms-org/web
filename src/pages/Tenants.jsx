import React, { useEffect, useState } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiDownload,
  FiFilter,
  FiCalendar,
} from "react-icons/fi";
import api from "../api/axiosInstance";
import toast from "react-hot-toast";
import { formatDate } from "../utils/helpers";
import CustomSelect from "../components/CustomSelect";

const Tenants = () => {
  const [tenants, setTenants] = useState([]);
  const [filteredTenants, setFilteredTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    fullName: "",
    ownerMobile: "",
    tenantMobile: "",
    propertyCode: "",
    status: "ACTIVE_RENT",
    occupiedDate: "",
  });

  useEffect(() => {
    loadTenants();
  }, []);

  useEffect(() => {
    filterTenants();
  }, [search, statusFilter, tenants]);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/tenants");
      setTenants(response.data.data);
    } catch (error) {
      console.error("Error loading tenants:", error);
      toast.error("Failed to load tenants");
    } finally {
      setLoading(false);
    }
  };

  const filterTenants = () => {
    let filtered = tenants;

    // Status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((tenant) => tenant.status === statusFilter);
    }

    // Search filter
    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter(
        (tenant) =>
          tenant.fullName?.toLowerCase().includes(query) ||
          tenant.ownerMobile?.includes(query) ||
          tenant.tenantMobile?.includes(query) ||
          tenant.propertyCode?.toLowerCase().includes(query),
      );
    }

    setFilteredTenants(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredTenants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTenants = filteredTenants.slice(startIndex, endIndex);

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

  const handleOpenCreate = () => {
    setEditingTenant(null);
    setFormData({
      fullName: "",
      ownerMobile: "",
      tenantMobile: "",
      propertyCode: "",
      status: "ACTIVE_RENT",
      occupiedDate: new Date().toISOString().split("T")[0],
    });
    setShowModal(true);
  };

  const handleOpenEdit = (tenant) => {
    setEditingTenant(tenant);
    setFormData({
      fullName: tenant.fullName,
      ownerMobile: tenant.ownerMobile,
      tenantMobile: tenant.tenantMobile,
      propertyCode: tenant.propertyCode,
      status: tenant.status,
      occupiedDate: tenant.occupiedDate
        ? tenant.occupiedDate.split("T")[0]
        : "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.fullName ||
      !formData.ownerMobile ||
      !formData.tenantMobile ||
      !formData.propertyCode
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const tenantData = {
        ...formData,
        occupiedDate: formData.occupiedDate
          ? new Date(formData.occupiedDate).toISOString()
          : new Date().toISOString(),
        lastActive: new Date().toISOString(),
      };

      if (editingTenant) {
        await api.put(`/admin/tenants/${editingTenant.id}`, tenantData);
        toast.success("Tenant updated successfully!");
      } else {
        const newTenant = {
          id: `tenant-${Date.now()}`,
          ...tenantData,
          createdAt: new Date().toISOString(),
        };
        await api.post("/admin/tenants", newTenant);
        toast.success("Tenant added successfully!");
      }
      setShowModal(false);
      loadTenants();
    } catch (error) {
      console.error("Error saving tenant:", error);
      toast.error("Failed to save tenant");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await api.delete(`/admin/tenants/${deleteTarget.id}`);
      toast.success("Tenant deleted successfully!");
      setShowDeleteModal(false);
      setDeleteTarget(null);
      loadTenants();
    } catch (error) {
      console.error("Error deleting tenant:", error);
      toast.error("Failed to delete tenant");
    }
  };

  const handleExport = () => {
    toast.success("Exporting tenants... (mock)");
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      ACTIVE_RENT: "status-active",
      REVOKED: "status-suspended",
      TERMINATED: "status-terminated",
    };
    return statusMap[status] || "status-default";
  };

  const getLastActiveText = (lastActive) => {
    if (!lastActive) return "Never";

    const now = new Date();
    const lastActiveDate = new Date(lastActive);
    const diffMs = now - lastActiveDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffMonths = Math.floor(diffMs / 2592000000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading tenants...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-header__title">
            Tenant Users, Assigned by Owners.
          </h2>
          <p className="page-header__subtitle">
            Manage all tenant users in one place.
          </p>
        </div>
        <div className="action-btns">
          <button className="btn btn-secondary" onClick={handleExport}>
            <FiDownload /> Export
          </button>
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <FiPlus /> Add New Tenant
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
            <FiFilter /> Status
          </button>
          <CustomSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Status' },
              { value: 'ACTIVE_RENT', label: 'Active Rent' },
              { value: 'REVOKED', label: 'Revoked' },
              { value: 'TERMINATED', label: 'Terminated' }
            ]}
            style={{ width: 'auto', minWidth: '180px' }}
          />
          <button className="btn btn-secondary">
            <FiCalendar /> Date
          </button>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>OWNER MOBILE</th>
                <th>TENANT MOBILE</th>
                <th>PROPERTY CODE</th>
                <th>STATUS</th>
                <th>OCCUPIED DATE</th>
                <th>Last Active</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {currentTenants.length === 0 ? (
                <tr>
                  <td colSpan="8">
                    <div className="empty-state">
                      <div className="empty-state__icon">👥</div>
                      <div className="empty-state__text">
                        {search || statusFilter !== "ALL"
                          ? "No tenants match your filters"
                          : "No tenants found"}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                currentTenants.map((tenant) => (
                  <tr key={tenant.id}>
                    <td>
                      <span style={{ fontWeight: 600, color: "#0f172a" }}>
                        {tenant.fullName}
                      </span>
                    </td>
                    <td style={{ fontFamily: "monospace", fontSize: 13 }}>
                      {tenant.ownerMobile}
                    </td>
                    <td style={{ fontFamily: "monospace", fontSize: 13 }}>
                      {tenant.tenantMobile}
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 600,
                          color: "#6366f1",
                          fontSize: 13,
                        }}
                      >
                        {tenant.propertyCode}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${getStatusBadgeClass(tenant.status)}`}
                      >
                        {tenant.status.replace("_", " ")}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: "#64748b" }}>
                      {formatDate(tenant.occupiedDate)}
                    </td>
                    <td style={{ fontSize: 13, color: "#64748b" }}>
                      {getLastActiveText(tenant.lastActive)}
                    </td>
                    <td>
                      <div className="action-btns">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenEdit(tenant)}
                          title="Edit"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => {
                            setDeleteTarget(tenant);
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

        {/* Pagination */}
        {filteredTenants.length > itemsPerPage && (
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
        <div className="pagination-info">
          Showing {startIndex + 1} to {Math.min(endIndex, filteredTenants.length)} of {filteredTenants.length} tenants
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">
                {editingTenant ? "Edit Tenant" : "Add New Tenant"}
              </h2>
              <button
                className="modal__close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., John Smith"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Owner Mobile *</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="e.g., +251912312312"
                  value={formData.ownerMobile}
                  onChange={(e) =>
                    setFormData({ ...formData, ownerMobile: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tenant Mobile *</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="e.g., +251912312312"
                  value={formData.tenantMobile}
                  onChange={(e) =>
                    setFormData({ ...formData, tenantMobile: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Property Code *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., MBT127"
                  value={formData.propertyCode}
                  onChange={(e) =>
                    setFormData({ ...formData, propertyCode: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <CustomSelect
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  options={[
                    { value: 'ACTIVE_RENT', label: 'Active Rent' },
                    { value: 'REVOKED', label: 'Revoked' },
                    { value: 'TERMINATED', label: 'Terminated' }
                  ]}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Occupied Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.occupiedDate}
                  onChange={(e) =>
                    setFormData({ ...formData, occupiedDate: e.target.value })
                  }
                />
              </div>
              <div className="modal__footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTenant ? "Update" : "Add"} Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteTarget && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">Confirm Delete</h2>
              <button
                className="modal__close"
                onClick={() => setShowDeleteModal(false)}
              >
                ×
              </button>
            </div>
            <div className="confirm-message">
              Are you sure you want to delete tenant{" "}
              <strong>{deleteTarget.fullName}</strong>? This action cannot be
              undone.
            </div>
            <div className="modal__footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
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

export default Tenants;
