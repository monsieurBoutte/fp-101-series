import React from 'react'
import * as O from 'fp-ts/Option'
import * as E from 'fp-ts/Either'

import { pipe } from 'fp-ts/function'

export const ADTsComponent = () => {
  const [avatarOpt, setAvatarOpt] = React.useState<O.Option<string>>(O.none)

  // todo - show example of O.map
  // todo - show example of O.chain
  // todo - show example of O.fromPredicate
  // todo - show example of O.getOrElse

  // todo - show example of E.map
  // todo - show example of E.mapLeft
  // todo - show example of E.chain
  // todo - show example of E.fromPredicate
  // todo - show example of E.fold
  return (
    <>
      <code>{`Option<string>`}</code>
      <pre>{JSON.stringify(avatarOpt, null, 2)}</pre>
    </>
  )
}
