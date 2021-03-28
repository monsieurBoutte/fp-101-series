import React from 'react'
import { ADTsComponent } from './video-one-ADTs/ADTsComponent'
import { EitherFormValidation } from './video-three-either-form-validation'
import './App.css'

const App = () => {
  return (
    <div className="App">
      <header className="App-header">
        {/* Video One - ADTs */}
        {/* <ADTsComponent /> */}
        {/* Video Two - doesn't have a component—only test */}
        {/* Video Three - Either Form Validation */}
        <EitherFormValidation />
      </header>
    </div>
  )
}

export default App
