import { sveltePreprocess } from 'svelte-preprocess';

/**@type {import('@sveltejs/kit').Config} */
export default {
  compilerOptions: {
    css: 'injected',
    runes: true,
    // disable all warnings coming from node_modules and all accessibility warnings
    warningFilter: (warning) =>
      !warning.filename?.includes('node_modules') &&
      !warning.code.startsWith('a11y'),
  },
  preprocess: sveltePreprocess(),
};
