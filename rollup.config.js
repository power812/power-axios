import resolve from '@rollup/plugin-node-resolve'; //允许我们加载第三方模块
import commonjs from '@rollup/plugin-commonjs'; //插件将它们转换为ES6版本
import terser from '@rollup/plugin-terser'; //压缩,转译es6+语法，请改用terser
import json from '@rollup/plugin-json'; //可将.json文件转换为ES6模块
import { babel } from '@rollup/plugin-babel'; //正确解析我们的模块并使其与旧版浏览器兼容
import autoExternal from 'rollup-plugin-auto-external'; //自动添加至 externals 未免
import bundleSize from 'rollup-plugin-bundle-size'; //分析包大小工具
import ts from 'rollup-plugin-typescript2'; // typescript打包
// import serve from 'rollup-plugin-serve'; //服务
import path from 'path';
import fs from 'fs';
import { URL, fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const pkgPath = path.resolve(path.dirname(__filename), './package.json');
const __dirname = path.dirname(__filename);
const lib = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

const outputFileName = 'axios';
const name = 'axios';
const namedInput = './index.ts'; //入口路径
const defaultInput = './lib/axios.ts';

const buildConfig = ({ es5, browser = true, minifiedVersion = true, ...config }) => {
  const { file } = config.output;
  const ext = path.extname(file);
  const basename = path.basename(file, ext);
  const extArr = ext.split('.');
  extArr.shift();

  const build = ({ minified }) => ({
    input: namedInput,
    ...config,
    output: {
      ...config.output,
      file: `${path.dirname(file)}/${basename}.${(minified ? ['min', ...extArr] : extArr).join('.')}`,
    },
    plugins: [
      json(),
      resolve({ browser, extensions: ['.js', '.ts'] }),
      commonjs(),
      ts({
        tsconfig: path.resolve(__dirname, 'tsconfig.json'),
      }),
      // serve({
      //   port: 8000,
      //   contentBase: '', // 表示起的服务是在根目录下
      //   openPage: 'index.html', // 打开的是哪个文件
      //   open: true, // 默认打开浏览器
      // }),
      minified && terser(),
      minified && bundleSize(),
      ...(es5
        ? [
            babel({
              babelHelpers: 'bundled',
              presets: ['@babel/preset-env'],
            }),
          ]
        : []),
      ...(config.plugins || []),
    ],
  });

  const configs = [build({ minified: false })];

  if (minifiedVersion) {
    configs.push(build({ minified: true }));
  }

  return configs;
};

export default async () => {
  const year = new Date().getFullYear();
  const banner = `// Axios v${lib.version} Copyright (c) ${year} ${lib.author} and contributors`;

  return [
    // browser ESM bundle for CDN
    ...buildConfig({
      input: namedInput,
      output: {
        file: `dist/esm/${outputFileName}.js`,
        format: 'esm',
        generatedCode: {
          constBindings: true,
        },
        exports: 'named',
        banner,
      },
    }),

    // Browser UMD bundle for CDN
    ...buildConfig({
      input: defaultInput,
      es5: true,
      output: {
        file: `dist/${outputFileName}.js`,
        name,
        format: 'umd',
        exports: 'default',
        banner,
      },
    }),

    // Browser CJS bundle
    ...buildConfig({
      input: defaultInput,
      es5: false,
      minifiedVersion: false, // 是否打包mini版本
      output: {
        file: `dist/browser/${name}.cjs`,
        name,
        format: 'cjs',
        exports: 'default',
        banner,
      },
    }),

    // Node.js commonjs bundle
    {
      input: defaultInput,
      output: {
        file: `dist/node/${name}.cjs`,
        format: 'cjs',
        generatedCode: {
          constBindings: true,
        },
        exports: 'default',
        banner,
      },
      plugins: [
        autoExternal(),
        ts({
          tsconfig: path.resolve(__dirname, 'tsconfig.json'),
        }),
        resolve({ extensions: ['.js', '.ts'] }),
        commonjs(),
      ],
    },
  ];
};
