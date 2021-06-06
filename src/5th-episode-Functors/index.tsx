import React from 'react'

import { MapExample } from './MapExample'
import { BimapExample } from './BimapExample'
import { ProfunctorExample } from './Profunctor'

export const FunctorExample = () => {
  return (
    <div>
      <h1>Hello friend</h1>
      <MapExample />
      <BimapExample />
      <ProfunctorExample />
    </div>
  )
}
