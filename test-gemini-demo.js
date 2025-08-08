#!/usr/bin/env node

// Simple Node.js script to test Gemini AI demo generation
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

// Sample demo request
const sampleDemoRequest = {
  businessName: "Elite Legal Services",
  industry: "professional-services",
  industryName: "Professional Services",
  framework: "authority",
  frameworkName: "Authority Architecture",
  services: ["law-firm", "consulting", "legal-advice"],
  valueProposition: "We help businesses grow through expert legal guidance and risk management",
  targetAudience: "Small to medium business owners",
  currentWebsite: "https://elitelegal.com",
  microExperiences: ["case-evaluator", "consultation-scheduler"],
  primaryColor: "#20466f",
  secondaryColor: "#ffd147",
  email: "test@elitelegal.com"
};

async function testGeminiDemo() {
  const env = loadEnv();
  
  console.log('🚀 Testing Gemini AI Demo Generation');
  console.log('====================================');
  
  if (!env.GEMINI_API_KEY) {
    console.error('❌ Error: No Gemini API key found in .env file');
    console.log('Please set GEMINI_API_KEY in your .env file');
    console.log('Get your API key from: https://aistudio.google.com/app/apikey');
    return;
  }
  
  console.log('🔑 Gemini API Key configured');
  console.log('📦 Demo Request:');
  console.log(JSON.stringify(sampleDemoRequest, null, 2));
  console.log('\n🔄 Sending request to local API...');
  
  try {
    const postData = JSON.stringify(sampleDemoRequest);
    
    const options = {
      hostname: 'localhost',
      port: 4321,
      path: '/api/generate-ai-demo',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'AktivCRO-Gemini-Test/1.0'
      }
    };
    
    const req = http.request(options, (res) => {
      console.log(`📋 Response Status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          
          if (result.success) {
            console.log('\n🎉 SUCCESS! AI Demo Generated');
            console.log(`📍 Demo ID: ${result.demoId}`);
            console.log('\n📝 Generated Content Preview:');
            if (result.generatedContent) {
              console.log(`• Hero Headline: "${result.generatedContent.heroHeadline}"`);
              console.log(`• Hero Subheadline: "${result.generatedContent.heroSubheadline}"`);
              console.log(`• CTA Text: "${result.generatedContent.ctaText}"`);
              console.log(`• Services: ${result.generatedContent.servicesContent.map(s => s.title).join(', ')}`);
            }
            
            // Save HTML to file for inspection
            if (result.html) {
              const demoFilename = `demo-${result.demoId}.html`;
              fs.writeFileSync(demoFilename, result.html);
              console.log(`\n💾 Demo HTML saved to: ${demoFilename}`);
              console.log(`🌐 Open file in browser to view the generated demo`);
            }
            
          } else {
            console.log(`\n❌ Error: ${result.error}`);
            if (result.details) {
              console.log(`📋 Details: ${result.details}`);
            }
          }
        } catch (error) {
          console.error('❌ Failed to parse response:', error.message);
          console.log('📄 Raw response:', data);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Request Error:', error.message);
      console.log('\n💡 Make sure your development server is running:');
      console.log('   npm run dev');
    });
    
    req.write(postData);
    req.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the test
testGeminiDemo();