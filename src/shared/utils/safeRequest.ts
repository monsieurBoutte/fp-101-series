import * as D from 'io-ts/Decoder'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/function'
import { get } from '@contactlab/appy'
import { withBody } from '@contactlab/appy/combinators/body'
import { withHeaders } from '@contactlab/appy/combinators/headers'
import {
  withDecoder,
  Decoder,
  toDecoder,
} from '@contactlab/appy/combinators/decoder'

export type RequestStatus = 'idle' | 'loading' | 'error' | 'success'

type Config<T> = {
  url: string
  decoder: D.Decoder<unknown, T>
}

const fromIots = <A>(d: D.Decoder<unknown, A>): Decoder<A> =>
  toDecoder(d.decode, (e) => new Error(D.draw(e)))

export const safeRequest = <T>(config: Config<T>) =>
  pipe(get, withDecoder(fromIots(config.decoder)))(config.url)
