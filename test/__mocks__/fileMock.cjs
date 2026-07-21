// Jest can't parse binary/asset imports (images, fonts) the way Vite does.
// Any `import x from '@/assets/...'` resolves to this string instead.
module.exports = 'test-file-stub'
