const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');
const figlet = require('figlet');
const fs = require('fs');
const path = require('path');
const { queryAerodrome } = require('./liquidityProviders/aerodromeLiquidity');
require('dotenv').config();

// Load configuration
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

// Telegram bot token, chat ID, and thread ID
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
const threadId = process.env.TELEGRAM_LIQUIDITY_THREAD_ID;

// RPC URL for Base chain
const rpcUrl = process.env.RPC_BASE;

// Schedule in minutes (loaded from .env file)
const scheduleMinutes = parseInt(process.env.CRON_SCHEDULE) || 10;

// Convert minutes to a cron expression
const cronSchedule = `*/${scheduleMinutes} * * * *`;

// Create a new bot instance
const bot = new TelegramBot(botToken);

// Log file path
const logFilePath = path.join(__dirname, 'liquiditylog.txt');

// Function to log messages to file
function logToFile(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}\n`;
  fs.appendFileSync(logFilePath, logMessage);
}

// Function to send Telegram message (now with thread support)
async function sendTelegramMessage(message) {
  const options = {
    parse_mode: 'Markdown',
    ...(threadId ? { message_thread_id: parseInt(threadId) } : {})
  };
  try {
    await bot.sendMessage(chatId, message, options);
    logToFile(`Telegram message sent: ${message}`);
  } catch (error) {
    logToFile(`Error sending Telegram message: ${error.message}`);
    console.error('Error sending Telegram message:', error);
  }
}

// Function to display stylized startup message
function displayStartupMessage() {
  figlet('Reserve Check', (err, data) => {
    if (err) {
      console.log('Something went wrong with figlet');
      console.dir(err);
      return;
    }
    console.log(data);
    console.log('Reserve monitoring script is running...');
    console.log(`Checking every ${scheduleMinutes} minute${scheduleMinutes !== 1 ? 's' : ''}`);
    console.log(`Monitoring ${config.liquidity.length} liquidity pool(s)`);
    console.log('---------------------------------------------------------------');
    logToFile('Script started');
    logToFile(`Check interval: ${scheduleMinutes} minute${scheduleMinutes !== 1 ? 's' : ''}`);
  });
}

// Function to check the reserves for a single pool
async function checkPoolReserves(pool) {
  const now = new Date();
  const formattedTime = now.toUTCString();
  const checkMessage = `Performing check for ${pool.name}`;
  console.log(`\n${checkMessage}`);
  console.log('Check Time:',formattedTime);
  logToFile(checkMessage);
  
  try {
    const poolData = await queryAerodrome(rpcUrl, pool.decimalstoken0, pool.decimalstoken1, pool.offset);
    
    if (poolData) {
      const reserveRatio = parseFloat(poolData.reserve0) / parseFloat(poolData.reserve1);
      const reserveMessage = `Pool: ${pool.name} - Reserve Ratio: ${reserveRatio.toFixed(6)}`;
      console.log(reserveMessage);
      logToFile(reserveMessage);
      logToFile(parseFloat(poolData.reserve0) + pool.token0, parseFloat(poolData.reserve1) + pool.token1)
      
      if (reserveRatio < pool.minRatio || reserveRatio > pool.maxRatio) {
        const alertMessage = `
🚨 *RESERVE ALERT* 🚨

Pool: *${pool.name}*
ID: \`${pool.id}\`
        
Current Reserve Ratio: \`${reserveRatio.toFixed(6)}\`
Min Ratio Threshold: \`${pool.minRatio}\`
Max Ratio Threshold:  \`${pool.maxRatio}\`

Token0 Balance: \`${Math.ceil(parseFloat(poolData.reserve0))} ${pool.token0}\`
Token1 Balance: \`${Math.ceil(parseFloat(poolData.reserve1))} ${pool.token1}\`


        
⚠️ *Reserve ratio has dropped below the alert threshold!* ⚠️
        
Time: ${formattedTime}`;

        await sendTelegramMessage(alertMessage);
        console.log('Alert sent:', alertMessage);
      } else {
        const noAlertMessage = 'Reserve ratio is above threshold. No alert sent.';
        console.log(noAlertMessage);
        logToFile(noAlertMessage);
      }
    } else {
      const notFoundMessage = `Pool ${pool.id} data not found in the response.`;
      console.log(notFoundMessage);
      logToFile(notFoundMessage);
    }
  } catch (error) {
    const errorMessage = `Error checking reserves for ${pool.name}: ${error.message}`;
    console.error(errorMessage);
    logToFile(errorMessage);
  }
}

// Function to check all liquidity
async function checkAllLiquidity() {
  for (const pool of config.liquidity) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    await checkPoolReserves(pool);
  }
}

// Display startup message
displayStartupMessage();

// Delay for 1 second before running the checks
setTimeout(checkAllLiquidity, 2500);

// Schedule the task using the cron schedule
cron.schedule(cronSchedule, checkAllLiquidity);