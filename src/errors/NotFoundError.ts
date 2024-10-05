class NotFoundError extends Error {

  constructor(message: string) {
      super(message); // Call the parent class constructor with the message
      this.name = "NotFoundError"; // Set the error name
      Error.captureStackTrace(this, this.constructor); // Capture the stack trace
  }
}

export default NotFoundError;