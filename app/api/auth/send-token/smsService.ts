// app\api\sendsms\smsService.ts
export async function sendSms(phoneNumber: string, text: string) {
  try {
    const smsGatewayUrl = 'https://smsportal.mobilitycairo.com/api/generate-hmac';

    // Ensure the environment variable is correctly set
    if (!smsGatewayUrl) {
      throw new Error("SMS gateway URL is not defined in the environment variables.");
    }

    const response = await fetch(smsGatewayUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phoneNumber,
        text
      }),
    });

    // Check if the response is okay
    if (response.ok) {
      return { message: 'SMS sent successfully' };
    } else {
      // Log the response status and text for debugging
      const errorText = await response.text();
      throw new Error(`Failed to send SMS. Status: ${response.status}, Error: ${errorText}`);
    }
  } catch (error) {
    console.log(error)
    // console.error('Error sending SMS:', error.message || error);
    // throw new Error('Failed to send SMS');
  }
}
