import { eventBus } from './events.js';
import { EVENTS } from './events.constants.js';
import { sendMail } from '../email/mail.service.js';

eventBus.on(EVENTS.MAIL_SEND, async (payload) => {
  try {
    console.log('📨 MAIL_SEND received', payload.to);
    await sendMail(payload);
    console.log('✅ Mail sent to:', payload.to);
  } catch (err) {
    console.error('❌ Mail failed:', err.message);
  }
});
