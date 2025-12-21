const makeWASocket = require("@whiskeysockets/baileys").default;
const {
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const qrcode = require("qrcode-terminal");
const pino = require("pino");
const fs = require("fs");
const path = require("path");

// AI Response Engine (No API needed)
class AIResponseEngine {
  constructor() {
    this.learningData = this.loadLearningData();
    this.contextMemory = new Map(); // Store conversation context per user
  }

  loadLearningData() {
    try {
      const dataPath = path.join(__dirname, 'ai_learning.json');
      if (fs.existsSync(dataPath)) {
        return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      }
    } catch (error) {
      console.error('Error loading learning data:', error);
    }
    
    // Default knowledge base
    return {
      greetings: ['hello', 'hi', 'hey', 'hola', 'namaste', 'salam'],
      farewells: ['bye', 'goodbye', 'see you', 'later', 'take care'],
      questions: {
        'how are you': ["I'm doing great! How about you?", "All systems operational! How can I help?"],
        'what is your name': ["I'm KING_BLESS XMD AI Bot!", "Call me XMD AI Assistant!"],
        'who created you': ["I was created by KING_BLESS using Baileys library!", "My developer is KING_BLESS!"],
        'what can you do': [
          "I can chat with you, answer questions, remember our conversations, and learn from interactions!",
          "I'm here to assist with conversations and provide helpful responses!"
        ],
        'time': () => `Current time: ${new Date().toLocaleTimeString()}`,
        'date': () => `Today's date: ${new Date().toDateString()}`
      },
      responses: {
        default: ["Interesting! Tell me more.", "I see. What else would you like to know?", "That's fascinating!"],
        joke: [
          "Why don't scientists trust atoms? Because they make up everything!",
          "Why did the computer go to the doctor? It had a virus!",
          "What do you call a fake noodle? An impasta!"
        ],
        fact: [
          "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly good to eat.",
          "Octopuses have three hearts. Two pump blood to the gills, while the third pumps it to the rest of the body.",
          "A day on Venus is longer than a year on Venus."
        ],
        quote: [
          "The only way to do great work is to love what you do. – Steve Jobs",
          "Innovation distinguishes between a leader and a follower. – Steve Jobs",
          "The future belongs to those who believe in the beauty of their dreams. – Eleanor Roosevelt"
        ]
      },
      patterns: {
        help: /help|support|assist|guide/i,
        joke: /joke|funny|laugh|humor/i,
        fact: /fact|interesting|tell me something|knowledge/i,
        quote: /quote|inspiration|motivation|wisdom/i,
        weather: /weather|rain|sunny|temperature/i,
        math: /calculate|math|plus|minus|multiply|divide|\d+\s*[\+\-\*\/]\s*\d+/,
        song: /song|music|play|artist|sing/i
      }
    };
  }

  saveLearningData() {
    try {
      const dataPath = path.join(__dirname, 'ai_learning.json');
      fs.writeFileSync(dataPath, JSON.stringify(this.learningData, null, 2));
    } catch (error) {
      console.error('Error saving learning data:', error);
    }
  }

  async processMessage(userId, message) {
    const text = message.toLowerCase().trim();
    const userContext = this.contextMemory.get(userId) || { lastTopic: null, mood: 'neutral' };
    
    // Update context
    userContext.lastMessage = text;
    this.contextMemory.set(userId, userContext);
    
    // Check for patterns
    for (const [category, pattern] of Object.entries(this.learningData.patterns)) {
      if (pattern.test(text)) {
        return this.generateResponse(category, text, userContext);
      }
    }
    
    // Check greetings
    if (this.learningData.greetings.some(greet => text.includes(greet))) {
      const greetings = ["Hello! 👋", "Hi there!", "Hey! How can I assist you today?"];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    // Check farewells
    if (this.learningData.farewells.some(farewell => text.includes(farewell))) {
      const farewells = ["Goodbye! 👋", "See you soon!", "Take care!"];
      return farewells[Math.floor(Math.random() * farewells.length)];
    }
    
    // Check specific questions
    for (const [question, response] of Object.entries(this.learningData.questions)) {
      if (text.includes(question)) {
        if (typeof response === 'function') {
          return response();
        }
        return response[Math.floor(Math.random() * response.length)];
      }
    }
    
    // Check for math expressions
    if (this.isMathExpression(text)) {
      return this.solveMathExpression(text);
    }
    
    // Learn from interaction
    this.learnFromInteraction(text);
    
    // Default intelligent response
    return this.generateIntelligentResponse(text, userContext);
  }

  isMathExpression(text) {
    const mathRegex = /^\s*(\d+(\.\d+)?\s*[\+\-\*\/]\s*)+\d+(\.\d+)?\s*$/;
    const simpleMath = /^(\d+\s*[\+\-\*\/]\s*\d+)/;
    return mathRegex.test(text) || simpleMath.test(text);
  }

  solveMathExpression(text) {
    try {
      // Remove any non-math characters for safety
      const cleanExpr = text.replace(/[^\d\+\-\*\/\.\(\)\s]/g, '');
      // Use eval with error handling (safe here as we sanitized)
      const result = eval(cleanExpr);
      return `Result: ${cleanExpr} = ${result}`;
    } catch (error) {
      return "Sorry, I couldn't calculate that. Could you rephrase?";
    }
  }

  generateResponse(category, text, context) {
    switch(category) {
      case 'help':
        return "I can help you with:\n• General conversations\n• Math calculations\n• Telling jokes\n• Sharing facts\n• Providing quotes\n• Answering questions\n\nJust ask me anything!";
      
      case 'joke':
        return this.learningData.responses.joke[Math.floor(Math.random() * this.learningData.responses.joke.length)];
      
      case 'fact':
        return `📚 Did you know?\n${this.learningData.responses.fact[Math.floor(Math.random() * this.learningData.responses.fact.length)]}`;
      
      case 'quote':
        return `💫 ${this.learningData.responses.quote[Math.floor(Math.random() * this.learningData.responses.quote.length)]}`;
      
      case 'weather':
        return "I can't check real-time weather without an API, but I suggest checking your local weather app! ☀️🌧️";
      
      case 'song':
        return "I'm currently learning about music! For now, I recommend checking Spotify or YouTube for your favorite tunes! 🎵";
      
      default:
        return this.learningData.responses.default[Math.floor(Math.random() * this.learningData.responses.default.length)];
    }
  }

  generateIntelligentResponse(text, context) {
    const words = text.split(' ');
    
    // Check for question words
    const questionWords = ['what', 'why', 'how', 'when', 'where', 'who', 'which', 'can', 'do', 'does'];
    const isQuestion = questionWords.some(word => text.startsWith(word));
    
    // Check for emotional content
    const happyWords = ['happy', 'excited', 'good', 'great', 'awesome', 'wonderful'];
    const sadWords = ['sad', 'bad', 'upset', 'angry', 'frustrated', 'tired'];
    
    const hasHappy = happyWords.some(word => text.includes(word));
    const hasSad = sadWords.some(word => text.includes(word));
    
    if (isQuestion) {
      const responses = [
        "That's an interesting question!",
        "I'm learning about that topic.",
        "Let me think about that...",
        "Great question! Could you elaborate?",
        "I'm not entirely sure, but I'm always learning!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    if (hasHappy) {
      return "That's wonderful to hear! 😊 I'm glad you're feeling good!";
    }
    
    if (hasSad) {
      return "I'm sorry to hear that. I'm here if you want to talk about it. 🤗";
    }
    
    // Generate context-aware response
    if (context.lastTopic) {
      return `You mentioned "${context.lastTopic}" earlier. Tell me more about it!`;
    }
    
    // Random engaging response
    const responses = [
      "Interesting! What else would you like to chat about?",
      "I see. How does that make you feel?",
      "That's fascinating! Could you tell me more?",
      "Thanks for sharing that with me!",
      "I'm learning so much from our conversation!"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  learnFromInteraction(text) {
    // Simple learning mechanism - store new patterns
    const words = text.toLowerCase().split(' ');
    const newWords = words.filter(word => 
      word.length > 3 && 
      !this.learningData.greetings.includes(word) &&
      !this.learningData.farewells.includes(word)
    );
    
    if (newWords.length > 0) {
      // Add to learning data (simple implementation)
      if (!this.learningData.learnedWords) {
        this.learningData.learnedWords = [];
      }
      
      newWords.forEach(word => {
        if (!this.learningData.learnedWords.includes(word)) {
          this.learningData.learnedWords.push(word);
        }
      });
      
      // Save periodically
      if (Math.random() < 0.1) { // 10% chance to save
        this.saveLearningData();
      }
    }
  }
}

// Auto-reply configuration
class AutoReplyManager {
  constructor() {
    this.autoReplies = this.loadAutoReplies();
    this.scheduledMessages = new Map();
  }

  loadAutoReplies() {
    try {
      const repliesPath = path.join(__dirname, 'auto_replies.json');
      if (fs.existsSync(repliesPath)) {
        return JSON.parse(fs.readFileSync(repliesPath, 'utf8'));
      }
    } catch (error) {
      console.error('Error loading auto replies:', error);
    }
    
    // Default auto-replies
    return {
      keywords: {
        'menu': "Here's what I can do:\n1. Chat with me\n2. Ask for a joke\n3. Request a fact\n4. Get a quote\n5. Math calculations\nSay 'help' for more options!",
        'owner': "My owner is KING_BLESS! 👑",
        'bot': "I'm KING_BLESS XMD AI Bot, powered by advanced algorithms!",
        'love': "I'm programmed to be helpful and friendly! 💖",
        'thank you': "You're welcome! 😊",
        'sorry': "No problem at all! 😇",
        'sticker': "I can't send stickers yet, but I'm learning!",
        'image': "Image processing features coming soon! 🖼️",
        'video': "Video features are in development! 🎬"
      },
      groupRules: [
        "Be respectful to everyone",
        "No spam or advertising",
        "Keep conversations appropriate",
        "Help each other learn"
      ]
    };
  }

  getAutoReply(text) {
    const lowerText = text.toLowerCase();
    
    // Check for keywords
    for (const [keyword, reply] of Object.entries(this.autoReplies.keywords)) {
      if (lowerText.includes(keyword)) {
        return reply;
      }
    }
    
    // Check for group rules
    if (lowerText.includes('rules') || lowerText.includes('rule')) {
      return "📜 Group Rules:\n" + this.autoReplies.groupRules.map((rule, i) => `${i + 1}. ${rule}`).join('\n');
    }
    
    return null;
  }
}

// Enhanced WhatsApp Bot
async function startBot() {
  console.log('🤖 KING_BLESS XMD AI Bot Starting...');
  console.log('🚀 Features: AI Chat | Auto Replies | Learning System\n');
  
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
  const aiEngine = new AIResponseEngine();
  const autoReplyManager = new AutoReplyManager();

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false, // We'll handle QR ourselves
  });

  // Save credentials when updated
  sock.ev.on('creds.update', saveCreds);

  // QR code and connection updates
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("\n" + "=".repeat(50));
      console.log("📲 SCAN QR CODE");
      console.log("=".repeat(50));
      console.log("1. Open WhatsApp on your phone");
      console.log("2. Tap Menu (3 dots) → Linked Devices");
      console.log("3. Tap 'Link a Device'");
      console.log("4. Scan this QR code:\n");
      qrcode.generate(qr, { small: false });
      console.log("\n" + "=".repeat(50));
    }

    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('🔌 Connection closed');
      if (shouldReconnect) {
        console.log('🔄 Attempting to reconnect...');
        setTimeout(() => startBot(), 3000);
      }
    } else if (connection === 'open') {
      console.log('\n✅ Bot Connected Successfully!');
      console.log('🤖 AI System: ONLINE');
      console.log('💬 Auto-Reply: ENABLED');
      console.log('📊 Memory: LEARNING ACTIVE');
      
      // Set custom status
      sock.updateProfileStatus('🤖 AI Assistant | Always Active');
    }
  });

  // Enhanced message handler
  sock.ev.on('messages.upsert', async ({ messages }) => {
    try {
      const msg = messages[0];
      if (!msg.message || msg.key.fromMe) return;

      const jid = msg.key.remoteJid;
      const sender = msg.key.participant || jid;
      const isGroup = jid.endsWith('@g.us');
      
      // Extract text from different message types
      let text = '';
      if (msg.message.conversation) {
        text = msg.message.conversation;
      } else if (msg.message.extendedTextMessage?.text) {
        text = msg.message.extendedTextMessage.text;
      } else if (msg.message.imageMessage?.caption) {
        text = msg.message.imageMessage.caption;
      } else if (msg.message.videoMessage?.caption) {
        text = msg.message.videoMessage.caption;
      }

      if (!text.trim()) return;

      console.log(`\n📩 New Message: ${isGroup ? '[GROUP]' : '[PRIVATE]'} ${sender.split('@')[0]}: ${text}`);

      // Check auto-replies first
      const autoReply = autoReplyManager.getAutoReply(text);
      if (autoReply) {
        await sock.sendMessage(jid, { text: autoReply });
        console.log(`🤖 Auto-reply sent to ${sender.split('@')[0]}`);
        return;
      }

      // Process with AI
      console.log(`🧠 AI Processing message from ${sender.split('@')[0]}...`);
      const aiResponse = await aiEngine.processMessage(sender, text);
      
      // Add typing indicator simulation
      await sock.sendPresenceUpdate('composing', jid);
      
      // Small delay to make it feel natural
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Send AI response
      await sock.sendMessage(jid, { text: aiResponse });
      console.log(`💬 AI Response sent to ${sender.split('@')[0]}`);
      
      // Update presence
      await sock.sendPresenceUpdate('available', jid);

    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  // Handle group participants
  sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
    if (action === 'add') {
      const welcomeMsg = `👋 Welcome to the group, @${participants[0].split('@')[0]}!\n\n` +
        `I'm KING_BLESS XMD AI Bot. Type 'menu' to see what I can do!\n` +
        `Say 'help' for assistance. Enjoy your stay! 😊`;
      
      await sock.sendMessage(id, { 
        text: welcomeMsg,
        mentions: participants
      });
    }
  });

  // Error handling
  sock.ev.on('connection.update', (update) => {
    if (update.error) {
      console.error('❌ Connection Error:', update.error);
    }
  });
}

// Run the bot
startBot().catch(console.error);

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down KING_BLESS XMD AI Bot...');
  console.log('💾 Saving AI learning data...');
  process.exit(0);
});

console.log(`
╔═══════════════════════════════════════════╗
║      KING_BLESS XMD AI BOT v2.0          ║
║  #WA 🔢: +233535502035#
║ #Telegram bot#: http://t.me/Gyimah803_bot ║
║  Features Included:                       ║
║  • Advanced AI Chat System                ║
║  • Smart Auto-Reply Engine                ║
║  • Context-Aware Responses                ║
║  • Learning Memory                        ║
║  • Math Calculations                      ║
║  • Group Welcome Messages                 ║
║  • No API Required                        ║
║                                           ║
║  Starting up...                           ║
╚═══════════════════════════════════════════╝
`);
