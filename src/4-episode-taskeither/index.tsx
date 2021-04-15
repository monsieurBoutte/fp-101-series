import React from 'react'
import * as TE from 'fp-ts/TaskEither'
import * as D from 'io-ts/Decoder'
import * as E from 'fp-ts/Either'
import * as O from 'fp-ts/Option'
import * as A from 'fp-ts/Array'
import { flow, pipe } from 'fp-ts/function'
import type { NonEmptyArray } from 'fp-ts/lib/NonEmptyArray'

const LIST_ALL_PEOPLE_URL = 'https://swapi.dev/api/people'

export function makeRequest<A>(
  url: string,
  decoder: D.Decoder<unknown, A>,
  signal?: AbortSignal,
): TE.TaskEither<Error, A> {
  return TE.tryCatch(
    async () => {
      const response = await fetch(url, { signal })
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

  const match = React.useCallback(
    <B, C, D, F>(
      onNone: () => B,
      onLoading: () => C,
      onError: (error: E) => D,
      onSuccess: (value: A) => F,
    ) =>
      pipe(
        value,
        O.matchW(
          () => (isLoading ? onLoading() : onNone()),
          E.matchW(onError, onSuccess),
        ),
      ),
    [],
  )

  return [match, run] as const
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

const peoplePayloadDecoder = starwarsPayload(
  pipe(D.array(peopleDecoder), D.refine(A.isNonEmpty, 'NonEmptyArray')),
)
type PersonPayload = D.TypeOf<typeof peoplePayloadDecoder>

const FilmPayloadDecoder = starwarsPayload(filmDecoder)
type FilmPayload = D.TypeOf<typeof FilmPayloadDecoder>

const renderNone = () => null
const renderError = (error: Error) => <section>{error.message}</section>

const renderLoading = () => <span>Loading...</span>

function randomItem<A>(array: NonEmptyArray<A>): A {
  const index = Math.floor(length * Math.random())

  return array[index]
}

type TaskEitherExampleProps = {}

export const TaskEitherExample = ({}: TaskEitherExampleProps) => {
  // Create state to help manage TaskEither lifecycle
  const [matchPeople, getPeople] = useTaskEither<Error, Array<Person>>()
  const [person, setPerson] = React.useState<O.Option<Person>>(O.none)

  React.useEffect(() =>
    pipe(
      makeRequest(LIST_ALL_PEOPLE_URL, peoplePayloadDecoder),
      TE.map((r) => r.results),
      getPeople,
    ),
  )

  return (
    <section>
      {matchPeople(renderNone, renderLoading, renderLoading, (people) =>
        pipe(
          person,
          O.match(
            () => (
              <PersonGrid
                people={people}
                selectPerson={flow(O.some, setPerson)}
              />
            ),
            (person) => <PersonView person={person} />,
          ),
        ),
      )}
    </section>
  )
}

type PersonGridProps = {
  people: Array<Person>
  selectPerson: (person: Person) => void
}

const PersonGrid = (props: PersonGridProps) => <div></div>

type PersonProps = {
  readonly person: Person
}

type PersonData = {
  readonly films: ReadonlyArray<Film>
}

const PersonView = ({ person }: PersonProps) => {
  // Create a place to
  const [matchData, getData] = useTaskEither<Error, PersonData>()

  React.useEffect(() => {
    const controller = new AbortController()

    pipe(
      TE.Do,
      TE.apS(
        'films',
        pipe(
          person.films,
          A.map((filmUrl) =>
            makeRequest(filmUrl, filmDecoder, controller.signal),
          ),
          TE.sequenceArray,
        ),
      ),
      getData,
    )

    return () => controller.abort()
  }, [person])

  return (
    <section>
      {matchData(
        () => null,
        renderLoading,
        renderError,
        ({ films }) => (
          <ul>
            {films.map((film) => (
              <li>{film.title}</li>
            ))}
          </ul>
        ),
      )}
    </section>
  )
}
