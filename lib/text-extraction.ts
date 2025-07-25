import pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';
import * as Tesseract from 'tesseract.js';
// Remove static import of pdf2pic to avoid execution at build time. We'll load it dynamically when needed.
import sharp from 'sharp';
import { createWorker } from 'tesseract.js';
import { promises as fs } from 'fs';
import path from 'path';

export interface TextExtractionResult {
  text: string;
  confidence: number;
  pageCount: number;
  language: string;
  processingTime: number;
  metadata: {
    fileType: string;
    fileSize: number;
    extractedAt: Date;
    ocrUsed: boolean;
    qualityScore: number;
  };
  pages?: PageResult[];
}

export interface PageResult {
  pageNumber: number;
  text: string;
  confidence: number;
  imageUrl?: string;
}

export interface ExtractionOptions {
  enableOCR?: boolean;
  ocrLanguage?: string;
  imageQuality?: number;
  maxPages?: number;
  enableImageProcessing?: boolean;
  confidenceThreshold?: number;
}

export class TextExtractionService {
  private static instance: TextExtractionService;
  private tesseractWorker: Tesseract.Worker | null = null;

  private constructor() {}

  public static getInstance(): TextExtractionService {
    if (!TextExtractionService.instance) {
      TextExtractionService.instance = new TextExtractionService();
    }
    return TextExtractionService.instance;
  }

  /**
   * Initialize Tesseract worker for OCR
   */
  private async initializeTesseract(): Promise<void> {
    if (!this.tesseractWorker) {
      this.tesseractWorker = await createWorker('eng');
    }
  }

  /**
   * Extract text from various file formats
   */
  public async extractText(
    fileBuffer: Buffer,
    fileName: string,
    options: ExtractionOptions = {}
  ): Promise<TextExtractionResult> {
    const startTime = Date.now();
    const fileType = this.getFileType(fileName);
    
    try {
      let result: TextExtractionResult;

      switch (fileType) {
        case 'pdf':
          result = await this.extractFromPDF(fileBuffer, options);
          break;
        case 'docx':
          result = await this.extractFromDOCX(fileBuffer, options);
          break;
        case 'doc':
          result = await this.extractFromDOC(fileBuffer, options);
          break;
        case 'txt':
          result = await this.extractFromTXT(fileBuffer, options);
          break;
        case 'rtf':
          result = await this.extractFromRTF(fileBuffer, options);
          break;
        case 'image':
          result = await this.extractFromImage(fileBuffer, options);
          break;
        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }

      // Add metadata
      result.metadata = {
        fileType,
        fileSize: fileBuffer.length,
        extractedAt: new Date(),
        ocrUsed: result.metadata.ocrUsed,
        qualityScore: this.calculateQualityScore(result),
      };

      result.processingTime = Date.now() - startTime;

      return result;
    } catch (error) {
      console.error('Text extraction error:', error);
      throw new Error(`Failed to extract text from ${fileName}: ${error}`);
    }
  }

  /**
   * Extract text from PDF files
   */
  private async extractFromPDF(
    fileBuffer: Buffer,
    options: ExtractionOptions
  ): Promise<TextExtractionResult> {
    try {
      // Try direct text extraction first
      const pdfData = await pdfParse(fileBuffer);
      
      if (pdfData.text && pdfData.text.trim().length > 100) {
        // Text extraction successful
        return {
          text: pdfData.text,
          confidence: 0.95,
          pageCount: pdfData.numpages,
          language: this.detectLanguage(pdfData.text),
          processingTime: 0,
          metadata: {
            fileType: 'pdf',
            fileSize: fileBuffer.length,
            extractedAt: new Date(),
            ocrUsed: false,
            qualityScore: 0,
          },
          pages: this.splitIntoPages(pdfData.text, pdfData.numpages),
        };
      } else {
        // Text extraction failed or insufficient text, try OCR
        if (options.enableOCR !== false) {
          return await this.extractFromPDFWithOCR(fileBuffer, options);
        } else {
          throw new Error('PDF appears to be image-based and OCR is disabled');
        }
      }
    } catch (error) {
      console.error('PDF extraction error:', error);
      
      // Fallback to OCR if direct extraction fails
      if (options.enableOCR !== false) {
        return await this.extractFromPDFWithOCR(fileBuffer, options);
      }
      
      throw error;
    }
  }

