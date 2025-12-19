![Screenshot_20251218_220936_Termux](https://github.com/user-attachments/assets/68b856c7-06ba-4acd-8c5a-1ee28d53df60)
# WhatsApp-AI-Bot
Installation & Setup for Termux:

1. Install Termux from F-Droid (not Play Store)
2. Update packages:

```bash
pkg update && pkg upgrade
pkg install nodejs git
```

1. Install project:

```bash
git clone https://github.com/pokuahhnyarko-lang/WhatsApp-AI-Bot.git
cd WhatsApp-AI-Bot
npm init -y
npm install @whiskeysockets/baileys qrcode-terminal pino
```

1. Create the bot file:

```bash
nano bot.js
```

Paste the code above and save (Ctrl+X, then Y, then Enter)

1. Run the bot:

```bash
node bot.js
```

1. Additional files that will be created automatically:

· auth_info/ - WhatsApp authentication files
· ai_learning.json - AI learning database
· auto_replies.json - Custom auto-reply configurations

Features Added:

🤖 AI Capabilities:

· Context-aware conversations
· Learning from interactions
· Math calculation engine
· Emotional response detection
· Memory of past conversations

🔄 Auto-Reply System:

· Keyword-based auto-replies
· Smart pattern matching
· Group welcome messages
· Customizable responses

📊 Advanced Features:

· Group participant tracking
· Typing indicators
· Presence updates
· Error handling
· Auto-reconnection

🎯 Commands to Try:

· hi / hello - Greetings
· menu / help - Show features
· joke - Get a random joke
· fact - Interesting facts
· quote - Motivational quotes
· 2+2 / 10*5 - Math calculations
· rules - Group rules
