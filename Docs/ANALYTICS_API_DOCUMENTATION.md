# Analytics API Documentation

## Base URL
```
http://localhost:8000/api/v1/analytics
```

## Authentication
- **Bearer Token**: Required for all operations
- **Admin Access**: All analytics endpoints require admin privileges

---

## Endpoints

### 1. Get Analytics Data
**GET** `/getAnalyticsData`

**Description**: Retrieve comprehensive analytics data including sales, orders, users, and revenue statistics.

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Response**:
```json
{
  "status": "success",
  "message": "Analytics data retrieved successfully",
  "data": {
    "totalSales": 125000.50,
    "totalOrders": 450,
    "totalUsers": 1200,
    "totalProducts": 85,
    "averageOrderValue": 277.78,
    "conversionRate": 12.5,
    "monthlyGrowth": 8.3,
    "topSellingProducts": [
      {
        "productId": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "iPhone 15 Pro",
        "totalSold": 45,
        "revenue": 44999.55
      },
      {
        "productId": "64f8a1b2c3d4e5f6a7b8c9d1",
        "name": "Samsung Galaxy S24",
        "totalSold": 32,
        "revenue": 28799.68
      }
    ],
    "recentOrders": [
      {
        "orderId": "64f8a1b2c3d4e5f6a7b8c9d2",
        "customerName": "John Doe",
        "amount": 999.99,
        "status": "completed",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "salesByCategory": [
      {
        "category": "Electronics",
        "totalSales": 75000.25,
        "orderCount": 280
      },
      {
        "category": "Clothing",
        "totalSales": 35000.15,
        "orderCount": 120
      },
      {
        "category": "Books",
        "totalSales": 15000.10,
        "orderCount": 50
      }
    ],
    "userGrowth": {
      "currentMonth": 150,
      "previousMonth": 120,
      "growthPercentage": 25.0
    },
    "revenueTrends": {
      "currentMonth": 45000.75,
      "previousMonth": 38000.50,
      "growthPercentage": 18.4
    }
  }
}
```

**Error Response**:
```json
{
  "status": "error",
  "message": "Unauthorized access",
  "error": "Only admins can access analytics data"
}
```

---

### 2. Get Daily Sales Data
**GET** `/getDailySalesData`

**Description**: Retrieve daily sales data for a specific date range with detailed breakdown.

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Query Parameters**:
- `startDate` (required): Start date in YYYY-MM-DD format
- `endDate` (required): End date in YYYY-MM-DD format

**Response**:
```json
{
  "status": "success",
  "message": "Daily sales data retrieved successfully",
  "data": {
    "dateRange": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-15"
    },
    "totalSales": 45000.75,
    "totalOrders": 180,
    "averageDailySales": 8000.05,
    "averageDailyOrders": 12,
    "dailyData": [
      {
        "date": "2024-01-01",
        "sales": 2800.50,
        "orders": 8,
        "averageOrderValue": 350.06,
        "topProduct": {
          "name": "iPhone 15 Pro",
          "quantity": 3,
          "revenue": 2999.97
        }
      },
      {
        "date": "2024-01-02",
        "sales": 3200.75,
        "orders": 12,
        "averageOrderValue": 266.73,
        "topProduct": {
          "name": "Samsung Galaxy S24",
          "quantity": 4,
          "revenue": 3599.96
        }
      },
      {
        "date": "2024-01-03",
        "sales": 2950.25,
        "orders": 10,
        "averageOrderValue": 295.03,
        "topProduct": {
          "name": "MacBook Pro",
          "quantity": 2,
          "revenue": 3999.98
        }
      }
    ],
    "salesTrends": {
      "trend": "increasing",
      "growthRate": 15.2,
      "peakDay": "2024-01-02",
      "peakSales": 3200.75
    },
    "categoryBreakdown": [
      {
        "category": "Electronics",
        "totalSales": 28000.45,
        "orderCount": 95,
        "percentage": 62.2
      },
      {
        "category": "Clothing",
        "totalSales": 12000.30,
        "orderCount": 60,
        "percentage": 26.7
      },
      {
        "category": "Books",
        "totalSales": 5000.00,
        "orderCount": 25,
        "percentage": 11.1
      }
    ],
    "hourlyDistribution": [
      {
        "hour": "09:00",
        "orders": 5,
        "sales": 1200.50
      },
      {
        "hour": "10:00",
        "orders": 8,
        "sales": 1800.75
      },
      {
        "hour": "11:00",
        "orders": 12,
        "sales": 2500.25
      }
    ]
  }
}
```

