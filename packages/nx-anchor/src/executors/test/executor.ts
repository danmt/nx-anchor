import { logger } from '@nrwl/devkit';
import { spawn } from 'child_process';
import { combineLatest, fromEvent, merge, of, throwError } from 'rxjs';
import { catchError, first, map, switchMap, tap } from 'rxjs/operators';

import { TestExecutorSchema } from './schema';

const fromCommand = (command: string, monitor = false) => {
  const spawnee = spawn(command, {
    shell: true,
  });

  const stdout$ = fromEvent(spawnee.stdout, 'data').pipe(
    tap((stdout) => logger.info(stdout))
  );
  const stderr$ = fromEvent(spawnee.stderr, 'data').pipe(
    tap((stderr) => logger.error(stderr))
  );
  const close$ = fromEvent(spawnee, 'close').pipe(
    switchMap(([code]) =>
      code === 0 ? of(true) : throwError(`Failed with code ${code}`)
    )
  );
  const error$ = fromEvent(spawnee, 'error').pipe(
    switchMap((error) => throwError(error))
  );

  return combineLatest([
    monitor ? merge(stdout$, stderr$) : of(null),
    merge(close$, error$),
  ]).pipe(
    map(() => ({ success: true })),
    catchError(() => of({ success: false })),
    first()
  );
};

export default async function runExecutor(options: TestExecutorSchema) {
  logger.info(`Executing "test"...`);
  logger.info(`Options: ${JSON.stringify(options, null, 2)}`);

  return fromCommand(
    `cd ${options.projectPath} && anchor test`,
    options.monitor
  ).toPromise();
}
