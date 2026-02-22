#!/bin/bash
# Run this after npm run build
# Copies dist/chat-widget.js to Django's static files folder

echo "Building widget..."
npm run build

echo "Copying to Django static files..."
cp dist/chat-widget.js ../../erp-chat-bot-backend/static/chat-widget.js

echo "Done! Widget available at: /static/chat-widget.js"
echo ""
echo "Clients add this one line to their website:"
echo '<script src="https://yourdomain.com/static/chat-widget.js" data-client-id="CLIENT_ID" data-api-base="https://yourdomain.com"></script>'
