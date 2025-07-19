const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const categories = [
  {
    name: "Smartphones",
    description: "Latest AI-powered devices",
    featured: true,
    order: 1
  },
  {
    name: "Laptops",
    description: "Professional computing power",
    featured: false,
    order: 2
  },
  {
    name: "Gaming",
    description: "Ultimate gaming experience",
    featured: true,
    order: 3
  },
  {
    name: "Smart Home",
    description: "Connected living spaces",
    featured: true,
    order: 4
  },
  {
    name: "Audio",
    description: "Immersive sound experience",
    featured: false,
    order: 5
  },
  {
    name: "Tablets",
    description: "Portable productivity",
    featured: false,
    order: 6
  }
];

const API_URL = 'http://localhost:8000/api/v1/categories'; // Corrected base path
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODdhNDMyNWIyNjE0Nzk1NzNmZjQwMGIiLCJpYXQiOjE3NTI4NDMxNzYsImV4cCI6MTc1Mjg0NDA3Nn0.15ZQbTTplP8csGzTfJJ232ppDHb_eSX6WFnlhQW5Ero'; // <-- Inserted real admin JWT token

// Use a reliable online image (Wikimedia Commons)
const ONLINE_IMAGE_URL = 'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg';
const LOCAL_IMAGE_PATH = path.join(__dirname, 'online-placeholder.jpg');

// Download the online image once
async function downloadOnlineImage() {
  if (fs.existsSync(LOCAL_IMAGE_PATH)) return LOCAL_IMAGE_PATH;
  const response = await axios({
    url: ONLINE_IMAGE_URL,
    method: 'GET',
    responseType: 'stream'
  });
  const writer = fs.createWriteStream(LOCAL_IMAGE_PATH);
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(LOCAL_IMAGE_PATH));
    writer.on('error', reject);
  });
}

async function addCategories() {
  const imgPath = await downloadOnlineImage();
  for (const cat of categories) {
    try {
      // Prepare form data
      const form = new FormData();
      form.append('name', cat.name);
      form.append('description', cat.description);
      form.append('featured', cat.featured);
      form.append('order', cat.order);
      form.append('image', fs.createReadStream(imgPath));
      // Send request
      const res = await axios.post(API_URL, form, {
        headers: {
          ...form.getHeaders(),
          Cookie: `accessToken=${TOKEN}`
        },
        withCredentials: true
      });
      console.log(`Added: ${cat.name}`, res.data);
    } catch (err) {
      console.error(`Error adding ${cat.name}:`, err.response?.data || err.message);
    }
  }
}

addCategories(); 