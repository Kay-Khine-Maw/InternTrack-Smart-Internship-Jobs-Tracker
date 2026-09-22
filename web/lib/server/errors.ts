export type AppErrorCode =
  | "INVALID_URL"
  | "UNSUPPORTED_FILE"
  | "AI_FAILURE"
  | "DATABASE_FAILURE"
  | "EXTRACT_FAILURE"
  | "NOT_FOUND"
  | "VALIDATION"
  | "DUPLICATE";

export class AppError extends Error {
  constructor(
    public code: AppErrorCode,
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function databaseError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown database error";
  if (/can'?t reach|ECONNREFUSED|P1001|P1000|P1017/i.test(message)) {
    return new AppError(
      "DATABASE_FAILURE",
      "Could not connect to the database. Start Postgres (docker compose up -d) and run prisma migrate.",
      500
    );
  }
  return new AppError("DATABASE_FAILURE", "A database error occurred. Please try again.", 500);
}
