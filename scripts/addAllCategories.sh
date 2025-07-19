#!/bin/bash

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODdhNDMyNWIyNjE0Nzk1NzNmZjQwMGIiLCJpYXQiOjE3NTI4NDMxNzYsImV4cCI6MTc1Mjg0NDA3Nn0.15ZQbTTplP8csGzTfJJ232ppDHb_eSX6WFnlhQW5Ero"
API_URL="http://localhost:8000/api/v1/categories"

# Smartphones with image
curl -X POST $API_URL \
  -H "Authorization: Bearer $TOKEN" \
  -F "name=Smartphones" \
  -F "description=Latest AI-powered devices" \
  -F "featured=true" \
  -F "order=1" \
  -F "image=@../Client/src/assets/phones.jpeg"

echo "---"
# Laptops
curl -X POST $API_URL \
  -H "Authorization: Bearer $TOKEN" \
  -F "name=Laptops" \
  -F "description=Professional computing power" \
  -F "featured=false" \
  -F "order=2"

echo "---"
# Gaming
curl -X POST $API_URL \
  -H "Authorization:$TOKEN" \
  -F "name=Gaming" \
  -F "description=Ultimate gaming experience" \
  -F "featured=true" \
  -F "order=3"

echo "---"
# Smart Home
curl -X POST $API_URL \
  -H "Authorization: Bearer $TOKEN" \
  -F "name=Smart Home" \
  -F "description=Connected living spaces" \
  -F "featured=true" \
  -F "order=4"

echo "---"
# Audio
curl -X POST $API_URL \
  -H "Authorization: Bearer $TOKEN" \
  -F "name=Audio" \
  -F "description=Immersive sound experience" \
  -F "featured=false" \
  -F "order=5"

echo "---"
# Tablets
curl -X POST $API_URL \
  -H "Authorization: Bearer $TOKEN" \
  -F "name=Tablets" \
  -F "description=Portable productivity" \
  -F "featured=false" \
  -F "order=6"

echo "All categories added." 