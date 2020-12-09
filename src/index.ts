import { App } from "@tinyhttp/app";
import { logger as loggerMiddleware } from "@tinyhttp/logger";
import { logger } from "./util/logger";
import { config } from "./util/config";
import { LogLevel } from "@toes/core";
import { green } from "colorette";
import path from "upath";
import { renderFile } from "pug";
import httpProxy from "http-proxy";
import vhost from "vhost-ts";

async function main() {
    const app = new App();
    const proxy = httpProxy.createProxyServer({});

    app.use(
        loggerMiddleware({
            output: {
                color: true,
                callback: (msg) => logger.log(LogLevel.info, msg),
            },
        })
    );

    // Load proxied sites
    config.toObject().sites?.forEach((site) => {
        site.sources.forEach((s) => {
            app.use(
                vhost(s, (req, res) => {
                    try {
                        proxy.web(req, res, { target: site.target });
                    } catch {
                        return res.redirect("/404");
                    }
                })
            );
            app.use(`/s/${s}`, (req, res) => {
                try {
                    proxy.web(req, res, { target: site.target });
                } catch {
                    return res.redirect("/404");
                }
            });
        });
    });

    app.get("/404", (_, res) => {
        res.render("index.pug", { content: "Site Not Found" });
    });

    app.engine("pug", (path, data, opts, cb) =>
        renderFile(path, { opts, ...data }, cb)
    );
    app.set("views", path.join(__dirname, "../views"));

    app.listen(config.toObject().webPort, () =>
        logger.info(
            green(`Web server listening on :${config.toObject().webPort}`)
        )
    );
}

main().catch((err) => logger.error(err));
