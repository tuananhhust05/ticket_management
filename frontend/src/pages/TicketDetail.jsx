import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiTrash, HiChatAlt } from 'react-icons/hi';
import { ticketsAPI } from '../services/api';
import './TicketDetail.css';

const TicketDetail = () => {
  const { projectId, id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      const response = await ticketsAPI.getById(id);
      setTicket(response.data);
    } catch (error) {
      console.error('Failed to fetch ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      const response = await ticketsAPI.update(id, { status: newStatus });
      setTicket(response.data);
    } catch (error) {
      console.error('Failed to update:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    try {
      setUpdating(true);
      const response = await ticketsAPI.update(id, { priority: newPriority });
      setTicket(response.data);
    } catch (error) {
      console.error('Failed to update:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await ticketsAPI.addComment(id, {
        content: comment,
      });
      setComment('');
      fetchTicket();
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;

    try {
      await ticketsAPI.delete(id);
      navigate(`/projects/${projectId}`);
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'var(--apple-gray)',
      'In Progress': 'var(--apple-blue)',
      'Completed': 'var(--apple-green)',
      'Cancelled': 'var(--apple-red)',
    };
    return colors[status] || 'var(--apple-gray)';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': 'var(--apple-gray)',
      'Medium': 'var(--apple-blue)',
      'High': 'var(--apple-orange)',
      'Urgent': 'var(--apple-red)',
    };
    return colors[priority] || 'var(--apple-gray)';
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!ticket) {
    return <div className="error">Ticket not found</div>;
  }

  return (
    <div className="ticket-detail-page">
      <div className="detail-header">
        <button onClick={() => navigate(`/projects/${projectId}`)} className="back-button">
          <HiArrowLeft className="btn-icon" />
          Back to Project
        </button>
        <div className="header-actions">
          <button onClick={handleDelete} className="btn-danger">
            <HiTrash className="btn-icon" />
            Delete
          </button>
        </div>
      </div>

      <div className="detail-content">
        <div className="detail-main">
          <div className="ticket-title-section">
            <h1>{ticket.title}</h1>
            <div className="ticket-meta-badges">
              <span
                className="status-badge-large"
                style={{ backgroundColor: getStatusColor(ticket.status) }}
              >
                {ticket.status}
              </span>
              <span
                className="priority-badge-large"
                style={{ color: getPriorityColor(ticket.priority) }}
              >
                Priority: {ticket.priority}
              </span>
            </div>
          </div>

          <div className="ticket-description-section">
            <h2>Description</h2>
            <p>{ticket.description || 'No description'}</p>
          </div>

          <div className="comments-section">
            <h2>
              <HiChatAlt className="section-icon" />
              Comments ({ticket.comments?.length || 0})
            </h2>
            <form onSubmit={handleAddComment} className="comment-form">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="comment-input"
                rows="3"
              />
              <button type="submit" className="btn-primary">
                Post Comment
              </button>
            </form>

            <div className="comments-list">
              {ticket.comments && ticket.comments.length > 0 ? (
                ticket.comments.map((comment, index) => (
                  <div key={index} className="comment-item">
                    <div className="comment-header">
                      <span className="comment-author">
                        {comment.user?.username || 'Anonymous'}
                      </span>
                      <span className="comment-date">
                        {new Date(comment.createdAt).toLocaleString('en-US')}
                      </span>
                    </div>
                    <p className="comment-content">{comment.content}</p>
                  </div>
                ))
              ) : (
                <p className="no-comments">No comments yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="detail-sidebar">
          <div className="sidebar-section">
            <h3>Status</h3>
            <select
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updating}
              className="sidebar-select"
              style={{ borderColor: getStatusColor(ticket.status) }}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="sidebar-section">
            <h3>Priority</h3>
            <select
              value={ticket.priority}
              onChange={(e) => handlePriorityChange(e.target.value)}
              disabled={updating}
              className="sidebar-select"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div className="sidebar-section">
            <h3>Information</h3>
            <div className="info-item">
              <span className="info-label">Created:</span>
              <span className="info-value">
                {new Date(ticket.createdAt).toLocaleString('en-US')}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Updated:</span>
              <span className="info-value">
                {new Date(ticket.updatedAt).toLocaleString('en-US')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
