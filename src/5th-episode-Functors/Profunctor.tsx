import React from 'react'
import { pipe, identity } from 'fp-ts/function'
import * as R from 'fp-ts/Reader'

interface UserProfile {
  handle: string
  email: string
  createdAt: string
}

export const ProfunctorExample = () => {
  // promap: <E, A, D, B>(f: (d: D) => E, g: (a: A) => B) => (fea: R.Reader<E, A>) => R.Reader<D, B>
  // (a) => g(fea(f(a)))
  const promap = R.promap

  const foo: UserProfile = {
    handle: '@hello',
    email: 'foo@example.com',
    createdAt: '2021-10-04T16:46:23.560875Z',
  }

  const isHandleLongEnough = (config: UserProfile) =>
    pipe(
      config,
      promap(
        // f: (d: D) => E
        (c: UserProfile) => ({ ...c, handle: c.handle + 'friend' }),
        // g: (a: A) => B
        (n: number) => n >= 12,
        // => (fea: R.Reader<E, A>)
      )((c: UserProfile) => c.handle.length),
      // => R.Reader<D, B>
      identity,
    )

  return (
    <h3>is handle long enough? {isHandleLongEnough(foo) ? 'yes' : 'no'}</h3>
  )
}
