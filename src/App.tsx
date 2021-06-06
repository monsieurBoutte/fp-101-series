import React from 'react'
import { ADTsComponent } from './1st-episode-ADTs/ADTsComponent'
import { EitherFormValidation } from './3rd-episode-either-form-validation'
import { TaskEitherExample } from './4th-episode-taskeither'
import { FunctorExample } from './5th-episode-Functors'

import './App.css'

const App = () => {
  return (
    <div className="App">
      <header className="App-header">
        {/* Video 1 - ADTs */}
        {/* <ADTsComponent /> */}
        {/* Video 2 - doesn't have a component, it's only test */}
        {/* Video 3 - Either Form Validation */}
        {/* <EitherFormValidation /> */}
        {/* Video 4 - TaskEither for network request */}
        {/* <TaskEitherExample /> */}
        {/* Video 5 - Functor, Bifunctor, Profunctor examples */}
        {/* <TaskEitherExample /> */}
        <FunctorExample />
      </header>
    </div>
  )
}

export default App
