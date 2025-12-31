import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { HiArrowLeft, HiTrash, HiPlusCircle, HiX, HiTicket, HiUsers } from 'react-icons/hi';
import { projectsAPI, ticketsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './ProjectDetail.css';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [memberRole, setMemberRole] = useState('Viewer');

  useEffect(() => {
    fetchProject();
    fetchTickets();
  }, [id]);

  // Scroll to top when tickets change
  useEffect(() => {
    if (tickets.length > 0) {
      const ticketsList = document.querySelector('.tickets-list');
      if (ticketsList) {
        ticketsList.scrollTop = 0;
      }
    }
  }, [tickets.length]);

  const fetchProject = async () => {
    try {
      const response = await projectsAPI.getById(id);
      setProject(response.data);
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    try {
      const response = await ticketsAPI.getAll({ project: id });
      // Sort by createdAt descending (newest first)
      const sortedTickets = response.data.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setTickets(sortedTickets);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    }
  };

  const handleSearchUsers = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await projectsAPI.searchUsers(query);
      // Filter out users who are already members
      const memberIds = project?.members?.map(m => m.user._id.toString()) || [];
      const filtered = response.data.filter(
        u => !memberIds.includes(u._id.toString())
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error('Failed to search users:', error);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUser) return;

    try {
      await projectsAPI.addMember(id, {
        userId: selectedUser._id,
        role: memberRole
    });
      setShowAddMember(false);
      setSelectedUser(null);
      setSearchQuery('');
      setSearchResults([]);
      fetchProject();
    } catch (error) {
      console.error('Failed to add member:', error);
      alert(error.response?.data?.error || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;

    try {
      await projectsAPI.removeMember(id, memberId);
      fetchProject();
    } catch (error) {
      console.error('Failed to remove member:', error);
      alert(error.response?.data?.error || 'Failed to remove member');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      await projectsAPI.delete(id);
      navigate('/projects');
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert(error.response?.data?.error || 'Failed to delete project');
    }
  };

  const isOwner = project?.owner?._id?.toString() === user?._id?.toString();
  const isAdmin = project?.members?.some(
    m => m.user._id.toString() === user?._id?.toString() && m.role === 'Admin'
  );
  const canManage = isOwner || isAdmin;

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!project) {
    return <div className="error">Project not found</div>;
  }

  return (
    <div className="project-detail-page">
      <div className="detail-header">
        <button onClick={() => navigate('/projects')} className="back-button">
          <HiArrowLeft className="btn-icon" />
          Back
        </button>
        {isOwner && (
          <button onClick={handleDelete} className="btn-danger">
            <HiTrash className="btn-icon" />
            Delete
          </button>
        )}
      </div>

      <div className="project-info">
        <div className="project-title-section">
          <h1>{project.name}</h1>
          <span
            className="status-badge-large"
            style={{
              backgroundColor: project.status === 'Active' ? 'var(--apple-green)' :
                project.status === 'Completed' ? 'var(--apple-blue)' : 'var(--apple-gray)'
            }}
          >
            {project.status}
          </span>
        </div>
        <p className="project-description">{project.description || 'No description'}</p>
      </div>

      <div className="project-content">
        <div className="project-main">
          <div className="section">
            <div className="section-header">
              <h2>
                <HiUsers className="section-icon" />
                Members ({project.members?.length || 0})
              </h2>
              {canManage && (
                <button
                  onClick={() => setShowAddMember(!showAddMember)}
                  className="btn-primary btn-sm"
                >
                  <HiPlusCircle className="btn-icon" />
                  Add Member
                </button>
              )}
            </div>

            {showAddMember && canManage && (
              <div className="add-member-form">
                <div className="form-group">
                  <label>Search Users</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchUsers(e.target.value)}
                    className="form-input"
                    placeholder="Search by username, email, or name..."
                  />
                  {searchResults.length > 0 && (
                    <div className="search-results">
                      {searchResults.map(user => (
                        <div
                          key={user._id}
                          className={`search-result-item ${selectedUser?._id === user._id ? 'selected' : ''}`}
                          onClick={() => setSelectedUser(user)}
                        >
                          <div>
                            <div className="user-name">{user.fullName || user.username}</div>
                            <div className="user-email">{user.email}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedUser && (
                  <>
                    <div className="form-group">
                      <label>Role</label>
                      <select
                        value={memberRole}
                        onChange={(e) => setMemberRole(e.target.value)}
                        className="form-select"
                      >
                        <option value="Viewer">Viewer</option>
                        <option value="Tester">Tester</option>
                        <option value="Developer">Developer</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                    <div className="form-actions">
                      <button
                        onClick={() => {
                          setShowAddMember(false);
                          setSelectedUser(null);
                          setSearchQuery('');
                          setSearchResults([]);
                        }}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                      <button onClick={handleAddMember} className="btn-primary">
                        Add Member
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="members-list">
              {project.members && project.members.length > 0 ? (
                project.members.map((member, index) => (
                  <div key={index} className="member-item">
                    <div className="member-info">
                      <div className="member-avatar">
                        {member.user.fullName?.[0] || member.user.username?.[0] || 'U'}
                      </div>
                      <div>
                        <div className="member-name">
                          {member.user.fullName || member.user.username}
                          {project.owner._id.toString() === member.user._id.toString() && (
                            <span className="owner-badge">Owner</span>
                          )}
                        </div>
                        <div className="member-email">{member.user.email}</div>
                      </div>
                    </div>
                    <div className="member-actions">
                      <span className="role-badge">{member.role}</span>
                      {canManage &&
                        project.owner._id.toString() !== member.user._id.toString() && (
                          <button
                            onClick={() => handleRemoveMember(member.user._id)}
                            className="remove-btn"
                          >
                            <HiX />
                          </button>
                        )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-members">No members yet</p>
              )}
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <h2>
                <HiTicket className="section-icon" />
                Tickets ({tickets.length})
              </h2>
              <Link to={`/projects/${id}/tickets/new`} className="btn-primary btn-sm">
                Create Ticket
              </Link>
            </div>
            {tickets.length === 0 ? (
              <p className="info-text">No tickets yet. Create your first ticket!</p>
            ) : (
              <div className="tickets-list">
                {tickets.map(ticket => (
                  <Link
                    key={ticket._id}
                    to={`/projects/${id}/tickets/${ticket._id}`}
                    className="ticket-item"
                  >
                    <div className="ticket-item-header">
                      <h4>{ticket.title}</h4>
                      <span
                        className="status-badge-small"
                        style={{
                          backgroundColor:
                            ticket.status === 'Pending' ? 'var(--apple-gray)' :
                            ticket.status === 'In Progress' ? 'var(--apple-blue)' :
                            ticket.status === 'Completed' ? 'var(--apple-green)' :
                            'var(--apple-red)'
                        }}
                      >
                        {ticket.status}
                      </span>
                    </div>
                    <p className="ticket-item-description">
                      {ticket.description || 'No description'}
                    </p>
                    <div className="ticket-item-footer">
                      <span className="priority-badge-small">{ticket.priority}</span>
                      <span className="ticket-date-small">
                        {new Date(ticket.createdAt).toLocaleDateString('en-US')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;

