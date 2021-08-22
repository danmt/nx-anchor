import {
  addDependenciesToPackageJson,
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  names,
  offsetFromRoot,
  Tree,
} from '@nrwl/devkit';
import * as path from 'path';
import { toCrateName } from '../../utils';
import { SampleGeneratorSchema } from './schema';

interface NormalizedSchema extends SampleGeneratorSchema {
  projectName: string;
  projectRoot: string;
}

function normalizeOptions(
  tree: Tree,
  options: SampleGeneratorSchema
): NormalizedSchema {
  const projectName = names(options.name).fileName;
  const projectRoot = `${getWorkspaceLayout(tree).libsDir}/${projectName}`;

  return {
    ...options,
    projectName,
    projectRoot,
  };
}

function addFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    ...names(options.name),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
    dot: '.',
    crateName: toCrateName(options.name),
  };
  generateFiles(
    tree,
    path.join(__dirname, 'files'),
    options.projectRoot,
    templateOptions
  );
}

export default async function (tree: Tree, options: SampleGeneratorSchema) {
  const normalizedOptions = normalizeOptions(tree, options);
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
  addFiles(tree, normalizedOptions);
  await formatFiles(tree);
}
