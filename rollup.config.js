import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'

const name = require('./package.json').main.replace(/\.js$/, '')

const ext = format =>
  format == 'dts' ? 'd.ts' : format == 'cjs' ? 'js' : 'mjs'

const bundle = format => ({
  input: 'src/index.ts',
  output: {
    file: `${name}.${ext(format)}`,
    format: format == 'cjs' ? 'cjs' : 'es',
    sourcemap: format != 'dts',
  },
  plugins: format == 'dts' ? [dts()] : [esbuild({ minify: true, target: ['chrome51', 'firefox54' , 'safari10' , 'edge15']})],
  external: id => !/^[./]/.test(id),
})

export default [
  bundle('es'),
  bundle('cjs'),
  bundle('dts'),
]