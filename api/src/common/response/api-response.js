export function sendSuccess(reply, {
  data = null,
  message = "Success",
  statusCode = 200,
  meta
} = {}) {
  const body = {
    success: true,
    message,
    data
  };

  if (meta) body.meta = meta;

  return reply.code(statusCode).send(body);
}
