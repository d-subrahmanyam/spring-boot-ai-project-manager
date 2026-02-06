import axios from 'axios';
import { Project, Note } from '../actions';

export const API_BASE_URL = '/api/agent';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const projectsApi = {
  fetchProjects: () => api.get<Project[]>('/projects'),
  getProject: (id: string) => api.get<Project>(`/projects/${id}`),
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<Project>('/projects', project),
  updateProject: (id: string, project: Partial<Project>) =>
    api.put<Project>(`/projects/${id}`, project),
  deleteProject: (id: string) => api.delete(`/projects/${id}`),
};

export const notesApi = {
  fetchNotes: () => api.get<Note[]>('/notes'),
  getNote: (id: string) => api.get<Note>(`/notes/${id}`),
  createNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<Note>('/notes', note),
  updateNote: (id: string, note: Partial<Note>) =>
    api.put<Note>(`/notes/${id}`, note),
  deleteNote: (id: string) => api.delete(`/notes/${id}`),
};

export default api;
