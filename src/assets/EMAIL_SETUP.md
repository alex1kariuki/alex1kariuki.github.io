# Setting Up Email Functionality for Your Contact Form

This guide will help you set up EmailJS to enable your contact form to send emails to your specified email address.

## What is EmailJS?

EmailJS is a service that allows you to send emails directly from client-side JavaScript code without requiring a backend server. It's perfect for static websites and single-page applications.

## Setup Instructions

### 1. Create an EmailJS Account

1. Go to [EmailJS.com](https://www.emailjs.com/) and sign up for a free account
2. The free tier allows 200 emails per month, which is sufficient for most portfolio websites

### 2. Connect an Email Service

1. In your EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the authentication steps to connect your email account
5. Give your service a name (e.g., "Portfolio Contact Form")
6. Note down the **Service ID** for later use

### 3. Create an Email Template

1. In your EmailJS dashboard, go to "Email Templates"
2. Click "Create New Template"
3. Design your email template using the visual editor
4. Use the following template variables in your design:
   - `{{from_name}}` - The name of the person contacting you
   - `{{from_email}}` - The email address of the person contacting you
   - `{{project_details}}` - The project details they submitted
   - `{{to_email}}` - Your email address (recipient)
5. Save your template
6. Note down the **Template ID** for later use

### 4. Get Your Public Key

1. In your EmailJS dashboard, go to "Account"
2. Find your **Public Key** in the API Keys section
3. Note down this key for later use

### 5. Update Your Code

Open the file `src/app/core/contact/contact.component.ts` and update the following constants with your EmailJS information:

```typescript
private readonly EMAILJS_SERVICE_ID = 'YOUR_EMAILJS_SERVICE_ID'; // Replace with your service ID
private readonly EMAILJS_TEMPLATE_ID = 'YOUR_EMAILJS_TEMPLATE_ID'; // Replace with your template ID
private readonly EMAILJS_PUBLIC_KEY = 'YOUR_EMAILJS_PUBLIC_KEY'; // Replace with your public key
private readonly RECIPIENT_EMAIL = 'build@stoim.io'; // Update if needed
```

### 6. Test Your Form

1. Run your application
2. Fill out the contact form and submit it
3. Check your email to ensure you received the test message
4. Check the browser console for any errors if the email doesn't arrive

## Troubleshooting

- If emails aren't being sent, check the browser console for error messages
- Verify that your EmailJS service is properly connected
- Make sure your template variables match those used in the code
- Check your spam folder if you don't see the test emails

## Security Considerations

- EmailJS public keys are meant to be used client-side and are safe to include in your code
- However, be aware that anyone can see your public key in the browser
- EmailJS has rate limiting to prevent abuse
- Consider implementing CAPTCHA for additional protection against spam

## Additional Resources

- [EmailJS Documentation](https://www.emailjs.com/docs/)
- [EmailJS API Reference](https://www.emailjs.com/docs/api/) 