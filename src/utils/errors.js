export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.type = 'VALIDATION';
  }
}

export class DatabaseError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = 'DatabaseError';
    this.type = 'DATABASE';
    this.originalError = originalError;
  }
}

export class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.type = 'MODEL';
  }
}

export class DuplicateError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DuplicateError';
    this.type = 'DATABASE';
  }
}
