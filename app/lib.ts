import { useCloseVectorManager } from 'closevector-react'
import { useCallback, useEffect, useState } from 'react'

export function debounceAsyncFunc<T extends any[], U>(
  func: (...args: T) => Promise<U>,
  wait: number,
): (...args: T) => Promise<U> {
  let timeout: any
  return function (this: any, ...args: T): Promise<U> {
    const context = this
    return new Promise((resolve, reject) => {
      const later = function () {
        timeout = null
        resolve(func.apply(context, args))
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    })
  }
}

export type PokemonDataItem = {
  number: number
  name: string
  type1: string
  type2: string
  total: number
  hp: number
  attack: number
  defense: number
  spAtk: number
  spDef: number
  speed: number
  generation: number
  legendary: boolean
  embedding: number[]
}

class PokemonDataFetcher {
  isFetching: boolean = false

  data: PokemonDataItem[] = []

  fetch = async () => {
    if (this.isFetching) return
    if (this.data.length) return
    this.isFetching = true
    const response = await fetch('/pokemon-with-embeddings.json')
    const data = await response.json()
    this.data = data.data
    this.isFetching = false
  }
}

export const usePokemonVectorDatabase = () => {
  const [isFetching, setIsFetching] = useState(false)
  const [fetcher] = useState<PokemonDataFetcher>(new PokemonDataFetcher())
  const { manager } = useCloseVectorManager({
    // CloseVector API Key is needed to create a new instance,
    // provide a customEmbeddings if you don't need to use the CloudVector CDN
    accessKey: process.env.NEXT_PUBLIC_CLOSEVECTOR_ACCESS_KEY,
  })

  type CloseVectorManager = Exclude<typeof manager, null>
  type CloseVectorInstance = Awaited<
    ReturnType<CloseVectorManager['createNewCloseVector']>
  >

  const [instance, setInstance] = useState<CloseVectorInstance | null>(null)

  const fetchData = useCallback(async () => {
    if (!manager) {
      return
    }
    if (isFetching) {
      return
    }
    if (fetcher.data.length > 0) {
      return
    }

    setIsFetching(true)
    await fetcher.fetch()
    const instance = await manager.createNewCloseVector({})
    const embeddings = fetcher.data.map((d) => d.embedding)
    const documents = fetcher.data.map((d) => ({
      pageContent: d.name,
      metadata: d,
    }))
    await instance.addVectors(embeddings, documents)
    setInstance(instance)
    setIsFetching(false)
  }, [fetcher, isFetching, manager])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { instance, fetcher, isFetching }
}
