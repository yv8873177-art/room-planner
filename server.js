require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname)); // เสิร์ฟ index.html และไฟล์อื่นๆ

const API_KEY = process.env.GEMINI_API_KEY;
// endpoint ที่ frontend จะเรียกแทน Gemini ตรงๆ
app.post('/api/analyze-room', async (req, res) => {
  try {
    const { imageBase64, prompt, mimeType } = req.body;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType, data: imageBase64 } }
            ]
          }]
        })
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเรียก AI' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));