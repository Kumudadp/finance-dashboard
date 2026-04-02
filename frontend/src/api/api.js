import client from './client';

export const authAPI = {
  login: (email, password) => {
    const form = new URLSearchParams();
    form.append('username', email);
    form.append('password', password);
    return client.post('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },
};

export const dashboardAPI = {
  getSummary: () => client.get('/dashboard/summary'),
};

export const recordsAPI = {
  getAll:  (params)     => client.get('/records/', { params }),
  getOne:  (id)         => client.get('/records/' + id),
  create:  (data)       => client.post('/records/', data),
  update:  (id, data)   => client.patch('/records/' + id, data),
  remove:  (id)         => client.delete('/records/' + id),
};

export const usersAPI = {
  getAll:     ()         => client.get('/users/'),
  create:     (data)     => client.post('/users/', data),
  update:     (id, data) => client.patch('/users/' + id, data),
  activate:   (id)       => client.patch('/users/' + id + '/activate'),
  deactivate: (id)       => client.patch('/users/' + id + '/deactivate'),
  remove:     (id)       => client.delete('/users/' + id),
};