const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');
const figlet = require('figlet');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Load configuration
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

// Telegram bot token, chat ID, and thread ID (you'll need to set these in a .env file)
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
const threadId = process.env.TELEGRAM_THREAD_ID; // Optional: Thread ID

// Cron schedule (now loaded from .env file)
const cronSchedule = process.env.CRON_SCHEDULE || '*/10 * * * *'; // Default to every 10 minutes if not set

// Create a new bot instance
const bot = new TelegramBot(botToken);

// Log file path
const logFilePath = path.join(__dirname, 'log.txt');

// Function to log messages to file
function logToFile(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}\n`;
  fs.appendFileSync(logFilePath, logMessage);
}

// Function to send Telegram message (now with thread support)
async function sendTelegramMessage(message) {
  const options = threadId ? { message_thread_id: parseInt(threadId) } : {};
  try {
    await bot.sendMessage(chatId, message, options);
    logToFile(`Telegram message sent: ${message}`);
  } catch (error) {
    logToFile(`Error sending Telegram message: ${error.message}`);
    console.error('Error sending Telegram message:', error);
  }
}

// Function to convert cron schedule to minutes
function cronToMinutes(cronExpression) {
    const parts = cronExpression.split(' ');
    if (parts[0] === '*' && parts[1] === '*') return 1;
    if (parts[0] === '*') return 60;
    return parseInt(parts[0].replace('*/', ''));
}

// Function to display stylized startup message
function displayStartupMessage() {
  figlet('Price Oracle Check', (err, data) => {
    if (err) {
      console.log('Something went wrong with figlet');
      console.dir(err);
      return;
    }
    console.log(data);
    console.log('Price oracle monitoring script is running...');
    console.log(`Checking every ${cronToMinutes(cronSchedule)} minutes`);
    console.log(`Monitoring ${config.pools.length} pool(s)`);
    console.log('---------------------------------------------------------------');
    logToFile('Script started');
    logToFile(`Cron schedule: ${cronSchedule}`);
  });
}

// Function to check the price oracle for a single pool
async function checkPoolPriceOracle(pool) {
  const now = new Date();
  const checkMessage = `Performing check for ${pool.name} (${pool.id})`;
  console.log(`\n${checkMessage}`);
  logToFile(checkMessage);
  
  try {
    const response = await axios.get(`https://api.curve.fi/api/getPools/${pool.network}/${pool.factoryType}`);
    const poolData = response.data.data.poolData.find(p => p.id === pool.id);
    
    if (poolData) {
        const priceMessage = `Pool: ${pool.name} - Current price oracle: ${poolData.priceOracle.toFixed(6)}`;
        console.log(priceMessage);
        logToFile(priceMessage);
        
      if (poolData.priceOracle < pool.alertThreshold) {
        
        const alertMessage = `🚨 *PRICE ALERT* 🚨
        Pool: *${pool.name}*
        ID: \`${pool.id}\`
        
        Current Price Oracle: \`${poolData.priceOracle.toFixed(6)}\`
        Alert Threshold: \`${pool.alertThreshold}\`
        
        ⚠️ Price has dropped below the alert threshold! ⚠️
        
        Time: ${new Date().toISOString()}`;

        await sendTelegramMessage(alertMessage);
        console.log('Alert sent:', alertMessage);
        logToFile(`Alert sent: ${alertMessage}`);
      } else {
        const noAlertMessage = 'Price is above threshold. No alert sent.';
        console.log(noAlertMessage);
        logToFile(noAlertMessage);
      }
    } else {
      const notFoundMessage = `Pool ${pool.id} not found in the API response.`;
      console.log(notFoundMessage);
      logToFile(notFoundMessage);
    }
  } catch (error) {
    const errorMessage = `Error checking price oracle for ${pool.name}: ${error.message}`;
    console.error(errorMessage);
    logToFile(errorMessage);
  }
  
  console.log('---------------------------------------------------------------');
  logToFile('---------------------------------------------------------------');
}

// Function to check all pools
async function checkAllPools() {
  for (const pool of config.pools) {
    await checkPoolPriceOracle(pool);
  }
}

// Display startup message
displayStartupMessage();

// Schedule the task using the cron schedule from .env
cron.schedule(cronSchedule, checkAllPools);

// Run the check immediately on startup
checkAllPools();