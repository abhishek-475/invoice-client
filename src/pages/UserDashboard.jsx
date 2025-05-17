import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { toast } from 'react-toastify';

const UserDashboard = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: '',
  });
  const [submitting, setSubmitting] = useState(false);

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

  const openUpdateRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowUpdateModal(true);
  };

  const handleUpdateRoleSubmit = async (e) => {
    e.preventDefault();
    if (!newRole) {
      toast.error('Please select a role');
      return;
    }
    try {
      await axios.put(`/users/${selectedUser._id}`, { role: newRole });
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
                  <tr key={u._id}>
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
                  <td colSpan="5" className="text-center py-4">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create User Modal */}
      {showModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal d-block fade show">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <form onSubmit={handleCreateUser}>
                  <div className="modal-header">
                    <h5 className="modal-title">Create New User</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowModal(false)}
                      disabled={submitting}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Username</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.username}
                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                        required
                        disabled={submitting}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        required
                        disabled={submitting}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        required
                        disabled={submitting}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Role</label>
                      <select
                        className="form-select"
                        value={formData.role}
                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                        required
                        disabled={submitting}
                      >
                        <option value="">Select Role</option>
                        <option value="ADMIN">Admin</option>
                        <option value="UNIT_MANAGER">Unit Manager</option>
                        <option value="USER">User</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={submitting}
                    >
                      {submitting ? 'Creating...' : 'Create User'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Update Role Modal */}
      {showUpdateModal && selectedUser && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal d-block fade show">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <form onSubmit={handleUpdateRoleSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">Update Role for {selectedUser.username}</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowUpdateModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Select New Role</label>
                      <select
                        className="form-select"
                        value={newRole}
                        onChange={e => setNewRole(e.target.value)}
                        required
                      >
                        <option value="">Select Role</option>
                        <option value="ADMIN">Admin</option>
                        <option value="UNIT_MANAGER">Unit Manager</option>
                        <option value="USER">User</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowUpdateModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Update Role
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
