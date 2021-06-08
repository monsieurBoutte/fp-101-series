import React from 'react'
import { pipe, identity } from 'fp-ts/function'
import * as R from 'fp-ts/Reader'

interface UserConfig {
  handle: string
  email: string
}

export const ProfunctorExample = () => {
  // promap: <E, A, D, B>(f: (d: D) => E, g: (a: A) => B) => (fea: R.Reader<E, A>) => R.Reader<D, B>
  const promap = R.promap

  const foo: UserConfig = {
    handle: '@hello',
    email: 'foo@example.com',
  }

  const isHandleLongEnough = (config: UserConfig) =>
    pipe(
      config,
      promap(
        // f: (d: D) => E
        (c: UserConfig) => ({ ...c, handle: c.handle + 'friend' }),
        // g: (a: A) => B
        (n: number) => n >= 12,
        // => (fea: R.Reader<E, A>)
      )((c: UserConfig) => c.handle.length),
      // => R.Reader<D, B>
      identity,
    )

  return (
    <h3>is handle long enough? {isHandleLongEnough(foo) ? 'yes' : 'no'}</h3>
  )
}
