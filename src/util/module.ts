import { Request, Response } from "@tinyhttp/app";

// TODO: module loading system instead of importing file directly

export type RequestLoader = (
    config: unknown
) => (req: Request, res: Response) => Promise<unknown>;
