#!/bin/bash

# Install dependencies
echo "Installing dependencies..."
npm install

# Install Angular CLI globally if not already installed
if ! command -v ng &> /dev/null; then
    echo "Installing Angular CLI globally..."
    npm install -g @angular/cli
fi

# Build the application
echo "Building the application..."
ng build

# Serve the application
echo "Starting the server on port 4200..."
ng serve --host 0.0.0.0 --port 4200 --disable-host-check