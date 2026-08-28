export const verificationStatus = ["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"];

export function canApprove(status) {
  return ["PENDING", "UNDER_REVIEW"].includes(status);
}
