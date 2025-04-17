import { app } from 'electron'
import fs from 'fs'
import path from 'path'

const LOGS_DIR = path.join(app.getPath('userData'), 'logs')

// Ensure logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true })
}

// Create a new log file with timestamp
const createLogFile = (): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const logFileName = `app-${timestamp}.log`
  const logFilePath = path.join(LOGS_DIR, logFileName)
  
  // Create empty log file
  fs.writeFileSync(logFilePath, '')
  
  return logFilePath
}

// Get current log file path
let currentLogFile = createLogFile()

// Log a message to file
export const logToFile = (message: string): void => {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] ${message}\n`
  
  fs.appendFileSync(currentLogFile, logMessage)
}

// Get logs directory path
export const getLogsDirectory = (): string => {
  return LOGS_DIR
}

// Create a new log file (to be called on app restart)
export const createNewLogFile = (): void => {
  currentLogFile = createLogFile()
} 