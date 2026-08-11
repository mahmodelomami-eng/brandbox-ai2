import os
import zipfile
import sys

# Define target zip filename
ZIP_FILENAME = "brand-box-ai-production-source-v1.0.0-RC1.zip"
PROJECT_DIR = "brand-box-ai"

files = {
    ".gitignore": """# Dependencies
/node_modules
/.pnpm-store
/yarn.lock
/package-lock.json

# Next.js build output & caches
/.next/
/out/
/build
/.vercel

# Environment variables & secrets
.env
.env*.local
.env.production
.env.staging
*.pem
*.key
*.cert

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# System files
.DS_Store
.idea/
.vscode/
""",

    ".env.example": """# Public Variables
NEXT_PUBLIC_APP_URL=https://www.brandbox-ai.com
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Server Secrets
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_secret_key_here
EZONEPAY_MERCHANT_ID=your_ezonepay_merchant_id
EZONEPAY_HMAC_SECRET=your_ezonepay_hmac_secret_key
EZONEPAY_PRODUCTION_ACTIVATED=false
OPENAI_API_KEY=sk-proj-your_openai_api_key_here
ANTHROPIC_API_KEY=sk-ant-your_anthropic_api_key_here
GOOGLE_VERTEX_KEY=your_google_vertex_ai_key_or_json
BFL_FLUX_API_KEY=bfl_key_your_black_forest_labs_api_key
""",

    "package.json": """{
  "name": "brand-box-ai",
  "version": "1.0.0-RC1",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "node --loader ts-node/register src/tests/production-hardening.test.ts"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.8",
    "clsx": "^2.1.0",
    "framer-motion": "^11.0.8",
    "lucide-react": "^0.354.0",
    "next": "14.1.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tailwind-merge": "^2.2.1"
  },
  "devDependencies": {
    "@types/node": "^20.11.28",
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "autoprefixer": "^10.4.18",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.4.2"
  }
}
""",

    "tsconfig.json": """{
  "compilerOptions": {
    "target": "es2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
""",

    "next.config.js": """/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' }
    ]
  }
};
module.exports = nextConfig;
""",

    "tailwind.config.js": """/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './App.jsx'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#090A0F',
          surface: '#121520',
          border: '#1F2438',
          accent: '#FF2E4C',
          hover: '#E50914'
        }
      }
    }
  },
  plugins: []
};
""",

    "src/app/layout.jsx": """import React from 'react';

export const metadata = {
  title: 'Brand Box AI — منصة الذكاء الاصطناعي الشاملة',
  description: 'منصة الذكاء الاصطناعي المتكاملة لصناع المحتوى والشركات في ليبيا والشرق الأوسط.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-[#090A0F] text-gray-100 font-sans antialiased selection:bg-[#FF2E4C] selection:text-white">
        {children}
      </body>
    </html>
  );
}
""",

    "src/app/page.jsx": """'use client';

import React from 'react';
import App from '../../App';

export default function HomePage() {
  return <App />;
}
""",

    "src/app/api/health/route.ts": """import { NextResponse } from 'next/server';
import { HealthCheckEngine } from '@/lib/observability/telemetry';

export async function GET() {
  try {
    const report = await HealthCheckEngine.runFullHealthCheck();
    const statusCode = report.status === 'healthy' ? 200 : 200;
    return NextResponse.json(report, { status: statusCode });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'unhealthy', timestamp: new Date().toISOString(), error: error?.message || 'Failed' },
      { status: 500 }
    );
  }
}
""",

    "src/app/api/v1/ezonepay/webhook/route.ts": """import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { Logger } from '@/lib/observability/telemetry';

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-correlation-id') || `req_${Date.now()}`;
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-ezonepay-signature');
    const hmacSecret = process.env.EZONEPAY_HMAC_SECRET;

    if (!signature || !hmacSecret) {
      Logger.security('Webhook received without required signature', { requestId });
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const expectedSignature = crypto.createHmac('sha256', hmacSecret).update(rawBody).digest('hex');
    if (signature !== expectedSignature) {
      Logger.security('HMAC verification failed', { requestId });
      return NextResponse.json({ error: 'INVALID_SIGNATURE' }, { status: 403 });
    }

    const payload = JSON.parse(rawBody);
    Logger.info('Ezone Pay webhook processed successfully', { requestId, metadata: payload });

    return NextResponse.json({ success: true, status: 'PROCESSED' });
  } catch (err: any) {
    Logger.error('Ezone Pay webhook handling exception', err, { requestId });
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
"""
}

def build_zip():
    print("🚀 جاري إنشاء هيكل المشروع وضغطه...")
    
    # Create temp project directory
    if not os.path.exists(PROJECT_DIR):
        os.makedirs(PROJECT_DIR)
        
    for filepath, content in files.items():
        full_path = os.path.join(PROJECT_DIR, filepath)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"  ✓ تم إنشاء: {filepath}")

    # Zip the directory
    zip_path = os.path.join(os.getcwd(), ZIP_FILENAME)
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, _, filenames in os.walk(PROJECT_DIR):
            for filename in filenames:
                file_full_path = os.path.join(root, filename)
                arcname = os.path.relpath(file_full_path, PROJECT_DIR)
                zipf.write(file_full_path, arcname)

    print("\n✅ اكتملت العملية بنجاح!")
    print(f"📦 اسم الملف المضغوط: {ZIP_FILENAME}")
    print(f"📂 المسار النهائي: {zip_path}")

if __name__ == "__main__":
    build_zip()