import React from 'react'
import * as O from 'fp-ts/Option'
import * as E from 'fp-ts/Either'
import * as A from 'fp-ts/Array'
import * as Ap from 'fp-ts/Apply'

import { pipe } from 'fp-ts/function'

import { nonEmpty, minLength, oneCapital, oneNumber } from './validators'
import './either-form.css'

export const EitherFormValidation = () => {
  const [emailOpt, setEmailOpt] = React.useState<O.Option<string>>(O.none)
  const [pwOpt, setPwOpt] = React.useState<O.Option<string>>(O.none)
  const [validationErrors, setValidationErrors] = React.useState<
    O.Option<Array<string>>
  >(O.none)

  const applicativeValidation = E.getValidation(A.getMonoid<string>())
  const sequencedValidation = Ap.sequenceT(applicativeValidation)
  const validateInputField = (
    emptyErrorMessage: string,
    strOpt: O.Option<string>,
  ) =>
    pipe(
      // run all validation checks in parallel
      sequencedValidation(
        nonEmpty(emptyErrorMessage, strOpt),
        minLength(strOpt),
        oneCapital(strOpt),
        oneNumber(strOpt),
      ),
      // pull out the first value
      E.map(([s]) => s),
    )

  // parallel operations
  const handleFormValidation = () =>
    pipe(
      sequencedValidation(
        validateInputField('email cannot be empty', emailOpt),
        validateInputField('password cannot be empty', pwOpt),
      ),
      E.fold(
        (errs) => setValidationErrors(O.some(errs)),
        ([email, password]) => {
          console.log(
            `%c validatedform -> ${JSON.stringify(
              { email, password },
              null,
              1,
            )}`,
            `background: #7f2bff; color: #fff; padding: 4px; border-radius: 2px;`,
          )
          setValidationErrors(O.none)
        },
      ),
    )

  // fail-fast
  const doFormValidation = () =>
    pipe(
      E.Do,
      E.bind('email', () =>
        validateInputField('email cannot be empty', emailOpt),
      ),
      E.apS('password', validateInputField('password cannot be empty', pwOpt)),
      E.fold(
        (errs) => setValidationErrors(O.some(errs)),
        ({ email, password }) => {
          console.log(
            `%c validatedform -> ${JSON.stringify(
              { email, password },
              null,
              1,
            )}`,
            `background: #7f2bff; color: #fff; padding: 4px; border-radius: 2px;`,
          )
          setValidationErrors(O.none)
        },
      ),
    )

  return (
    <div className="grid-container">
      <div>
        <label htmlFor="email" className="input-label">
          Email
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="email"
            id="email"
            className="input-field"
            placeholder="you@example.com"
            onChange={(e) =>
              setEmailOpt(
                e.target.value !== '' ? O.some(e.target.value) : O.none,
              )
            }
            value={pipe(emailOpt, O.toUndefined)}
          />
        </div>
        <label htmlFor="pw" className="input-label">
          Password
        </label>
        <div className="mt-1">
          <input
            type="password"
            name="pw"
            id="pw"
            className="input-field"
            placeholder="🙈 🙊 🙉"
            onChange={(e) =>
              setPwOpt(e.target.value !== '' ? O.some(e.target.value) : O.none)
            }
            value={pipe(pwOpt, O.toUndefined)}
          />
        </div>
        <button
          type="button"
          className="form-btn"
          onClick={() => doFormValidation()}
        >
          Submit
        </button>
      </div>
      <div>
        <label
          htmlFor="errors"
          className="input-label"
          style={{
            color: O.isNone(validationErrors)
              ? 'rgb(0, 255, 179, 1)'
              : 'rgb(206, 20, 88, 1)',
          }}
        >
          Validation Errors
        </label>
        <pre
          className="validation-output"
          style={{
            borderColor: O.isNone(validationErrors)
              ? 'rgb(0, 255, 179, 1)'
              : 'rgb(206, 20, 88, 1)',
            color: O.isNone(validationErrors)
              ? 'rgb(0, 255, 179, 1)'
              : 'rgb(206, 20, 88, 1)',
          }}
        >
          {JSON.stringify(validationErrors, null, 2)}
        </pre>
      </div>
    </div>
  )
}
