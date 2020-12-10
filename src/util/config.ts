import * as ftconfig from "aio-config";
import Joi from "joi";
import { logger } from "./logger";
import path from "upath";
import { red, bold } from "colorette";

export interface ServeOptions {
    root: string;
    loader: "php";
}

export interface Site {
    sources: string[];
    proxyTo: string; // TODO: add sub-path (eg. /joe/mama)
    serve: ServeOptions;
}

export interface HomelabConfig {
    adminPassword: string;
    webPort: number;
    sites: Site[];
}

export const configSchema = Joi.object<HomelabConfig, HomelabConfig>({
    adminPassword: Joi.string().required().min(5).default(123456), // TODO: random crypto string for default
    webPort: Joi.number().required().default(3000),
    sites: Joi.array()
        .items(
            Joi.object({
                sources: Joi.array()
                    .items(Joi.string().domain())
                    .required()
                    .default([])
                    .min(1),
                proxyTo: Joi.string().optional().uri({}),
                serve: Joi.object({
                    root: Joi.string().default("/var/www/html").optional(),
                    loader: Joi.string().valid("php").default("php"),
                }).optional(),
            })
        )
        .default([]),
});

export const config = ftconfig
    .readFile<HomelabConfig>(path.join(process.cwd(), "config.yaml"), {
        type: "yaml",
    })
    .modify((obj) => {
        const validation = configSchema.validate(obj);
        if (validation.error) {
            logger.error(
                red(`${bold("Validation error:")} ${validation.error.message}`)
            );
            process.exit(1);
        }
        return validation.value;
    });
