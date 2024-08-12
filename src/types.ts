export interface Options {
  /** 包括要匹配的路径 */
  include?: string | string[];
  /** 包括不匹配的路径 */
  exclude?: string | string[];
  /** 使用原生小程序组件库的平台 */
  componentsPlatform: keyof typeof Platform;
  /** 小程序组件库前缀 */
  componentsPrefix: string;
  /** 要处理的小程序组件库路径 */
  componentsPath: string;
  /** 排除的组件 */
  excludeComponents?: string[];
  /** 要处理的小程序组件库路径 */
  miniprogramComponentsPath?: string;
  /** 原生小程序组件库是否采用npm的方式 */
  npm?: boolean;
}

/** 枚举Platform */
export enum Platform {
  /** 微信小程序 */
  alipay = "axml",
  /** 支付宝小程序 */
  weixin = "wxml",
  /** 百度小程序 */
  baidu = "swan",
  /** 字节跳动小程序 */
  bytedance = "ttml",
  /** 快手小程序 */
  kuaishou = "ksml",
}
