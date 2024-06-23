import {
  Schema,
  Template,
  generateHash,
  generateLocalOrRandomProductionDomainWithProtocol,
  generatePassword,
} from "../utils";

// https://min.io/
export function generate(schema: Schema): Template {
  const userHash = generateHash(schema.projectName);
  const consoleHash = generateHash(schema.projectName);
  const serverHash = generateHash(schema.projectName);
  const password = generatePassword(21);
  const randomConsoleURL = generateLocalOrRandomProductionDomainWithProtocol({
    serverIp: "console",
    projectName: schema.projectName,
    port: 9001,
  });
  const randomServerURL = generateLocalOrRandomProductionDomainWithProtocol({
    serverIp: "api",
    projectName: schema.projectName,
    port: 9000,
  });

  const envs = [
    `MINIO_SERVER_URL_HOST=${randomServerURL}`,
    `MINIO_BROWSER_REDIRECT_URL_HOST=${randomConsoleURL}`,
    `MINIO_ROOT_USER=${userHash}`,
    `MINIO_ROOT_PASSWORD=${password}`,
    `CONSOLE_HASH=${consoleHash}`,
    `SERVER_HASH=${serverHash}`,
  ];

  return {
    envs,
  };
}
