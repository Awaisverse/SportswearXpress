# ChatGPT Integration Setup Guide

## Environment Variables

Add the following to your `.env` file in the backend directory:

```env
# OpenAI API Configuration (for ChatGPT integration)
OPENAI_API_KEY=sk-your-openai-api-key-here
```

## Getting Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section: https://platform.openai.com/api-keys
4. Click "Create new secret key"
5. Copy the key and add it to your `.env` file

**Important:** Keep your API key secure and never commit it to version control!

## Testing the Integration

1. Start your backend server:

   ```bash
   npm run dev
   ```

2. Check chatbot health:

   ```bash
   curl http://localhost:5000/api/v1/chatbot/health
   ```

3. Test the chat endpoint (requires authentication):
   ```bash
   curl -X POST http://localhost:5000/api/v1/chatbot/chat \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{"message": "Hello! Show me some products"}'
   ```

## Features

The chatbot can:

- ✅ Search products
- ✅ Get product details
- ✅ Add items to cart
- ✅ View cart contents
- ✅ Update cart items
- ✅ Remove items from cart
- ✅ Check order history
- ✅ Get order details
- ✅ Provide design assistance
- ✅ Answer e-commerce questions

## Cost Information

- Model used: `gpt-4o-mini` (cost-effective)
- Estimated cost: $0.01-$0.10 per conversation
- For 1000 users/month: ~$100-500/month

You can upgrade to `gpt-4o` for better performance by changing the model in `backend/controllers/chatbotController.js`.

## Troubleshooting

1. **"OpenAI API key not configured" error**

   - Make sure `OPENAI_API_KEY` is set in your `.env` file
   - Restart the server after adding the key

2. **"Not authorized" error**

   - Make sure you're sending a valid JWT token in the Authorization header
   - The user must be logged in

3. **Functions not working**
   - Check that the user is authenticated (user ID is available)
   - Verify the function parameters are correct
