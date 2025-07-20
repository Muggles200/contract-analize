#!/usr/bin/env tsx

import { aiAnalysisService, AnalysisRequest } from '../lib/ai-analysis';

/**
 * Test script for long contract handling functionality
 */
async function testLongContractHandling() {
  console.log('🚀 Starting Long Contract Handling Test Suite\n');

  // Generate a very long contract for testing
  const longContract = generateLongContract();
  console.log(`📄 Generated test contract: ${longContract.length} characters`);

  // Test 1: Long contract with chunking enabled
  console.log('\n🧪 Test 1: Long Contract with Chunking Enabled');
  await testLongContractWithChunking(longContract);

  // Test 2: Long contract with different chunk sizes
  console.log('\n🧪 Test 2: Long Contract with Custom Chunk Size');
  await testLongContractWithCustomChunkSize(longContract);

  // Test 3: Performance comparison
  console.log('\n🧪 Test 3: Performance Comparison');
  await testPerformanceComparison(longContract);

  console.log('\n✅ Long Contract Handling Test Suite completed!');
}

/**
 * Test long contract analysis with chunking enabled
 */
async function testLongContractWithChunking(contractText: string) {
  const request: AnalysisRequest = {
    contractId: 'long-contract-test-1',
    contractText,
    contractMetadata: {
      fileName: 'long-test-contract.txt',
      fileSize: contractText.length,
      pageCount: Math.ceil(contractText.length / 2000), // Rough estimate
      contractType: 'Service Agreement',
      jurisdiction: 'United States',
      contractValue: 500000,
      parties: ['TechCorp Inc.', 'DataServices LLC']
    },
    analysisType: 'comprehensive',
    userId: 'test-user-1',
    organizationId: 'test-org-1',
    longContractOptions: {
      enableChunking: true,
      chunkSize: 8000,
      enableSummarization: true,
      enableHierarchicalAnalysis: true,
      maxChunks: 15,
      chunkOverlap: 500
    }
  };

  try {
    console.log('⏳ Starting analysis...');
    const startTime = Date.now();
    
    const result = await aiAnalysisService.analyzeContract(request);
    
    const processingTime = Date.now() - startTime;
    
    if (result.success) {
      console.log('✅ Long contract analysis completed successfully');
      console.log(`⏱️  Processing time: ${processingTime}ms`);
      console.log(`💰 Cost: $${result.cost?.toFixed(4)}`);
      console.log(`🎯 Tokens used: ${result.tokensUsed}`);
      
      if (result.isLongContract) {
        console.log('📄 Long contract detected and processed');
        console.log(`📊 Total chunks: ${result.chunkingInfo?.totalChunks}`);
        console.log(`📈 Coverage: ${result.chunkingInfo?.coveragePercentage.toFixed(1)}%`);
        console.log(`🔧 Strategy: ${result.chunkingInfo?.chunkingStrategy}`);
        
        if (result.hierarchicalAnalysis) {
          const ha = result.hierarchicalAnalysis;
          console.log(`📋 Executive summary: ${ha.executiveSummary.substring(0, 200)}...`);
          console.log(`🏗️  Document sections: ${ha.documentStructure.sections.length}`);
          console.log(`📊 Quality metrics:`);
          console.log(`   - Coverage: ${(ha.metadata.qualityMetrics.coverageScore * 100).toFixed(1)}%`);
          console.log(`   - Consistency: ${(ha.metadata.qualityMetrics.consistencyScore * 100).toFixed(1)}%`);
          console.log(`   - Completeness: ${(ha.metadata.qualityMetrics.completenessScore * 100).toFixed(1)}%`);
          
          console.log(`📋 Consolidated analysis:`);
          console.log(`   - Clauses: ${ha.consolidatedAnalysis.clauses.length}`);
          console.log(`   - Risks: ${ha.consolidatedAnalysis.risks.length}`);
          console.log(`   - Recommendations: ${ha.consolidatedAnalysis.recommendations.length}`);
        }
      }
    } else {
      console.log('❌ Analysis failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

/**
 * Test long contract with custom chunk size
 */
async function testLongContractWithCustomChunkSize(contractText: string) {
  const request: AnalysisRequest = {
    contractId: 'long-contract-test-2',
    contractText,
    contractMetadata: {
      fileName: 'long-test-contract-custom.txt',
      fileSize: contractText.length,
      pageCount: Math.ceil(contractText.length / 2000),
      contractType: 'Service Agreement',
      jurisdiction: 'United States',
      contractValue: 500000,
      parties: ['TechCorp Inc.', 'DataServices LLC']
    },
    analysisType: 'comprehensive',
    userId: 'test-user-2',
    organizationId: 'test-org-1',
    longContractOptions: {
      enableChunking: true,
      chunkSize: 12000, // Larger chunks
      enableSummarization: true,
      enableHierarchicalAnalysis: true,
      maxChunks: 10, // Fewer chunks
      chunkOverlap: 1000 // More overlap
    }
  };

  try {
    console.log('⏳ Starting analysis with custom chunk size...');
    const startTime = Date.now();
    
    const result = await aiAnalysisService.analyzeContract(request);
    
    const processingTime = Date.now() - startTime;
    
    if (result.success) {
      console.log('✅ Custom chunk size analysis completed');
      console.log(`⏱️  Processing time: ${processingTime}ms`);
      console.log(`💰 Cost: $${result.cost?.toFixed(4)}`);
      console.log(`📊 Total chunks: ${result.chunkingInfo?.totalChunks}`);
      console.log(`📈 Coverage: ${result.chunkingInfo?.coveragePercentage.toFixed(1)}%`);
    } else {
      console.log('❌ Analysis failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

/**
 * Test performance comparison between chunked and non-chunked analysis
 */
async function testPerformanceComparison(contractText: string) {
  console.log('📊 Comparing performance between chunked and standard analysis...');
  
  // Test with chunking
  const chunkedRequest: AnalysisRequest = {
    contractId: 'performance-test-chunked',
    contractText,
    contractMetadata: {
      fileName: 'performance-test.txt',
      fileSize: contractText.length,
      pageCount: Math.ceil(contractText.length / 2000),
      contractType: 'Service Agreement',
      jurisdiction: 'United States',
      contractValue: 500000,
      parties: ['TechCorp Inc.', 'DataServices LLC']
    },
    analysisType: 'comprehensive',
    userId: 'test-user-3',
    organizationId: 'test-org-1',
    longContractOptions: {
      enableChunking: true,
      chunkSize: 8000,
      enableSummarization: true,
      enableHierarchicalAnalysis: true,
      maxChunks: 15,
      chunkOverlap: 500
    }
  };

  // Test without chunking (will likely fail due to token limits, but good for comparison)
  const standardRequest: AnalysisRequest = {
    contractId: 'performance-test-standard',
    contractText,
    contractMetadata: {
      fileName: 'performance-test.txt',
      fileSize: contractText.length,
      pageCount: Math.ceil(contractText.length / 2000),
      contractType: 'Service Agreement',
      jurisdiction: 'United States',
      contractValue: 500000,
      parties: ['TechCorp Inc.', 'DataServices LLC']
    },
    analysisType: 'comprehensive',
    userId: 'test-user-3',
    organizationId: 'test-org-1'
  };

  try {
    // Test chunked analysis
    console.log('⏳ Testing chunked analysis...');
    const chunkedStart = Date.now();
    const chunkedResult = await aiAnalysisService.analyzeContract(chunkedRequest);
    const chunkedTime = Date.now() - chunkedStart;

    console.log(`✅ Chunked analysis: ${chunkedTime}ms, Cost: $${chunkedResult.cost?.toFixed(4)}, Success: ${chunkedResult.success}`);

    // Test standard analysis (may fail due to token limits)
    console.log('⏳ Testing standard analysis...');
    const standardStart = Date.now();
    const standardResult = await aiAnalysisService.analyzeContract(standardRequest);
    const standardTime = Date.now() - standardStart;

    console.log(`📊 Standard analysis: ${standardTime}ms, Cost: $${standardResult.cost?.toFixed(4)}, Success: ${standardResult.success}`);

    // Performance comparison
    console.log('\n📈 Performance Comparison:');
    console.log(`⏱️  Chunked: ${chunkedTime}ms | Standard: ${standardTime}ms`);
    console.log(`💰 Chunked: $${chunkedResult.cost?.toFixed(4)} | Standard: $${standardResult.cost?.toFixed(4)}`);
    console.log(`✅ Chunked: ${chunkedResult.success} | Standard: ${standardResult.success}`);
    
    if (chunkedResult.success && !standardResult.success) {
      console.log('🎉 Chunked analysis succeeded while standard analysis failed!');
    }

  } catch (error) {
    console.error('❌ Performance test failed:', error);
  }
}

/**
 * Generate a very long contract for testing
 */
function generateLongContract(): string {
  const sections = [
    'SERVICE AGREEMENT',
    'This Service Agreement (the "Agreement") is entered into as of [DATE] by and between TechCorp Inc., a Delaware corporation ("Provider"), and DataServices LLC, a California limited liability company ("Client").',
    
    '1. SERVICES',
    'Provider shall provide the following services to Client: (a) Data processing and analysis services; (b) Cloud infrastructure management; (c) Technical support and maintenance; (d) Custom software development; (e) Training and documentation services.',
    
    '2. TERM AND TERMINATION',
    'This Agreement shall commence on the Effective Date and continue for a period of three (3) years unless earlier terminated as provided herein. Either party may terminate this Agreement upon thirty (30) days written notice to the other party. Provider may terminate immediately if Client fails to pay any amounts due within fifteen (15) days of the due date.',
    
    '3. PAYMENT TERMS',
    'Client shall pay Provider a monthly fee of $50,000 for the services provided hereunder. Payment shall be due within thirty (30) days of receipt of invoice. Late payments shall bear interest at the rate of 1.5% per month. All amounts are exclusive of taxes, which Client shall pay in addition.',
    
    '4. CONFIDENTIALITY',
    'Each party acknowledges that it may have access to confidential information of the other party. Each party agrees to maintain the confidentiality of such information and not to disclose it to any third party without the prior written consent of the disclosing party. This obligation shall survive termination of this Agreement for a period of five (5) years.',
    
    '5. INTELLECTUAL PROPERTY',
    'All intellectual property rights in the services and deliverables provided by Provider shall remain with Provider. Client shall have a limited, non-exclusive license to use such intellectual property solely for its internal business purposes. Client retains all rights to its own intellectual property.',
    
    '6. WARRANTIES AND DISCLAIMERS',
    'Provider warrants that the services will be performed in a professional manner consistent with industry standards. EXCEPT AS EXPRESSLY PROVIDED HEREIN, PROVIDER MAKES NO WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.',
    
    '7. LIMITATION OF LIABILITY',
    'IN NO EVENT SHALL EITHER PARTY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR USE, INCURRED BY THE OTHER PARTY OR ANY THIRD PARTY, WHETHER IN AN ACTION IN CONTRACT OR TORT, EVEN IF THE OTHER PARTY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.',
    
    '8. INDEMNIFICATION',
    'Provider shall indemnify and hold harmless Client from and against any claims, damages, losses, and expenses arising out of or relating to Provider\'s breach of this Agreement or negligence. Client shall indemnify and hold harmless Provider from and against any claims, damages, losses, and expenses arising out of or relating to Client\'s breach of this Agreement or negligence.',
    
    '9. FORCE MAJEURE',
    'Neither party shall be liable for any delay or failure to perform its obligations under this Agreement due to circumstances beyond its reasonable control, including but not limited to acts of God, natural disasters, war, terrorism, riots, labor disputes, or government actions.',
    
    '10. DISPUTE RESOLUTION',
    'Any disputes arising out of or relating to this Agreement shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. The arbitration shall be conducted in San Francisco, California, and the decision of the arbitrator shall be final and binding.',
    
    '11. GOVERNING LAW',
    'This Agreement shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of laws principles.',
    
    '12. ENTIRE AGREEMENT',
    'This Agreement constitutes the entire agreement between the parties with respect to the subject matter hereof and supersedes all prior or contemporaneous agreements, representations, or understandings, whether oral or written.',
    
    '13. AMENDMENTS',
    'This Agreement may only be amended by a written instrument signed by both parties.',
    
    '14. ASSIGNMENT',
    'Neither party may assign this Agreement or any of its rights or obligations hereunder without the prior written consent of the other party, except that either party may assign this Agreement to a successor in interest in connection with a merger, acquisition, or sale of substantially all of its assets.',
    
    '15. NOTICES',
    'All notices required or permitted under this Agreement shall be in writing and shall be delivered personally, by certified mail, return receipt requested, or by overnight courier to the addresses set forth above or to such other addresses as the parties may designate in writing.',
    
    '16. SEVERABILITY',
    'If any provision of this Agreement is held to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.',
    
    '17. WAIVER',
    'The waiver by either party of a breach of any provision of this Agreement shall not operate as or be construed as a waiver of any subsequent breach.',
    
    '18. SURVIVAL',
    'The provisions of this Agreement that by their nature should survive termination shall survive termination of this Agreement.',
    
    '19. COUNTERPARTS',
    'This Agreement may be executed in counterparts, each of which shall be deemed an original, and all of which together shall constitute one and the same instrument.',
    
    '20. HEADINGS',
    'The headings in this Agreement are for convenience only and shall not affect the interpretation of this Agreement.'
  ];

  // Repeat sections to make it very long
  let longContract = sections.join('\n\n');
  for (let i = 0; i < 5; i++) {
    longContract += '\n\n' + sections.join('\n\n');
  }

  return longContract;
}

// Run the test
if (require.main === module) {
  testLongContractHandling().catch(console.error);
} 