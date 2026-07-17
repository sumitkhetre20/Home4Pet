import api from './axios';

// Helper to extract data from backend wrapper
const responseBody = (response) => response.data;

export const authService = {
  register: (data) => api.post('/auth/register', data).then(responseBody),
  login: (credentials) => api.post('/auth/login', credentials).then(responseBody),
  changePassword: (data) => api.put('/auth/change-password', data).then(responseBody),
};

export const userService = {
  getMe: () => api.get('/users/me').then(responseBody),
  updateMe: (data) => api.put('/users/me', data).then(responseBody),
  getUserById: (id) => api.get(`/users/${id}`).then(responseBody),
  adminGetUsers: (page = 0, size = 10) => api.get(`/users?page=${page}&size=${size}`).then(responseBody),
  adminToggleUserStatus: (id, active) => {
    const endpoint = active ? `/users/${id}/activate` : `/users/${id}/deactivate`;
    return api.patch(endpoint).then(responseBody);
  },
  adminChangeRole: (id, role) => api.patch(`/users/${id}/role`, { role }).then(responseBody),
};

export const petService = {
  getPets: (params = {}) => api.get('/pets', { params }).then(responseBody),
  getPetById: (id) => api.get(`/pets/${id}`).then(responseBody),
  getMyPets: (page = 0, size = 10) => api.get(`/pets/me?page=${page}&size=${size}`).then(responseBody),
  createPet: (data) => api.post('/pets', data).then(responseBody),
  updatePet: (id, data) => api.put(`/pets/${id}`, data).then(responseBody),
  deletePet: (id) => api.delete(`/pets/${id}`).then(responseBody),
  uploadPetImage: (petId, file, isPrimary = false) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/pets/${petId}/images?primary=${isPrimary}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(responseBody);
  },
  deletePetImage: (petId, imageId) => api.delete(`/pets/${petId}/images/${imageId}`).then(responseBody),
};

export const adoptionService = {
  createRequest: (data) => api.post('/adoption-requests', data).then(responseBody),
  getRequestById: (id) => api.get(`/adoption-requests/${id}`).then(responseBody),
  getMyRequests: (page = 0, size = 10) => api.get(`/adoption-requests/my?page=${page}&size=${size}`).then(responseBody),
  getReceivedRequests: (page = 0, size = 10) => api.get(`/adoption-requests/received?page=${page}&size=${size}`).then(responseBody),
  adminGetRequests: (status = 'PENDING', page = 0) => api.get(`/adoption-requests?status=${status}&page=${page}`).then(responseBody),
  updateRequestStatus: (id, data) => api.patch(`/adoption-requests/${id}/status`, data).then(responseBody), // { status, adminNote }
};

export const favoriteService = {
  addFavorite: (petId) => api.post(`/favorites/${petId}`).then(responseBody),
  removeFavorite: (petId) => api.delete(`/favorites/${petId}`).then(responseBody),
  getFavorites: (page = 0, size = 10) => api.get(`/favorites?page=${page}&size=${size}`).then(responseBody),
  checkFavorite: (petId) => api.get(`/favorites/${petId}/check`).then(responseBody),
};

export const reviewService = {
  createReview: (data) => api.post('/reviews', data).then(responseBody), // { petId, rating, comment }
  getPetReviews: (petId, page = 0) => api.get(`/reviews/pet/${petId}?page=${page}`).then(responseBody),
  getMyReviews: (page = 0) => api.get(`/reviews/my?page=${page}`).then(responseBody),
  deleteReview: (id) => api.delete(`/reviews/${id}`).then(responseBody),
};

export const paymentService = {
  createPayment: (data) => api.post('/payments', data).then(responseBody),
  confirmPayment: (id) => api.post(`/payments/${id}/confirm`).then(responseBody),
  getPaymentById: (id) => api.get(`/payments/${id}`).then(responseBody),
  getMyPayments: (page = 0) => api.get(`/payments/my?page=${page}`).then(responseBody),
  adminGetPayments: (status = 'PENDING') => api.get(`/payments?status=${status}`).then(responseBody),
  createCheckoutSession: (petId) => api.post('/stripe/checkout', { petId }).then(responseBody),
  syncPayment: (sessionId) => api.post(`/stripe/sync-payment?sessionId=${sessionId}`).then(responseBody),
};

export const notificationService = {
  getNotifications: (page = 0, size = 10) => api.get(`/notifications?page=${page}&size=${size}`).then(responseBody),
  getUnreadCount: () => api.get('/notifications/unread-count').then(responseBody),
  markRead: (id) => api.patch(`/notifications/${id}/read`).then(responseBody),
  markAllRead: () => api.patch('/notifications/read-all').then(responseBody),
};

export const chatService = {
  sendMessage: (message) => api.post('/chat/messages', { message }).then(responseBody), // { message }
  getHistory: (page = 0, size = 50) => api.get(`/chat/messages?page=${page}&size=${size}`).then(responseBody),
  clearHistory: () => api.delete('/chat/messages').then(responseBody),
};

export const adminService = {
  getDashboardStats: () => api.get('/admin/dashboard').then(responseBody),
};

export const healthService = {
  getHealth: () => api.get('/health').then(responseBody),
};
