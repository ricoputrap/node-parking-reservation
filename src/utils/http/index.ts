import { IncomingMessage, ServerResponse } from 'http';
import { EnumErrorName, EnumHttpStatus } from '../../../config/enums';
import log from '../logger';

interface Params {
  res: ServerResponse,
  status: EnumHttpStatus,
  success: boolean,
  message: string,
  data?: any
  errors?: Record<string, string>
}

/**
 * A helper function to send a JSON response to the client.
 * 
 * @param {{ res: ServerResponse, status: EnumHttpStatus, success: boolean, message: string, data?: any }} params
 * @param {ServerResponse} params.res The ServerResponse object to write to.
 * @param {EnumHttpStatus} params.status The HTTP status code to return.
 * @param {boolean} params.success Whether the request was successful or not.
 * @param {string} params.message A message to be included in the response.
 * @param {any} [params.data] Optional data to be included in the response.
 */
export const sendResponse = ({ res, status, success, message, data, errors }: Params) => {
  res.statusCode = status;

  res.write(JSON.stringify({
    success,
    message,
    data,
    errors
  }));

  res.end();
}

export const notFoundHandler = (req: IncomingMessage, res: ServerResponse) => {
  sendResponse({
    res,
    status: EnumHttpStatus.NOT_FOUND,
    success: false,
    message: 'Route not found'
  });
}

export const methodNotAllowedHandler = (req: IncomingMessage, res: ServerResponse) => {
  sendResponse({
    res,
    status: EnumHttpStatus.METHOD_NOT_ALLOWED,
    success: false,
    message: 'Method not allowed'
  });
}

export const errorHandler = (error: any, res: ServerResponse, logPrefix: string) => {
  let message: string = error.message || 'An unexpected error occurred';
  let status: EnumHttpStatus = EnumHttpStatus.INTERNAL_SERVER_ERROR;

  switch (error.name) {
    case EnumErrorName.BAD_REQUEST_ERROR:
      status = EnumHttpStatus.BAD_REQUEST;
      break;

    case EnumErrorName.UNAUTHORIZED_ERROR:
      status = EnumHttpStatus.UNAUTHORIZED;
      break;

    case EnumErrorName.FORBIDDEN_ERROR:
      status = EnumHttpStatus.FORBIDDEN;
      break;

    case EnumErrorName.NOT_FOUND_ERROR:
      status = EnumHttpStatus.NOT_FOUND;
      break;

    case EnumErrorName.TOKEN_EXPIRED_ERROR:
      status = EnumHttpStatus.UNAUTHORIZED;
      message = 'Access token expired';
      break;

    default:
      break;
  }

  log(`${logPrefix}: ${error.message}`);

  sendResponse({
    res,
    status,
    success: false,
    message
  });
}