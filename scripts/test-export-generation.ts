#!/usr/bin/env tsx

import { resolve } from 'path';

// Load environment variables from .env.local
try {
  require('dotenv').config({ path: resolve(process.cwd(), '.env.local') });
} catch (error) {
  console.log('⚠️ Could not load .env.local file:', (error as Error).message);
}

import { 
  generatePDFReport, 
  generateCSVExport, 
  generateJSONExport,
  fetchReportData,
  generateHTMLTemplate,
  ExportOptions 
} from '../lib/export-utils';
import { prisma } from '../lib/db';

async function testExportGeneration() {
  console.log('🧪 Testing Export & Report Generation...\n');

  try {
    // Test 1: Check if we have any users
    console.log('1. Checking for test users...');
    
    const user = await prisma.user.findFirst({
      select: { id: true, email: true, name: true }
    });
    
    if (!user) {
      console.log('   ❌ No users found in database');
      console.log('   💡 You may need to create a user first');
      return;
    }
    
    console.log(`   ✅ Found user: ${user.email}`);
    
    // Test 2: Test report data fetching
    console.log('\n2. Testing report data fetching...');
    
    const options: ExportOptions = {
      format: 'pdf',
      template: 'test-report',
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        end: new Date().toISOString()
      },
      reportType: 'overview',
      userId: user.id
    };
    
    const reportData = await fetchReportData(options);
    console.log('   ✅ Report data fetched successfully');
    console.log(`   📊 Overview: ${JSON.stringify(reportData.overview, null, 2)}`);
    console.log(`   📈 Usage: ${JSON.stringify(reportData.usage, null, 2)}`);
    console.log(`   ⚡ Performance: ${JSON.stringify(reportData.performance, null, 2)}`);
    console.log(`   ⚠️ Risk: ${JSON.stringify(reportData.risk, null, 2)}`);
    
    // Test 3: Test PDF generation
    console.log('\n3. Testing PDF generation...');
    
    try {
      const pdfBuffer = await generatePDFReport(reportData, options);
      console.log(`   ✅ PDF generated successfully (${pdfBuffer.length} bytes)`);
      
      // Save test PDF
      const fs = require('fs');
      fs.writeFileSync('test-report.pdf', pdfBuffer);
      console.log('   💾 Test PDF saved as test-report.pdf');
    } catch (error) {
      console.log('   ❌ PDF generation failed:', error);
    }
    
    // Test 4: Test CSV generation
    console.log('\n4. Testing CSV generation...');
    
    try {
      const csvData = [
        { metric: 'Total Contracts', value: reportData.overview?.totalContracts || 0 },
        { metric: 'Total Analyses', value: reportData.overview?.totalAnalyses || 0 },
        { metric: 'Success Rate', value: reportData.overview?.successRate || '0%' },
        { metric: 'Total Cost', value: reportData.performance?.totalCost || 0 },
        { metric: 'High Risk Contracts', value: reportData.risk?.highRiskContracts || 0 }
      ];
      
      const csvBuffer = await generateCSVExport(csvData, options);
      console.log(`   ✅ CSV generated successfully (${csvBuffer.length} bytes)`);
      
      // Save test CSV
      const fs = require('fs');
      fs.writeFileSync('test-report.csv', csvBuffer);
      console.log('   💾 Test CSV saved as test-report.csv');
    } catch (error) {
      console.log('   ❌ CSV generation failed:', error);
    }
    
    // Test 5: Test JSON generation
    console.log('\n5. Testing JSON generation...');
    
    try {
      const jsonBuffer = await generateJSONExport(reportData, options);
      console.log(`   ✅ JSON generated successfully (${jsonBuffer.length} bytes)`);
      
      // Save test JSON
      const fs = require('fs');
      fs.writeFileSync('test-report.json', jsonBuffer);
      console.log('   💾 Test JSON saved as test-report.json');
    } catch (error) {
      console.log('   ❌ JSON generation failed:', error);
    }
    
    // Test 6: Test HTML template generation
    console.log('\n6. Testing HTML template generation...');
    
    try {
      const htmlContent = generateHTMLTemplate(reportData, options);
      console.log(`   ✅ HTML template generated successfully (${htmlContent.length} characters)`);
      
      // Save test HTML
      const fs = require('fs');
      fs.writeFileSync('test-report.html', htmlContent);
      console.log('   💾 Test HTML saved as test-report.html');
    } catch (error) {
      console.log('   ❌ HTML template generation failed:', error);
    }
    
    // Test 7: Test API endpoints
    console.log('\n7. Testing API endpoints...');
    
    // Test PDF generation endpoint
    try {
      const response = await fetch('http://localhost:3000/api/reports/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template: 'test',
          dateRange: options.dateRange,
          reportType: 'overview',
          usePuppeteer: false
        }),
      });
      
      if (response.ok) {
        const pdfBuffer = await response.arrayBuffer();
        console.log(`   ✅ PDF API endpoint working (${pdfBuffer.byteLength} bytes)`);
      } else {
        console.log(`   ❌ PDF API endpoint failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log('   ⚠️ PDF API endpoint: Server not running or not accessible');
    }
    
    console.log('\n🎉 Export generation test completed!');
    console.log('\n📁 Generated test files:');
    console.log('   - test-report.pdf (PDF report)');
    console.log('   - test-report.csv (CSV data)');
    console.log('   - test-report.json (JSON data)');
    console.log('   - test-report.html (HTML template)');
    
  } catch (error) {
    console.error('❌ Error testing export generation:', error);
  }
}

// Run the test
testExportGeneration().catch(console.error); 