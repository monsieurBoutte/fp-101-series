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
  id: 6,
  account_balance: 60000,
  first_name: 'Jane',
  last_name: 'Doe',
  email: 'janeDoe@example.com',
  favorite_quote:
    'Almost always, the creative dedicated minority has made the world better',
}

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

    //#region Jane's assertion
    // const janesOperation = pipe(
    //   userJaneOpt,
    //   O.chain((x) => O.fromNullable(x.favorite_quote)),
    //   O.map((x) => x.toLocaleUpperCase()),
    //   O.map((x) => `'${x}' - MLK`),
    // )
    // expect(janesOperation).to.be.eql(O.some('foo'))
    //#endregion

    //#region John's assertion
    // const johnsOperation = pipe(
    //   userJohnOpt,
    //   O.chain((x) => O.fromNullable(x.favorite_quote)),
    //   O.map((x) => x.toLocaleUpperCase()),
    //   O.map((x) => `'${x}' - MLK`),
    // )
    // expect(johnsOperation).to.be.eql(O.some('foo'))
    //#endregion
  })
})

describe('Apply', () => {
  it('can handle sequential composition with an ADTs Applicative implementation', () => {
    const userJohnOpt = O.some(johnDoe)
    const userJaneOpt = O.some(janeDoe)

    //#region Applicative test
    // const sequenceOptionStruct = Ap.sequenceS(O.Applicative)

    // const assertion = pipe(
    //   sequenceOptionStruct({
    //     johnsQuote: pipe(
    //       userJohnOpt,
    //       quoteOpt,
    //       // O.getOrElse(() => 'default quote'),
    //       // O.some,
    //     ),
    //     janesQuote: pipe(userJaneOpt, quoteOpt),
    //   }),
    // )
    // expect(assertion).to.be.eql(O.some('foo'))
    //#endregion
  })

  it.only('can handle parallel composition where the provided ADT supports it', () => {
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
