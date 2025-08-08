import { readdir, stat, readFile } from 'fs/promises';
import { join } from 'path';

const DIST_DIR = './dist';

async function analyzeBundle() {
  console.log('📊 Bundle Analysis Report\n');
  
  try {
    // Analyze client assets
    const clientDir = join(DIST_DIR, '_astro');
    const files = await readdir(clientDir);
    
    const jsFiles = files.filter(f => f.endsWith('.js'));
    const cssFiles = files.filter(f => f.endsWith('.css'));
    
    console.log('🟡 JavaScript Assets:');
    let totalJSSize = 0;
    let totalJSGzipSize = 0;
    
    for (const file of jsFiles) {
      const filePath = join(clientDir, file);
      const stats = await stat(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      totalJSSize += stats.size;
      
      // Estimate gzip size (roughly 30-40% of original)
      const gzipEstimate = (stats.size * 0.35 / 1024).toFixed(2);
      totalJSGzipSize += stats.size * 0.35;
      
      console.log(`  ${file}: ${sizeKB} KB (gzip: ~${gzipEstimate} KB)`);
    }
    
    console.log(`\n📊 Total JS: ${(totalJSSize / 1024).toFixed(2)} KB (gzip: ~${(totalJSGzipSize / 1024).toFixed(2)} KB)\n`);
    
    console.log('🎨 CSS Assets:');
    let totalCSSSize = 0;
    
    for (const file of cssFiles) {
      const filePath = join(clientDir, file);
      const stats = await stat(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      totalCSSSize += stats.size;
      
      console.log(`  ${file}: ${sizeKB} KB`);
    }
    
    console.log(`\n📊 Total CSS: ${(totalCSSSize / 1024).toFixed(2)} KB\n`);
    
    // Performance recommendations
    console.log('💡 Performance Recommendations:');
    
    if (totalJSSize > 300 * 1024) {
      console.log('  ⚠️  Large JS bundle detected. Consider code splitting.');
    } else {
      console.log('  ✅ JS bundle size is reasonable.');
    }
    
    if (totalCSSSize > 50 * 1024) {
      console.log('  ⚠️  Large CSS bundle. Consider purging unused styles.');
    } else {
      console.log('  ✅ CSS bundle size is reasonable.');
    }
    
    // Check for largest files
    const largestJS = jsFiles
      .map(file => ({ 
        name: file, 
        size: require('fs').statSync(join(clientDir, file)).size 
      }))
      .sort((a, b) => b.size - a.size)[0];
    
    if (largestJS && largestJS.size > 100 * 1024) {
      console.log(`  🔍 Largest JS file: ${largestJS.name} (${(largestJS.size / 1024).toFixed(2)} KB)`);
      console.log('     Consider splitting this into smaller chunks.');
    }
    
    console.log('\n🎯 Target Metrics:');
    console.log('  • Total bundle < 300KB (gzipped)');
    console.log('  • Largest chunk < 100KB');
    console.log('  • Critical CSS < 30KB');
    console.log('  • Load time < 3s on 3G');
    
  } catch (error) {
    console.error('Error analyzing bundle:', error);
  }
}

analyzeBundle();