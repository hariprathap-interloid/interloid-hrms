// Used by Jest only (via babel-jest). The app build uses vite.config.ts's own
// babel plugin (React Compiler) instead — this config is not shared with it.
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
  plugins: ['./babel-plugin-transform-import-meta-env.cjs'],
}
