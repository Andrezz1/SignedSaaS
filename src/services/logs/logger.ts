import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({format: 'DD-MM-YYYY HH:mm:ss'}),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level}: ${message}`
    })
  ),
  transports: [
    new winston.transports.File({ filename: '../../../logs/app.log' }),
  ],
})

export default logger