**Error Response**:
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "startDate",
      "message": "Start date is required and must be in YYYY-MM-DD format"
    },
    {
      "field": "endDate",
      "message": "End date must be after start date"
    }
  ]
}
```

---

## Validation Rules

### Date Range Validation
```javascript
{
  startDate: {
    type: 'string',
    required: true,
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    message: 'Start date must be in YYYY-MM-DD format'
  },
  endDate: {
    type: 'string',
    required: true,
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    message: 'End date must be in YYYY-MM-DD format',
    custom: (value, { startDate }) => {
      if (new Date(value) <= new Date(startDate)) {
        throw new Error('End date must be after start date');
      }
    }
  }
}
```

---

## Error Handling

### Common Error Codes
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (insufficient permissions - non-admin user)
- `500`: Internal Server Error

### Error Response Format
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

---

## Testing with Postman

### Environment Variables
```
BASE_URL: http://localhost:8000/api/v1
ADMIN_TOKEN: <your_admin_jwt_token>
```

### Test Data

#### Sample Date Ranges
```
# Last 7 days
startDate: 2024-01-08
endDate: 2024-01-15

# Last 30 days
startDate: 2023-12-16
endDate: 2024-01-15

# Specific month
startDate: 2024-01-01
endDate: 2024-01-31

# Custom range
startDate: 2024-01-10
endDate: 2024-01-20
```

### Postman Collection Setup

#### 1. Get Analytics Data
```
GET {{BASE_URL}}/analytics/getAnalyticsData
Headers:
  Authorization: Bearer {{ADMIN_TOKEN}}
```

#### 2. Get Daily Sales Data
```
GET {{BASE_URL}}/analytics/getDailySalesData?startDate=2024-01-01&endDate=2024-01-15
Headers:
  Authorization: Bearer {{ADMIN_TOKEN}}
```

---

## Frontend Integration Examples

### JavaScript (Fetch API)

#### Get Analytics Data
```javascript
const getAnalyticsData = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/v1/analytics/getAnalyticsData', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    throw error;
  }
};

