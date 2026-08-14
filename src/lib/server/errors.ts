export class ApplicationError extends Error {
  constructor(message: string, readonly code: string, readonly status: number) { super(message); }
}
export class AuthenticationError extends ApplicationError { constructor() { super('Authentication required', 'AUTHENTICATION_REQUIRED', 401); } }
export class AuthorizationError extends ApplicationError { constructor() { super('You do not have permission to perform this action', 'FORBIDDEN', 403); } }
export class NotFoundError extends ApplicationError { constructor(resource = 'Resource') { super(`${resource} not found`, 'NOT_FOUND', 404); } }
export class ConflictError extends ApplicationError { constructor(message: string) { super(message, 'CONFLICT', 409); } }
export class RateLimitError extends ApplicationError { constructor() { super('Too many requests', 'RATE_LIMITED', 429); } }
export class ExternalServiceError extends ApplicationError { constructor() { super('An external service is temporarily unavailable', 'EXTERNAL_SERVICE_UNAVAILABLE', 503); } }
