import PokemonData from '../public/pokemon.json'
import { CloseVectorFreeEmbeddings } from 'closevector-web'
import fs from 'fs/promises'
import path from 'path'

const KEY = process.env.NEXT_PUBLIC_CLOSEVECTOR_ACCESS_KEY

if (!KEY) {
  throw new Error('Missing CloseVector credentials')
}

const cv = new CloseVectorFreeEmbeddings({
  key: KEY,
})

;(async () => {
  let count = 0
  for (const pokemon of PokemonData.data) {
    const documentString = JSON.stringify(pokemon)
    let embedding = await cv.embedQuery(documentString)
    ;(pokemon as any).embedding = embedding
    console.log(
      'embedded',
      pokemon.name,
      'remaining',
      PokemonData.data.length - ++count,
    )
  }
  await fs.writeFile(
    path.resolve(__dirname, '../public/pokemon-with-embeddings.json'),
    JSON.stringify(PokemonData, null, 2),
    'utf-8',
  )
})()
