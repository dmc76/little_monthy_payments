import { useState, useEffect } from 'react';
import { Project, ProjectItem } from '../types/Payment';
import { saveProjects, loadProjects } from '../utils/storageUtils';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const storedProjects = loadProjects();
    setProjects(storedProjects);
  }, []);

  const addProject = (project: Omit<Project, 'id' | 'createdAt' | 'totalAmount'>) => {
    const totalAmount = project.items.reduce((sum, item) => sum + item.amount, 0);
    const newProject: Project = {
      ...project,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      totalAmount
    };
    
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    saveProjects(updatedProjects);
    return newProject;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    const updatedProjects = projects.map(project => {
      if (project.id === id) {
        const updated = { ...project, ...updates };
        if (updates.items) {
          updated.totalAmount = updates.items.reduce((sum, item) => sum + item.amount, 0);
        }
        return updated;
      }
      return project;
    });
    setProjects(updatedProjects);
    saveProjects(updatedProjects);
  };

  const deleteProject = (id: string) => {
    const updatedProjects = projects.filter(project => project.id !== id);
    setProjects(updatedProjects);
    saveProjects(updatedProjects);
  };

  const addItemToProject = (projectId: string, item: Omit<ProjectItem, 'id' | 'isSelected' | 'isCompleted'>) => {
    const newItem: ProjectItem = {
      ...item,
      id: crypto.randomUUID(),
      isSelected: false,
      isCompleted: false
    };

    const project = projects.find(p => p.id === projectId);
    if (project) {
      const updatedItems = [...project.items, newItem];
      updateProject(projectId, { items: updatedItems });
    }
  };

  const updateProjectItem = (projectId: string, itemId: string, updates: Partial<ProjectItem>) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const updatedItems = project.items.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      );
      updateProject(projectId, { items: updatedItems });
    }
  };

  const deleteProjectItem = (projectId: string, itemId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const updatedItems = project.items.filter(item => item.id !== itemId);
      updateProject(projectId, { items: updatedItems });
    }
  };

  const toggleItemSelection = (projectId: string, itemId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const item = project.items.find(i => i.id === itemId);
      if (item && !item.isCompleted) {
        updateProjectItem(projectId, itemId, { 
          isSelected: !item.isSelected 
        });
      }
    }
  };

  const toggleItemCompletion = (projectId: string, itemId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const item = project.items.find(i => i.id === itemId);
      if (item) {
        updateProjectItem(projectId, itemId, { 
          isCompleted: !item.isCompleted,
          isSelected: false // Unselect when completed
        });
      }
    }
  };

  return {
    projects,
    addProject,
    updateProject,
    deleteProject,
    addItemToProject,
    updateProjectItem,
    deleteProjectItem,
    toggleItemSelection,
    toggleItemCompletion
  };
};