import { Request, Response } from "@tinyhttp/app";
import { PhpClient } from "./php";
import { PhpConfiguration } from "./util";
import { parse as parseURL } from "url";
import path from "upath";
export const loader = (config: PhpConfiguration) => {
    const php = new PhpClient(config);
    return async (req: Request, res: Response) => {
        const url = parseURL(req.url);
        const phpFile = path.basename(url.pathname);
        php.run(phpFile, (err, output, phpError) => {
            if (err == 99)
                res.status(500).send(
                    `<h1>Encountered PHP FPM Error</h1><p>Code: ${err}</p>`
                );
            if (phpError)
                res.status(500).send(
                    `<h1>Encountered PHP Error</h1><p>${phpError}</p>`
                );
            else res.send(output);
        });
    };
};
