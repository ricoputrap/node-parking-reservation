import { ServerResponse } from 'http';
import log from '../logger';
import { ZodIssue } from 'zod';

/**
 * Parse the incoming JSON body, and return the parsed data if successful.
 * 
 * If there is an error while parsing the JSON body, set the response status code
 * to 400, write the error message to the response, and log the error.
 * 
 * @param res - The outgoing HTTP response.
 * @param body - The incoming JSON body.
 * @param logPrefix - The prefix string for logging.
 * 
 * @returns The parsed data if successful, or undefined if there is an error.
 */
export const parseData = (
  res: ServerResponse,
  body: string,
  logPrefix: string
): unknown | undefined => {
  let data: unknown; // Using unknown to enforce validation

  try {
    data = JSON.parse(body);
    return data;
  }
  catch (error) {
    res.statusCode = 400;
    res.write(JSON.stringify({
      success: false,
      message: 'Invalid JSON format'
    }));
    res.end();

    // log the error
    log(`${logPrefix}: Invalid JSON format`);

    return undefined;
  }
}

/**
 * Handle schema validation errors.
 *
 * Set the response status code to 400, write the validation errors to the response,
 * and log the error.
 *
 * @param res - The outgoing HTTP response.
 * @param validationErrors - The validation errors.
 * @param logPrefix - The prefix string for logging.
 */
export const handleSchemaValidationError = (
  res: ServerResponse,
  validationErrors: ZodIssue[],
  logPrefix: string
) => {
  const errors: Record<string, string> = {};

  // Extract the validation errors
  for (const error of validationErrors) {
    errors[error.path[0] as keyof typeof errors] = error.message;
  }

  res.statusCode = 400;
  res.write(JSON.stringify({
    success: false,
    message: "Validation failed",
    errors
  }));
  res.end();

  // log the error
  log(`${logPrefix}: Validation failed ${JSON.stringify(errors)}`);
}