  /**
   * Extract text from PDF using OCR
   */
  private async extractFromPDFWithOCR(
    fileBuffer: Buffer,
    options: ExtractionOptions
  ): Promise<TextExtractionResult> {
    await this.initializeTesseract();
    
    const maxPages = options.maxPages || 50;
    const pages: PageResult[] = [];
    let fullText = '';
    let totalConfidence = 0;

    try {
      // Dynamically import pdf2pic to avoid executing it during build time
      const { fromBuffer } = await import('pdf2pic');

      // Convert PDF to images
      const pdf2picOptions = {
        density: options.imageQuality || 300,
        saveFilename: "page",
        savePath: "./temp",
        format: "png",
        width: 2480,
        height: 3508
      };

      const convert = fromBuffer(fileBuffer, pdf2picOptions);
      const pageCount = Math.min(await (convert.bulk(-1, { responseType: "buffer" }) as any), maxPages);

      for (let i = 1; i <= pageCount; i++) {
        try {
          const pageImage = await (convert(i, { responseType: "buffer" }) as any);
          
          // Process image for better OCR
          let processedImage = pageImage as Buffer;
          if (options.enableImageProcessing !== false) {
            processedImage = await this.preprocessImageForOCR(pageImage as Buffer);
          }

          // Perform OCR
          const ocrResult = await this.tesseractWorker!.recognize(processedImage as any);
          
          const pageText = ocrResult.data.text;
          const confidence = ocrResult.data.confidence / 100;

          pages.push({
            pageNumber: i,
            text: pageText,
            confidence,
          });

          fullText += pageText + '\n\n';
          totalConfidence += confidence;

        } catch (pageError) {
          console.error(`Error processing page ${i}:`, pageError);
          // Continue with other pages
        }
      }

      const averageConfidence = pages.length > 0 ? totalConfidence / pages.length : 0;

      return {
        text: fullText.trim(),
        confidence: averageConfidence,
        pageCount: pages.length,
        language: this.detectLanguage(fullText),
        processingTime: 0,
        metadata: {
          fileType: 'pdf',
          fileSize: fileBuffer.length,
          extractedAt: new Date(),
          ocrUsed: true,
          qualityScore: 0,
        },
        pages,
      };

    } catch (error) {
      console.error('PDF OCR extraction error:', error);
      throw new Error(`OCR extraction failed: ${error}`);
    }
  }

  /**
   * Extract text from DOCX files
   */
  private async extractFromDOCX(
    fileBuffer: Buffer,
    options: ExtractionOptions
  ): Promise<TextExtractionResult> {
    try {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      
      return {
        text: result.value,
        confidence: 0.95,
        pageCount: this.estimatePageCount(result.value),
        language: this.detectLanguage(result.value),
        processingTime: 0,
        metadata: {
          fileType: 'docx',
          fileSize: fileBuffer.length,
          extractedAt: new Date(),
          ocrUsed: false,
          qualityScore: 0,
        },
      };
    } catch (error) {
      console.error('DOCX extraction error:', error);
      throw new Error(`DOCX extraction failed: ${error}`);
    }
  }

  /**
   * Extract text from DOC files (convert to DOCX first)
   */
  private async extractFromDOC(
    fileBuffer: Buffer,
    options: ExtractionOptions
  ): Promise<TextExtractionResult> {
    try {
      // For DOC files, we'll need to convert them first
      // This is a simplified implementation - in production, you might use a service like LibreOffice
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      
      return {
        text: result.value,
        confidence: 0.85, // Lower confidence for DOC files
        pageCount: this.estimatePageCount(result.value),
        language: this.detectLanguage(result.value),
        processingTime: 0,
        metadata: {
          fileType: 'doc',
          fileSize: fileBuffer.length,
          extractedAt: new Date(),
          ocrUsed: false,
          qualityScore: 0,
        },
      };
    } catch (error) {
      console.error('DOC extraction error:', error);
      throw new Error(`DOC extraction failed: ${error}`);
    }
  }

  /**
   * Extract text from TXT files
   */
  private async extractFromTXT(
    fileBuffer: Buffer,
    options: ExtractionOptions
  ): Promise<TextExtractionResult> {
    try {
      const text = fileBuffer.toString('utf-8');
      
      return {
        text,
        confidence: 1.0,
        pageCount: this.estimatePageCount(text),
        language: this.detectLanguage(text),
        processingTime: 0,
        metadata: {
          fileType: 'txt',
          fileSize: fileBuffer.length,
          extractedAt: new Date(),
          ocrUsed: false,
          qualityScore: 0,
        },
      };
    } catch (error) {
      console.error('TXT extraction error:', error);
      throw new Error(`TXT extraction failed: ${error}`);
    }
  }

  /**
   * Extract text from RTF files
   */
  private async extractFromRTF(
    fileBuffer: Buffer,
    options: ExtractionOptions
  ): Promise<TextExtractionResult> {
    try {
      // RTF extraction is complex - this is a simplified implementation
      // In production, you might use a dedicated RTF parser
      const text = fileBuffer.toString('utf-8');
      
      // Basic RTF text extraction (remove RTF markup)
      const cleanText = this.cleanRTFText(text);
      
      return {
        text: cleanText,
        confidence: 0.8,
        pageCount: this.estimatePageCount(cleanText),
        language: this.detectLanguage(cleanText),
        processingTime: 0,
        metadata: {
          fileType: 'rtf',
          fileSize: fileBuffer.length,
          extractedAt: new Date(),
          ocrUsed: false,
          qualityScore: 0,
        },
      };
    } catch (error) {
      console.error('RTF extraction error:', error);
      throw new Error(`RTF extraction failed: ${error}`);
    }
  }

