export class HttpError extends Error {
  constructor(status, message, details) {
    super(message)
    this.status = status
    this.details = details
  }
}

export const badRequest = (msg, details) => new HttpError(400, msg, details)
export const unauthorized = (msg = 'Not authenticated') => new HttpError(401, msg)
export const notFound = (msg = 'Not found') => new HttpError(404, msg)
export const conflict = (msg) => new HttpError(409, msg)

// Express 5 forwards rejected promises to the error handler, but wrapping
// keeps the behaviour explicit and version-independent.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

// Parses with a zod schema and throws a 400 carrying field-level details.
export function parse(schema, data) {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw badRequest('Validation failed', result.error.flatten().fieldErrors)
  }
  return result.data
}
