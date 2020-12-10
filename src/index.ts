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
import { loader as phpLoader } from "./modules/php-loader";
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
            if (site.serve) {
                if (site.serve.loader === "php") {
                    app.use(
                        `/s/${s}`,
                        phpLoader({
                            host: "127.0.0.1",
                            port: 9000,
                            documentRoot: site.serve.root,
                        })
                    );
                    app.use(
                        vhost(
                            s,
                            phpLoader({
                                host: "127.0.0.1",
                                port: 9000,
                                documentRoot: site.serve.root,
                            })
                        )
                    );
                }
            } else {
                app.use(
                    vhost(s, (req, res) => {
                        proxy.web(req, res, { target: site.proxyTo }, (err) => {
                            return res.render("content.pug", {
                                header: "Site Not Found",
                                content: err.toString(),
                            });
                        });
                    })
                );
                app.use(`/s/${s}`, (req, res) => {
                    req.url = req.url.replace(`s/${s}`, "");
                    proxy.web(req, res, { target: site.proxyTo }, (err) => {
                        if (err)
                            return res.render("content.pug", {
                                header: "Site Not Found",
                                content: `<h3>Details:</h3>${err.toString()}`,
                            });
                    });
                });
            }
        });
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
