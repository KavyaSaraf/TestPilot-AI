const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const { Builder } = require('selenium-webdriver');

const app = express();
const PORT = 5000;

// Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors());
app.use(express.json());

const scriptsDir = path.join(__dirname, 'generated-scripts');
if (!fs.existsSync(scriptsDir)) {
  fs.mkdirSync(scriptsDir);
}

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  console.log('✅ Frontend connected via WebSocket!');
  socket.emit('test-log', { type: 'info', message: '🔌 Connected to TestPilot AI backend' });
});

// ==============================
//        ROUTES
// ==============================

app.get('/', (req, res) => {
  res.send('🚀 TestPilot AI Backend (Selenium Version) is running!');
});

// =========================================
// Generate Selenium Test using Gemini AI
// =========================================
app.post('/generate-test', async (req, res) => {
  const { testDescription } = req.body;

  if (!testDescription) {
    return res.status(400).json({ message: '❗️ Test description is required' });
  }

  console.log(`📋 Test Description Received: ${testDescription}`);
  io.emit('test-log', { type: 'info', message: `📋 Generating test for: ${testDescription}` });

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
    Generate a complete Selenium WebDriver test script for Node.js that does the following:
    
    Scenario:
    ${testDescription}

    Requirements:
    - The script should be an exported async function: (driver, io) => {...}
    - Use io.emit('test-log', { type: 'info|success|error', message: 'Your message' }) for logs
    - Take a screenshot at key points and save them in './screenshots'
    - Handle errors properly using try/catch
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let generatedCode = response.text().trim().replace(/```(javascript|js)?/g, '').trim();

    if (!generatedCode.includes('module.exports')) {
      generatedCode = `module.exports = async (driver, io) => { ${generatedCode} };`;
    }

    const fileName = `test-${Date.now()}.js`;
    const filePath = path.join(scriptsDir, fileName);
    fs.writeFileSync(filePath, generatedCode);

    console.log(`✅ Test Script Generated: ${fileName}`);
    io.emit('test-log', { type: 'success', message: `✅ Test script generated: ${fileName}` });

    res.json({ message: '✅ Test script generated successfully', fileName });
  } catch (error) {
    console.error('❌ Error generating test script:', error);
    io.emit('test-log', { type: 'error', message: `❌ Error generating test script: ${error.message}` });
    res.status(500).json({ message: '❌ Error generating test script', error: error.message });
  }
});

// =========================================
// Run Generated Selenium Test Script
// =========================================
app.post('/run-test', async (req, res) => {
  const { fileName } = req.body;
  if (!fileName) return res.status(400).json({ message: '❗️ File name is required' });

  const scriptPath = path.join(scriptsDir, fileName);
  if (!fs.existsSync(scriptPath)) return res.status(404).json({ message: '❗️ Script file not found' });

  console.log(`🚀 Running Test Script: ${fileName}`);
  io.emit('test-log', { type: 'info', message: `🚀 Executing test: ${fileName}` });

  let driver;
  try {
    delete require.cache[require.resolve(scriptPath)];
    const testScript = require(scriptPath);
    if (typeof testScript !== 'function') throw new Error('Invalid test script format');

    driver = await new Builder().forBrowser('chrome').build();
    io.emit('test-log', { type: 'info', message: '🚀 Browser launched' });

    const startTime = Date.now();
    await testScript(driver, io);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    io.emit('test-log', { type: 'info', message: `⏱️ Test completed in ${duration} seconds` });
  } catch (error) {
    console.error('❌ Error running test script:', error);
    io.emit('test-log', { type: 'error', message: `❌ ${error.message}` });
  } finally {
    if (driver) await driver.quit();
    io.emit('test-log', { type: 'info', message: '🛑 Browser closed' });
    io.emit('test-finish', { message: '🏁 Test execution finished!' });
  }
  res.json({ message: `✅ Test script ${fileName} executed successfully` });
});

// =========================================
// Start Server
// =========================================
server.listen(PORT, () => {
  console.log(`✅ Backend Server running at http://localhost:${PORT}`);
});