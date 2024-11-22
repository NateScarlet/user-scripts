import { build as esbuild } from './scripts/build';
import { series, parallel } from 'gulp';
import { spawn } from 'child_process';

function buildScript(watch: boolean) {
  return function buildScript() {
    return esbuild(watch);
  };
}

function buildStyle__bilibili(watch: boolean) {
  return function buildStyle__bilibili() {
    return spawn(
      'npx',
      [
        'postcss',
        'style.scss',
        '-o',
        'style.css',
        ...(watch ? ['--watch'] : []),
      ],
      {
        cwd: 'src/bilibili.com',
        shell: true,
      }
    );
  };
}

function buildStyle__niconico() {
  if (1) {
    // TODO: upgrade to tailwind v3
    return Promise.resolve();
  }
  return spawn('npx', ['tailwindcss', '-o', 'style.css'], {
    cwd: 'src/niconico.jp',
    shell: true,
  });
}

export function clean() {
  return spawn('rm', ['-rf', 'dist']);
}

export const dev = series(
  clean,
  parallel(buildScript(true), buildStyle__bilibili(true))
);

export const build = series(
  clean,
  parallel(buildStyle__bilibili(false), buildStyle__niconico),
  buildScript(false)
);

export default build;
