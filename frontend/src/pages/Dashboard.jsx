import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiFolder, HiPlus, HiUsers } from 'react-icons/hi';
import { projectsAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await projectsAPI.getAll();
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'var(--apple-green)',
      'Archived': 'var(--apple-gray)',
      'Completed': 'var(--apple-blue)',
    };
    return colors[status] || 'var(--apple-gray)';
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <Link to="/projects/new" className="btn-primary">
          <HiPlus className="btn-icon" />
          New Project
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <HiFolder className="stat-icon" />
          <div className="stat-content">
            <div className="stat-value">{projects.length}</div>
            <div className="stat-label">Total Projects</div>
          </div>
        </div>

        <div className="stat-card">
          <HiFolder className="stat-icon" style={{ color: 'var(--apple-green)' }} />
          <div className="stat-content">
            <div className="stat-value">
              {projects.filter(p => p.status === 'Active').length}
            </div>
            <div className="stat-label">Active Projects</div>
          </div>
        </div>

        <div className="stat-card">
          <HiUsers className="stat-icon" style={{ color: 'var(--apple-blue)' }} />
          <div className="stat-content">
            <div className="stat-value">
              {projects.reduce((sum, p) => sum + (p.members?.length || 0), 0)}
            </div>
            <div className="stat-label">Total Members</div>
          </div>
        </div>
      </div>

      <div className="recent-projects">
        <h2>My Projects</h2>
        {projects.length === 0 ? (
          <div className="empty-state">
            <p>No projects yet</p>
            <Link to="/projects/new" className="btn-primary">
              Create First Project
            </Link>
          </div>
        ) : (
          <div className="project-list">
            {projects.slice(0, 6).map(project => (
              <Link
                key={project._id}
                to={`/projects/${project._id}`}
                className="project-card"
              >
                <div className="project-header">
                  <HiFolder className="project-icon" />
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(project.status) }}
                  >
                    {project.status}
                  </span>
                </div>
                <h3>{project.name}</h3>
                <p className="project-description">
                  {project.description || 'No description'}
                </p>
                <div className="project-footer">
                  <HiUsers className="meta-icon" />
                  <span>{project.members?.length || 0} members</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
