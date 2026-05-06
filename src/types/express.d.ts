declare module "mongo-sanitize";
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
        instituteId?: string;
      };
    }
  }
}