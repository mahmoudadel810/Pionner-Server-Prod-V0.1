# 📞 TheShop Contact API Documentation

## 📋 Table of Contents
- [Base URL & Headers](#base-url--headers)
- [Authentication & Authorization](#authentication--authorization)
- [API Endpoints](#api-endpoints)
- [Error Handling](#error-handling)
- [Testing Data](#testing-data)

---

## 🌐 Base URL & Headers

### Base URL
```
Development: http://localhost:3000/api/v1
Production: https://your-domain.com/api/v1
```

### Required Headers
```javascript
Content-Type: application/json
Authorization: Bearer <access_token> // REQUIRED for admin routes only
```

---

## 🔐 Authentication & Authorization

**Contact form submission is public** - no authentication required for users to submit contact forms.

**Admin routes require authentication and admin privileges** for managing contact submissions.

### Access Levels
```
Public: Submit contact forms
Admin: View, manage, and delete contact submissions
```

---

## 📡 API Endpoints

### 1. 📝 Submit Contact Form (Public)
**POST** `/contact/submitContactForm`

**Description**: Submit a new contact form message (public access).

**Headers:**
```javascript
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Product Inquiry",
  "message": "I have a question about your iPhone 15 Pro. What are the available colors?"
}
```

**Validation Rules:**
- `name`: Required, 2-50 characters
- `email`: Required, valid email format
- `subject`: Required, 5-100 characters
- `message`: Required, 10-1000 characters

**Success Response (201):**
```json
{
  "status": "success",
  "message": "Contact form submitted successfully. We'll get back to you soon!",
  "data": {
    "contactSubmission": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Doe",
      "email": "john@example.com",
      "subject": "Product Inquiry",
      "message": "I have a question about your iPhone 15 Pro. What are the available colors?",
      "isRead": false,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**
```json
// 400 - Validation Error
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Name is required and must be between 2 and 50 characters"
    },
    {
      "field": "email",
      "message": "Please enter a valid email address"
    }
  ]
}

// 500 - Email Service Error
{
  "status": "error",
  "message": "Failed to send confirmation email",
  "error": "Email service temporarily unavailable"
}
```

---

### 2. 📋 Get All Contact Submissions (Admin Only)
**GET** `/contact/getAllContactSubmissions`

**Description**: Retrieve all contact form submissions with pagination and sorting.

**Headers Required:**
```javascript
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1, min: 1)
- `limit` (optional): Items per page (default: 10, min: 1, max: 50)
- `sort` (optional): Sort field (name, email, subject, createdAt, default: createdAt)
- `order` (optional): Sort order (asc, desc, default: desc)

**Example Request:**
```
GET /contact/getAllContactSubmissions?page=1&limit=10&sort=createdAt&order=desc
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Contact submissions retrieved successfully",
  "data": {
    "contactSubmissions": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "John Doe",
        "email": "john@example.com",
        "subject": "Product Inquiry",
        "message": "I have a question about your iPhone 15 Pro. What are the available colors?",
        "isRead": false,
        "createdAt": "2024-01-15T10:30:00.000Z"
      },
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "subject": "Order Status",
        "message": "I placed an order yesterday and would like to know the current status.",
        "isRead": true,
        "createdAt": "2024-01-14T15:45:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 48,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

**Error Response (401):**
```json
{
  "status": "error",
  "message": "Unauthorized access",
  "error": "Only admins can access contact submissions"
}
```

---

### 3. 🔍 Get Single Contact Submission (Admin Only)
**GET** `/contact/getContactSubmission/:id`

**Description**: Retrieve a specific contact submission by ID.

**Headers Required:**
```javascript
Authorization: Bearer <admin_token>
```

**URL Parameters:**
- `id`: Contact submission ID (24-character MongoDB ObjectId)

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Contact submission retrieved successfully",
  "data": {
    "contactSubmission": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Doe",
      "email": "john@example.com",
      "subject": "Product Inquiry",
      "message": "I have a question about your iPhone 15 Pro. What are the available colors? I'm particularly interested in the titanium finish and would like to know if it's available in all storage configurations.",
      "isRead": false,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**
```json
// 400 - Invalid ID
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "id",
      "message": "Invalid contact submission ID format"
    }
  ]
}

