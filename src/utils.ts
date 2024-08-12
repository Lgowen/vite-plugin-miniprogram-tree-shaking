import { join, extname } from "node:path";
import { readdirSync, statSync, readFileSync } from "node:fs";

export function jsonStringify(obj: object) {
  return JSON.stringify(obj, null, 2);
}

export function pkgFromUserAgent(userAgent: string | undefined) {
  if (!userAgent) return undefined;
  const pkgSpec = userAgent.split(" ")[0];
  const pkgSpecArr = pkgSpec.split("/");
  return {
    name: pkgSpecArr[0],
    version: pkgSpecArr[1],
  };
}

export function toPascalCase(prefix: string, str: string): string {
  const parts = str.replace(`${prefix}-`, "").split("-");
  return parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

export function convertToPath(str: string): string {
  // 将字符串按短横线分割成数组
  const parts = str.split("-");

  // 处理数组中的每个元素，除了第一个元素，其余每个元素首字母大写
  const convertedParts = parts.map((part) => {
    return part.charAt(0).toUpperCase() + part.slice(1);
  });

  return convertedParts[0];
}

export function findComponentKey(
  dir: string,
  prefix: string,
  comps: Set<string>
) {
  const files = readdirSync(dir);
  files.forEach((file: string) => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      findComponentKey(filePath, prefix, comps);
    } else {
      if (extname(file) === ".json") {
        const fileContent = JSON.parse(
          readFileSync(filePath, "utf-8")
        ).usingComponents;
        if (fileContent) {
          Object.keys(fileContent).forEach((key) =>
            comps.add(toPascalCase(prefix, key))
          );
        }
      }
    }
  });
}
