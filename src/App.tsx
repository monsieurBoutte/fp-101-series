import React from 'react'
import * as O from 'fp-ts/Option'
import * as E from 'fp-ts/lib/Either'
import { RequestStatus, safeRequest } from './shared/utils/safeRequest'
import {
  FetchUserPayload,
  FetchUserPayloadDecoded,
} from './shared/types/user.types'
import { pipe } from 'fp-ts/lib/function'
import './App.css'

const App = () => {
  const [avatarOpt, setAvatarOpt] = React.useState<O.Option<string>>(O.none)
  const [reqStatus, setReqStatus] = React.useState<RequestStatus>('idle')

  const fetchUser = safeRequest<FetchUserPayloadDecoded>({
    url: 'https://reqres.in/api/users/1',
    decoder: FetchUserPayload,
  })

  React.useEffect(() => {
    setReqStatus('loading')
    fetchUser().then(
      E.fold(
        (err) => {
          console.log('onError -> E.Left', err)
          setReqStatus('error')
        },
        ({ data: response }) => {
          console.log('onSuccess -> E.Right', response)
          pipe(
            O.fromNullable(response.data.avatar),
            O.fold(
              () => {},
              (avatar) => {
                setAvatarOpt(O.some(avatar))
                setReqStatus('success')
              },
            ),
          )
        },
      ),
    )
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <code>{`Option<string>`}</code>
        <pre>{JSON.stringify(avatarOpt, null, 2)}</pre>
        <code>Request Status</code>
        <pre>{JSON.stringify(reqStatus, null, 2)}</pre>
      </header>
    </div>
  )
}

export default App
