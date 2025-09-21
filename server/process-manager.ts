
import fs from 'fs';
import path from 'path';

const PID_FILE = path.join(process.cwd(), '.server.pid');

export function checkRunningInstance(): boolean {
  try {
    if (fs.existsSync(PID_FILE)) {
      const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8'));
      
      // Check if process is still running
      try {
        process.kill(pid, 0);
        console.log(`Server already running with PID: ${pid}`);
        return true;
      } catch (e) {
        // Process is not running, remove stale PID file
        fs.unlinkSync(PID_FILE);
      }
    }
  } catch (e) {
    // PID file doesn't exist or can't be read
  }
  
  return false;
}

export function createPidFile(): void {
  fs.writeFileSync(PID_FILE, process.pid.toString());
  
  // Clean up PID file on exit
  const cleanup = () => {
    try {
      if (fs.existsSync(PID_FILE)) {
        fs.unlinkSync(PID_FILE);
      }
    } catch (e) {
      // Ignore cleanup errors
    }
  };

  process.on('exit', cleanup);
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

export function killExistingServer(): void {
  try {
    if (fs.existsSync(PID_FILE)) {
      const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8'));
      try {
        process.kill(pid, 'SIGTERM');
        console.log(`Killed existing server with PID: ${pid}`);
        // Wait a moment for the process to exit
        setTimeout(() => {
          if (fs.existsSync(PID_FILE)) {
            fs.unlinkSync(PID_FILE);
          }
        }, 1000);
      } catch (e) {
        // Process already dead
        fs.unlinkSync(PID_FILE);
      }
    }
  } catch (e) {
    // Ignore errors
  }
}