// Usage
const analyticsData = await getAnalyticsData();
console.log('Total Sales:', analyticsData.totalSales);
console.log('Total Orders:', analyticsData.totalOrders);
```

#### Get Daily Sales Data
```javascript
const getDailySalesData = async (startDate, endDate) => {
  try {
    const queryParams = new URLSearchParams({
      startDate,
      endDate
    }).toString();
    
    const response = await fetch(`http://localhost:8000/api/v1/analytics/getDailySalesData?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error fetching daily sales data:', error);
    throw error;
  }
};

// Usage
const dailySalesData = await getDailySalesData('2024-01-01', '2024-01-15');
console.log('Daily Sales:', dailySalesData.dailyData);
```

### React Integration

#### Analytics Dashboard Component
```jsx
import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [dailySalesData, setDailySalesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/analytics/getAnalyticsData', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setAnalyticsData(data.data);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to fetch analytics data');
    }
  };

  const fetchDailySalesData = async () => {
    try {
      const queryParams = new URLSearchParams(dateRange).toString();
      const response = await fetch(`http://localhost:8000/api/v1/analytics/getDailySalesData?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setDailySalesData(data.data);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to fetch daily sales data');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAnalyticsData(), fetchDailySalesData()]);
      setLoading(false);
    };
    
    loadData();
  }, [dateRange]);

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) return <div className="loading">Loading analytics...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!analyticsData || !dailySalesData) return <div>No data available</div>;

  return (
    <div className="analytics-dashboard">
      <h1>Analytics Dashboard</h1>
      
      {/* Date Range Selector */}
      <div className="date-range-selector">
        <label>
          Start Date:
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
          />
        </label>
        <label>
          End Date:
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
          />
        </label>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Total Sales</h3>
          <p className="metric-value">${analyticsData.totalSales.toLocaleString()}</p>
        </div>
        <div className="metric-card">
          <h3>Total Orders</h3>
          <p className="metric-value">{analyticsData.totalOrders}</p>
        </div>
        <div className="metric-card">
          <h3>Total Users</h3>
          <p className="metric-value">{analyticsData.totalUsers}</p>
        </div>
        <div className="metric-card">
          <h3>Average Order Value</h3>
          <p className="metric-value">${analyticsData.averageOrderValue.toFixed(2)}</p>
        </div>
      </div>

      {/* Sales Trend Chart */}
      <div className="chart-container">
        <h2>Daily Sales Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailySalesData.dailyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => [`$${value}`, 'Sales']} />
            <Legend />
            <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown */}
      <div className="chart-container">
        <h2>Sales by Category</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={dailySalesData.categoryBreakdown}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name}: ${percentage}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="totalSales"
            >
              {dailySalesData.categoryBreakdown.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`$${value}`, 'Sales']} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Top Selling Products */}
      <div className="chart-container">
        <h2>Top Selling Products</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analyticsData.topSellingProducts}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
            <Legend />
            <Bar dataKey="revenue" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Orders */}
      <div className="recent-orders">
        <h2>Recent Orders</h2>
        <div className="orders-list">
          {analyticsData.recentOrders.map(order => (
            <div key={order.orderId} className="order-item">
              <div className="order-info">
                <span className="order-id">#{order.orderId.slice(-8)}</span>
                <span className="customer-name">{order.customerName}</span>
                <span className="order-amount">${order.amount}</span>
                <span className={`order-status ${order.status}`}>{order.status}</span>
              </div>
              <div className="order-date">
                {new Date(order.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
```

#### Analytics Service
```jsx
// services/analyticsService.js
class AnalyticsService {
  constructor() {
    this.baseURL = 'http://localhost:8000/api/v1/analytics';
    this.token = localStorage.getItem('adminToken');
  }

  async request(endpoint, options = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    const data = await response.json();

    if (data.status === 'success') {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  }

  async getAnalyticsData() {
    return this.request('/getAnalyticsData');
  }

  async getDailySalesData(startDate, endDate) {
    const queryParams = new URLSearchParams({ startDate, endDate }).toString();
    return this.request(`/getDailySalesData?${queryParams}`);
  }

  async getAnalyticsForDateRange(startDate, endDate) {
    const [analyticsData, dailySalesData] = await Promise.all([
      this.getAnalyticsData(),
      this.getDailySalesData(startDate, endDate)
    ]);

    return {
      analytics: analyticsData,
      dailySales: dailySalesData
    };
  }
}

export default new AnalyticsService();
```

### Vue.js Integration

#### Analytics Dashboard Component
```vue
<template>
  <div class="analytics-dashboard">
    <h1>Analytics Dashboard</h1>
    
    <!-- Date Range Selector -->
    <div class="date-range-selector">
      <label>
        Start Date:
        <input
          v-model="dateRange.startDate"
          type="date"
          @change="handleDateRangeChange"
        />
      </label>
      <label>
        End Date:
        <input
          v-model="dateRange.endDate"
          type="date"
          @change="handleDateRangeChange"
        />
      </label>
    </div>

    <!-- Loading and Error States -->
    <div v-if="loading" class="loading">Loading analytics...</div>
    <div v-else-if="error" class="error">Error: {{ error }}</div>
    
    <!-- Analytics Content -->
    <div v-else-if="analyticsData && dailySalesData" class="analytics-content">
      <!-- Key Metrics -->
      <div class="metrics-grid">
        <div class="metric-card">
          <h3>Total Sales</h3>
          <p class="metric-value">${{ formatNumber(analyticsData.totalSales) }}</p>
        </div>
        <div class="metric-card">
          <h3>Total Orders</h3>
          <p class="metric-value">{{ analyticsData.totalOrders }}</p>
        </div>
        <div class="metric-card">
          <h3>Total Users</h3>
          <p class="metric-value">{{ analyticsData.totalUsers }}</p>
        </div>
        <div class="metric-card">
          <h3>Average Order Value</h3>
          <p class="metric-value">${{ analyticsData.averageOrderValue.toFixed(2) }}</p>
        </div>
      </div>

      <!-- Sales Trend Chart -->
      <div class="chart-container">
        <h2>Daily Sales Trend</h2>
        <canvas ref="salesChart"></canvas>
      </div>

      <!-- Category Breakdown -->
      <div class="chart-container">
        <h2>Sales by Category</h2>
        <canvas ref="categoryChart"></canvas>
      </div>

      <!-- Recent Orders -->
      <div class="recent-orders">
        <h2>Recent Orders</h2>
        <div class="orders-list">
          <div
            v-for="order in analyticsData.recentOrders"
            :key="order.orderId"
            class="order-item"
          >
            <div class="order-info">
              <span class="order-id">#{{ order.orderId.slice(-8) }}</span>
              <span class="customer-name">{{ order.customerName }}</span>
              <span class="order-amount">${{ order.amount }}</span>
              <span :class="['order-status', order.status]">{{ order.status }}</span>
            </div>
            <div class="order-date">
              {{ formatDate(order.createdAt) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';

export default {
  name: 'AnalyticsDashboard',
  data() {
    return {
      analyticsData: null,
      dailySalesData: null,
      loading: true,
      error: null,
      dateRange: {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      },
      salesChart: null,
      categoryChart: null
    };
  },
  async mounted() {
    await this.loadAnalyticsData();
  },
  methods: {
    async loadAnalyticsData() {
      try {
        this.loading = true;
        this.error = null;
        
        const [analyticsResponse, dailySalesResponse] = await Promise.all([
          this.fetchAnalyticsData(),
          this.fetchDailySalesData()
        ]);
        
        this.analyticsData = analyticsResponse;
        this.dailySalesData = dailySalesResponse;
        
        this.$nextTick(() => {
          this.createCharts();
        });
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchAnalyticsData() {
      const response = await fetch('http://localhost:8000/api/v1/analytics/getAnalyticsData', {
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
    },
    
    async fetchDailySalesData() {
      const queryParams = new URLSearchParams(this.dateRange).toString();
      const response = await fetch(`http://localhost:8000/api/v1/analytics/getDailySalesData?${queryParams}`, {
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
    },
    
    createCharts() {
      this.createSalesChart();
      this.createCategoryChart();
    },
    
    createSalesChart() {
      const ctx = this.$refs.salesChart.getContext('2d');
      
      if (this.salesChart) {
        this.salesChart.destroy();
      }
      
      this.salesChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.dailySalesData.dailyData.map(item => item.date),
          datasets: [{
            label: 'Daily Sales',
            data: this.dailySalesData.dailyData.map(item => item.sales),
            borderColor: '#8884d8',
            backgroundColor: 'rgba(136, 132, 216, 0.1)',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Daily Sales Trend'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '$' + value.toLocaleString();
                }
              }
            }
          }
        }
      });
    },
    
    createCategoryChart() {
      const ctx = this.$refs.categoryChart.getContext('2d');
      
      if (this.categoryChart) {
        this.categoryChart.destroy();
      }
      
      this.categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: this.dailySalesData.categoryBreakdown.map(item => item.category),
          datasets: [{
            data: this.dailySalesData.categoryBreakdown.map(item => item.totalSales),
            backgroundColor: [
              '#0088FE',
              '#00C49F',
              '#FFBB28',
              '#FF8042',
              '#8884D8'
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Sales by Category'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${label}: $${value.toLocaleString()} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    },
    
    handleDateRangeChange() {
      this.loadAnalyticsData();
    },
    
    formatNumber(value) {
      return value.toLocaleString();
    },
    
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString();
    }
  },
  
  beforeUnmount() {
    if (this.salesChart) {
      this.salesChart.destroy();
    }
    if (this.categoryChart) {
      this.categoryChart.destroy();
    }
  }
};
</script>

<style scoped>
.analytics-dashboard {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.date-range-selector {
  margin-bottom: 20px;
  display: flex;
  gap: 20px;
}

.date-range-selector label {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.date-range-selector input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.metric-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.metric-card h3 {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 0.9em;
  text-transform: uppercase;
}

.metric-value {
  margin: 0;
  font-size: 2em;
  font-weight: bold;
  color: #333;
}

.chart-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.chart-container h2 {
  margin: 0 0 20px 0;
  color: #333;
}

.recent-orders {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
}

.order-info {
  display: flex;
  gap: 15px;
  align-items: center;
}

.order-id {
  font-weight: bold;
  color: #333;
}

.customer-name {
  color: #666;
}

.order-amount {
  font-weight: bold;
  color: #e74c3c;
}

.order-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8em;
  text-transform: uppercase;
}

.order-status.completed {
  background-color: #27ae60;
  color: white;
}

.order-status.pending {
  background-color: #f39c12;
  color: white;
}

.order-status.cancelled {
  background-color: #e74c3c;
  color: white;
}

.order-date {
  color: #999;
  font-size: 0.9em;
}

.loading,
.error {
  text-align: center;
  padding: 40px;
  font-size: 1.1em;
}

.error {
  color: #e74c3c;
}
</style>
```

---

## Notes for Frontend Developers

### Data Visualization
1. **Chart Libraries**: Use libraries like Chart.js, Recharts, or D3.js for data visualization
2. **Responsive Design**: Ensure charts are responsive and work on all screen sizes
3. **Color Schemes**: Use consistent color schemes for different data types
4. **Tooltips**: Provide detailed information on hover/click

### Performance Optimization
1. **Data Caching**: Cache analytics data to reduce API calls
2. **Lazy Loading**: Load charts only when visible
3. **Debouncing**: Debounce date range changes to avoid excessive API calls
4. **Pagination**: For large datasets, implement pagination

### Error Handling
1. **Network Errors**: Handle API failures gracefully
2. **Authentication**: Redirect to login if token expires
3. **Data Validation**: Validate data before rendering charts
4. **Fallback UI**: Show meaningful messages when data is unavailable

### Security Considerations
1. **Token Management**: Store admin tokens securely
2. **Data Privacy**: Ensure sensitive analytics data is not exposed
3. **Access Control**: Verify admin permissions on frontend
4. **HTTPS**: Use HTTPS in production

### Best Practices
1. **Loading States**: Show loading indicators during data fetching
2. **Error Boundaries**: Implement error boundaries for React components
3. **Date Formatting**: Use consistent date formatting across the app
4. **Number Formatting**: Format large numbers with appropriate separators
5. **Accessibility**: Ensure charts are accessible with proper ARIA labels

### Real-time Updates
1. **WebSocket Integration**: Consider real-time updates for live analytics
2. **Auto-refresh**: Implement auto-refresh for critical metrics
3. **Polling**: Use polling for near real-time updates if WebSockets aren't available
4. **User Preferences**: Allow users to configure update frequency

---

**Last Updated**: January 2024  
**API Version**: v1  
**Base URL**: `http://localhost:8000/api/v1`  
**Available Routes**: `/api/v1/auth`, `/api/v1/products`, `/api/v1/cart`, `/api/v1/coupons`, `/api/v1/orders`, `/api/v1/payments`, `/api/v1/analytics`, `/api/v1/contact` 