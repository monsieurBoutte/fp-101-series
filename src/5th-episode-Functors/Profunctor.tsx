import React from 'react'
import { pipe, identity } from 'fp-ts/function'
import { pipeable } from 'fp-ts/pipeable'
import * as R from 'fp-ts/Reader'

export const ProfunctorExample = () => {
  //promap: <E, A, D, B>(f: (d: D) => E, g: (a: A) => B) => (fbc: R.Reader<E, A>) => R.Reader<D, B>
  const { promap } = pipeable(R.Profunctor)

  const handle = '@hello'

  const isLongEnough = (name: string) =>
    pipe(
      name,
      promap(
        // f: (d: D) => E
        (s: string) => s + 'friend',
        // g: (a: A) => B
        (n: number) => n >= 12,
        // => (fbc: R.Reader<E, A>)
      )((s: string) => s.length),
      // => R.Reader<D, B>
      identity,
    )

  return <h3>is handle long enough? {isLongEnough(handle) ? 'yes' : 'no'}</h3>
}
