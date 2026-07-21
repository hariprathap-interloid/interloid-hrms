// Jest runs on CommonJS/Node and has no native `import.meta` support, so Vite-style
// `import.meta.env.X` reads (see src/config/env.ts) crash under babel-jest without this.
// Rewrites `import.meta` -> `process`, so `import.meta.env.FOO` becomes `process.env.FOO`.
// jest.setup.cjs loads `.env` into `process.env` via dotenv so the values line up.
module.exports = function importMetaEnvPlugin() {
  return {
    visitor: {
      MetaProperty(path) {
        if (path.node.meta.name === 'import' && path.node.property.name === 'meta') {
          path.replaceWithSourceString('process')
        }
      },
    },
  }
}
