import React from 'react'
import * as A from 'fp-ts/ReadonlyArray'
import * as D from 'fp-ts/Date'
import * as Ord from 'fp-ts/Ord'
import { pipe } from 'fp-ts/function'

interface UserProfile {
  handle: string
  email: string
  createdAt: string
}

export const pluckDateFromProfile: Ord.Ord<UserProfile> = pipe(
  D.Ord,
  Ord.contramap((a: UserProfile) => new Date(a.createdAt)),
)

export const ContramapExample = () => {
  const userProfiles: Array<UserProfile> = [
    {
      handle: '@hello',
      email: 'foo@example.com',
      createdAt: '2021-10-04T16:46:23.560875Z',
    },
    {
      handle: '@hi',
      email: 'bar@example.com',
      createdAt: '2020-12-04T16:46:23.560875Z',
    },
    {
      handle: '@yo',
      email: 'baz@example.com',
      createdAt: '2021-09-04T16:46:23.560875Z',
    },
  ]

  const sortedProfilesByDateCreated = (profiles: Array<UserProfile>) =>
    pipe(profiles, A.sort(pluckDateFromProfile))

  return (
    <div>
      <h3>unsorted profiles</h3>
      <pre
        style={{
          textAlign: 'left',
          backgroundColor: '#f99898',
          color: '#990606',
        }}
      >
        {JSON.stringify(userProfiles, null, 2)}
      </pre>
      <h3>sorted profiles</h3>
      <pre
        style={{
          textAlign: 'left',
          backgroundColor: '#c5f7cd',
          color: '#095d09',
        }}
      >
        {JSON.stringify(sortedProfilesByDateCreated(userProfiles), null, 2)}
      </pre>
    </div>
  )
}
