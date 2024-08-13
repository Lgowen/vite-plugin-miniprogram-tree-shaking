import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import miniprogramTreeShaking from "vite-plugin-miniprogram-tree-shaking";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni(),
    miniprogramTreeShaking({
      include: ["pages/**/*"], // 表示从以下路径中去寻找所使用过的组件
      componentsPlatform: "alipay", // 原生小程序组件库平台
      componentsPrefix: "ant", // pages.json中 要处理的小程序组件库前缀 例如 <ant-button> 中的 ant 默认使用 '-' 拼接
      excludeComponents: ["style", "_util", "mixins", "tsxml"], // 支付宝小程序组件库所需要的base内容
      componentsPath:
        "dist/build/mp-alipay/mycomponents/node_modules/antd-mini/es", // 原生小程序组件库编译后的目录路径
      miniprogramComponentsPath: "dist/build/mp-alipay/mycomponents", // 如果是以node_modules的方式引入的话可以填写，用于CI上安装依赖(内部执行npm i)
    }),
  ],
});
