import { SanitizeOptions } from "../interfaces/interface";

  /**
   * Sanitizes the body object by only keeping allowed fields and removing any unwanted fields.
   * @param options - Object containing the allowedFields array.
   * @param body - The request body to be sanitized.
   * @returns A sanitized copy of the request body containing only the allowed fields.
   */
  export function sanitizeBody(options: SanitizeOptions, body: any): any {
    const sanitizedBody: any = {};
  
    for (const key of options.allowedFields) {
      if (body.hasOwnProperty(key)) {
        sanitizedBody[key] = body[key];
      }
    }
  
    return sanitizedBody;
  }