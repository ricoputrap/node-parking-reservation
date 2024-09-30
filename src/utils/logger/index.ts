import fs from 'fs/promises';

/**
 * Logs a message to a file. If the file doesn't exist, it will be created.
 * 
 * Each log message will be appended to the file with the current time in
 * hh:mm:ss format.
 * 
 * If the file already exists, the message will be appended to
 * the file.
 * 
 * If the file doesn't exist, the message will be written as the
 * first line of the file.
 * 
 * @param message The message to be logged
 * @returns {Promise<void>}
 */
const log = async (message: string) => {// get current date in format YYYY-MM-DD
  const date = new Date().toISOString().slice(0, 10);
  const filePath = `./logs/${date}.log`;

  // get current time in hh:mm:ss format
  const time = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true
  });
  const loggedMessage = `${time} - ${message}\n`;

  try {
    // read log file -> if not error, it exists
    await fs.readFile(filePath, 'utf8');

    // append message to log file
    await fs.appendFile(filePath, loggedMessage);
  }
  catch (error: any) {
    // create new log file and put loggedMessage in it
    if (error.code == "ENOENT") {
      await fs.writeFile(filePath, loggedMessage);
      return;
    }

    console.error("[LOGGING] error.code:", error.code);
  }
}

export default log;
