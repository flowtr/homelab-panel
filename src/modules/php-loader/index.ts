import { Request, Response } from "@tinyhttp/app";
import { parse as parseURL } from "url";
import { PHPFPM } from "tsnode-phpfpm";
import path from "upath";
import { PhpConfiguration } from "./util";
export const loader = (config: PhpConfiguration) => {
    const php = new PHPFPM(config);
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
