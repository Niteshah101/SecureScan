/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const isProd = process.env.NODE_ENV === 'production';
  const port = 3000;

  app.use(express.json());

  // NVD API Proxy
  // We use the backend to avoid CORS issues and potentially add a rate limit/caching
  app.get('/api/cves', async (req, res) => {
    try {
      const { keyword, version, resultsPerPage = 20, startIndex = 0 } = req.query;
      
      if (!keyword) {
        return res.status(400).json({ error: 'Keyword is required' });
      }

      // Combine keyword and version for higher precision if version is provided
      const searchTerm = version ? `${keyword} ${version}` : keyword;
      console.log(`Fetching CVEs for: ${searchTerm}`);

      // NVD API v2
      // Documentation: https://nvd.nist.gov/developers/v2
      const nvdUrl = 'https://services.nvd.nist.gov/rest/json/cves/2.0';
      
      const response = await axios.get(nvdUrl, {
        params: {
          keywordSearch: searchTerm,
          resultsPerPage,
          startIndex
        },
        timeout: 10000 // 10s timeout
      });

      res.json(response.data);
    } catch (error: any) {
      console.error('NVD API Error:', error.message);
      res.status(error.response?.status || 500).json({ 
        error: 'Failed to fetch CVE data from NVD',
        details: error.message 
      });
    }
  });

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer().catch(err => {
  console.error('Error starting server:', err);
  process.exit(1);
});
