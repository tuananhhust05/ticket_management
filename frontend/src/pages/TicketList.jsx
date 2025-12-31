import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiPlus, HiSearch } from 'react-icons/hi';
import { ticketsAPI } from '../services/api';
import './TicketList.css';

const TicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
  });

  useEffect(() => {
    fetchTickets();
  }, [filters]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketsAPI.getAll(filters);
      setTickets(response.data);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
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

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="ticket-list-page">
      <div className="page-header">
        <h1>All Tickets</h1>
        <Link to="/tickets/new" className="btn-primary">
          <HiPlus className="btn-icon" />
          New Ticket
        </Link>
      </div>

      <div className="filters">
        <div className="search-wrapper">
          <HiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search tickets..."
            className="search-input"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <select
          className="filter-select"
          value={filters.priority}
          onChange={(e) => handleFilterChange('priority', e.target.value)}
        >
          <option value="">All Priority</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Urgent">Urgent</option>
        </select>
      </div>

      {tickets.length === 0 ? (
        <div className="empty-state">
          <p>No tickets found</p>
          <Link to="/tickets/new" className="btn-primary">
            Create First Ticket
          </Link>
        </div>
      ) : (
        <div className="tickets-grid">
          {tickets.map(ticket => (
            <Link
              key={ticket._id}
              to={`/tickets/${ticket._id}`}
              className="ticket-card-large"
            >
              <div className="ticket-card-header">
                <h3>{ticket.title}</h3>
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(ticket.status) }}
                >
                  {ticket.status}
                </span>
              </div>
              <p className="ticket-description">
                {ticket.description || 'No description'}
              </p>
              <div className="ticket-meta">
                <div className="meta-item">
                  <span className="meta-label">Priority:</span>
                  <span
                    className="priority-badge"
                    style={{ color: getPriorityColor(ticket.priority) }}
                  >
                    {ticket.priority}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Created:</span>
                  <span className="meta-value">
                    {new Date(ticket.createdAt).toLocaleDateString('en-US')}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketList;
