import { logger } from '@nrwl/devkit';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { fromCommand } from '../../utils';
import { DeployExecutorSchema } from './schema';

export default async function runExecutor(options: DeployExecutorSchema) {
  logger.info(`Executing "deploy"...`);
  logger.info(`Options: ${JSON.stringify(options, null, 2)}`);

  return fromCommand(
    `cd ${options.projectPath} && anchor deploy`,
    options.monitor
  )
    .pipe(
      map(() => ({ success: true })),
      catchError(() => of({ success: false }))
    )
    .toPromise();
}
