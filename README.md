========================================================================
SECURESCAN: AI-POWERED VULNERABILITY AUDIT TOOL
========================================================================

1. PROJECT OVERVIEW
SecureScan is a full-stack security auditing application designed to identify 
vulnerabilities in software packages. It leverages the NIST National 
Vulnerability Database (NVD) via the REST API 2.0 and uses Generative AI 
(Google Gemini) to provide human-readable summaries and remediation techniques.

2. CORE FEATURES
- Real-time CVE Lookup: Search for any software package by name.
- Version-Specific Auditing: Optionally specify a version for precise results.
- Bulk Scan (JSON): Upload a JSON list of software to audit entire environments.
- AI Remediation: Uses Gemini AI to analyze raw CVE data and give clear fix steps.
- Modern UI: High-performance React interface with dark/light mode support.

3. TECH STACK
- Frontend: React (Vite), Tailwind CSS, Lucide Icons, Framer Motion.
- Backend: Node.js with Express.
- API 1: NIST NVD (National Vulnerability Database).
- API 2: Google Gemini (Generative AI).

4. LOCAL INSTALLATION & SETUP
Steps to run SecureScan on your local machine:

A. PREREQUISITES
   - Node.js (v18 or higher recommended)
   - npm or yarn

B. INSTALLATION
   1. Clone or download the repository.
   2. Open a terminal in the project root.
   3. Run 'npm install' to install dependencies.

C. API KEYS CONFIGURATION
   1. Create a file named '.env' in the root directory.
   2. Copy the content from '.env.example' into '.env'.
   3. Provide your keys:
      - GEMINI_API_KEY: Get this from Google AI Studio.
      - NVD_API_KEY: (Recommended) Get this from nvd.nist.gov to avoid 
        aggressive rate limiting.

D. RUNNING THE APP
   - Start development mode: 'npm run dev'
   - The app will be available at: http://localhost:3000

5. JSON UPLOAD FORMAT
For the bulk upload feature, use the following format:
[
  { "name": "package_name", "version": "1.2.3" },
  { "name": "another_package" }
]

6. SECURITY NOTE
This tool is for informational purposes. While it uses official data from NIST, 
always verify findings with official vendor security advisories before 
applying patches to production systems.

========================================================================
SecureScan Labs - Proactive Security Auditing
========================================================================
