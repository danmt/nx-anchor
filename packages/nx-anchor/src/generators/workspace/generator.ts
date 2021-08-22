import {
  addDependenciesToPackageJson,
  addProjectConfiguration,
  formatFiles,
  getWorkspaceLayout,
  names,
  Tree,
} from '@nrwl/devkit';

import { fromCommand } from '../../utils';
import { WorkspaceGeneratorSchema } from './schema';
import * as fs from 'fs';

interface NormalizedSchema extends WorkspaceGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
}

function normalizeOptions(
  tree: Tree,
  options: WorkspaceGeneratorSchema
): NormalizedSchema {
  const name = names(options.name).fileName;
  const projectDirectory = options.directory
    ? `${names(options.directory).fileName}/${name}`
    : name;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const projectRoot = `${getWorkspaceLayout(tree).libsDir}/${projectDirectory}`;

  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
  };
}

function initWorkspace(projectName: string, cwd: string) {
  return fromCommand(`anchor init ${projectName}`, {
    cwd,
    monitor: true,
  }).toPromise();
}

export default async function (tree: Tree, options: WorkspaceGeneratorSchema) {
  const normalizedOptions = normalizeOptions(tree, options);
  // Add project configuration with its custom executors
  addProjectConfiguration(tree, normalizedOptions.projectName, {
    root: normalizedOptions.projectRoot,
    projectType: 'application',
    targets: {
      build: {
        executor: '@danmt/nx-anchor:build',
        options: {
          projectPath: normalizedOptions.projectRoot,
          monitor: true,
        },
      },
      test: {
        executor: '@danmt/nx-anchor:test',
        options: {
          projectPath: normalizedOptions.projectRoot,
          monitor: true,
        },
      },
      deploy: {
        executor: '@danmt/nx-anchor:deploy',
        options: {
          projectPath: normalizedOptions.projectRoot,
          monitor: true,
        },
      },
    },
  });
  // Add the main dependencies from an anchor workspace
  addDependenciesToPackageJson(
    tree,
    { '@project-serum/anchor': 'latest' },
    { mocha: 'latest' }
  );
  // Call init
  await initWorkspace(
    normalizedOptions.projectName,
    getWorkspaceLayout(tree).libsDir
  );
  fs.rmdirSync(`${normalizedOptions.projectRoot}/app`);
  await formatFiles(tree);
}
