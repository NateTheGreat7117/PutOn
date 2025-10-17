// PutOn/server.js
import express from "express";
import session from "express-session";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import bcrypt from "bcrypt";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import SQLiteStore from "connect-sqlite3";


const SQLiteStoreSession = SQLiteStore(session);


// Load environment variables FIRST
dotenv.config();


// Debug: Check if API key is loaded
console.log('🔑 API Key loaded:', process.env.HUGGINGFACE_API_KEY ? 'YES ✓' : 'NO ✗');
if (process.env.HUGGINGFACE_API_KEY) {
  console.log('🔑 API Key preview:', process.env.HUGGINGFACE_API_KEY.substring(0, 10) + '...');
}


// --- Boilerplate for __dirname in ES modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// --- Paths ---
const ROOT = __dirname;
const ASSETS = path.join(ROOT, "assets");
const PAGES = path.join(ROOT, "pages");
const COMPONENTS = path.join(ROOT, "components");
const DATA = path.join(ROOT, "data");
const DB_PATH = path.join(ROOT, "data/database.db");


console.log("Server starting...");
console.log("Project root:", ROOT);
console.log("Assets dir:", ASSETS);
console.log("Pages dir:", PAGES);
console.log("Components dir:", COMPONENTS);
console.log("DB path:", DB_PATH);


const app = express();
const PORT = process.env.PORT || 3000;


// --- Middleware ---
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    store: new SQLiteStoreSession({ db: "sessions.sqlite", dir: DATA }),
    secret: "meaders",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    },
  })
);


// --- Serve static directories ---
app.use("/assets", express.static(ASSETS));
app.use("/components", express.static(COMPONENTS));
app.use("/data", express.static(DATA));


// ============================================
// CLOTHING DETECTION DATA & FUNCTIONS
// ============================================
const CLOTHING_CATEGORIES = {
  'top': ['shirt', 't-shirt', 'blouse', 'sweater', 'hoodie', 'tank'],
  'bottom': ['pants', 'jeans', 'shorts', 'skirt', 'trousers'],
  'outerwear': ['jacket', 'coat', 'blazer', 'cardigan'],
  'dress': ['dress', 'gown'],
  'footwear': ['shoes', 'sneakers', 'boots', 'sandals'],
  'accessories': ['hat', 'bag', 'scarf', 'sunglasses', 'watch']
};


