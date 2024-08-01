# 🔮 Curve.fi Price Oracle Check

This Node.js script monitors the price oracle for specified pools on Curve.fi. It checks the price on a configurable schedule, sends a Telegram alert if the price falls below a specified threshold, and logs all check activities to a file.

## ✨ Features

- 📊 Fetches price oracle data from Curve.fi API for multiple pools
- 🚨 Sends Telegram or SMS alerts when price drops below threshold
- 🧵 Supports sending alerts to specific Telegram threads
- ⚙️ Configurable pools and thresholds via external configuration file
- ⏰ Configurable check schedule via environment variable
- 🎨 Displays stylized console output using figlet
- 📝 Logs detailed check information to both console and a log file
- 💾 Persistent logging of all check activities to `log.txt`

## 📋 Prerequisites

Before you begin, ensure you have met the following requirements:

- 🟢 Node.js (v12.0.0 or higher) installed on your machine
- 🤖 A Telegram bot token (obtain from [@BotFather](https://t.me/botfather))
- 🆔 Your Telegram chat ID
- 🧵 (Optional) Telegram thread ID for sending alerts to specific threads

## 🚀 Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/curve-price-oracle-check.git
   cd curve-price-oracle-check
   ```

2. Install the required dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the project root and add your configuration:
   ```
 - **Telegram configuration**:
     - `TELEGRAM_BOT_TOKEN`: Your Telegram bot token.
     - `TELEGRAM_CHAT_ID`: The chat ID where alerts will be sent.
     - `TELEGRAM_LIQUIDITY_THREAD_ID`: The thread ID for Telegram messages (optional).

   - **Twilio configuration**:
     - `TWILIO_ACCOUNT_SID`: Your Twilio account SID.
     - `TWILIO_AUTH_TOKEN`: Your Twilio auth token.
     - `TWILIO_PHONE_NUMBER`: Your Twilio phone number.
     - `ALERT_PHONE_NUMBER`: The phone number to receive SMS alerts.
     - `ENABLE_SMS_ALERT`: Set to `true` to enable SMS alerts.

   - **RPC URL for Base chain**:
     - `RPC_BASE`: Your RPC URL.

   - **Schedule in minutes**:
     - `CRON_SCHEDULE`: The interval in minutes for checking the reserves.

   ```

4. Create a `config.json` file in the project root with your pool configurations:
   ```json
   {
     "pools": [
       {
         "id": "factory-twocrypto-19",
         "name": "KNOX/eUSD",
         "network": "arbitrum",
         "factoryType": "factory-twocrypto",
         "alertThreshold": 0.97
       }
     ]
   }
   ```

## 🏃‍♂️ Usage

To start the price oracle monitoring script, run:

```
npm start
```

The script will display a stylized "Price Oracle Check" message and begin monitoring according to the specified schedule. It will log information about each check to both the console and the `log.txt` file, and send Telegram alerts when the price drops below the specified threshold for each pool.

## ⚙️ Configuration

### ⏱️ Check Interval

The check interval is configured using the `CRON_SCHEDULE` environment variable in the `.env` file. Set this to the number of minutes between each check. For example:

```
CRON_SCHEDULE=10  # Check every 10 minutes
```

Some example configurations:
- `5`: Check every 5 minutes
- `60`: Check every hour
- `1440`: Check once a day

If not set, the script defaults to checking every 10 minutes.

### 🏊‍♂️ Pool Configuration

You can modify the pool configurations in the `config.json` file:

- `id`: The pool ID as used in the Curve.fi API
- `name`: A human-readable name for the pool (used in logs and alerts)
- `network`: The network the pool is on (e.g., "arbitrum", "ethereum")
- `factoryType`: The factory type for the API URL (e.g., "factory-twocrypto")
- `alertThreshold`: The price threshold below which to send alerts

To add more pools to monitor, simply add new objects to the `pools` array in `config.json`.

## 🧵 Telegram Thread Support

To send alerts to a specific thread in a Telegram group or channel:

1. Obtain the thread ID from Telegram (you can use @userinfobot in the desired thread to get this).
2. Add the `TELEGRAM_THREAD_ID` to your `.env` file.

If `TELEGRAM_THREAD_ID` is not set, alerts will be sent to the main chat specified by `TELEGRAM_CHAT_ID`.

## 📝 Logging

All check activities are logged to a `log.txt` file in the project root directory. Each log entry includes:

- ⏰ Timestamp of the check
- 🏊‍♂️ Pool name and ID
- 💹 Current price oracle value
- 🚨 Whether an alert was sent
- ❌ Any errors encountered during the check

This log file provides a persistent record of all checks, including those that don't trigger alerts, which can be useful for monitoring and debugging purposes.

## 🤝 Contributing

Contributions to this project are welcome. Please fork the repository and submit a pull request with your changes.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Curve.fi](https://curve.fi/) for providing the API
- [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api) for Telegram integration
- [figlet](https://github.com/patorjk/figlet.js) for the stylized console output

## ⚠️ Disclaimer

This script is for educational purposes only. Always verify the data and use at your own risk. The authors are not responsible for any financial decisions made based on this script's output.