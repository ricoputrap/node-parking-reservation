class UnauthorizedError extends Error {

  constructor(message: string) {
      super(message); // Call the parent class constructor with the message
      this.name = "UnauthorizedError"; // Set the error name
      Error.captureStackTrace(this, this.constructor); // Capture the stack trace
  }
}

export default UnauthorizedError;