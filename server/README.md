# Zen Bypass Server

Backend API server for EVO Bypass with support for 100+ link shortener, key system, social, paste, and file-host services.

## Features

- ✅ **100+ Supported Services** - Linkvertise, Lootlabs, Work.ink, Rekonise, Platoboost, and more
- ✅ **Multiple Bypass Methods** - Service-specific + universal fallback
- ✅ **Rate Limiting** - 100 requests per 15 minutes per IP
- ✅ **Bulk Processing** - Process up to 50 URLs at once (API key required)
- ✅ **Stats Tracking** - Real-time bypass statistics
- ✅ **CORS Enabled** - Ready for frontend integration
- ✅ **Security** - Helmet.js protection + API key authentication

## Installation

```bash
cd server
npm install
```

## Configuration

Create a `.env` file:

```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3001
API_KEY=your-secret-api-key-here
```

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## API Endpoints

### 1. Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "operational",
  "uptime": 12345,
  "timestamp": "2025-01-17T10:30:00.000Z"
}
```

### 2. Bypass Single URL
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

### 3. Bulk Bypass (API Key Required)
```http
POST /api/bypass/bulk
Content-Type: application/json

{
  "apiKey": "your-api-key",
  "urls": [
    "https://linkvertise.com/123456/example1",
    "https://work.ink/abcdef"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "results": [...],
  "total": 2,
  "successful": 2,
  "failed": 0
}
```

### 4. Get Stats
```http
GET /api/stats
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "total": 23387799,
    "success": 150,
    "failure": 5,
    "services": {
      "Linkvertise": 50,
      "Lootlabs": 30,
      "Work.ink": 20
    }
  }
}
```

### 5. Supported Services
```http
GET /api/supported
```

**Response:**
```json
{
  "success": true,
  "services": [
    { "name": "Linkvertise", "status": "active" },
    { "name": "Lootlabs", "status": "active" }
  ],
  "total": 30
}
```

## Supported Services

- Linkvertise
- Work.ink
- Lootlabs
- Rekonise
- Platoboost
- Admaven
- Lockr.so
- Shrtfly
- Sub2Unlock
- Boost.ink
- mBoost
- And 20+ more via Universal bypass

## Frontend Integration

```javascript
// Example: Bypass a URL
async function bypassUrl(url) {
  const response = await fetch('http://localhost:3000/api/bypass', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url })
  });
  
  const result = await response.json();
  
  if (result.success) {
    console.log('Bypassed URL:', result.destination);
  } else {
    console.error('Bypass failed:', result.error);
  }
}
```

## Rate Limiting

- **Anonymous users**: 100 requests per 15 minutes per IP
- **API key users**: Unlimited (for bulk endpoint)

## Security

- Helmet.js for HTTP security headers
- CORS protection
- API key authentication for bulk operations
- Rate limiting to prevent abuse
- Input validation

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

## License

MIT

## Support

For issues or questions, contact: support@izen.lol
