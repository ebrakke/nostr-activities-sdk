import dts from 'bun-plugin-dts'

await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  plugins: [dts()],
  external: ['@nostr-dev-kit/ndk', 'blossom-client-sdk']
})
