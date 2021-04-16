import React from 'react'
import * as TE from 'fp-ts/TaskEither'
import * as D from 'io-ts/Decoder'
import * as E from 'fp-ts/Either'
import * as O from 'fp-ts/Option'
import * as A from 'fp-ts/Array'
import { flow, pipe } from 'fp-ts/function'

const LIST_ALL_PEOPLE_URL = 'https://swapi.dev/api/people'
const PERSON_COUNT = 10

export const TaskEitherExample = () => {
  // Create state to help manage TaskEither lifecycle
  const [matchPeople, getPeople, clearPeople] = useTaskEither<
    Error,
    PeoplePayload
  >(600)
  const [person, setPerson] = React.useState<O.Option<Person>>(O.none)
  const [page, setPage] = React.useState(1)
  const back = React.useCallback(() => setPage((x) => Math.max(x - 1, 1)), [])
  const forward = React.useCallback(
    () => setPage((x) => Math.max(x + 1, 0)),
    [],
  )

  React.useEffect(
    () =>
      pipe(
        TE.fromIO<Error, void>(clearPeople),
        TE.chain(() =>
          makeRequest(createPeopleUrl(page), peoplePayloadDecoder),
        ),
        getPeople,
      ),
    [page],
  )

  return (
    <section>
      {matchPeople(
        renderNone,
        renderLoading,
        renderError,
        ({ count, results: people }) =>
          pipe(
            person,
            O.match(
              () => {
                const start = Math.min(page * PERSON_COUNT, count)
                const end = Math.min(page * PERSON_COUNT + people.length, count)

                return (
                  <>
                    <PersonList
                      people={people}
                      selectPerson={flow(O.some, setPerson)}
                    />

                    <footer>
                      <p>
                        Showing {start}-{end} of {count}
                      </p>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <button disabled={page === 1} onClick={back}>
                          Back
                        </button>
                        <button disabled={end === count} onClick={forward}>
                          Forward
                        </button>
                      </div>
                    </footer>
                  </>
                )
              },
              (person) => (
                <PersonView
                  key={person.name}
                  person={person}
                  goBack={() => setPerson(O.none)}
                />
              ),
            ),
          ),
      )}
    </section>
  )
}

const createPeopleUrl = (page: number) => {
  const url = new URL(LIST_ALL_PEOPLE_URL)

  url.searchParams.set('page', page.toString())

  return url.toString()
}

type PersonListProps = {
  people: Array<Person>
  selectPerson: (person: Person) => void
}

/**
 * A list of people
 */
const PersonList = ({ people, selectPerson }: PersonListProps) => (
  <>
    <h1>Star Wars Characters</h1>

    <ul>
      {people.map((person) => (
        <li>
          <PersonName
            key={person.name}
            person={person}
            onClick={() => selectPerson(person)}
          />
        </li>
      ))}
    </ul>
  </>
)

type PersonNameProps = {
  person: Person
  onClick: () => void
}

/**
 * A component just for putting a person's name in a <p> tag
 */
const PersonName = ({ person, onClick }: PersonNameProps) => (
  <p onClick={onClick}>{person.name}</p>
)

/**
 * Our view of a single person that has been selected from the list
 */
const PersonView = ({ person, goBack }: PersonViewProps) => {
  // Create a place to track a person's films
  const [matchFilms, getFilms] = useTaskEither<Error, ReadonlyArray<Film>>(600)

  React.useEffect(() => {
    // Give the ability to cancel our requests
    const controller = new AbortController()

    pipe(
      person.films,
      A.map((filmUrl) => makeRequest(filmUrl, filmDecoder, controller.signal)),
      TE.sequenceArray,
      getFilms,
    )

    // When person changes we will cancel the previous requests
    return () => controller.abort()
  }, [person])

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button style={{ marginRight: '1rem' }} onClick={goBack}>
          {'<-'}
        </button>
        <h2>{person.name}</h2>
      </div>

      {matchFilms(renderNone, renderLoading, renderError, (films) => (
        <ul>
          {films.map((film) => (
            <li key={film.episode_id}>{film.title}</li>
          ))}
        </ul>
      ))}
    </>
  )
}

type PersonViewProps = {
  readonly person: Person
  readonly goBack: () => void
}

// Really basic rendering helpers
const renderNone = () => null
const renderError = (error: Error) => <section>{error.message}</section>
const renderLoading = () => <p>Loading...</p>

/**
 * Constructs a TaskEither that is capable of making a GET request that
 * will use the provided Decoder to validate the current type. Optionally
 * and AbortSignal can be passed along to support cancelation of the fetch request.
 */
function makeRequest<A>(
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

/**
 * Constructs React state for managing the lifecycle of a TaskEither with
 * the ability to pattern match over all of its states. Using the given timeToLoad
 * we can ensure that the user is able to see the process of loading ocurring.
 */
function useTaskEither<E, A>(timeToLoad: number) {
  const [value, setValue] = React.useState<Option<Either<E, A>>>(O.none)
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const run = React.useCallback((te: TE.TaskEither<E, A>) => {
    const start = performance.now()

    const task = pipe(
      TE.fromTask<E, void>(async () => setIsLoading(true)),
      TE.chain(() => te),
      TE.chainFirstTaskK(() => () =>
        new Promise((resolve) =>
          setTimeout(resolve, timeToLoad - (performance.now() - start)),
        ),
      ),
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
    [value, isLoading],
  )

  const clear = React.useCallback(() => setValue(O.none), [])

  return [match, run, clear] as const
}

const filmDecoder = D.struct({
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

const peopleDecoder = D.struct({
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
  return D.struct({
    count: D.number,
    next: D.nullable(D.string),
    previous: D.nullable(D.string),
    results: decoder,
  })
}

const peoplePayloadDecoder = starwarsPayload(
  pipe(D.array(peopleDecoder), D.refine(A.isNonEmpty, 'NonEmptyArray')),
)

export type PeoplePayload = D.TypeOf<typeof peoplePayloadDecoder>
