import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

const buildConfigs = {
  cjs: {
    output: {
      file: 'dist/xlsx.cjs.js',
      format: 'cjs',
    },
  },
  esm: {
    output: {
      file: 'dist/xlsx.esm.js',
      format: 'es',
    },
  },
  global: {
    output: {
      file: 'dist/xlsx.global.js',
      format: 'iife',
      name: 'XLSX',
    },
  },
};

export default Object.entries(buildConfigs).map(([, config]) => {
  return {
    input: 'src/index.ts',
    output: config.output,
    plugins: [
      typescript(),
      resolve(),
      commonjs({
        namedExports: {
          'file-saver': ['saveAs'],
        },
      }),
      terser(),
    ],
  };
});
