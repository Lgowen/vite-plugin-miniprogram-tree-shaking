# vite-plugin-miniprogram-tree-shaking

[![npm](https://img.shields.io/npm/v/vite-plugin-miniprogram-tree-shaking)](https://www.npmjs.com/package/vite-plugin-miniprogram-tree-shaking)
![npm peer dependency version](https://img.shields.io/npm/dependency-version/vite-plugin-miniprogram-tree-shaking/peer/vite)
[![GitHub license](https://img.shields.io/github/license/Lgowen/vite-plugin-miniprogram-tree-shaking)](https://github.com/Lgowen/vite-plugin-miniprogram-tree-shaking/blob/master/LICENSE)

一个用于跨平台小程序框架使用原生小程序组件库时的 Tree Shaking 插件

## Install

```bash
npm install vite-plugin-miniprogram-tree-shaking --save-dev
# or
yarn add vite-plugin-miniprogram-tree-shaking -D
```

## Usage

这里以uniapp为例（插件执行顺序需要放在跨平台小程序框架相关vite插件之后，建议放在最后）

```js
import { defineConfig } from 'vite'
import uni from "@dcloudio/vite-plugin-uni";
import miniprogramTreeShaking from "vite-plugin-miniprogram-tree-shaking";

export default defineConfig(({ mode }) => {
  return {
    plugins: mode === "production" ? [uni(), miniprogramTreeShaking({
      include: ["pages/**/*", "subpages/**/*", "components/**/*"], // 表示从以下路径中去寻找所使用过的组件
      componentsPlatform: "alipay", // 原生小程序组件库平台
      componentsPrefix: "ant", // pages.json中 要处理的小程序组件库前缀 例如 <ant-button> 中的 ant 默认使用 '-' 拼接
      excludeComponents: [
        "style",
        "_util",
        "mixins",
        "tsxml",
      ], // 支付宝小程序组件库所需要的base内容
      componentsPath:
        "dist/build/mp-alipay/mycomponents/node_modules/antd-mini/es", // 原生小程序组件库编译后的目录路径
      miniprogramComponentsPath: "dist/build/mp-alipay/mycomponents", // 如果是以node_modules的方式引入的话可以填写，用于CI上安装依赖(内部执行npm i)
    })] : [uni()];
  };
});

```

## Options

| 选项名 |   值    | 默认值 | 是否必填 |                      说明                      |
| ------ | :-----: | :----: | :------: | :--------------------------------------------: |
| include | string 、 string[] |  <空>  |    否    | 指定插件所要搜寻的目录(用于查找所有使用到的原生小程序组件) |
| exclude  | string 、 string[]  |  <空>  |    否    |     指定插件不搜寻的目录    |
| componentsPlatform  | keyof typeof Platform  |  <空>  |    是    |     使用原生小程序组件库的平台(必填)    |
| componentsPrefix  | string  |  <空>  |    是    |     要处理的小程序组件库前缀(必填,需要统一格式), 例如 pages.json中 要处理的小程序组件库前缀 例如 <ant-button> 中的 ant 默认使用 '-' 拼接    |
| componentsPath  | string  |  <空>  |    是    |     要处理的小程序组件库路径(必填)   |
| excludeComponents  | string[]  |  <空>  |    否    |     排除的组件或文件夹(必填), 例如 `['style','mixins', 'tsxml']`   |
| miniprogramComponentsPath  | string  |  <空>  |    否    |     要处理的小程序组件库根路径,有需要在CI上执行npm安装依赖的情况下填写    |
| npm  | boolean  |  false  |    否    |     原生小程序组件库是否采用npm的方式, 如果该值设置为true时 miniprogramComponentsPath 为必填    |


## Example

可以参考 [example](https://github.com/Lgowen/vite-plugin-miniprogram-tree-shaking/tree/main/example) 中的示例
例子中是使用 `uniapp` 作为小程序跨平台框架使用支付宝原生小程序 `antd-mini` 时的Tree Shaking插件


## License

MIT
