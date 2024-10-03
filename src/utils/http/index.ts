import { ServerResponse } from 'http';
import { EnumHttpStatus } from '../../../config/enums';

interface Params {
  res: ServerResponse,
  status: EnumHttpStatus,
  success: boolean,
  message: string,
  data?: any
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
export const sendResponse = ({ res, status, success, message, data }: Params) => {
  res.statusCode = status;

  res.write(JSON.stringify({
    success,
    message,
    data
  }));

  res.end();
}