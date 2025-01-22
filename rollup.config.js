import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'


const bundle = config => ({
  ...config,
  input: 'src/index.ts',
  external: id => !/^[./]/.test(id),
})

export default [
  bundle({
    plugins: [esbuild()],
    output: [
      {
        file: `dist/karma-sauce-launcher.js`,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: `dist/karma-sauce-launcher.mjs`,
        format: 'esm',
        sourcemap: true,
      },
    ],
  }),
  bundle({
    plugins: [dts()],
    output: {
      file: `dist/karma-sauce-launcher.d.ts`,
      format: 'es',
    },
  }),
]
