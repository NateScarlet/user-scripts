import { build as esbuild } from './scripts/build';
import { series, watch, parallel } from 'gulp';
import { spawn } from 'child_process';

const tasks = {
  'bilibili.com:style': () =>
    spawn('npx', ['postcss', 'style.scss', '-o', 'style.css'], {
      cwd: 'src/bilibili.com',
      shell: true,
    }),
  'niconico.jp:style': () => {
    if (1) {
      // TODO: upgrade to tailwind v3
      return Promise.resolve();
    }
    return spawn('npx', ['tailwindcss', '-o', 'style.css'], {
      cwd: 'src/niconico.jp',
      shell: true,
    });
  },
};

export function scripts() {
  return esbuild();
}

export const build = series(
  parallel(tasks['bilibili.com:style'], tasks['niconico.jp:style']),
  scripts
);

export async function dev() {
  watch('src/*/*.ts', scripts);
  watch(
    'src/bilibili.com/components/*.ts',
    series(tasks['bilibili.com:style'], scripts)
  );
}

export default build;
