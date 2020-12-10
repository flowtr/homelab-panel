import flat from "flat";

export type PhpConfiguration = {
    host?: string;
    port?: number;
    documentRoot?: string;
    skipCheckServer?: boolean;
    environmentVariables?: Record<string, string>;
};

export type PhpCallback = (
    err: number | false,
    output: string,
    phpError: string
) => void;

export type RequestInfo =
    | string
    | {
          url: string;
          uri?: string;
          method?: "GET" | "POST";
          form?: Record<string, unknown>;
          json?: Record<string, unknown>;
          body?: string | Buffer;
          contentType?: string;
          contentLength?: number;
          queryString?: string;
      };

export type PhpRequest = {
    info: RequestInfo;
    cb: PhpCallback;
};

/**
 * Encodes a url php-style.
 */
export function encodeUrl(obj: Record<string, unknown>) {
    const flatted = flat(obj);
    const params = [];
    for (const key in flatted)
        if (flatted.hasOwnProperty(key)) {
            if (
                flatted[key] !== null &&
                typeof flatted[key] === "object" &&
                Object.keys(flatted[key]).length === 0
            )
                continue;
            if (flatted[key] === null) continue;
            params.push(
                dot2brackets(key) + "=" + encodeURIComponent(flatted[key])
            );
        }

    return params.join("&");
}

function dot2brackets(key) {
    const arr = key.split(".");
    for (let i = 1; i < arr.length; i++) arr[i] = "[" + arr[i] + "]";

    return arr.join("");
}
