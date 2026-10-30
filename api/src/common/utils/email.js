/**
 * Backward compatibility re-export forwarder.
 * Points to the clean architectural domain at `api/src/email/email.service.js`.
 */
export * from "../../email/email.service.js";
export { dispatchEmail as sendEmail } from "../../email/email.provider.js";
