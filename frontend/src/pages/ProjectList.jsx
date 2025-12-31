import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiPlus, HiFolder, HiUsers, HiClock } from 'react-icons/hi';
import { projectsAPI } from '../services/api';
import './ProjectList.css';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.getAll();
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
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
    <div className="project-list-page">
      <div className="page-header">
        <h1>Projects</h1>
        <Link to="/projects/new" className="btn-primary">
          <HiPlus className="btn-icon" />
          New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <HiFolder className="empty-icon" />
          <p>No projects yet</p>
          <Link to="/projects/new" className="btn-primary">
            Create First Project
          </Link>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => (
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
                <div className="project-meta">
                  <HiUsers className="meta-icon" />
                  <span>{project.members?.length || 0} members</span>
                </div>
                <div className="project-meta">
                  <HiClock className="meta-icon" />
                  <span>{new Date(project.createdAt).toLocaleDateString('en-US')}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;

