import { EnumErrorName } from "../../config/enums";

class BadRequestError extends Error {

  constructor(message: string) {
      super(message); // Call the parent class constructor with the message
      this.name = EnumErrorName.BAD_REQUEST_ERROR; // Set the error name
      Error.captureStackTrace(this, this.constructor); // Capture the stack trace
  }
}

export default BadRequestError;