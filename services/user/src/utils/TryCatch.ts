import { Request, Response, NextFunction, RequestHandler } from "express";
import ErrorHandler from "./errorHandler.js";
import { logger } from "./monitoring.js";

export const TryCatch =
  (
    controller: (
      req: Request,
      res: Response,
      next: NextFunction,
    ) => Promise<any>,
  ): RequestHandler =>
  async (req, res, next) => {
    try {
      await controller(req, res, next);
    } catch (error: any) {
      // 1. LOG THE ERROR TO WINSTON/LOKI
      // This ensures the stack trace and metadata are saved
      logger.error(`Error in ${req.method} ${req.path}`, {
        message: error.message,
        stack: error.stack,
        statusCode: error instanceof ErrorHandler ? error.statusCode : 500,
        path: req.path,
        method: req.method
      });

      // 2. Respond to the client
      if (error instanceof ErrorHandler) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  };