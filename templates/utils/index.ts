import { randomBytes } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { templates } from "../templates";
import type { TemplatesKeys } from "../types/templates-data.type";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export interface Schema {
  serverIp: string;
  projectName: string;
}

export interface Template {
  envs: string[];
  mounts?: {
    mountPath: string;
    content?: string;
  }[];
}

interface LocalOrRandomProductionDomain {
  port: number;
  domain: string;
  fullDomain: `http://${string}` | `https://${string}`;
  protocol: "http" | "https";
}

export const generateRandomDomain = ({
  serverIp,
  projectName,
}: Schema): string => {
  const hash = randomBytes(3).toString("hex");
  const slugIp = serverIp.replaceAll(".", "-");
  return `${projectName}-${hash}-${slugIp}.traefik.me`;
};

/**
 * Generates a local or random production domain based on the provided parameters.
 * If the current environment is "development", it returns a local domain with the specified port.
 * Otherwise, it generates a random domain using the server IP and project name.
 * @param {object} options - The options for generating the domain.
 * @param {string} options.serverIp - The server IP address.
 * @param {string} options.projectName - The project name.
 * @param {number} [options.port=80] - The port number (default is 80).
 * @returns {LocalOrRandomProductionDomain} The generated domain data.
 */
export const generateLocalOrRandomProductionDomain = ({
  port = 80,
  ...schema
}: Schema & {
  port?: number;
}): LocalOrRandomProductionDomain => {
  if (process.env.NODE_ENV === "development") {
    return {
      port,
      domain: `localhost:${port}`,
      fullDomain: `http://localhost:${port}`,
      protocol: "http",
    };
  }

  const randomDomain = generateRandomDomain(schema);
  return {
    port,
    domain: randomDomain,
    fullDomain: `https://${randomDomain}`,
    protocol: "https",
  };
};

export const generateHash = (projectName: string, quantity = 3): string => {
  const hash = randomBytes(quantity).toString("hex");
  return `${projectName}-${hash}`;
};

export const generatePassword = (quantity = 16): string => {
  return randomBytes(Math.ceil(quantity / 2))
    .toString("hex")
    .slice(0, quantity);
};

export const generateBase64 = (bytes = 32): string => {
  return randomBytes(bytes).toString("base64");
};

export const loadTemplateModule = async (
  id: TemplatesKeys
): Promise<(schema: Schema) => Template> => {
  const templateLoader = templates.find((t) => t.id === id);
  if (!templateLoader) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Template ${id} not found or not implemented yet`,
    });
  }

  const generate = await templateLoader.load();
  return generate;
};

export const readComposeFile = async (id: string) => {
  const cwd = process.cwd();
  const composeFile = await readFile(
    join(cwd, ".next", "templates", id, "docker-compose.yml"),
    "utf8"
  );

  return composeFile;
};
