import { context } from 'esbuild';
import { readFile, readdir, stat } from 'fs/promises';
import { createHash } from 'crypto';

import { execSync } from 'child_process';
import moment from 'moment';
import * as fs from 'fs/promises';
import * as pathLib from 'path';

const METADATA_START = '// ==UserScript==';
const METADATA_END = '// ==/UserScript==';

function shell(command) {
  return execSync(command).toString().trimEnd();
}

function autoVersion(p: string[]): string {
  let date = new Date(
    parseInt(shell(`git log -1 --pretty=%at ${p.join(' ')}`)) * 1e3
  );
  if (!Number.isFinite(date.getTime())) {
    console.warn(`can not get commit date: ${p}`);
    date = new Date();
  }

  return moment(date).format('YYYY.MM.DD');
}

async function walk(root: string, cb: (path: string) => Promise<void>) {
  for (const i of await readdir(root)) {
    const p = pathLib.join(root, i);
    const s = await stat(p);
    if (s.isDirectory()) {
      await walk(p, cb);
    } else {
      await cb(p);
    }
  }
}

function workspacePath(...parts: string[]): string {
  return pathLib.resolve(__dirname, '..', ...parts);
}

export async function build(watch = false) {
  const root = workspacePath('src');
  const entryPoints: string[] = [];
  await walk(root, async (entry) => {
    if (!entry.endsWith('.user.ts')) {
      return;
    }
    entryPoints.push(entry);
  });
  // spell-checker: word outdir
  const ctx = await context({
    entryPoints,
    bundle: true,
    treeShaking: true,
    target: 'es2015',
    outdir: workspacePath('dist'),
    write: false,
    metafile: true,
    charset: 'utf8',
    plugins: [
      {
        name: 'lit-html',
        setup(build) {
          build.onResolve({ filter: /^lit-html$/ }, async () => {
            return {
              path: workspacePath(
                'node_modules',
                'lit-html',
                'development',
                'lit-html.js'
              ),
            };
          });
          build.onLoad({ filter: /[\/\\]lit-html.js$/ }, async ({ path }) => {
            const source = await readFile(path, 'utf-8');
            return {
              contents: source.replace(
                'const DEV_MODE = true',
                'const DEV_MODE = false'
              ),
            };
          });
        },
      },
      {
        name: 'save',
        setup(build) {
          build.onEnd(async (res) => {
            res.warnings.forEach((i) => {
              console.warn(i);
            });
            res.errors.forEach((i) => {
              console.error(i);
            });
            await Promise.all(
              res.outputFiles.map(async ({ text, path }, index) => {
                const hash = createHash('sha256')
                  .update(text)
                  .digest('hex')
                  .slice(0, 8);
                const entry = entryPoints[index];
                const relPath = pathLib
                  .relative(workspacePath(), path)
                  .replace(/\\/g, '/');
                const entryContent = await fs.readFile(entry, {
                  encoding: 'utf-8',
                });
                const data = Array.from(
                  (function* () {
                    for (const i of (function* () {
                      enum CursorPosition {
                        BEFORE_METADATA,
                        METADATA,
                      }
                      let pos = CursorPosition.BEFORE_METADATA;
                      let hasVersion = false;
                      for (const line of entryContent.split(/\r?\n/)) {
                        if (pos === CursorPosition.BEFORE_METADATA) {
                          if (line === METADATA_START) {
                            yield line;
                            pos = CursorPosition.METADATA;
                          }
                        } else if (pos === CursorPosition.METADATA) {
                          if (line === METADATA_END) {
                            if (!hasVersion) {
                              yield `// @version   ${autoVersion(
                                Object.keys(
                                  res.metafile.outputs[relPath].inputs
                                ).filter((i) => !i.startsWith('node_modules/'))
                              )}+${hash}`;
                            }
                            yield line;
                            return;
                          } else if (line.startsWith('// @version')) {
                            hasVersion = true;
                            yield line.trim() + '+' + hash;
                          } else {
                            yield line;
                          }
                        }
                      }
                    })()) {
                      yield i + '\n';
                    }
                    yield '\n';
                    yield text;
                  })()
                );
                console.log(relPath);
                await fs.writeFile(path, data, {
                  encoding: 'utf-8',
                  flag: 'w',
                });
              })
            );
          });
        },
      },
    ],
    loader: {
      '.html': 'text',
      '.css': 'text',
    },
  });
  if (watch) {
    await ctx.watch();
    // run forever
    await new Promise(() => undefined);
  } else {
    await ctx.rebuild();
  }
  await ctx.dispose();
}

if (require.main === module) {
  (async () => {
    await build(process.argv.includes('--watch'));
  })();
}
