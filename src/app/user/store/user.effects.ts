import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { switchMap, map, catchError } from 'rxjs/operators';
import { UserProxyService } from '@user/services/user-proxy.service';

import * as actions from './user.actions';
import { ESnackbarActions, ESnackbarMessages } from '@common/enums';

@Injectable()
export class UserEffects {
  public constructor(
    private readonly _actions$: Actions,
    private readonly _userProxy: UserProxyService,
    private readonly _snackbar: MatSnackBar,
    private readonly _router: Router
  ) {}

  public loginEffect$ = createEffect(() =>
    this._actions$.pipe(
      ofType<ReturnType<typeof actions.loginRequest>>(actions.loginRequest),
      switchMap((action) =>
        this._userProxy.login(action.payload.email, action.payload.password).pipe(
          map((response: any) => response.args),
          map((user) => actions.loginSuccess({ payload: { user } })),
          catchError((error: HttpErrorResponse) =>
            of(actions.loginError({ payload: { error } }))
          )
        )
      )
    )
  );

  public patchUser = createEffect(() =>
    this._actions$.pipe(
      ofType<ReturnType<typeof actions.patchUserRequest>>(
        actions.patchUserRequest
      ),
      map((action) =>
        actions.patchUserSuccess({ payload: { user: action.payload.user } })
      ),
    )
  );

  public patchSuccess$ = createEffect(
    () =>
      this._actions$.pipe(
        ofType<ReturnType<typeof actions.patchUserSuccess>>(actions.patchUserSuccess),
        map(() =>
          this._snackbar.open(
            ESnackbarMessages.PatchSuccess,
            ESnackbarActions.Close
          )
        ),
        map(() => this._router.navigate(['/']))
      ),
    { dispatch: false }
  );

  public loginSuccess$ = createEffect(
    () =>
      this._actions$.pipe(
        ofType<ReturnType<typeof actions.loginSuccess>>(actions.loginSuccess),
        map(() =>
          this._snackbar.open(
            ESnackbarMessages.LoginSuccess,
            ESnackbarActions.Close
          )
        ),
        map(() => this._router.navigate(['/']))
      ),
    { dispatch: false }
  );

  public loginError$ = createEffect(
    () =>
      this._actions$.pipe(
        ofType<ReturnType<typeof actions.loginError>>(actions.loginError),
        map((action) => {
          const statusCode: string = action.payload.error.status.toString();

          if (statusCode.startsWith('4'))
            this._snackbar.open(
              ESnackbarMessages.ClientError,
              ESnackbarActions.Close
            );

          if (statusCode.startsWith('5'))
            this._snackbar.open(
              ESnackbarMessages.ServerError,
              ESnackbarActions.Close
            );
        })
      ),
    { dispatch: false }
  );
}
