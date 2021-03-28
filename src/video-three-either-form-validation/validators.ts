import * as O from 'fp-ts/lib/Option'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/function'

/**
 * Returns a E.left value if empty,
 * and a E.right if the value is not empty.
 */
export const nonEmpty = <T>(
  error: string,
  a: O.Option<T>,
): E.Either<Array<string>, T> => {
  return O.isNone(a) ? E.left([error]) : E.right(a.value)
}

/**
 * Returns a E.left value if the value supplied isn't atleast 6 characters long,
 * and a E.right if the value is 6 characters or longer.
 */
export const minLength = (
  strOpt: O.Option<string>,
): Either<Array<string>, string> =>
  pipe(
    strOpt,
    O.chain(O.fromPredicate((s) => s.length >= 6)),
    O.fold(
      () => E.left(['at least 6 characters']),
      (s) => E.right(s),
    ),
  )

/**
 * Returns a E.left value if the value supplied doesn't contain a single captial letter,
 * and a E.right if the value has atleast one captial letter.
 */
export const oneCapital = (
  strOpt: O.Option<string>,
): Either<Array<string>, string> =>
  pipe(
    strOpt,
    O.chain(O.fromPredicate((s) => /[A-Z]/g.test(s))),
    O.fold(
      () => E.left(['at least one capital letter']),
      (s) => E.right(s),
    ),
  )

/**
 * Returns a E.left value if the value supplied doesn't contain at least one number,
 * and a E.right if the value has atleast one number.
 */
export const oneNumber = (
  strOpt: O.Option<string>,
): Either<Array<string>, string> =>
  pipe(
    strOpt,
    O.chain(O.fromPredicate((s) => /[0-9]/g.test(s))),
    O.fold(
      () => E.left(['at least one number']),
      (s) => E.right(s),
    ),
  )
