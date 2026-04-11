/**
 * Standardized API response helper
 * All responses follow: { success, message, data, error }
 */

const ok = (res, data = null, message = 'Request successful', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data, error: null });

const created = (res, data = null, message = 'Created successfully') =>
  ok(res, data, message, 201);

const fail = (res, error = 'Request failed', statusCode = 400, data = null) =>
  res.status(statusCode).json({ success: false, message: error, data, error });

const unauthorized = (res, error = 'Unauthorized') =>
  fail(res, error, 401);

const forbidden = (res, error = 'Access denied') =>
  fail(res, error, 403);

const notFound = (res, error = 'Not found') =>
  fail(res, error, 404);

const serverError = (res, error = 'Internal server error') =>
  fail(res, typeof error === 'string' ? error : error?.message || 'Internal server error', 500);

module.exports = { ok, created, fail, unauthorized, forbidden, notFound, serverError };