  /**
   * Extract text from image files using OCR
   */
  private async extractFromImage(
    fileBuffer: Buffer,
    options: ExtractionOptions
  ): Promise<TextExtractionResult> {
    await this.initializeTesseract();
    
    try {
      // Process image for better OCR
      let processedImage = fileBuffer;
      if (options.enableImageProcessing !== false) {
        processedImage = await this.preprocessImageForOCR(fileBuffer);
      }

      // Perform OCR
      const ocrResult = await this.tesseractWorker!.recognize(processedImage);
      
      return {
        text: ocrResult.data.text,
        confidence: ocrResult.data.confidence / 100,
        pageCount: 1,
        language: this.detectLanguage(ocrResult.data.text),
        processingTime: 0,
        metadata: {
          fileType: 'image',
          fileSize: fileBuffer.length,
          extractedAt: new Date(),
          ocrUsed: true,
          qualityScore: 0,
        },
      };
    } catch (error) {
      console.error('Image OCR extraction error:', error);
      throw new Error(`Image OCR extraction failed: ${error}`);
    }
  }

  /**
   * Preprocess image for better OCR results
   */
  private async preprocessImageForOCR(imageBuffer: Buffer): Promise<Buffer> {
    try {
      return await sharp(imageBuffer)
        .grayscale()
        .normalize()
        .sharpen()
        .png()
        .toBuffer();
    } catch (error) {
      console.error('Image preprocessing error:', error);
      return imageBuffer; // Return original if preprocessing fails
    }
  }

  /**
   * Clean RTF text by removing markup
   */
  private cleanRTFText(rtfText: string): string {
    // Basic RTF cleaning - remove common RTF markup
    return rtfText
      .replace(/\\[a-z]+\d*\s?/g, '') // Remove RTF commands
      .replace(/\{[^}]*\}/g, '') // Remove RTF groups
      .replace(/\r?\n/g, '\n') // Normalize line breaks
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Split text into pages
   */
  private splitIntoPages(text: string, pageCount: number): PageResult[] {
    const pages: PageResult[] = [];
    const lines = text.split('\n');
    const linesPerPage = Math.ceil(lines.length / pageCount);

    for (let i = 0; i < pageCount; i++) {
      const startLine = i * linesPerPage;
      const endLine = Math.min((i + 1) * linesPerPage, lines.length);
      const pageText = lines.slice(startLine, endLine).join('\n');

      pages.push({
        pageNumber: i + 1,
        text: pageText,
        confidence: 0.95,
      });
    }

    return pages;
  }

  /**
   * Estimate page count based on text length
   */
  private estimatePageCount(text: string): number {
    // Rough estimation: ~500 words per page
    const words = text.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 500));
  }

  /**
   * Detect language of text
   */
  private detectLanguage(text: string): string {
    // Simple language detection based on common words
    const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const spanishWords = ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te'];
    const frenchWords = ['le', 'la', 'de', 'et', 'un', 'une', 'est', 'pour', 'dans', 'sur', 'avec', 'par'];

    const words = text.toLowerCase().split(/\s+/);
    const englishCount = words.filter(word => englishWords.includes(word)).length;
    const spanishCount = words.filter(word => spanishWords.includes(word)).length;
    const frenchCount = words.filter(word => frenchWords.includes(word)).length;

    if (englishCount > spanishCount && englishCount > frenchCount) return 'en';
    if (spanishCount > englishCount && spanishCount > frenchCount) return 'es';
    if (frenchCount > englishCount && frenchCount > spanishCount) return 'fr';
    
    return 'en'; // Default to English
  }

  /**
   * Get file type from filename
   */
  private getFileType(fileName: string): string {
    const extension = path.extname(fileName).toLowerCase();
    
    switch (extension) {
      case '.pdf':
        return 'pdf';
      case '.docx':
        return 'docx';
      case '.doc':
        return 'doc';
      case '.txt':
        return 'txt';
      case '.rtf':
        return 'rtf';
      case '.png':
      case '.jpg':
      case '.jpeg':
      case '.gif':
      case '.bmp':
      case '.tiff':
        return 'image';
      default:
        throw new Error(`Unsupported file extension: ${extension}`);
    }
  }

  /**
   * Calculate quality score for extraction result
   */
  private calculateQualityScore(result: TextExtractionResult): number {
    let score = result.confidence;

    // Penalize for OCR usage
    if (result.metadata.ocrUsed) {
      score *= 0.9;
    }

    // Penalize for very short text
    if (result.text.length < 100) {
      score *= 0.7;
    }

    // Bonus for longer, well-structured text
    if (result.text.length > 1000 && result.confidence > 0.8) {
      score *= 1.1;
    }

    return Math.min(1.0, Math.max(0.0, score));
  }

  /**
   * Clean up resources
   */
  public async cleanup(): Promise<void> {
    if (this.tesseractWorker) {
      await this.tesseractWorker.terminate();
      this.tesseractWorker = null;
    }
  }
}

// Export singleton instance
export const textExtractionService = TextExtractionService.getInstance(); 