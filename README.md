# RingCentral WebPhone for Zoho CRM

A lightweight Angular-based WebPhone that can be embedded in Zoho CRM as a widget. This application integrates with RingCentral APIs to enable making calls directly from Zoho CRM.

## Features

- Make outgoing calls using RingCentral APIs
- Display call status and duration
- Numeric dial pad with call controls
- Admin panel for RingCentral API configuration
- Support for passing customer information via URL parameters
- Iframe-compatible for embedding in Zoho CRM

## Prerequisites

- Node.js (v14 or higher)
- Angular CLI
- RingCentral developer account with API credentials
- Zoho CRM account with widget capabilities

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/developer-ech/rc-phone.git
   cd rc-phone
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Build for production:
   ```
   npm run build
   ```

## Configuration

### RingCentral API Configuration

1. Create a RingCentral developer account at https://developers.ringcentral.com/
2. Create a new application in the RingCentral Developer Console
3. Note your Client ID and Client Secret
4. In the WebPhone, click "Show Admin Panel" and enter your credentials

### URL Parameters

The WebPhone supports the following URL parameters:

- `customerName`: The name of the customer (will be displayed in the UI)
- `customerNumber`: The phone number to call (will be pre-filled in the dial pad)
- `admin=true`: Show the admin panel by default

Example:
```
https://your-webphone-url/?customerName=John%20Doe&customerNumber=+15551234567
```

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

## Security Considerations

- The WebPhone stores RingCentral API credentials in the browser's localStorage
- For production use, consider implementing server-side token management
- Ensure your hosting environment supports HTTPS for secure communication

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues or questions, please open an issue on the GitHub repository or contact the developer at openhands@all-hands.dev.