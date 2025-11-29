# Canva API Integration Setup Guide

## Overview

This guide explains how to set up Canva API integration for the customization tool, allowing users to export designs to Canva for advanced editing and AI features.

## Features Available

### 1. Export to Canva

- Export current canvas design to Canva
- Continue editing with Canva's advanced tools
- Access to Canva's AI features

### 2. Import from Canva

- Import designs created in Canva back to the tool
- Seamless workflow between platforms

### 3. Canva AI Features

- Text-to-image generation
- Background removal
- Image enhancement
- Smart design suggestions

### 4. Template Access

- Browse thousands of professional templates
- Use Canva's design library

## Setup Instructions

### Step 1: Get Canva API Access

1. Visit [Canva Developers Portal](https://www.canva.com/developers/)
2. Create a developer account
3. Create a new app
4. Get your API key and Brand Kit ID

### Step 2: Environment Configuration

Create a `.env` file in the frontend directory with:

```env
# Canva API Configuration
REACT_APP_CANVA_API_KEY=your_canva_api_key_here
REACT_APP_CANVA_BRAND_KIT_ID=your_brand_kit_id_here
```

### Step 3: Brand Kit Setup

1. In your Canva account, go to Brand Kit
2. Create a new brand kit or use existing one
3. Copy the Brand Kit ID
4. Add it to your environment variables

### Step 4: API Permissions

Ensure your Canva app has the following permissions:

- `designs:read`
- `designs:write`
- `brand_kits:read`
- `files:read`
- `files:write`

## Usage

### Exporting to Canva

1. Create your design in the customization tool
2. Click "Canva Integration" in the sidebar
3. Click "Export to Canva for Advanced Editing"
4. Your design will open in Canva for further editing

### Using Canva AI

1. Click "Use Canva AI Features"
2. This opens Canva's AI tools in a new tab
3. Use AI features like:
   - Text-to-image generation
   - Background removal
   - Image enhancement
   - Smart design suggestions

### Importing from Canva

1. Create a design in Canva
2. Copy the design URL
3. In the customization tool, click "Import from Canva"
4. Paste the URL to import the design

## API Endpoints Used

### Export Design

```javascript
POST https://api.canva.com/v1/designs
```

### Import Design

```javascript
GET https://api.canva.com/v1/designs/{designId}
```

### Design Button API

```javascript
// Load Canva Design Button SDK
<script src="https://sdk.canva.com/designbutton/v1.js"></script>
```

## Troubleshooting

### Common Issues

1. **API Key Not Working**

   - Verify your API key is correct
   - Check if your app has the required permissions
   - Ensure your account is active

2. **Brand Kit Not Found**

   - Verify your Brand Kit ID is correct
   - Make sure the Brand Kit exists in your Canva account
   - Check if you have access to the Brand Kit

3. **Design Export Fails**

   - Check if the canvas has content
   - Verify the design format is supported
   - Check browser console for errors

4. **Import Not Working**
   - Verify the Canva design URL is correct
   - Ensure the design is public or you have access
   - Check if the design format is supported

### Error Messages

- `"Failed to create Canva design"` - API key or permissions issue
- `"Failed to fetch Canva design"` - Design not found or access denied
- `"Canvas not found"` - Canvas reference issue

## Advanced Configuration

### Custom Brand Kit

You can create a custom brand kit with your brand colors, fonts, and logos:

1. Go to Canva Brand Kit
2. Create a new brand kit
3. Add your brand assets
4. Use the Brand Kit ID in your configuration

### Webhook Integration

For real-time updates, you can set up webhooks:

```javascript
// Webhook endpoint for design updates
app.post("/webhooks/canva", (req, res) => {
  const { designId, action } = req.body;
  // Handle design updates
  res.status(200).send("OK");
});
```

## Security Considerations

1. **API Key Security**

   - Never expose API keys in client-side code
   - Use environment variables
   - Rotate keys regularly

2. **CORS Configuration**

   - Configure CORS properly for your domain
   - Limit access to trusted domains

3. **Rate Limiting**
   - Implement rate limiting for API calls
   - Handle API quotas gracefully

## Support

For technical support:

- Canva API Documentation: https://www.canva.com/developers/
- Canva Developer Community: https://community.canva.com/
- GitHub Issues: [Your Repository URL]

## Changelog

### Version 1.0.0

- Initial Canva integration
- Export/Import functionality
- AI features access
- Template browsing
