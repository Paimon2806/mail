import { readFileSync } from "fs";
import { envs } from "./envs/index";
import loggerConfig from "./logger/index";
const pkg = JSON.parse(readFileSync("./package.json", { encoding: "utf8" }));
import { initializeApp } from "firebase-admin/app";
import { credential } from "firebase-admin";

const app = initializeApp({
  credential: credential.cert(getFirebaseFile())
});

function getFirebaseFile() {
  const firebaseFile = envs.FIREBASE_SERVICE_ACCOUNT_FILE || "service-account.json";
  return require(`../../${firebaseFile}`);
}

export const config = {
  version: pkg.version,
  envs,
  logger: loggerConfig,
  // additional shared configuration,
  app
};
