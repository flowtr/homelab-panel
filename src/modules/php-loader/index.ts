import { Request, Response } from "@tinyhttp/app";
import { parse as parseURL } from "url";
import { PHPFPM } from "tsnode-phpfpm";
import path from "upath";
import { PhpConfiguration } from "./util";
import { logger } from "../../util/logger";
export const loader = (config: PhpConfiguration) => {
    const php = new PHPFPM(config);
    return async (req: Request, res: Response) => {
        const url = parseURL(req.url);
        const phpFile = path.basename(url.pathname);
        // logger.debug(`Serving php file: ${phpFile}`);
        php.run(phpFile, (err, output, phpError) => {
            if (err == 99)
                return res
                    .status(500)
                    .send(
                        `<h1>Encountered PHP FPM Error</h1><p>Code: ${err}. ${phpError}</p>`
                    );
            if (phpError)
                return res
                    .status(500)
                    .send(`<h1>Encountered PHP Error</h1><p>${phpError}</p>`);
            return res.send(output);
        });
    };
};
