import React from 'react'
import * as TE from 'fp-ts/TaskEither'
import * as D from 'io-ts/Decoder'
import * as E from 'fp-ts/Either'
import * as O from 'fp-ts/Option'
import * as A from 'fp-ts/Array'
import { flow, pipe } from 'fp-ts/function'
import type { Task } from 'fp-ts/lib/Task'

import './styles.css'

const LIST_ALL_PEOPLE_URL = 'https://swapi.dev/api/people'
const PERSON_COUNT = 10

/**
 * TaskEither example using fetch requests and the Star Wars API. It requests
 * 10 people at a time allowing for you to paginate through all 82 people.
 */
export const TaskEitherExample = () => {
  // Create state to help manage TaskEither lifecycle
  const [matchPeople, getPeople] = useTaskEither<Error, PeoplePayload>(600)
  // Track the currently selected person
  const [person, setPerson] = React.useState<O.Option<Person>>(O.none)
  // Track the current page for pagination
  const [page, setPage] = React.useState(1)
  // Go back, but no less than 1
  const back = React.useCallback(() => setPage((x) => Math.max(x - 1, 1)), [])
  // Go forwards
  const forward = React.useCallback(
    () => setPage((x) => Math.max(x + 1, 0)),
    [],
  )

  // Request for people given the page that we are currently on
  React.useEffect(
    () => getPeople(makeRequest(createPeopleUrl(page), peoplePayloadDecoder)),
    [page],
  )

  return (
    <section>
      <h1>Star Wars {O.isSome(person) ? 'Films' : 'Characters'}</h1>

      {matchPeople(
        renderNone,
        renderLoading,
        renderError,
        ({ count, results: people }, isLoading) =>
          pipe(
            person,
            O.match(
              () => {
                // Determine the range of values
                const start = Math.min(page * PERSON_COUNT, count)
                const end = Math.min(start + people.length, count)

                return (
                  <>
                    <section className="PersonSection">
                      {isLoading ? (
                        renderLoading()
                      ) : (
                        <PersonList
                          people={people}
                          selectPerson={flow(O.some, setPerson)}
                        />
                      )}
                    </section>

                    <footer>
                      <p>
                        Showing{' '}
                        <span>
                          {start}-{end}
                        </span>{' '}
                        of {count}
                      </p>

                      <div className="Pagination">
                        <button
                          type="button"
                          className="Pagination__button Left"
                          disabled={page === 1}
                          onClick={back}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                              clip-rule="evenodd"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="Pagination__button Forward"
                          disabled={end === count}
                          onClick={forward}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clip-rule="evenodd"
                            />
                          </svg>
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

// Create a paginated people's URL
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
    <ul className="Container">
      {people.map((person) => (
        <li className="Tile" style={{ cursor: 'pointer' }}>
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
    <div className="FilmContent">
      <div className="Character">
        <svg
          className="GoBack"
          onClick={goBack}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 24c6.627 0 12-5.373 12-12s-5.373-12-12-12-12 5.373-12 12 5.373 12 12 12zm-1-17v4h8v2h-8v4l-6-5 6-5z" />
        </svg>
        <h2>{person.name}</h2>
      </div>

      {matchFilms(renderNone, renderLoading, renderError, (films) => (
        <ul className="Container">
          {films.map((film) => (
            <li className="Tile" key={film.episode_id}>
              {film.title}
            </li>
          ))}
        </ul>
      ))}
    </div>
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
      // Set Loading to true
      TE.fromIO<E, void>(() => setIsLoading(true)),
      // Run the provided TaskEither
      TE.chain(() => te),
      // Simulate a longer load time if required for user experience
      TE.chainFirstTaskK(() => delay(timeToLoad - (performance.now() - start))),
      // Set loading back to false
      TE.chainFirst(() => TE.fromIO(() => setIsLoading(false))),
    )

    // Run our task and then update our value with the Either
    task().then((either) => pipe(either, O.some, setValue))
  }, [])

  // Pattern match over all possible states
  const match = React.useCallback(
    <B, C, D, F>(
      onNone: () => B,
      onLoading: () => C,
      onError: (error: E, isLoading: boolean) => D,
      onSuccess: (value: A, isLoading: boolean) => F,
    ) =>
      pipe(
        value,
        O.matchW(
          () => (isLoading ? onLoading() : onNone()),
          E.matchW(
            (e) => onError(e, isLoading),
            (a) => onSuccess(a, isLoading),
          ),
        ),
      ),
    [value, isLoading],
  )

  return [match, run] as const
}

const delay = (ms: number): Task<void> => () =>
  new Promise((resolve) => setTimeout(resolve, ms))

const filmDecoder = D.type({
  title: D.string,
  episode_id: D.number,
  url: D.string,
})

type Film = D.TypeOf<typeof filmDecoder>

const peopleDecoder = D.type({
  name: D.string,
  films: D.array(D.string),
})

type Person = D.TypeOf<typeof peopleDecoder>

const peoplePayloadDecoder = D.type({
  count: D.number,
  results: pipe(
    D.array(peopleDecoder),
    D.refine(A.isNonEmpty, 'NonEmptyArray'),
  ),
})

export type PeoplePayload = D.TypeOf<typeof peoplePayloadDecoder>
