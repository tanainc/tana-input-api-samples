import type { APIFileNode } from '../types/types';

import { join } from 'node:path';
import { readFile, writeFile, readdir } from 'node:fs/promises';

import { TanaAPIHelper } from '../TanaAPIClient';

const token = process.env.TANA_TOKEN || '';
if (!token) {
  console.log('Please set TANA_TOKEN in your environment');
  process.exit(1);
}

const STATE_FN = 'tana-upload-state.json';
const folder = process.argv[2] || '.';

type State = Record<string, any>;

async function processFile(state: State, helper: TanaAPIHelper, path: string, filename: string) {
  if (state[filename]?.nodeId) {
    console.log(`Already processed '${filename}'.`);
    return;
  }

  const synposisFileContents = await readFile(path, { encoding: 'base64' });
  const node: APIFileNode = {
    filename: `Audio captured from ${filename.replaceAll('/', '_')}`,
    dataType: 'file',
    contentType: 'audio/mp4',
    file: synposisFileContents.toString(),
  };
  const responseObj = await helper.createNode(node, 'INBOX');
  state[filename] = responseObj;
}

async function walk(dir: string): Promise<string[]> {
  const files = await readdir(dir, { withFileTypes: true });
  const paths = files.map(async (file) => {
    const path = join(dir, file.name);
    if (file.isDirectory()) return await walk(path);
    return path;
  });
  return (await Promise.all(paths)).flat(2);
}

async function run(folder: string) {
  const stateFilePath = join(folder, STATE_FN);
  let state: State = {};
  try {
    state = JSON.parse((await readFile(stateFilePath)).toString());
  } catch {}
  const tanaAPIHelper = new TanaAPIHelper(token);

  const files = await walk(folder);
  for (const f of files) {
    if (!f.endsWith('.m4a')) {
      continue;
    }
    const fn = f.slice(folder.length);
    await processFile(state, tanaAPIHelper, f, fn);
  }
  await writeFile(stateFilePath, JSON.stringify(state, null, 2));
}

run(folder).then(() => process.exit(0));
