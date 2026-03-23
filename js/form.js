/**
 * Nordelta Builders - Form Logic
 * Handles the registration form submission to Google Sheets
 */

document.addEventListener('DOMContentLoaded', () => {
    // Note: The form HTML needs to be added to index.html to match this script.
    // Right now index.html only has the hero and events sections, but not the actual registration form.
    // The README mentions integrating Google Sheets.
    
    // Example form submission setup
    const form = document.getElementById('registration-form');
    // Replace YOUR_API_KEY with actual Google Sheets Setup URL/Backend URL
    const API_URL = 'YOUR_API_KEY_OR_WEBHOOK_URL_HERE'; 

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            data['Fecha Registro'] = new Date().toISOString();

            try {
                // Here is where you would normally send to your Google Apps Script Web app
                // or your custom backend that uses the Google Sheets API.
                /*
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });
                
                if (response.ok) {
                    alert('¡Gracias por registrarte! Nos pondremos en contacto pronto.');
                    form.reset();
                } else {
                    throw new Error('Error en el servidor');
                }
                */
                console.log('Form data to send:', data);
                alert('¡Gracias por unirse! Implementación de Sheets pendiente de configuración.');
                form.reset();
            } catch (error) {
                console.error('Error submitting form:', error);
                alert('Hubo un error al enviar el formulario. Por favor intenta nuevamente.');
            } finally {
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    }
});
