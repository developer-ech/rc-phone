# RingCentral WebPhone for Zoho CRM

A lightweight Angular-based WebPhone that can be embedded in Zoho CRM as a widget. This application integrates with both SIP (via JsSIP) and RingCentral APIs to enable making calls directly from Zoho CRM.

## System Overview

This application is a complete WebPhone solution that can be embedded in Zoho CRM or used as a standalone application. It consists of the following components:

### Core Components

1. **SIP Integration Layer**: Uses JsSIP library to handle SIP protocol communication for making outgoing calls.
2. **RingCentral API Integration**: Connects to RingCentral APIs for authentication and call management.
3. **Dial Pad Interface**: User interface for entering phone numbers and controlling calls.
4. **Call Status Display**: Shows real-time call status and duration.
5. **Admin Panel**: Configuration interface for RingCentral API credentials.
6. **Parameter Handling**: Processes URL parameters to pre-fill customer information.

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Angular Application                     │
├─────────────┬─────────────────────────┬─────────────────┤
│ Components  │       Services          │     Models      │
├─────────────┼─────────────────────────┼─────────────────┤
│ - Dial Pad  │ - SIP Service           │ - SIP Config    │
│ - Call Status│ - RingCentral Service  │ - RC Config     │
│ - Admin Panel│                        │ - Call Params   │
└─────────────┴─────────────────────────┴─────────────────┘
        │                  │                     │
        ▼                  ▼                     ▼
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│   JsSIP     │    │  RingCentral SDK │    │ Web Browser │
│  Library    │    │                  │    │   APIs      │
└─────────────┘    └─────────────────┘    └─────────────┘
        │                  │                     │
        ▼                  ▼                     ▼
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│ SIP Server  │    │ RingCentral API  │    │ Web Audio   │
└─────────────┘    └─────────────────┘    └─────────────┘
```

## Working Features

✅ **SIP Integration**
- Make outgoing calls using SIP protocol
- Real-time call status updates
- Call duration tracking
- Hang up functionality

✅ **RingCentral Integration**
- Authentication with RingCentral API
- Secure credential storage
- SIP provisioning via RingCentral
- Making calls via RingCentral API

✅ **User Interface**
- Numeric dial pad with digit input
- Call and hang-up buttons
- Call status display
- Duration timer for active calls
- Admin panel for configuration

✅ **Configuration**
- RingCentral API credentials setup
- SIP configuration management
- Persistent settings via localStorage

✅ **Zoho CRM Integration**
- URL parameter support for customer data
- Iframe-compatible for widget embedding
- Responsive design for various widget sizes

✅ **Security**
- Secure credential handling
- CORS and iframe embedding support
- Configurable server settings

## Prerequisites

- Node.js (v14 or higher)
- Angular CLI
- RingCentral developer account with API credentials
- Zoho CRM account with widget capabilities (for CRM integration)
- SIP account credentials (if not using RingCentral for SIP)

## Local Testing

You can easily test this application on your local computer:

1. Clone the repository:
   ```bash
   git clone https://github.com/developer-ech/rc-phone.git
   cd rc-phone
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```
   Or use the provided script:
   ```bash
   ./start.sh
   ```

4. Access the application in your browser:
   ```
   http://localhost:12000
   ```

5. To test with customer data parameters:
   ```
   http://localhost:12000/?customerName=John%20Doe&customerNumber=+15551234567
   ```

6. To show the admin panel by default:
   ```
   http://localhost:12000/?admin=true
   ```

### Testing SIP Functionality

1. Click "Show Admin Panel" in the application
2. Enter your SIP credentials (URI, password, WebSocket server)
3. Test making calls to valid phone numbers

### Testing RingCentral Integration

1. Create a RingCentral developer account at https://developers.ringcentral.com/
2. Create a new application in the RingCentral Developer Console
3. Note your Client ID and Client Secret
4. In the WebPhone, click "Show Admin Panel" and enter your credentials
5. Log in with your RingCentral account credentials
6. Test making calls through the RingCentral API

## Deployment

### Option 1: Static Web Server Deployment

1. Build the application for production:
   ```bash
   npm run build
   ```

2. The build output will be in the `dist/rc-phone-app` directory

3. Deploy these files to any static web server (Apache, Nginx, etc.)

4. Configure your web server to:
   - Serve the application at your desired URL
   - Set appropriate CORS headers for iframe embedding
   - Enable HTTPS for secure communication

Example Nginx configuration:
```nginx
server {
    listen 80;
    server_name your-webphone-domain.com;
    
    # Redirect to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name your-webphone-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    root /path/to/dist/rc-phone-app;
    index index.html;
    
    # CORS and iframe embedding headers
    add_header 'Access-Control-Allow-Origin' '*';
    add_header 'X-Frame-Options' 'ALLOWALL';
    add_header 'Content-Security-Policy' "frame-ancestors 'self' *";
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Option 2: Docker Deployment

1. Create a Dockerfile in the project root:
```dockerfile
FROM node:16 as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist/rc-phone-app /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. Create nginx.conf:
```
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;
    
    # CORS and iframe embedding headers
    add_header 'Access-Control-Allow-Origin' '*';
    add_header 'X-Frame-Options' 'ALLOWALL';
    add_header 'Content-Security-Policy' "frame-ancestors 'self' *";
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

3. Build and run the Docker container:
```bash
docker build -t rc-phone .
docker run -p 80:80 rc-phone
```

### Option 3: Cloud Hosting (e.g., AWS S3 + CloudFront)

1. Build the application for production:
```bash
npm run build
```

2. Upload the contents of the `dist/rc-phone-app` directory to an S3 bucket

3. Configure the S3 bucket for static website hosting

4. Create a CloudFront distribution pointing to the S3 bucket

5. Configure CloudFront to:
   - Use HTTPS
   - Add appropriate CORS and frame-ancestors headers
   - Set index.html as the default root object
   - Set error page redirects to index.html for SPA routing

## Embedding in Zoho CRM

### As a Custom Button

1. In Zoho CRM, go to Setup > Customization > Modules and Fields
2. Select the module where you want to add the WebPhone (e.g., Contacts, Leads)
3. Go to "Links and Buttons" and click "Create Button"
4. Configure the button:
   - Name: "Call with RingCentral"
   - Type: "Links"
   - Where to show: "Detail Page"
   - Action: "Open URL"
   - URL: `https://your-webphone-url/?customerName=$FUNCTION.CONCATENATE($FIELD.First_Name," ",$FIELD.Last_Name)&customerNumber=$FIELD.Phone`
   - Open in: "New Window" or "Same Window" (as preferred)

### As a Custom Widget

1. In Zoho CRM, go to Setup > Customization > Widgets
2. Click "Create Widget"
3. Configure the widget:
   - Name: "RingCentral WebPhone"
   - Type: "Web"
   - Widget Source: "URL"
   - URL: `https://your-webphone-url/`
   - Height: 600px (or as needed)
   - Width: 350px (or as needed)
   - Position: As preferred

4. For passing contact information to the widget, use the following URL with Zoho CRM variables:
   ```
   https://your-webphone-url/?customerName=${FIELD.First_Name} ${FIELD.Last_Name}&customerNumber=${FIELD.Phone}
   ```

5. Save the widget and add it to your page layouts

## Configuration Options

### URL Parameters

The WebPhone supports the following URL parameters:

- `customerName`: The name of the customer (will be displayed in the UI)
- `customerNumber`: The phone number to call (will be pre-filled in the dial pad)
- `admin=true`: Show the admin panel by default

Example:
```
https://your-webphone-url/?customerName=John%20Doe&customerNumber=+15551234567&admin=true
```

### RingCentral API Configuration

The admin panel allows configuration of:
- Client ID
- Client Secret
- Server URL (defaults to https://platform.ringcentral.com)
- Username (phone number)
- Password
- Extension (optional)

### SIP Configuration

When using RingCentral, SIP configuration is automatically provisioned. For direct SIP configuration, you would need:
- SIP URI (e.g., sip:username@domain.com)
- SIP Password
- WebSocket Server URL (e.g., wss://sip.domain.com:8089/ws)
- Display Name (optional)

## Security Considerations

- The WebPhone stores RingCentral API credentials in the browser's localStorage
- For production use, consider implementing server-side token management
- Ensure your hosting environment supports HTTPS for secure communication
- Consider implementing additional authentication for the admin panel
- Regularly rotate API credentials for enhanced security

## Troubleshooting

### Common Issues

1. **Call fails to connect**
   - Check SIP credentials
   - Verify WebSocket server is accessible
   - Ensure proper network connectivity
   - Check browser console for detailed error messages

2. **RingCentral authentication fails**
   - Verify Client ID and Secret
   - Check that the application has proper permissions in RingCentral
   - Ensure the user has calling privileges

3. **Widget doesn't load in Zoho CRM**
   - Check CORS headers on your web server
   - Verify the URL is accessible from Zoho CRM
   - Ensure proper iframe embedding headers are set

4. **Audio issues**
   - Grant microphone permissions in the browser
   - Check audio device settings
   - Verify WebRTC is supported and enabled in the browser

5. **TypeScript errors with JsSIP library**
   - If you encounter TypeScript errors related to JsSIP types, the application includes a custom type definition file in `src/types/jssip.d.ts`
   - Make sure your `tsconfig.json` includes the custom type definitions:
     ```json
     "typeRoots": [
       "node_modules/@types",
       "src/types"
     ],
     "skipLibCheck": true
     ```
   - If you still encounter errors, try using `any` type for JsSIP objects temporarily

6. **RingCentral SDK Node.js compatibility issues**
   - The application uses a custom implementation of RingCentral API calls using HttpClient instead of the official SDK
   - This avoids Node.js-specific dependencies like 'crypto' that cause issues in the browser
   - If you want to use the official SDK, you'll need to configure Vite with Node.js polyfills:
     ```javascript
     // vite.config.js
     import { nodePolyfills } from 'vite-plugin-node-polyfills';
     
     export default defineConfig({
       // ... other config
       plugins: [
         nodePolyfills({
           protocolImports: true,
         }),
       ],
       resolve: {
         alias: {
           crypto: 'crypto-browserify',
           stream: 'stream-browserify',
           // ... other Node.js built-ins
         }
       }
     });
     ```

### Browser Compatibility

The application is tested and works on:
- Chrome (recommended)
- Firefox
- Edge
- Safari (limited WebRTC support in some versions)

## Future Enhancements

- Incoming call support
- Call recording functionality
- Contact directory integration
- Call history and logging
- Multiple line support
- Advanced call controls (hold, transfer, conference)
- Enhanced audio quality settings

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues or questions, please open an issue on the GitHub repository or contact the developer at openhands@all-hands.dev.