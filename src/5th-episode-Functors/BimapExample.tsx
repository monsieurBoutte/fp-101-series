import React from 'react'
import { pipe } from 'fp-ts/function'
import * as E from 'fp-ts/Either'

export const BimapExample = () => {
  const leftValue = E.left('invalid form')
  const rightValue = E.right(6)
  const [formValidation, setFormValidation] = React.useState<
    E.Either<string, number>
  >(rightValue)

  return pipe(
    formValidation,
    E.bimap(
      // onLeft i.e. error channel
      (errorMessage) => errorMessage.toUpperCase(),
      // onRight i.e. success channel
      (num) => num * 2,
    ),
    E.match(
      // onLeft i.e. error channel
      (errorMessage) => (
        <h3>
          uh oh{' '}
          <span role="img" aria-label="screaming cat">
            🙀
          </span>{' '}
          {errorMessage}
        </h3>
      ),
      // onRight i.e. success channel
      (num) => <h3>validated form with value: {num}</h3>,
    ),
  )
}
