#!/bin/bash

# Build the application
echo "Building the application..."
ng build

# Serve the built application
echo "Starting the server on port 12000..."
cd dist/rc-phone-app && python3 -m http.server 12000 --bind 0.0.0.0