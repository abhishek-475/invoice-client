import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { toast } from 'react-toastify';

const UserDashboard = () => {
  // existing states
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // modal states for create user
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // new states for update role modal
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/users');
      let filtered = res.data;

      if (roleFilter) {
        filtered = filtered.filter(u => u.role === roleFilter);
      }
      if (searchTerm) {
        filtered = filtered.filter(u =>
          u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.uniqueId.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setUsers(filtered);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Create user handler (unchanged)
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/users', formData);
      toast.success('User created successfully');
      setShowModal(false);
      setFormData({ username: '', email: '', password: '', role: '' });
      fetchUsers();
    } catch (err) {
      toast.error('Failed to create user');
      console.log(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`/users/${id}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to delete user');
      console.log(err);
    }
  };

  // Open modal for updating role, set selected user and current role
  const openUpdateRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowUpdateModal(true);
  };

  // Submit role update
  const handleUpdateRoleSubmit = async (e) => {
    e.preventDefault();
    if (!newRole) {
      toast.error('Please select a role');
      return;
    }
    try {
      await axios.put(`/users/${selectedUser._id}`, { newRole });
      toast.success('User role updated successfully');
      setShowUpdateModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update role');
      console.log(err);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 d-flex justify-content-between align-items-center">
        User Dashboard
        <button
          className="btn btn-outline-danger"
          onClick={() => {
            localStorage.clear();
            window.location.href = '/';
          }}
        >
          Logout
        </button>
      </h2>

      <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
        <select
          className="form-select me-auto"
          style={{ maxWidth: '200px' }}
          onChange={e => setRoleFilter(e.target.value)}
          value={roleFilter}
          aria-label="Filter by Role"
        >
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="UNIT_MANAGER">Unit Manager</option>
          <option value="USER">User</option>
        </select>

        <input
          type="text"
          className="form-control me-2"
          style={{ maxWidth: '300px' }}
          placeholder="Search by username, email, or ID"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          aria-label="Search users"
        />

        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Create User
        </button>
      </div>

      {loading ? (
        <div className="text-center py-4">Loading users...</div>
      ) : (

      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th style={{ minWidth: '140px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map(u => (
                <tr key={u._id} style={{ cursor: 'default' }}>
                  <td>{u.uniqueId}</td>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => openUpdateRoleModal(u)}
                    >
                      Update Role
                    </button>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleDeleteUser(u._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}
      {/* Create User Modal - unchanged */}

      {/* Update Role Modal */}
      {showUpdateModal && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => !submitting && setShowUpdateModal(false)}
            style={{ cursor: submitting ? 'not-allowed' : 'pointer' }}
          ></div>

          <div
            className="modal d-block fade show"
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
            aria-labelledby="updateRoleModalLabel"
            onKeyDown={e => e.key === 'Escape' && !submitting && setShowUpdateModal(false)}
            style={{ overflowY: 'auto' }}
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <form onSubmit={handleUpdateRoleSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title" id="updateRoleModalLabel">
                      Update Role for {selectedUser?.username}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      aria-label="Close"
                      onClick={() => !submitting && setShowUpdateModal(false)}
                      disabled={submitting}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <select
                      className="form-select"
                      value={newRole}
                      onChange={e => setNewRole(e.target.value)}
                      required
                      disabled={submitting}
                    >
                      <option value="">Select Role</option>
                      <option value="ADMIN">Admin</option>
                      <option value="UNIT_MANAGER">Unit Manager</option>
                      <option value="USER">User</option>
                    </select>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowUpdateModal(false)}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-success"
                      disabled={submitting}
                    >
                      {submitting ? 'Updating...' : 'Update Role'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserDashboard;
