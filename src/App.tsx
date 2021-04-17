import React from 'react'
import { ADTsComponent } from './1st-episode-ADTs/ADTsComponent'
import { EitherFormValidation } from './3rd-episode-either-form-validation'
import { TaskEitherExample } from './4th-episode-taskeither'

import './App.css'

const App = () => {
  return (
    <div className="App">
      <header className="App-header">
        {/* Video One - ADTs */}
        {/* <ADTsComponent /> */}
        {/* Video Two - doesn't have a component—only test */}
        {/* Video Three - Either Form Validation */}
        {/* <EitherFormValidation /> */}
        {/* Video four - TaskEither for network request */}
        <TaskEitherExample />
      </header>
    </div>
  )
}

export default App