// 404 - Not Found
{
  "status": "error",
  "message": "Contact submission not found",
  "error": "No contact submission found with this ID"
}
```

---

### 4. ✅ Mark as Read (Admin Only)
**PATCH** `/contact/markAsRead/:id`

**Description**: Mark a contact submission as read.

**Headers Required:**
```javascript
Authorization: Bearer <admin_token>
```

**URL Parameters:**
- `id`: Contact submission ID (24-character MongoDB ObjectId)

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Contact submission marked as read",
  "data": {
    "contactSubmission": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Doe",
      "email": "john@example.com",
      "subject": "Product Inquiry",
      "message": "I have a question about your iPhone 15 Pro. What are the available colors?",
      "isRead": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Error Response (404):**
```json
{
  "status": "error",
  "message": "Contact submission not found",
  "error": "No contact submission found with this ID"
}
```

---

### 5. 🗑️ Delete Contact Submission (Admin Only)
**DELETE** `/contact/deleteContactSubmission/:id`

**Description**: Delete a contact submission permanently.

**Headers Required:**
```javascript
Authorization: Bearer <admin_token>
```

**URL Parameters:**
- `id`: Contact submission ID (24-character MongoDB ObjectId)

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Contact submission deleted successfully",
  "data": {
    "contactSubmission": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Doe",
      "email": "john@example.com",
      "subject": "Product Inquiry",
      "message": "I have a question about your iPhone 15 Pro. What are the available colors?",
      "isRead": false,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Error Response (404):**
```json
{
  "status": "error",
  "message": "Contact submission not found",
  "error": "No contact submission found with this ID"
}
```

---

### 6. 📊 Get Unread Count (Admin Only)
**GET** `/contact/getUnreadCount`

**Description**: Get the count of unread contact submissions for dashboard display.

**Headers Required:**
```javascript
Authorization: Bearer <admin_token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Unread count retrieved successfully",
  "data": {
    "unreadCount": 12
  }
}
```

**Error Response (401):**
```json
{
  "status": "error",
  "message": "Unauthorized access",
  "error": "Only admins can access contact data"
}
```

---

## ⚠️ Error Handling

### Standard Error Format
```json
{
  "status": "error",
  "message": "Error description",
  "error": "Detailed error message",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message"
    }
  ]
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created (contact form submitted)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (contact submission not found)
- `500` - Internal Server Error

---

## 🧪 Testing Data

### Valid Contact Form Submissions
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Product Inquiry",
  "message": "I have a question about your iPhone 15 Pro. What are the available colors?"
}
```

```json
{
  "name": "Jane Smith",
  "email": "jane.smith@company.com",
  "subject": "Bulk Order Request",
  "message": "I'm interested in placing a bulk order for 50 units of the Samsung Galaxy S24. Could you please provide pricing information and delivery timeline?"
}
```

```json
{
  "name": "Ahmed Hassan",
  "email": "ahmed@techstartup.com",
  "subject": "Technical Support",
  "message": "I'm experiencing issues with the checkout process. When I try to complete my purchase, I get an error message. Can you help me resolve this?"
}
```

### Invalid Contact Form Submissions
```json
// Missing required fields
{
  "name": "John Doe",
  "email": "john@example.com"
  // Missing subject and message
}

// Invalid email format
{
  "name": "John Doe",
  "email": "invalid-email",
  "subject": "Test",
  "message": "This is a test message"
}

// Too short message
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Test",
  "message": "Hi"
}
```

---

## 🔧 Frontend Integration Examples

### JavaScript (Fetch API)

#### Submit Contact Form
```javascript
const submitContactForm = async (formData) => {
  try {
    const response = await fetch('http://localhost:3000/api/v1/contact/submitContactForm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.data.contactSubmission;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error submitting contact form:', error);
    throw error;
  }
};

// Usage
const contactData = {
  name: 'John Doe',
  email: 'john@example.com',
  subject: 'Product Inquiry',
  message: 'I have a question about your products...'
};

