export class EmailProvider {
  async send({ to, subject, html, text }) {
    // In production, this can connect to SES, SendGrid, Postmark, or SMTP
    return {
      success: true,
      provider: "email",
      messageId: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      to,
      subject,
    };
  }
}

export class SmsProvider {
  async send({ to, message }) {
    // In production, Twilio, Gupshup, SNS
    return {
      success: true,
      provider: "sms",
      messageId: `sms_${Date.now()}`,
      to,
    };
  }
}

export class PushProvider {
  async send({ toUserId, title, body, data }) {
    // In production, FCM, APNS
    return {
      success: true,
      provider: "push",
      messageId: `push_${Date.now()}`,
      toUserId,
    };
  }
}
