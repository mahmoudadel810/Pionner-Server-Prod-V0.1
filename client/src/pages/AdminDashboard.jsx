import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  Package,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  MoreVertical,
} from "lucide-react";
import { useProductStore } from "../stores/useProductStore";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";

const AdminDashboard = () => {
  const { products, fetchAllProducts, deleteProduct, loading } =
    useProductStore();
  const [contacts, setContacts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await fetchAllProducts();
      await fetchContacts();
      await fetchOrders();
      await fetchStats();
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await axios.get("/contact");
      setContacts(response.data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get("/orders/all");
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get("/analytics/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleDeleteProduct = async productId => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(productId);
        toast.success("Product deleted successfully");
      } catch (error) {
        toast.error("Failed to delete product");
      }
    }
  };

  const filteredProducts = products.filter(
    product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = [
    { id: "overview", name: "Overview", icon: TrendingUp },
    { id: "products", name: "Products", icon: Package },
    { id: "orders", name: "Orders", icon: DollarSign },
    { id: "customers", name: "Customers", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your store and monitor performance
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Products</p>
                <p className="text-3xl font-bold text-foreground">
                  {stats.totalProducts}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Package size={24} className="text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Orders</p>
                <p className="text-3xl font-bold text-foreground">
                  {stats.totalOrders}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <DollarSign size={24} className="text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-foreground">
                  ${stats.totalRevenue}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp size={24} className="text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Customers</p>
                <p className="text-3xl font-bold text-foreground">
                  {stats.totalCustomers}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Users size={24} className="text-purple-500" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex space-x-1 bg-card rounded-lg p-1 border border-border">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon size={16} />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Recent Orders */}
              <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Recent Orders
                </h2>
                <div className="space-y-4">
                  {orders.slice(0, 5).map(order => (
                    <div
                      key={order._id}
                      className="flex items-center justify-between p-4 bg-background rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          Order #{order._id.slice(-8)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">
                          ${order.total}
                        </p>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === "delivered"
                              ? "bg-green-100 text-green-600"
                              : order.status === "pending"
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Contacts */}
              <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Recent Customer Messages
                </h2>
                <div className="space-y-4">
                  {contacts.slice(0, 5).map(contact => (
                    <div
                      key={contact._id}
                      className="p-4 bg-background rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-foreground">
                          {contact.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(contact.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {contact.email}
                      </p>
                      <p className="text-sm text-foreground">
                        {contact.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "products" && (
            <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  Products
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateForm(true)}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-300 flex items-center space-x-2"
                >
                  <Plus size={16} />
                  <span>Add Product</span>
                </motion.button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search
                    size={20}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>
              </div>

              {/* Products Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        Product
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        Category
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        Price
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(product => (
                      <tr
                        key={product._id}
                        className="border-b border-border hover:bg-background/50"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-medium text-foreground">
                                {product.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {product.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-foreground">
                          {product.category}
                        </td>
                        <td className="py-3 px-4 text-foreground">
                          ${product.price}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              product.isFeatured
                                ? "bg-green-100 text-green-600"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {product.isFeatured ? "Featured" : "Regular"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors duration-300"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors duration-300"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Orders
              </h2>
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order._id} className="p-4 bg-background rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-foreground">
                          Order #{order._id.slice(-8)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === "delivered"
                            ? "bg-green-100 text-green-600"
                            : order.status === "pending"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {order.items.length} items
                        </p>
                        <p className="font-medium text-foreground">
                          Customer: {order.user?.name || "Unknown"}
                        </p>
                      </div>
                      <p className="text-xl font-bold text-primary">
                        ${order.total}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "customers" && (
            <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Customer Messages
              </h2>
              <div className="space-y-4">
                {contacts.map(contact => (
                  <div
                    key={contact._id}
                    className="p-4 bg-background rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-foreground">
                          {contact.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {contact.email}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mb-3">
                      <p className="text-sm font-medium text-foreground mb-1">
                        Subject: {contact.subject}
                      </p>
                      <p className="text-sm text-foreground">
                        {contact.message}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-primary hover:text-primary/80 text-sm font-medium">
                        Reply
                      </button>
                      <button className="text-red-500 hover:text-red-600 text-sm font-medium">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
