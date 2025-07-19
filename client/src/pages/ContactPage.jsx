import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Globe,
  Users,
  Zap,
} from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";

const ContactPage = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [formData, setFormData] = useState({
    name: user?.data?.name || "",
    email: user?.data?.email || "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  // Update form data when user changes
  useEffect(() => {
    if (user?.data) {
      setFormData(prev => ({
        ...prev,
        name: user.data.name || "",
        email: user.data.email || "",
      }));
    }
  }, [user]);

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Support",
      details: "support@pioneer.com",
      description: "Get help via email anytime",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Phone,
      title: "Phone Support",
      details: "+1 (555) 123-4567",
      description: "Mon-Fri from 8am to 6pm",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      details: "Available 24/7",
      description: "Chat with our support team",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Clock,
      title: "Response Time",
      details: "Within 2 hours",
      description: "We respond quickly",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const features = [
    {
      icon: Zap,
      title: "Fast Response",
      description: "Get answers within 2 hours",
    },
    {
      icon: Users,
      title: "Expert Support",
      description: "Our team is here to help",
    },
    {
      icon: Globe,
      title: "24/7 Available",
      description: "Support whenever you need",
    },
  ];

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "name":
        if (!value.trim()) {
          error = "Name is required";
        } else if (value.trim().length < 2) {
          error = "Name must be at least 2 characters";
        } else if (value.trim().length > 50) {
          error = "Name must be less than 50 characters";
        } else if (!/^[a-zA-Z\s'-]+$/.test(value.trim())) {
          error =
            "Name can only contain letters, spaces, hyphens, and apostrophes";
        }
        break;

      case "email":
        if (!value.trim()) {
          error = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          error = "Please enter a valid email address";
        } else if (value.length > 100) {
          error = "Email must be less than 100 characters";
        }
        break;

      case "subject":
        if (!value.trim()) {
          error = "Subject is required";
        } else if (value.trim().length < 5) {
          error = "Subject must be at least 5 characters";
        } else if (value.trim().length > 100) {
          error = "Subject must be less than 100 characters";
        }
        break;

      case "message":
        if (!value.trim()) {
          error = "Message is required";
        } else if (value.trim().length < 10) {
          error = "Message must be at least 10 characters";
        } else if (value.trim().length > 1000) {
          error = "Message must be less than 1000 characters";
        }
        break;

      default:
        break;
    }

    return error;
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = e => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // Real-time validation
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleBlur = e => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true,
    }));

    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Clear previous success message and errors
    setSuccessMessage("");
    setErrors({});

    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      subject: true,
      message: true,
    });

    if (!validateForm()) {
      toast.error("Please fix all validation errors before submitting");
      return;
    }

    setLoading(true);

    try {
      // Trim all values before sending
      const trimmedData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      };

      const response = await axios.post("/v1/contact/submitContactForm", trimmedData);
      
      if (response.data && response.data.success) {
        setSuccessMessage("Message sent successfully! We'll get back to you soon.");
        setErrors({});
        
        // Reset form but keep user data if logged in
        setFormData({
          name: user?.data?.name || "",
          email: user?.data?.email || "",
          subject: "",
          message: "",
        });
        setTouched({});
      } else {
        toast.error("Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Contact form submission error:", error);

      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const message = error.response.data?.message || "An error occurred";

        switch (status) {
          case 400:
            // Handle validation errors
            if (error.response.data?.errors && Array.isArray(error.response.data.errors)) {
              // Set server validation errors to form state
              const serverErrors = {};
              error.response.data.errors.forEach(err => {
                // Only set error if the field actually has an error
                if (err.field && err.message) {
                  serverErrors[err.field] = err.message;
                }
              });
              
              // Only set errors if there are actual errors
              if (Object.keys(serverErrors).length > 0) {
                setErrors(serverErrors);
                setTouched(prev => ({
                  ...prev,
                  ...Object.keys(serverErrors).reduce((acc, key) => ({ ...acc, [key]: true }), {})
                }));
                toast.error("Please fix the validation errors below");
              } else {
                toast.error("Invalid form data. Please check your input.");
              }
            } else {
              toast.error("Invalid form data. Please check your input.");
            }
            break;
          case 401:
            toast.error("Please login to send a message");
            navigate("/login");
            break;
          case 429:
            toast.error(
              "Too many requests. Please wait a moment and try again."
            );
            break;
          case 500:
            toast.error("Server error. Please try again later.");
            break;
          default:
            toast.error(message);
        }
      } else if (error.request) {
        // Network error
        toast.error(
          "Network error. Please check your connection and try again."
        );
      } else {
        // Other error
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getInputClassName = fieldName => {
    const baseClasses =
      "w-full px-6 py-4 bg-gray-50 border-2 rounded-xl focus:outline-none transition-all duration-300 text-gray-900 placeholder:text-gray-500";

    if (errors[fieldName] && touched[fieldName]) {
      return `${baseClasses} border-red-300 focus:ring-4 focus:ring-red-100 focus:border-red-500 bg-red-50`;
    } else if (
      touched[fieldName] &&
      !errors[fieldName] &&
      formData[fieldName]
    ) {
      return `${baseClasses} border-green-300 focus:ring-4 focus:ring-green-100 focus:border-green-500 bg-green-50`;
    } else {
      return `${baseClasses} border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative py-24 lg:py-32 overflow-hidden"
      >
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-8 shadow-lg"
            >
              <MessageSquare size={32} className="text-white" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6"
            >
              Let's <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Connect</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto"
            >
              Have a question or need help? We'd love to hear from you. Our team is here to provide the support you need.
            </motion.p>
            
            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                  className="flex items-center justify-center space-x-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <feature.icon size={20} className="text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Contact Info Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose your preferred way to reach us. We're here to help!
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center overflow-hidden"
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${info.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                
                <div className={`w-16 h-16 ${info.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <info.icon size={28} className={`text-gradient-to-br ${info.color} bg-clip-text text-transparent`} />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                  {info.title}
                </h3>
                <p className="text-lg font-semibold text-blue-600 mb-2">{info.details}</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {info.description}
                </p>
                
                {/* Hover effect border */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${info.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
              </motion.div>
            ))}
          </div>

          {/* Contact Form Section */}
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative p-8 lg:p-12">
                <div className="text-center mb-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-lg"
                  >
                    <Send size={24} className="text-white" />
                  </motion.div>
                  
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    Send us a Message
                  </h2>
                  <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </p>
                  
                  {!user ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      viewport={{ once: true }}
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-8 max-w-md mx-auto"
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">💡</span>
                        </div>
                        <h3 className="font-semibold text-blue-900">Pro Tip</h3>
                      </div>
                      <p className="text-blue-800 text-sm mb-4">
                        Logging in will pre-fill your contact information and provide faster support.
                      </p>
                      <button
                        onClick={() => navigate("/login")}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        Login to Continue
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      viewport={{ once: true }}
                      className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-8 max-w-md mx-auto"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">✅</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-green-900">Welcome back!</h3>
                          <p className="text-green-800 text-sm">{user.data?.name}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-gray-700 mb-3"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={getInputClassName("name")}
                        placeholder="Enter your full name"
                        maxLength={50}
                      />
                      {touched.name && !errors.name && formData.name && (
                        <CheckCircle className="absolute right-3 top-3 h-5 w-5 text-green-500" />
                      )}
                      {errors.name && touched.name && (
                        <AlertCircle className="absolute right-3 top-3 h-5 w-5 text-red-500" />
                      )}
                    </div>
                    {errors.name && touched.name && (
                      <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-gray-700 mb-3"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={getInputClassName("email")}
                        placeholder="Enter your email"
                        maxLength={100}
                      />
                      {touched.email && !errors.email && formData.email && (
                        <CheckCircle className="absolute right-3 top-3 h-5 w-5 text-green-500" />
                      )}
                      {errors.email && touched.email && (
                        <AlertCircle className="absolute right-3 top-3 h-5 w-5 text-red-500" />
                      )}
                    </div>
                    {errors.email && touched.email && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-semibold text-gray-700 mb-3"
                  >
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={getInputClassName("subject")}
                      placeholder="Enter subject"
                      maxLength={100}
                    />
                    {touched.subject && !errors.subject && formData.subject && (
                      <CheckCircle className="absolute right-3 top-3 h-5 w-5 text-green-500" />
                    )}
                    {errors.subject && touched.subject && (
                      <AlertCircle className="absolute right-3 top-3 h-5 w-5 text-red-500" />
                    )}
                  </div>
                  {errors.subject && touched.subject && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.subject}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-gray-700 mb-3"
                  >
                    Message <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({formData.message.length}/1000 characters)
                    </span>
                  </label>
                  <div className="relative">
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      rows={6}
                      className={`${getInputClassName("message")} resize-none`}
                      placeholder="Enter your message"
                      maxLength={1000}
                    />
                    {touched.message && !errors.message && formData.message && (
                      <CheckCircle className="absolute right-3 top-3 h-5 w-5 text-green-500" />
                    )}
                    {errors.message && touched.message && (
                      <AlertCircle className="absolute right-3 top-3 h-5 w-5 text-red-500" />
                    )}
                  </div>
                  {errors.message && touched.message && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.message}
                    </p>
                  )}
                </div>



                <motion.button
                  type="submit"
                  disabled={
                    loading || Object.keys(errors).some(key => errors[key])
                  }
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="text-lg">Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send size={24} />
                      <span className="text-lg">Send Message</span>
                    </>
                  )}
                </motion.button>
              </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Find Us</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Visit our office or get in touch with us anytime
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-12 text-center max-w-4xl mx-auto"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <MapPin size={36} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Our Location
            </h3>
            <p className="text-lg text-gray-600 mb-8">
              123 Tech Street, Digital City, DC 12345
            </p>
            <div className="w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin size={24} className="text-gray-600" />
                </div>
                <p className="text-gray-600 font-medium">Interactive Map Coming Soon</p>
                <p className="text-gray-500 text-sm mt-2">We're working on bringing you a better experience</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
