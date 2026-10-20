// Keep the client transform and React runtime on the same production branch,
// even when a developer's untracked .env.local uses NODE_ENV=development.
process.env.NODE_ENV = 'production';

const [{ build: buildClient }, { build: buildServer }] = await Promise.all([
  import('vite'),
  import('esbuild'),
]);

await buildClient();
await buildServer({
  entryPoints: ['server.ts'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  packages: 'external',
  sourcemap: true,
  outfile: 'dist/server.cjs',
});
