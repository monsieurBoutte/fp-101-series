import * as D from 'io-ts/Decoder'

type User = {
  id: number
  email: string
  first_name: string
  last_name: string
  avatar?: string
}

export const FetchUserPayload = D.type({
  data: D.type({
    id: D.number,
    email: D.string,
    first_name: D.string,
    last_name: D.string,
    avatar: D.nullable(D.string),
  }),
})

export type FetchUserPayloadDecoded = D.TypeOf<typeof FetchUserPayload>