const submission = await submitContactForm(contactData);
console.log('Contact form submitted:', submission);
```

#### Get All Contact Submissions (Admin)
```javascript
const getAllContactSubmissions = async (page = 1, limit = 10, sort = 'createdAt', order = 'desc') => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort,
      order
    }).toString();
    
    const response = await fetch(`http://localhost:3000/api/v1/contact/getAllContactSubmissions?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    throw error;
  }
};
```

#### Mark as Read
```javascript
const markAsRead = async (submissionId) => {
  try {
    const response = await fetch(`http://localhost:3000/api/v1/contact/markAsRead/${submissionId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.data.contactSubmission;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error marking as read:', error);
    throw error;
  }
};
```

### React Integration

#### Contact Form Component
```jsx
import React, { useState } from 'react';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('http://localhost:3000/api/v1/contact/submitContactForm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.status === 'success') {
        setSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to submit contact form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-form">
      <h2>Contact Us</h2>
      
      {success && (
        <div className="success-message">
          Thank you for your message! We'll get back to you soon.
        </div>
      )}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            minLength={2}
            maxLength={50}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="subject">Subject *</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            required
            minLength={5}
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label htmlFor="message">Message *</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            required
            minLength={10}
            maxLength={1000}
            rows={5}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
```

#### Admin Contact Management Component
```jsx
import React, { useState, useEffect } from 'react';

const ContactManagement = () => {
  const [submissions, setSubmissions] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchSubmissions = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/v1/contact/getAllContactSubmissions?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      const data = await response.json();

      if (data.status === 'success') {
        setSubmissions(data.data.contactSubmissions);
        setPagination(data.data.pagination);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to fetch contact submissions');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/contact/getUnreadCount', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      const data = await response.json();

      if (data.status === 'success') {
        setUnreadCount(data.data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const handleMarkAsRead = async (submissionId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/contact/markAsRead/${submissionId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      const data = await response.json();

      if (data.status === 'success') {
        // Update the submission in the list
        setSubmissions(prev => 
          prev.map(sub => 
            sub._id === submissionId 
              ? { ...sub, isRead: true }
              : sub
          )
        );
        // Update unread count
        fetchUnreadCount();
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleDelete = async (submissionId) => {
    if (!window.confirm('Are you sure you want to delete this contact submission?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/v1/contact/deleteContactSubmission/${submissionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      const data = await response.json();

      if (data.status === 'success') {
        // Remove from list
        setSubmissions(prev => prev.filter(sub => sub._id !== submissionId));
        // Update unread count
        fetchUnreadCount();
      }
    } catch (error) {
      console.error('Failed to delete submission:', error);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    fetchUnreadCount();
  }, []);

  if (loading) return <div>Loading contact submissions...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="contact-management">
      <div className="header">
        <h2>Contact Submissions</h2>
        <div className="unread-badge">
          {unreadCount} unread
        </div>
      </div>

      <div className="submissions-list">
        {submissions.map(submission => (
          <div key={submission._id} className={`submission-card ${!submission.isRead ? 'unread' : ''}`}>
            <div className="submission-header">
              <h3>{submission.subject}</h3>
              <div className="submission-meta">
                <span className="name">{submission.name}</span>
                <span className="email">{submission.email}</span>
                <span className="date">
                  {new Date(submission.createdAt).toLocaleDateString()}
                </span>
                {!submission.isRead && <span className="unread-indicator">New</span>}
              </div>
            </div>
            
            <div className="submission-message">
              {submission.message}
            </div>
            
            <div className="submission-actions">
              {!submission.isRead && (
                <button 
                  onClick={() => handleMarkAsRead(submission._id)}
                  className="mark-read-btn"
                >
                  Mark as Read
                </button>
              )}
              <button 
                onClick={() => handleDelete(submission._id)}
                className="delete-btn"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="pagination">
          {pagination.hasPrevPage && (
            <button onClick={() => fetchSubmissions(pagination.currentPage - 1)}>
              Previous
            </button>
          )}
          <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
          {pagination.hasNextPage && (
            <button onClick={() => fetchSubmissions(pagination.currentPage + 1)}>
              Next
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ContactManagement;
```

### Vue.js Integration

#### Contact Form Component
```vue
<template>
  <div class="contact-form">
    <h2>Contact Us</h2>
    
    <div v-if="success" class="success-message">
      Thank you for your message! We'll get back to you soon.
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="name">Name *</label>
        <input
          id="name"
          v-model="formData.name"
          type="text"
          required
          minlength="2"
          maxlength="50"
        />
      </div>

      <div class="form-group">
        <label for="email">Email *</label>
        <input
          id="email"
          v-model="formData.email"
          type="email"
          required
        />
      </div>

      <div class="form-group">
        <label for="subject">Subject *</label>
        <input
          id="subject"
          v-model="formData.subject"
          type="text"
          required
          minlength="5"
          maxlength="100"
        />
      </div>

      <div class="form-group">
        <label for="message">Message *</label>
        <textarea
          id="message"
          v-model="formData.message"
          required
          minlength="10"
          maxlength="1000"
          rows="5"
        />
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Sending...' : 'Send Message' }}
      </button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'ContactForm',
  data() {
    return {
      formData: {
        name: '',
        email: '',
        subject: '',
        message: ''
      },
      loading: false,
      error: null,
      success: false
    };
  },
  methods: {
    async handleSubmit() {
      this.loading = true;
      this.error = null;
      this.success = false;

      try {
        const response = await fetch('http://localhost:3000/api/v1/contact/submitContactForm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.formData)
        });

        const data = await response.json();

        if (data.status === 'success') {
          this.success = true;
          this.formData = { name: '', email: '', subject: '', message: '' };
        } else {
          this.error = data.message;
        }
      } catch (error) {
        this.error = 'Failed to submit contact form';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.contact-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.form-group textarea {
  resize: vertical;
}

button {
  background-color: #007bff;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.success-message {
  background-color: #d4edda;
  color: #155724;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
}
</style>
```

---

## 📝 Notes for Frontend Developers

### Contact Form Implementation
1. **Public Access**: Contact form submission doesn't require authentication
2. **Email Notifications**: Users receive confirmation emails automatically
3. **Validation**: Implement client-side validation matching server rules
4. **Success Handling**: Show success message and clear form after submission
5. **Error Handling**: Display specific validation errors to users

### Admin Dashboard Features
1. **Real-time Updates**: Unread count updates when marking as read
2. **Pagination**: Handle large numbers of contact submissions
3. **Sorting**: Allow sorting by different fields
4. **Bulk Actions**: Consider implementing bulk mark as read/delete
5. **Search/Filter**: Add search functionality for large datasets

### Email Integration
1. **Confirmation Emails**: Users receive automatic confirmation emails
2. **Admin Notifications**: Admins receive notifications for new submissions
3. **Email Templates**: Customize email content and styling
4. **Email Service**: Ensure reliable email delivery service

### Security Considerations
1. **Rate Limiting**: Implement rate limiting for contact form submissions
2. **Spam Protection**: Consider CAPTCHA or other anti-spam measures
3. **Input Sanitization**: Sanitize user inputs before processing
4. **Admin Access**: Ensure proper admin authentication and authorization

### Best Practices
1. **Loading States**: Show loading indicators during form submission
2. **Form Validation**: Provide immediate feedback on validation errors
3. **Accessibility**: Ensure forms are accessible with proper labels
4. **Mobile Responsive**: Design forms to work well on mobile devices
5. **Error Recovery**: Allow users to recover from submission errors

---

## 🎯 Use Cases

### 1. Customer Support
```javascript
// Customer submits support request
const supportRequest = {
  name: "John Doe",
  email: "john@example.com",
  subject: "Technical Support Needed",
  message: "I'm having trouble with the checkout process..."
};

await submitContactForm(supportRequest);
```

### 2. Product Inquiries
```javascript
// Customer asks about product availability
const productInquiry = {
  name: "Jane Smith",
  email: "jane@company.com",
  subject: "iPhone 15 Pro Availability",
  message: "When will the iPhone 15 Pro be back in stock?"
};

await submitContactForm(productInquiry);
```

### 3. Admin Management
```javascript
// Admin views and manages submissions
const submissions = await getAllContactSubmissions(1, 20);
const unreadCount = await getUnreadCount();

// Mark as read
await markAsRead(submissionId);

// Delete submission
await deleteContactSubmission(submissionId);
```

---

## 🚀 Getting Started

1. **Public Form**: Users can submit contact forms without authentication
2. **Admin Access**: Admins can view and manage submissions
3. **Email Notifications**: Automatic email confirmations sent
4. **Dashboard Integration**: Include unread count in admin dashboard

---

## 🔄 Typical Flows

### Customer Flow
```
1. Customer visits contact page
2. Customer fills out contact form
3. Customer submits form → POST /contact/submitContactForm
4. Customer receives confirmation email
5. Admin receives notification email
```

### Admin Flow
```
1. Admin logs in → Gets admin token
2. Admin visits contact management → GET /contact/getAllContactSubmissions
3. Admin views unread count → GET /contact/getUnreadCount
4. Admin reads submission → PATCH /contact/markAsRead/:id
5. Admin responds to customer (via email)
6. Admin deletes old submissions → DELETE /contact/deleteContactSubmission/:id
```

---

**Last Updated**: January 2024  
**API Version**: v1  
**Base URL**: `http://localhost:3000/api/v1`  
**Authentication**: Required for admin routes only  
**Email Service**: Automatic notifications enabled 