# RC Phone - Lightweight SIP Webphone for Zoho CRM

A lightweight Angular-based SIP webphone that can be embedded in Zoho CRM as a widget.

## Features

- Outgoing call functionality
- Numeric dial pad
- Call status display
- SIP configuration interface
- Lightweight and iframe-compatible

## Technology Stack

- Angular (latest stable version)
- JsSIP library for SIP functionality
- Frontend-only (no backend required)

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Setup

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
   ng serve
   ```

4. Open your browser and navigate to `http://localhost:4200/`

## Building for Production

To build the project for production:

```bash
ng build --prod
```

The build artifacts will be stored in the `dist/` directory.

## Embedding in Zoho CRM

### Step 1: Host the Webphone

First, you need to host the built application on a web server that supports HTTPS and allows iframe embedding.

1. Build the application:
   ```bash
   ng build --prod
   ```

2. Upload the contents of the `dist/` directory to your web server.

### Step 2: Create a Custom Button in Zoho CRM

1. In Zoho CRM, go to **Setup** > **Customization** > **Buttons and Links**.
2. Click **Create Button**.
3. Select the module where you want to add the webphone (e.g., Contacts, Leads).
4. Choose **Page Layout Button** as the button type.
5. Enter a name for the button (e.g., "SIP Phone").
6. For the action, select **Open URL/Execute JavaScript**.
7. Choose **Execute JavaScript** and enter the following code:

```javascript
var iframe = document.createElement('iframe');
iframe.src = 'https://your-webphone-url.com';
iframe.style.width = '400px';
iframe.style.height = '600px';
iframe.style.border = 'none';
iframe.style.position = 'fixed';
iframe.style.right = '20px';
iframe.style.bottom = '20px';
iframe.style.zIndex = '9999';
iframe.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
iframe.style.borderRadius = '10px';
document.body.appendChild(iframe);
```

8. Replace `https://your-webphone-url.com` with the actual URL where you've hosted the webphone.
9. Save the button.

### Step 3: Configure SIP Settings

When you first open the webphone, you'll need to configure your SIP settings:

1. Enter your SIP username
2. Enter your SIP password
3. Enter your SIP server address
4. Enter your WebSocket server address
5. (Optional) Enter a display name
6. Click "Save Configuration"

## SIP Configuration

The webphone requires the following SIP configuration:

- **Username**: Your SIP account username
- **Password**: Your SIP account password
- **SIP Server**: Your SIP server domain (e.g., `sip.example.com`)
- **WebSocket Server**: WebSocket server URL (e.g., `wss://sip.example.com:8089/ws`)
- **Display Name** (optional): Name to display for outgoing calls

## License

MIT
