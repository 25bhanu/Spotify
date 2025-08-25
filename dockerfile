# Use an official nginx image as the base
FROM nginx:alpine

# Copy static files to nginx web directory
COPY . /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx server
# CMD ["nginx", "-g", "daemon off;"]
