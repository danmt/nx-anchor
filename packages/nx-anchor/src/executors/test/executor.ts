import { logger } from '@nrwl/devkit';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { fromCommand } from '../../utils';
import { TestExecutorSchema } from './schema';

export default async function runExecutor(options: TestExecutorSchema) {
  logger.info(`Executing "test"...`);
  logger.info(`Options: ${JSON.stringify(options, null, 2)}`);

  return fromCommand(
    `cd ${options.projectPath} && anchor test`,
    options.monitor
  )
    .pipe(
      map(() => ({ success: true })),
      catchError(() => of({ success: false }))
    )
    .toPromise();
}
