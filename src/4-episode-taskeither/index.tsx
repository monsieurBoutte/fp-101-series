import React from 'react'
import * as TE from 'fp-ts/TaskEither'
import * as D from 'io-ts/Decoder'
import * as E from 'fp-ts/Either'
import * as O from 'fp-ts/Option'
import * as A from 'fp-ts/Array'
import { pipe, tupled } from 'fp-ts/function'
import type { NonEmptyArray } from 'fp-ts/lib/NonEmptyArray'
import { sequenceT } from 'fp-ts/lib/Apply'
import * as RA from 'fp-ts/ReadonlyArray'

const LIST_ALL_PEOPLE_URL = 'https://swapi.dev/api/people'

export function makeRequest<A>(
  url: string,
  decoder: D.Decoder<unknown, A>,
): TE.TaskEither<Error, A> {
  return TE.tryCatch(
    async () => {
      const response = await fetch(url)
      const result = await response.json()
      const decoded = decoder.decode(result)

      if (E.isLeft(decoded)) {
        throw new TypeError(D.draw(decoded.left))
      }

      return decoded.right
    },
    (error): Error =>
      error instanceof Error ? error : new Error(JSON.stringify(error)),
  )
}

export function useTaskEither<E, A>() {
  const [value, setValue] = React.useState<Option<Either<E, A>>>(O.none)
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const run = React.useCallback((te: TE.TaskEither<E, A>) => {
    setIsLoading(true)

    const task = pipe(
      te,
      TE.chainFirst(() => TE.fromIO(() => setIsLoading(false))),
    )

    task().then((either) => pipe(either, O.some, setValue))
  }, [])

  return [value, isLoading, run] as const
}

const filmDecoder = D.type({
  title: D.string,
  episode_id: D.number,
  opening_crawl: D.string,
  director: D.string,
  producer: D.string,
  release_date: D.string,
  planets: D.array(D.string),
  characters: D.array(D.string),
  species: D.array(D.string),
  vehicles: D.array(D.string),
  created: D.string,
  edited: D.string,
  url: D.string,
})
type Film = D.TypeOf<typeof filmDecoder>

const peopleDecoder = D.type({
  name: D.string,
  height: D.nullable(D.string),
  gender: D.nullable(D.string),
  homeworld: D.string,
  species: D.array(D.string),
  vehicles: D.array(D.string),
  hair_color: D.nullable(D.string),
  skin_color: D.nullable(D.string),
  eye_color: D.nullable(D.string),
  birth_year: D.nullable(D.string),
  films: D.array(D.string),
})
type Person = D.TypeOf<typeof peopleDecoder>

function starwarsPayload<A>(
  decoder: D.Decoder<unknown, A>,
): D.Decoder<
  unknown,
  {
    count: number
    next: string | null
    previous: string | null
    results: A
  }
> {
  return D.type({
    count: D.number,
    next: D.nullable(D.string),
    previous: D.nullable(D.string),
    results: decoder,
  })
}

const PersonPayloadDecoder = starwarsPayload(
  pipe(D.array(peopleDecoder), D.refine(A.isNonEmpty, 'NonEmptyArray')),
)
type PersonPayload = D.TypeOf<typeof PersonPayloadDecoder>

const FilmPayloadDecoder = starwarsPayload(filmDecoder)
type FilmPayload = D.TypeOf<typeof FilmPayloadDecoder>

const renderError = (error: Error) => <section>{error.message}</section>

const renderLoading = () => <span>Loading...</span>

function randomItem<A>(array: NonEmptyArray<A>): A {
  const index = Math.floor(length * Math.random())

  return array[index]
}

export const TaskEitherExample = () => {
  const [person, personIsLoading, runPersonRequest] = useTaskEither<
    Error,
    { person: Person; films: Array<Film> }
  >()

  console.log(person, personIsLoading)

  React.useEffect(
    () =>
      pipe(
        TE.Do,
        TE.bind('person', () =>
          pipe(
            makeRequest(LIST_ALL_PEOPLE_URL, PersonPayloadDecoder),
            TE.map((r) => randomItem(r.results)),
          ),
        ),
        TE.bind('films', ({ person }) =>
          TE.sequenceArray(
            pipe(
              person.films,
              A.map((filmUrl) => makeRequest(filmUrl, filmDecoder)),
            ),
          ),
        ),
        runPersonRequest,
      ),
    [],
  )

  return (
    <div>
      {pipe(
        person,
        O.match(
          renderLoading,
          E.match(renderError, ({ films }) => <li>{films[0].title}</li>),
        ),
      )}
    </div>
  )
}
