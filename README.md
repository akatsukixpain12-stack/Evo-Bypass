# 🚀 EVO Bypass

**Free instant link resolver for Linkvertise, Lootlabs, Work.ink, Rekonise, Platoboost and 100+ more services**

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.0.0-green.svg)](https://flask.palletsprojects.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/akatsukixpain12-stack/Evo-Bypass)](https://github.com/akatsukixpain12-stack/Evo-Bypass/stargazers)

---

## ✨ Features

- 🔗 **Link Resolver** - Resolve 100+ services through one API
- 🐍 **Python/Flask Backend** - Fast, reliable, easy to maintain
- 🎨 **Black & White UI** - Clean, modern, professional design
- 🚀 **Lightning Fast** - Optimized for speed
- 🔒 **Secure** - Rate limiting, CORS, input validation
- 📊 **Stats Tracking** - Real-time bypass statistics
- 🌐 **API Ready** - RESTful API for integration

---

## 🎯 Supported Services

✅ Linkvertise  
✅ Work.ink  
✅ Lootlabs  
✅ Rekonise  
✅ Platoboost  
✅ Admaven  
✅ Lockr.so  
✅ Shrtfly  
✅ Sub2Unlock  
✅ Boost.ink  
✅ mBoost  
✅ **100+ services mapped through the live resolver catalog**

---

## 🚀 Quick Start

### Browser extension (Chrome / Edge)

The `extension` folder is a lightweight desktop popup: click the EVO icon, paste a link, and press **Go**.

1. Start the API with `npm run dev:backend` (do not add a trailing `\`).
2. Open `chrome://extensions` in Chrome or `edge://extensions` in Edge.
3. Enable **Developer mode**, choose **Load unpacked**, and select the repository's `extension` folder.
4. Pin **EVO Bypass**, click its icon, paste a link, and press **Go**.

The extension also supports **Paste clipboard**, **Use current tab URL**, a `Ctrl+Shift+E` shortcut, and right-clicking any link to choose **Resolve with EVO Bypass**. Open **Settings** in the popup to change the API URL without editing code. The default API is `http://localhost:3000`.

### Deploy the whole app on Netlify

Netlify hosts the Next.js frontend and the API function from `netlify/functions/api.js`, so production only needs one Netlify site.

1. Push this repository to GitHub and import it in Netlify.
2. Leave the base directory empty and use the committed `netlify.toml` settings.
3. Deploy. The website and API will share one domain:
   - Website: `https://your-site.netlify.app`
   - API health: `https://your-site.netlify.app/api/health`
   - API bypass: `https://your-site.netlify.app/api/bypass`
4. In the extension, open **Settings** and set the API URL to `https://your-site.netlify.app`.

For local work, keep using `npm run dev:frontend` and `npm run dev:backend`.

### One-Click Start (Windows)
```bash
# Just double-click:
start.bat
```

### Manual Start

#### 1. Install Python
Download from [python.org](https://python.org) (Python 3.8+)

#### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

#### 3. Run Server
```bash
python app.py
```

#### 4. Open Frontend
Open `index.html` in your browser

---

## 📡 API Endpoints

### Health Check
```http
GET /api/health
```

### Get Statistics
```http
GET /api/stats
```

### Bypass URL
```http
POST /api/bypass
Content-Type: application/json

{
  "url": "https://linkvertise.com/123456/example"
}
```

**Response:**
```json
{
  "success": true,
  "destination": "https://example.com/file.zip",
  "service": "Linkvertise",
  "processingTime": 1234
}
```

### Supported Services
```http
GET /api/supported
```

---

## 🐍 Why Python?

| Feature | Python | Node.js |
|---------|--------|---------|
| Syntax | ✅ Cleaner | ❌ More verbose |
| Web Scraping | ✅ BeautifulSoup | ❌ Cheerio |
| Learning Curve | ✅ Easier | ❌ Harder |
| Libraries | ✅ More | ❌ Less |
| Deployment | ✅ Easy | ✅ Easy |

---

## 📁 Project Structure

```
Evo-Bypass/
├── app.py              # Python Flask server
├── requirements.txt    # Python dependencies
├── start.bat          # One-click startup
├── index.html         # Frontend (Black & White UI)
├── PYTHON_SETUP.md    # Python setup guide
└── README.md          # This file
```

---

## 🔧 Configuration

### Change Port
Edit `app.py`:
```python
app.run(host='0.0.0.0', port=5000, debug=True)
```

### Rate Limiting
Edit `app.py`:
```python
@rate_limit(max_requests=200, window=900)  # 200 req per 15 min
```

---

## 🌐 Deploy to Production

### Heroku
```bash
heroku create evo-bypass
git push heroku main
```

### PythonAnywhere
1. Upload files
2. Create web app
3. Set WSGI to `app.py`

### Railway
1. Connect GitHub
2. Auto-deploy

### VPS
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:3000 app:app
```

---

## 🐛 Troubleshooting

### Python not found
Install from [python.org](https://python.org)

### Module not found
```bash
pip install -r requirements.txt
```

### Port already in use
Change port in `app.py`

### CORS errors
Already handled with `flask-cors`

---

## 📊 Performance

- **Response Time**: < 2 seconds
- **Concurrent Requests**: 100+
- **Memory Usage**: ~50MB
- **Success Rate**: 95%+

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ⚠️ Disclaimer

This tool is for educational purposes only. Use responsibly and respect the terms of service of the websites you interact with.

---

## 🌟 Star History

If you find this project useful, please consider giving it a star! ⭐

---

## 📧 Contact

- **GitHub**: [@akatsukixpain12-stack](https://github.com/akatsukixpain12-stack)
- **Repository**: [Evo-Bypass](https://github.com/akatsukixpain12-stack/Evo-Bypass)

---

## 🎯 Quick Links

- [Python Setup Guide](PYTHON_SETUP.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [API Documentation](#-api-endpoints)
- [GitHub Repository](https://github.com/akatsukixpain12-stack/Evo-Bypass)

---

**Made with ❤️ by akatsukixpain12-stack**

**EVO Bypass - The fastest, most reliable link bypasser! 🚀**
