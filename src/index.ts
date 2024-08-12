import { parse, join, basename, resolve } from "node:path";
import { readdirSync, lstatSync, rmSync } from "node:fs";
import { cwd } from "node:process";
import { execSync } from "node:child_process";
import type { Plugin } from "vite";
import { createFilter } from "vite";
import type { Options } from "./types";
import { Platform } from "./types";
import {
  jsonStringify,
  pkgFromUserAgent,
  convertToPath,
  findComponentKey,
} from "./utils";
export default function miniprogramTreeShaking(rawOptions: Options): Plugin {
  const startTime = Date.now();
  const allComponentsSet = new Set<string>();
  const filter = createFilter(rawOptions.include, rawOptions.exclude, {
    resolve: false,
  });

  const componentsPrefix = rawOptions.componentsPrefix;
  const excludeComponents = rawOptions.excludeComponents;
  const componentsPath = rawOptions.componentsPath;
  const miniprogramComponentsPath = rawOptions.miniprogramComponentsPath;
  const npm = rawOptions.npm;
  const rootPath = cwd();

  const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent);
  const pkgManager = pkgInfo ? pkgInfo.name : "npm";
  const __privateLogger = function (color: number, ...args: unknown[]) {
    console.log(
      `\x1b[95m`,
      "[vite-plugin-miniprogram-tree-shaking]",
      "\x1b[0m",
      `\x1b[${color}m`,
      ...args,
      "\x1b[0m"
    );
  };

  const __loggerInfo = function (...args: unknown[]) {
    __privateLogger(34, ...args);
  };

  const __loggerError = function (...args: unknown[]) {
    __privateLogger(31, ...args);
  };

  return {
    name: "vite-plugin-miniprogram-tree-shaking",
    apply: "build",
    generateBundle(_, bundle) {
      __loggerInfo("miniprogramTreeShaking begin");

      const allUsedAntComponents = new Set<string>([]);
      Object.keys(bundle).forEach((fileName) => {
        if (filter(fileName)) {
          const ml = Platform[rawOptions.componentsPlatform];
          if (fileName.includes(ml)) {
            const parsedPath = parse(fileName);
            const jsonPath = `${join(parsedPath.dir, parsedPath.name)}.json`;
            const jsonChunk = bundle[jsonPath];
            const curFile = bundle[fileName];
            if (curFile.type === "asset") {
              const mlContent = curFile.source as string;
              const reg = new RegExp(
                `<${componentsPrefix}-([\\w-]+)[\\s\\S]*?>`,
                "g"
              );
              for (const [_, val] of [...mlContent.matchAll(reg)]) {
                allUsedAntComponents.add(`${componentsPrefix}-${val}`);
                allComponentsSet.add(val);
              }
            }

            if (jsonChunk.type === "asset") {
              const jsonData = JSON.parse(jsonChunk.source as string);
              Object.keys(jsonData.usingComponents).forEach((key) => {
                if (
                  ![...allUsedAntComponents].includes(key) &&
                  key.startsWith(`${componentsPrefix}-`)
                ) {
                  delete jsonData.usingComponents[key];
                }
              });

              jsonChunk.source = jsonStringify(jsonData);
            }
          }
        }
      });
      // 单独处理app.json
      const appJson = "app.json";
      const jsonBundle = bundle[appJson];

      if (jsonBundle.type === "asset") {
        const jsonData = JSON.parse(jsonBundle.source as string);
        Object.keys(jsonData.usingComponents).forEach((key) => {
          if (![...allUsedAntComponents].includes(key)) {
            delete jsonData.usingComponents[key];
          }
        });
        jsonBundle.source = jsonStringify(jsonData);
      }
    },

    async closeBundle() {
      const comps: Set<string> = new Set([]);
      [...allComponentsSet].forEach((item) => comps.add(convertToPath(item)));

      const componentsDir = resolve(rootPath, componentsPath);
      if (npm && miniprogramComponentsPath) {
        const miniprogramComponentsRootDir = resolve(
          rootPath,
          miniprogramComponentsPath
        );
        try {
          const stdout = execSync(
            `cd ${miniprogramComponentsRootDir} && ${pkgManager} i`,
            {
              encoding: "utf-8",
            }
          );
          __loggerInfo(`npm stdout info: ${stdout}`);
        } catch (error) {
          __loggerError(`npm error info: ${error}`);
        }
      }

      try {
        readdirSync(componentsDir).forEach((file: string) => {
          const filePath = join(componentsDir, file);
          if (lstatSync(filePath).isDirectory()) {
            const folderName = basename(filePath);
            if ([...comps].includes(folderName)) {
              findComponentKey(filePath, componentsPrefix, comps);
            }
          }
        });
      } catch (error) {
        __loggerError(`handle componentsPath error: ${error}`);
      }

      const all = [...comps];
      if (excludeComponents) {
        all.push(...excludeComponents);
      }

      try {
        const files = readdirSync(componentsDir);
        Promise.all(
          files.map(async (file: string) => {
            const filePath = join(componentsDir, file);
            if (lstatSync(filePath).isDirectory()) {
              const folderName = basename(filePath);
              if (!all.includes(folderName)) {
                try {
                  await rmSync(filePath, { recursive: true, force: true });
                } catch (error) {
                  __loggerError(`Error deleting ${filePath}:`, error);
                }
              }
            }
          })
        );
      } catch (error) {
        __loggerError("Error deleting unused components:", error);
      }

      const endTime = Date.now();
      __loggerInfo(`miniprogramTreeShaking end in ${endTime - startTime} ms`);
    },
  };
}
