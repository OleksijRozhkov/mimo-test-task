export class NotFoundError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  public constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
    this.isOperational = true;
  }
}
