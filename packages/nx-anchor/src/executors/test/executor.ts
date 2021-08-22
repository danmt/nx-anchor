import { logger } from '@nrwl/devkit';

import { fromCommand } from '../../utils';
import { TestExecutorSchema } from './schema';

export default async function runExecutor(options: TestExecutorSchema) {
  logger.info(`Executing "test"...`);
  logger.info(`Options: ${JSON.stringify(options, null, 2)}`);

  return fromCommand(
    `cd ${options.projectPath} && anchor test`,
    options.monitor
  ).toPromise();
}
