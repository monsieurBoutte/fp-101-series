/**
 * The two most common ADT types are "product" and "sum".
 * Whether or not the data type is a product or sum can be derived
 * by counting the "inhabitants" or (values) of a given type.
 */

// ******* Option ********
type Option<A> = { _tag: 'None' } | { _tag: 'Some'; value: A }

// ******* Either ********
//#region Either
interface Left<E> {
  readonly _tag: 'Left'
  readonly left: E
}

interface Right<A> {
  readonly _tag: 'Right'
  readonly right: A
}

type Either<E, A> = Left<E> | Right<A>
//#endregion

// ******* Remote Data ********
//#region Remote Data
type RemoteProgress = {
  readonly loaded: number
  readonly total: Option<number>
}

type RemoteInitial = {
  readonly _tag: 'RemoteInitial'
}

type RemotePending = {
  readonly _tag: 'RemotePending'
  readonly progress: Option<RemoteProgress>
}

type RemoteFailure<E> = {
  readonly _tag: 'RemoteFailure'
  readonly error: E
}

type RemoteSuccess<A> = {
  readonly _tag: 'RemoteSuccess'
  readonly value: A
}

// reference: https://github.com/devexperts/remote-data-ts/blob/master/src/remote-data.ts#L68
type RemoteData<E, A> =
  | RemoteInitial
  | RemotePending
  | RemoteFailure<E>
  | RemoteSuccess<A>
//#endregion

//#region Product Type example
type Hour = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
type Period = 'AM' | 'PM'
type Clock = [Hour, Period]

// The Clock type has 12 * 2 = 24 inhabitants.
//#endregion
