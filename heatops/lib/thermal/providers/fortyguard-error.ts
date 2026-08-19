export class FortyGuardApiError extends Error {
  readonly statusCode: number | null;

  readonly code: string;

  readonly details: unknown;

  constructor({
    message,
    statusCode = null,
    code = "FORTYGUARD_API_ERROR",
    details = null,
  }: {
    message: string;
    statusCode?: number | null;
    code?: string;
    details?: unknown;
  }) {
    super(message);

    this.name = "FortyGuardApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}