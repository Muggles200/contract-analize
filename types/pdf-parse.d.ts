declare module 'pdf-parse' {
  interface Options {
    max?: number;
    version?: string;
  }

  interface Result {
    text: string;
    numpages: number;
    info: any;
    metadata: any;
    version: string;
  }

  function pdfParse(dataBuffer: Buffer, options?: Options): Promise<Result>;
  export = pdfParse;
} 