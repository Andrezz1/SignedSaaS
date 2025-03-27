import twilio from 'twilio'

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

type SendSmsParams = {
  accountSid: string;
  authToken: string;
  from: string;
  to: string;
  message: string;
}

export async function sendSms({ accountSid, authToken, from, to, message }: SendSmsParams): Promise<void> {
  const client = twilio(accountSid, authToken)

  try {
    const response = await client.messages.create({
      body: message,
      from,
      to,
    })
    console.log(`Message sent with SID: ${response.sid}`)
  } catch (error) {
    console.error('Failed to send SMS:', error)
    throw error
  }
}

/*sendSms({
  accountSid: 'AC9d32a745fc94d94bcd1248337ed8dcfb',
  authToken: '49ed2a547cecf3578fe085e9e67d6d9c',
  from: '+12543543854',
  to: '+351911555965',
  message: 'Hello from Twilio!',
})*/
