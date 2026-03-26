#!/bin/bash

echo "Setting up LexisBridge Legal Assistant..."

# Check if npm is installed
if ! command -v npm &> /dev/null
then
    echo "Error: npm is not installed. Please install Node.js and npm first."
    exit
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "Please edit the .env file and add your GEMINI_API_KEY."
fi

echo "Setup complete! Run 'npm run dev' to start the application."