const BRANDS = ['Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo', 'Gap', 'Levi\'s'];
const COLORS = ['Black', 'White', 'Blue', 'Red', 'Green', 'Gray', 'Beige'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL'];


// Function to generate realistic clothing data
function generateClothingData() {
  const items = [];
  const numItems = 2 + Math.floor(Math.random() * 3); // 2-4 items
 
  const itemTemplates = [
    { type: 'Top', names: ['Cotton Tee', 'Graphic T-Shirt', 'Crew Neck Sweater', 'Hoodie'] },
    { type: 'Bottom', names: ['Slim Fit Jeans', 'Cargo Pants', 'Athletic Shorts', 'Chinos'] },
    { type: 'Outerwear', names: ['Denim Jacket', 'Bomber Jacket', 'Windbreaker', 'Blazer'] },
    { type: 'Footwear', names: ['Classic Sneakers', 'Running Shoes', 'Canvas Shoes', 'Boots'] },
    { type: 'Accessories', names: ['Baseball Cap', 'Backpack', 'Sunglasses', 'Watch'] }
  ];
 
  const shuffled = itemTemplates.sort(() => 0.5 - Math.random());
 
  for (let i = 0; i < numItems && i < shuffled.length; i++) {
    const template = shuffled[i];
    const randomName = template.names[Math.floor(Math.random() * template.names.length)];
    const randomBrand = BRANDS[Math.floor(Math.random() * BRANDS.length)];
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const randomSize = SIZES[Math.floor(Math.random() * SIZES.length)];
    const price = 25 + (Math.floor(Math.random() * 15) * 5);
   
    items.push({
      type: template.type,
      name: randomName,
      brand: randomBrand,
      color: randomColor,
      size: randomSize,
      price: `$${price}.99`,
      confidence: 85 + Math.floor(Math.random() * 15)
    });
  }
 
  return items;
}


// Helper function to parse clothing from AI caption
function parseClothingFromCaption(caption) {
  const items = [];
  const lowerCaption = caption.toLowerCase();
 
  // Define clothing keywords and their mappings
  const clothingKeywords = {
    'shirt': { type: 'Top', name: 'Shirt' },
    't-shirt': { type: 'Top', name: 'T-Shirt' },
    'tshirt': { type: 'Top', name: 'T-Shirt' },
    'blouse': { type: 'Top', name: 'Blouse' },
    'sweater': { type: 'Top', name: 'Sweater' },
    'hoodie': { type: 'Top', name: 'Hoodie' },
    'tank': { type: 'Top', name: 'Tank Top' },
    'pants': { type: 'Bottom', name: 'Pants' },
    'jeans': { type: 'Bottom', name: 'Jeans' },
    'shorts': { type: 'Bottom', name: 'Shorts' },
    'skirt': { type: 'Bottom', name: 'Skirt' },
    'trousers': { type: 'Bottom', name: 'Trousers' },
    'jacket': { type: 'Outerwear', name: 'Jacket' },
    'coat': { type: 'Outerwear', name: 'Coat' },
    'blazer': { type: 'Outerwear', name: 'Blazer' },
    'dress': { type: 'Dress', name: 'Dress' },
    'shoes': { type: 'Footwear', name: 'Shoes' },
    'sneakers': { type: 'Footwear', name: 'Sneakers' },
    'boots': { type: 'Footwear', name: 'Boots' },
    'sandals': { type: 'Footwear', name: 'Sandals' },
    'hat': { type: 'Accessories', name: 'Hat' },
    'cap': { type: 'Accessories', name: 'Cap' },
    'bag': { type: 'Accessories', name: 'Bag' },
    'sunglasses': { type: 'Accessories', name: 'Sunglasses' },
    'glasses': { type: 'Accessories', name: 'Glasses' }
  };
 
  // Color detection
  const colors = ['black', 'white', 'blue', 'red', 'green', 'gray', 'grey', 'beige', 'brown', 'pink', 'yellow', 'purple', 'navy', 'denim'];
  let detectedColor = 'Unknown';
  for (const color of colors) {
    if (lowerCaption.includes(color)) {
      detectedColor = color.charAt(0).toUpperCase() + color.slice(1);
      break;
    }
  }
 
  // Detect clothing items from caption
  const foundItems = new Set();
  for (const [keyword, itemInfo] of Object.entries(clothingKeywords)) {
    if (lowerCaption.includes(keyword) && !foundItems.has(itemInfo.type)) {
      foundItems.add(itemInfo.type);
     
      const randomBrand = BRANDS[Math.floor(Math.random() * BRANDS.length)];
      const randomSize = SIZES[Math.floor(Math.random() * SIZES.length)];
      const price = 25 + (Math.floor(Math.random() * 15) * 5);
     
      items.push({
        type: itemInfo.type,
        name: itemInfo.name,
        brand: randomBrand,
        color: detectedColor,
        size: randomSize,
        price: `$${price}.99`,
        confidence: 75 + Math.floor(Math.random() * 20)
      });
    }
  }
 
  // If nothing detected, return empty array
  return items;
}


// ============================================
// DATABASE INITIALIZATION
// ============================================
let db;


(async function init() {
  try {
    db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database,
    });


    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        password_hash TEXT
      );
    `);


    console.log('✅ Database initialized');


  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    console.error('\n🔧 Possible fixes:');
    console.error('   1. Make sure the "data" folder exists in your project directory');
    console.error('   2. Check that you have write permissions in the project folder');
    console.error('   3. Verify all npm packages are installed (npm install)');
    process.exit(1);
  }
})();


// ============================================
// ROUTES
// ============================================


// ✅ Homepage route
app.get("/", (req, res) => {
  res.sendFile(path.join(PAGES, "homepage.html"));
});


// ✅ Generic page route (for /pages/other.html)
app.get("/pages/:name", (req, res) => {
  res.sendFile(path.join(PAGES, req.params.name));
});


// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});


// Test endpoint
app.get('/test', (req, res) => {
  res.json({
    message: 'Backend is working!',
    sampleData: generateClothingData()
  });
});


// API endpoint for clothing detection with FREE AI
app.post('/api/detect-clothing', async (req, res) => {
  try {
    const { imageUrl } = req.body;
   
    console.log('📸 Analyzing image:', imageUrl);
   
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'No image URL provided'
      });
    }
   
    // Check if Hugging Face API key is set
    const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
   
    console.log('🔍 Checking API key... Key exists:', !!HF_API_KEY);
   
    if (!HF_API_KEY) {
      console.log('⚠️ No Hugging Face API key found, using mock data');
      console.log('💡 Get a FREE API key at: https://huggingface.co/settings/tokens');
      // Fallback to mock data if no API key
      await new Promise(resolve => setTimeout(resolve, 1000));
      const detectedItems = generateClothingData();
      return res.json({
        success: true,
        items: detectedItems,
        total: detectedItems.length,
        message: 'Detection complete (mock data - set HUGGINGFACE_API_KEY for free AI detection)'
      });
    }
   
    // Use FREE Hugging Face AI vision detection
    console.log('🤖 Using Hugging Face Vision API (FREE) for real detection...');
   
    try {
      // First, fetch the image to convert to base64
      let imageData;
      if (imageUrl.startsWith('http://localhost') || imageUrl.startsWith('/')) {
        // Local image - read from file system
        const fs = await import('fs');
        const fsPromises = await import('fs/promises');
       
        // Convert URL to file path
        let imagePath = imageUrl.replace('http://localhost:3000', '').replace('http://localhost:' + PORT, '');
        if (imagePath.startsWith('/')) {
          imagePath = path.join(ROOT, imagePath);
        }
       
        console.log('📂 Reading local file:', imagePath);
       
        try {
          imageData = await fsPromises.readFile(imagePath);
        } catch (fileError) {
          console.error('File read error:', fileError.message);
          throw new Error(`Could not read image file: ${fileError.message}`);
        }
      } else {
        // Remote image - fetch it
        const imgResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        imageData = Buffer.from(imgResponse.data);
      }
     
      // Resize image if it's too large (max 1MB for free tier)
      const sharp = (await import('sharp')).default;
      console.log('🖼️ Resizing image to reduce size...');
     
      imageData = await sharp(imageData)
        .resize(800, 800, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 80 })
        .toBuffer();
     
      console.log('📦 Image size:', (imageData.length / 1024).toFixed(2), 'KB');
     
      // Use ViT-GPT2 model for image captioning (more reliable)
      console.log('🔄 Sending image to Hugging Face API...');
     
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/nlpconnect/vit-gpt2-image-captioning',
        imageData,
        {
          headers: {
            'Authorization': `Bearer ${HF_API_KEY}`
          },
          timeout: 30000 // 30 second timeout
        }
      );
     
      console.log('📥 Response status:', response.status);
      console.log('📥 Response data:', JSON.stringify(response.data));
     
      // Handle different response formats
      let caption = '';
      if (Array.isArray(response.data) && response.data.length > 0) {
        caption = response.data[0]?.generated_text || '';
      } else if (response.data.error) {
        // Model is loading
        console.log('⏳ Model is loading, please wait...');
        throw new Error('Model is still loading. Please try again in a few seconds.');
      }
     
      console.log('🤖 AI Caption:', caption);
     
      // Parse the caption to extract clothing items
      const detectedItems = parseClothingFromCaption(caption);
     
      console.log('✅ Detected', detectedItems.length, 'items');
     
      res.json({
        success: true,
        items: detectedItems,
        total: detectedItems.length,
        message: 'Detection complete (FREE AI-powered by Hugging Face)'
      });
     
    } catch (aiError) {
      console.error('AI API Error Details:', {
        message: aiError.message,
        status: aiError.response?.status,
        data: aiError.response?.data
      });
     
      // If it's a 503 or model loading error, give helpful message
      if (aiError.response?.status === 503 || aiError.message.includes('loading')) {
        throw new Error('AI model is warming up. Please wait 10-20 seconds and try again.');
      }
     
      throw aiError;
    }
   
  } catch (error) {
    console.error('❌ Error:', error.message);
   
    // Fallback to mock data on error
    const detectedItems = generateClothingData();
    res.json({
      success: true,
      items: detectedItems,
      total: detectedItems.length,
      message: 'Detection complete (fallback to mock data due to API error)'
    });
  }
});


// ============================================
// AUTHENTICATION ROUTES
// ============================================


// ✅ Login route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await db.get("SELECT * FROM users WHERE username = ?", [username]);
  if (!user) return res.status(400).send("User not found");
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.status(400).send("Incorrect password");
  req.session.userId = user.id;
  res.send("Login successful!");
});


  // Signup route
  app.post("/signup", async (req, res) => {
    const { name, username, email, password } = req.body;
    if (!name)
      return res.status(400).json({success: false, message: "missing name-required"});
    if (!username)
      return res.status(400).json({success: false, message: "missing username-required"});
    if (!email)
      return res.status(400).json({success: false, message: "missing email-required"});
    if (!password)
      return res.status(400).json({success: false, message: "missing password-required"});


    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/; // letters, numbers, underscores, 3-20 chars
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/; // min 8 chars, 1 uppercase, 1 lowercase, 1 number
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!usernameRegex.test(username)) {
      return res.status(400).json({ success: false, message: "invalid username" });
    }
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "invalid email"});
    }
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ success: false, message: "invalid password" });
    }


    const hashed = await bcrypt.hash(password, 10);
    try {
      // Check if email or username already exists
      const existingUser = await db.get(
        "SELECT username, email FROM users WHERE username = ? OR email = ?",
        [username, email]
      );


      if (existingUser) {
        if (existingUser.username === username) {
          return res.status(400).json({
            success: false,
            message: "exists username",
          });
        }
        if (existingUser.email === email) {
          return res.status(400).json({
            success: false,
            message: "exists email",
          });
        }
      }


      const result = await db.run(
        "INSERT INTO users (name, username, email, password_hash) VALUES (?, ?, ?, ?)",
        [name, username, email, hashed]
      );


      req.session.userId = result.lastID; // store user session
      await req.session.save();
      // ✅ Send a clear JSON response for the client to detect
      res.json({ success: true, message: "Account created successfully!" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

// Check login status
app.get("/check-login", async (req, res) => {
  try {
    // If no session found, user isn't logged in
    if (!req.session || !req.session.userId) {
      return res.json({ loggedIn: false });
    }


    // Retrieve user info from database
    const user = await db.get("SELECT username, email FROM users WHERE id = ?", [req.session.userId]);


    if (!user) {
      // User record not found, clear broken session
      req.session.destroy(() => {});
      return res.json({ loggedIn: false });
    }


    // ✅ Successfully authenticated
    res.json({
      loggedIn: true,
      user: {
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Error in /check-login:", err);
    res.status(500).json({ loggedIn: false, error: "Server error" });
  }
});


// ✅ Logout route
app.post("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ success: false, message: "Logout failed" });
      }
      res.clearCookie("connect.sid"); // clears the session cookie
      res.json({ success: true, message: "Logged out successfully" });
    });
  } else {
    res.json({ success: true, message: "No session to clear" });
  }
});


// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log(`\n✅ Server is running!`);
  console.log(`📍 Main server: http://localhost:${PORT}`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   GET  / - Homepage`);
  console.log(`   GET  /test - Test clothing detection`);
  console.log(`   GET  /health - Check server status`);
  console.log(`   GET  /check-login - Check login status`);
  console.log(`   POST /api/detect-clothing - Detect clothing in images`);
  console.log(`   POST /login - User login`);
  console.log(`   POST /signup - User signup`);
  console.log(`   POST /logout - User logout`);
  console.log(`\n💡 Tip: Keep this terminal open while using the website\n`);
});
