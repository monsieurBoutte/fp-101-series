import { expect } from 'chai'

import * as Ap from 'fp-ts/Apply'
import * as O from 'fp-ts/Option'
import * as T from 'fp-ts/Task'
import { pipe } from 'fp-ts/function'

import type { User } from 'src/shared/types/user.types'

type UserProfile = User & {
  account_balance: number
  favorite_quote?: string
}

const johnDoe: UserProfile = {
  id: 6,
  account_balance: 30000,
  first_name: 'John',
  last_name: 'Doe',
  email: 'johnDoe@example.com',
  avatar: 'example-photos.com/johnsAvatarPhoto',
}

const janeDoe: UserProfile = {
  id: 7,
  account_balance: 60000,
  first_name: 'Jane',
  last_name: 'Doe',
  email: 'janeDoe@example.com',
  favorite_quote:
    'Almost always, the creative dedicated minority has made the world better',
}

const quoteOpt = (userOpt: O.Option<UserProfile>) =>
  pipe(
    userOpt,
    O.chain((x) => O.fromNullable(x.favorite_quote)),
    O.map((x) => x.toLocaleUpperCase()),
    O.map((x) => `'${x}' - MLK`),
  )

describe('Option', () => {
  it("can map values via it's Functor implementation", () => {
    const userOpt = O.some(johnDoe)

    expect(
      pipe(
        userOpt,
        O.map((x) => x.account_balance + 100),
      ),
    ).to.be.eql(O.some(30100))

    expect(
      pipe(
        userOpt,
        O.map((x) => `${x.first_name} ${x.last_name}`),
        O.map((x) => x.toLocaleUpperCase()),
      ),
    ).to.be.eql(O.some('JOHN DOE'))
  })

  it("can chain operations via it's Chain implementation", () => {
    const userJohnOpt = O.some(johnDoe)
    const userJaneOpt = O.some(janeDoe)

    const expected =
      "'ALMOST ALWAYS, THE CREATIVE DEDICATED MINORITY HAS MADE THE WORLD BETTER' - MLK"

    //#region Jane's assertion
    expect(quoteOpt(userJaneOpt)).to.be.eql(O.some(expected))
    //#endregion

    //#region John's assertion
    expect(quoteOpt(userJohnOpt)).to.be.eql(O.none)
    //#endregion
  })
})

describe('Apply', () => {
  it('can handle sequential composition with an ADTs Applicative implementation', () => {
    const userJohnOpt = O.some(johnDoe)
    const userJaneOpt = O.some(janeDoe)

    const expected =
      "'ALMOST ALWAYS, THE CREATIVE DEDICATED MINORITY HAS MADE THE WORLD BETTER' - MLK"

    //#region Applicative test
    const sequenceOptionStruct = Ap.sequenceS(O.Applicative)

    const assertion = pipe(
      sequenceOptionStruct({
        johnsQuote: pipe(
          userJohnOpt,
          quoteOpt,
          O.getOrElse(() => 'default quote'),
          O.some,
        ),
        janesQuote: pipe(userJaneOpt, quoteOpt),
      }),
      (x) => x,
      O.map((people) => ({
        ...people,
        johnsQuote: people.johnsQuote.toLocaleUpperCase(),
      })),
    )
    expect(assertion).to.be.eql(
      O.some({
        janesQuote: expected,
        johnsQuote: 'DEFAULT QUOTE',
      }),
    )
    //#endregion
  })

  it('can handle parallel composition where the provided ADT supports it', () => {
    const sequentialExample = Ap.sequenceT(T.ApplicativeSeq)(
      T.delay(100)(T.of(1)),
      T.delay(100)(T.of(2)),
      T.delay(100)(T.of(3)),
    )().then((x) => x)
    // will evaluate in ~300ms

    const parallelExample = Ap.sequenceT(T.ApplicativePar)(
      T.delay(100)(T.of(1)),
      T.delay(100)(T.of(2)),
      T.delay(100)(T.of(3)),
    )().then((x) => x)
    // will evaluate in ~100ms
  })
})
