import React from 'react'
import { pipe } from 'fp-ts/function'
import * as O from 'fp-ts/Option'

export const MapExample = () => {
  const noValue = O.none
  const someValue = O.some('Elliot')
  const [nameOption, setNameOption] = React.useState<O.Option<string>>(
    someValue,
  )

  return pipe(
    nameOption,
    O.map((name) => <h2>my name is {name.toUpperCase()}!</h2>),
    O.toNullable,
  )
}
