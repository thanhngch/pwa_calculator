const esbuild = require('esbuild');

esbuild.build({
    entryPoints: ['src/main.tsx'],
    bundle: true,
    minify: false,
    sourcemap: true,
    target: ['chrome70'],
    outfile: 'public/js/out.js',
    logLevel: 'info',
    watch: true,
    preserveSymlinks: true,
    incremental: true,
    external: [
    ],
});
