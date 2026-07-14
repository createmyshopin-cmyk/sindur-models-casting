import { WATI_API_ENDPOINT, WATI_BEARER_TOKEN, WATI_TEMPLATE_NAME, WATI_SENDER_NUMBER } from '../config';

export const sendWatiMessage = async (recipientNumber: string, candidateName: string, location: string): Promise<void> => {
  if (!WATI_BEARER_TOKEN || WATI_BEARER_TOKEN.trim() === '') {
    console.warn('WATI token is empty. Skipping WhatsApp broadcast.');
    return;
  }

  // Format recipient phone number: remove non-digits, ensure country code (defaulting to 91 for India if 10 digits)
  let cleanNumber = recipientNumber.replace(/\D/g, '');
  if (cleanNumber.length === 10) {
    cleanNumber = "91" + cleanNumber;
  }

  const url = `${WATI_API_ENDPOINT}/api/ext/v3/messageTemplates/send`;
  const payload = {
    template_name: WATI_TEMPLATE_NAME,
    broadcast_name: "Model Casting Submission",
    recipients: [
      {
        phone_number: cleanNumber,
      }
    ],
    channel: WATI_SENDER_NUMBER.replace(/\D/g, ''), // sender number clean of symbols
    parameters: [
      { name: "name", value: candidateName },
      { name: "location", value: location },
      { name: "1", value: candidateName }, // Positional backup
      { name: "2", value: location },     // Positional backup
    ]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WATI_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('WATI Broadcast Status:', response.status);
    if (!response.ok) {
      console.warn('WATI server returned non-200 response.');
    }
  } catch (error) {
    // We catch and log, but do not throw or crash the main page since Wati might block CORS
    console.error('WATI client-side call error (likely due to standard browser CORS restrictions):', error);
  }
};
