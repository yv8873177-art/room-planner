require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GEMINI_API_KEY;

app.use(express.json({ limit: '20mb' }));
app.use(express.static(__dirname)); 

app.post('/api/analyze-room', async (req, res) => {
  try {
    const { imageBase64, prompt, mimeType } = req.body;

    if (!API_KEY) {
      return res.status(500).json({ error: { message: 'กรุณาตั้งค่า GEMINI_API_KEY ในไฟล์ .env บน Render' } });
    }

    // เรียกใช้ gemini-2.5-flash รุ่นเสถียรล่าสุด
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { 
              inline_data: { 
                mime_type: mimeType || 'image/jpeg', 
                data: imageBase64 
              } 
            }
          ]
        }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error:', data);
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (err) {
    console.error('Server Error:', err);
    res.status(500).json({ error: { message: 'เกิดข้อผิดพลาดในการเรียก AI: ' + err.message } });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
