'use strict';

const { createLogger, format, transports } = require('winston');
const fs = require('fs');
const path = require('path');

const env = process.env.NODE_ENV || 'development';

export default (datapath) => {
  const logDir = path.join(datapath, "logs");
  // Create the log directory if it does not exist
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }

  const filename = path.join(logDir, `${format.timestamp({ format: "YYYY-MM-DD_HH-mm-ss" })}.log`);

  return createLogger({
    // change level if in dev environment versus production
    level: env === 'production' ? 'info' : 'debug',
    format: format.combine(
      format.label({ label: path.basename(process.mainModule.filename) }),
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
    ),
    transports: [
      new transports.Console({
        format: format.combine(
          format.colorize(),
          format.printf(
            info =>
              `[${info.timestamp}][${info.level.toUpperCase()}] ${info.message}`
          )
        )
      }),
      new transports.File({
        filename,
        format: format.combine(
          format.printf(
            info =>
              `[${info.timestamp}][${info.level.toUpperCase()}] ${info.message}`
          )
        )
      })
    ]
  });
}