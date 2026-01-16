#!/bin/bash

# FlockRL Backend - Google Compute Engine Setup Script
# Run this script ON the GCE VM after SSHing in

set -e

echo "=== FlockRL Backend GCE Setup ==="

# Install system dependencies
echo "Installing system dependencies..."
sudo apt update
sudo apt install -y python3-pip python3-venv git

# Create app directory
APP_DIR="$HOME/flockrl-backend"
mkdir -p "$APP_DIR"
cd "$APP_DIR"

# Check if this is first setup or update
if [ -d "venv" ]; then
    echo "Existing installation found. Updating..."
    source venv/bin/activate
else
    echo "Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
fi

# Copy or clone application files
# If running from repo, copy the backend files
if [ -f "../backend/main.py" ]; then
    echo "Copying application files..."
    cp ../backend/main.py .
    cp ../backend/requirements.txt .
elif [ -f "main.py" ]; then
    echo "Using existing application files..."
else
    echo "Error: No application files found."
    echo "Please copy main.py and requirements.txt to $APP_DIR"
    exit 1
fi

# Install Python dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create uploads directory
mkdir -p uploads

# Create systemd service file
echo "Creating systemd service..."
sudo tee /etc/systemd/system/flockrl-backend.service > /dev/null <<EOF
[Unit]
Description=FlockRL Backend API
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$APP_DIR
Environment="PATH=$APP_DIR/venv/bin"
Environment="CORS_ORIGINS=http://localhost:3000"
ExecStart=$APP_DIR/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable service
sudo systemctl daemon-reload
sudo systemctl enable flockrl-backend

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Commands:"
echo "  Start:   sudo systemctl start flockrl-backend"
echo "  Stop:    sudo systemctl stop flockrl-backend"
echo "  Status:  sudo systemctl status flockrl-backend"
echo "  Logs:    sudo journalctl -u flockrl-backend -f"
echo ""
echo "To update CORS_ORIGINS, edit /etc/systemd/system/flockrl-backend.service"
echo "Then run: sudo systemctl daemon-reload && sudo systemctl restart flockrl-backend"
echo ""
echo "Starting service now..."
sudo systemctl start flockrl-backend
sudo systemctl status flockrl-backend --no-pager
