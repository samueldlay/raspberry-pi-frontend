#!/bin/bash

# Define variables
FRONTEND_DIR="."
BUILD_DIR="dist"
SERVER_USER="samueldlay"  # Change this to your Raspberry Pi username
SERVER_IP="10.0.0.243"  # Change this to your Raspberry Pi's IP address
SERVER_DIR="~/Projects/raspberry-pi-frontend/dist"  # Change this to the target directory on your Raspberry Pi

# Navigate to the frontend directory
cd $FRONTEND_DIR

# Build the React application
echo "Building the React application..."
npm run build

# Check if the build was successful
if [ $? -eq 0 ]; then
  echo "Build successful. Preparing to copy files to the Raspberry Pi server..."

  # Check if the remote directory exists and remove it if it does
  echo "Checking if remote directory exists..."
  ssh $SERVER_USER@$SERVER_IP "if [ -d $SERVER_DIR ]; then rm -rf $SERVER_DIR; fi"

  # Create the remote directory
  ssh $SERVER_USER@$SERVER_IP "mkdir -p $SERVER_DIR"

  # Copy the new build files to the Raspberry Pi server
  echo "Copying files to the Raspberry Pi server..."
  scp -r $BUILD_DIR/* $SERVER_USER@$SERVER_IP:$SERVER_DIR

  if [ $? -eq 0 ]; then
    echo "Files copied successfully to the Raspberry Pi server!"
  else
    echo "Failed to copy files to the Raspberry Pi server."
  fi
else
  echo "Build failed. Please check the errors above."
fi
