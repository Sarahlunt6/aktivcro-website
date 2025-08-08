#!/usr/bin/env node

// Simple Node.js script to test GoHighLevel webhook directly
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  const env = {};
  
  try {
    const envFile = fs.readFileSync(envPath, 'utf8');
    const lines = envFile.split('\n');
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=');
        env[key] = value;
      }
    });
  } catch (error) {
    console.error('Error reading .env file:', error.message);
  }
  
  return env;
}

// Sample payload that matches the demo generator
const samplePayload = {
  contact: {
    email: "sarah@opkie.com",
    firstName: "Sarah",
    lastName: "Lunt",
    phone: "+1234567890", 
    companyName: "Test Company",
    website: "https://testcompany.com"
  },
  demoRequest: {
    businessName: "Test Company",
    industry: "professional-services",
    industryName: "Professional Services",
    framework: "authority",
    frameworkName: "Authority Architecture",
    services: ["law-firm", "consulting"],
    valueProposition: "We help businesses grow through legal expertise",
    microExperiences: ["case-evaluator", "consultation-scheduler"],
    branding: {
      primaryColor: "#20466f",
      secondaryColor: "#ffd147"
    },
    currentWebsite: "https://testcompany.com",
    targetAudience: "Small business owners"
  },
  projections: {
    conversionIncrease: "+340%",
    leadQuality: "+280%",
    timeToClose: "-45%",
    roi: "850%",
    timeframe: "6-8 weeks"
  },
  leadScore: 85,
  triggers: {
    sendDemoEmail: true,
    scheduleFollowUp: true,
    addToNurtureCampaign: true,
    notifyTeam: true
  },
  source: "demo-generator-test",
  timestamp: new Date().toISOString(),
  userAgent: "AktivCRO-Test/1.0"
};

async function testWebhook() {
  const env = loadEnv();
  const webhookUrl = env.GHL_WEBHOOK_URL || env.GOHIGHLEVEL_WEBHOOK_URL;
  
  console.log('🚀 Testing GoHighLevel Webhook Integration');
  console.log('=====================================');
  
  if (!webhookUrl) {
    console.error('❌ Error: No webhook URL found in .env file');
    console.log('Please set GHL_WEBHOOK_URL in your .env file');
    return;
  }
  
  console.log('📍 Webhook URL:', webhookUrl);
  console.log('📦 Payload Preview:');
  console.log(JSON.stringify(samplePayload, null, 2));
  console.log('\n🔄 Sending request...');
  
  try {
    const url = new URL(webhookUrl);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const postData = JSON.stringify(samplePayload);
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'AktivCRO-Test-Webhook/1.0'
      }
    };
    
    const req = client.request(options, (res) => {
      console.log(`✅ Response Status: ${res.statusCode}`);
      console.log('📋 Response Headers:', res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('📄 Response Body:', data || '(empty)');
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('\n🎉 SUCCESS! Webhook sent successfully to GoHighLevel');
          console.log('👀 Check your GoHighLevel account for the incoming webhook data');
        } else {
          console.log('\n⚠️  Warning: Non-2xx status code received');
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Request Error:', error.message);
    });
    
    req.write(postData);
    req.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the test
testWebhook();