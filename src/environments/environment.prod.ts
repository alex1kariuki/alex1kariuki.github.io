export const environment = {
  production: true,
  emailjs: {
    serviceId: 'YOUR_SERVICE_ID',    // Replace with your EmailJS service ID
    templateId: 'YOUR_TEMPLATE_ID',  // Contact-form template
    pdfTemplateId: 'YOUR_PDF_TEMPLATE_ID', // Template with a variable attachment ({{content}}/{{filename}})
    publicKey: 'YOUR_EMAILJS_PUBLIC_KEY', // Replace with your actual public key in production
    recipientEmail: 'alex@storim.io'
  }
}; 