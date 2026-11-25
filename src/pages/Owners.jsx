import React, { useState, useEffect } from "react";
import { FiPlus, FiTrash2, FiSearch, FiEdit2 } from "react-icons/fi";
import toast from "react-hot-toast";
import "./Owners.css";
import api from "../api/axiosInstance";
import { createOwner } from "../api/owners";

const Owners = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingOwner, setEditingOwner] = useState(null);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
  });

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/owners");
      setOwners(response.data.data);
    } catch (error) {
      console.error("Error fetching owners:", error);
      toast.error("Failed to load owners");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingOwner(null);
    setFormData({
      fullName: "",
      mobileNumber: "",
    });
    setShowModal(true);
  };

  const handleOpenEdit = (owner) => {
    setEditingOwner(owner);
    setFormData({
      fullName: owner.fullName,
      mobileNumber: owner.mobileNumber,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.mobileNumber) {
      toast.error("Name and phone number are required");
      return;
    }

    try {
      if (editingOwner) {
        // Update existing owner
        const updatedOwner = {
          ...editingOwner,
          fullName: formData.fullName,
          mobileNumber: formData.mobileNumber,
          email: `${formData.mobileNumber}@pixelrents.com`,
        };
        await api.put(`/admin/owners/${editingOwner.id}`, updatedOwner);
        toast.success("Owner updated successfully!");
      } else {
        // Create new owner
        const newOwner = {
          id: "owner-" + Date.now(),
          fullName: formData.fullName,
          email: `${formData.mobileNumber}@pixelrents.com`,
          mobileNumber: formData.mobileNumber,
          status: "PENDING",
          role: "OWNER",
          joinedDate: new Date().toISOString(),
          lastActive: null,
          buildingsCount: 0,
          unitsCount: 0,
        };
        await createOwner(newOwner);
        toast.success("Owner created successfully!");
      }
      
      setShowModal(false);
      setFormData({ fullName: "", mobileNumber: "" });
      fetchOwners();
    } catch (error) {
      console.error("Error saving owner:", error);
      toast.error("Failed to save owner");
    }
  };

  const handleDeleteOwner = async () => {
    if (!selectedOwner) return;

    try {
      await api.delete(`/admin/owners/${selectedOwner.id}`);
      toast.success("Owner deleted successfully!");
      setShowDeleteModal(false);
      setSelectedOwner(null);
      fetchOwners();
    } catch (error) {
      console.error("Error deleting owner:", error);
      toast.error("Failed to delete owner");
    }
  };

  const openDeleteModal = (owner) => {
    setSelectedOwner(owner);
    setShowDeleteModal(true);
  };

  const filteredOwners = owners.filter(
    (owner) =>
      owner.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.mobileNumber.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredOwners.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOwners = filteredOwners.slice(startIndex, endIndex);

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

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      ACTIVE: "status-active",
      PENDING: "status-pending",
      SUSPENDED: "status-suspended",
      TERMINATED: "status-terminated",
    };
    return statusMap[status] || "status-default";
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading owners...</p>
      </div>
    );
  }

  return (
    <div className="owners-page">
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Building Owners</h1>
          <p className="page-header__subtitle">
            Manage building owners and their properties
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleOpenCreate}
        >
          <FiPlus /> Add New Owner
        </button>
      </div>

      <div className="card">
        <div className="filter-bar">
          <div className="search-input-wrap">
            <FiSearch className="search-icon" />
            <input
              type="text"
              className="form-input"
              placeholder="Search by name or mobile number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Mobile Number</th>
                <th>Buildings</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentOwners.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="empty-state">
                      <div className="empty-state__icon">👥</div>
                      <div className="empty-state__text">No owners found</div>
                    </div>
                  </td>
                </tr>
              ) : (
                currentOwners.map((owner) => (
                  <tr key={owner.id}>
                    <td>{owner.fullName}</td>
                    <td>{owner.mobileNumber}</td>
                    <td>{owner.buildingsCount}</td>
                    <td>
                      <span
                        className={`status-badge ${getStatusBadgeClass(owner.status)}`}
                      >
                        {owner.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenEdit(owner)}
                          title="Edit"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => openDeleteModal(owner)}
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
        {filteredOwners.length > itemsPerPage && (
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
          Showing {startIndex + 1} to {Math.min(endIndex, filteredOwners.length)} of {filteredOwners.length} owners
        </div>
      </div>

      {/* Create/Edit Owner Modal */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">
                {editingOwner ? "Edit Owner" : "Add New Owner"}
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
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.mobileNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, mobileNumber: e.target.value })
                  }
                  placeholder="+251900000000"
                  required
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
                  {editingOwner ? "Update" : "Create"} Owner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedOwner && (
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
              Are you sure you want to delete{" "}
              <strong>{selectedOwner.fullName}</strong>? This action cannot be
              undone.
            </div>
            <div className="modal__footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDeleteOwner}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Owners;
