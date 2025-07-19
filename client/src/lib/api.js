import axiosInstance from './axios';

// API service class for centralized API management
class ApiService {
  // Auth endpoints
  static auth = {
    signup: (data) => axiosInstance.post('/auth/signup', data),
    login: (data) => axiosInstance.post('/auth/login', data),
    logout: () => axiosInstance.post('/auth/logout'),
    forgotPassword: (data) => axiosInstance.post('/auth/forgot-password', data),
    resetPassword: (data) => axiosInstance.post('/auth/reset-password', data),
    confirmEmail: (token) => axiosInstance.post(`/auth/confirm-email/${token}`),
    checkAuth: () => axiosInstance.get('/auth/me'),
    refreshToken: () => axiosInstance.post('/auth/refresh-token'),
  };

  // Product endpoints
  static products = {
    getAll: (params) => axiosInstance.get('/products', { params }),
    getById: (id) => axiosInstance.get(`/products/${id}`),
    create: (data) => axiosInstance.post('/products/createProduct', data),
    update: (id, data) => axiosInstance.put(`/products/${id}`, data),
    delete: (id) => axiosInstance.delete(`/products/deleteProduct/${id}`),
    toggleFeatured: (id) => axiosInstance.patch(`/products/toggleFeaturedProduct/${id}`),
    getFeatured: () => axiosInstance.get('/products/getFeaturedProducts'),
    getBestsellers: () => axiosInstance.get('/products/getBestsellerProducts'),
    getNew: () => axiosInstance.get('/products/getNewProducts'),
    getSale: () => axiosInstance.get('/products/getSaleProducts'),
    getByCategory: (category) => axiosInstance.get(`/products/getProductsByCategory/${category}`),
    search: (query, params) => axiosInstance.get(`/products/search/${query}`, { params }),
  };

  // Category endpoints
  static categories = {
    getAll: (params) => axiosInstance.get('/categories', { params }),
    getById: (id) => axiosInstance.get(`/categories/${id}`),
    getProducts: (id, params) => axiosInstance.get(`/categories/${id}/products`, { params }),
  };

  // Cart endpoints
  static cart = {
    getItems: () => axiosInstance.get('/cart'),
    addItem: (data) => axiosInstance.post('/cart/add', data),
    updateItem: (id, data) => axiosInstance.put(`/cart/${id}`, data),
    removeItem: (id) => axiosInstance.delete(`/cart/${id}`),
    clear: () => axiosInstance.delete('/cart'),
  };

  // Wishlist endpoints
  static wishlist = {
    getItems: () => axiosInstance.get('/wishlist'),
    addItem: (data) => axiosInstance.post('/wishlist/add', data),
    removeItem: (id) => axiosInstance.delete(`/wishlist/${id}`),
    clear: () => axiosInstance.delete('/wishlist'),
  };

  // Order endpoints
  static orders = {
    getAll: (params) => axiosInstance.get('/orders', { params }),
    getById: (id) => axiosInstance.get(`/orders/${id}`),
    create: (data) => axiosInstance.post('/orders', data),
    cancel: (id) => axiosInstance.put(`/orders/${id}/cancel`),
  };

  // Payment endpoints
  static payments = {
    createCheckoutSession: (data) => axiosInstance.post('/payments/createCheckoutSession', data),
    checkoutSuccess: (data) => axiosInstance.post('/payments/checkoutSuccess', data),
    createIntent: (data) => axiosInstance.post('/payments/create-intent', data),
    confirm: (data) => axiosInstance.post('/payments/confirm', data),
    webhook: (data) => axiosInstance.post('/payments/webhook', data),
  };

  // User profile endpoints
  static profile = {
    get: () => axiosInstance.get('/profile'),
    update: (data) => axiosInstance.put('/profile', data),
    changePassword: (data) => axiosInstance.put('/profile/change-password', data),
  };

  // Contact endpoints
  static contact = {
    submit: (data) => axiosInstance.post('/contact', data),
  };

  // Analytics endpoints (admin only)
  static analytics = {
    getStats: () => axiosInstance.get('/analytics/stats'),
    getSales: (params) => axiosInstance.get('/analytics/sales', { params }),
    getProducts: (params) => axiosInstance.get('/analytics/products', { params }),
  };

  // Coupon endpoints
  static coupons = {
    get: () => axiosInstance.get('/coupons/getCoupon'),
    validate: (code) => axiosInstance.post('/coupons/validateCoupon', { code }),
  };
}

export default ApiService;