'use client'

import 'react-cmdk/dist/cmdk.css'
import Image from 'next/image'
import { usePokemonVectorDatabase, debounceAsyncFunc } from './lib'
import CommandPalette, { getItemIndex } from 'react-cmdk'
import ReactMarkdown from 'react-markdown'
import { useCallback, useEffect, useState } from 'react'
import { LoadingIcon, PokemonIcon } from '../components/icon'

export default function Home() {
  const { instance, fetcher, isFetching } = usePokemonVectorDatabase()
  const [searching, setSearching] = useState(false)
  const [search, setSearch] = useState('water')
  const [results, setResults] = useState<
    Awaited<ReturnType<typeof similaritySearch>>
  >(undefined)
  const [open, setOpen] = useState(true)

  const similaritySearch = useCallback(
    debounceAsyncFunc(async function (input: string) {
      try {
        setSearching(true)
        let results = await instance?.similaritySearch(input, 100)
        setResults(results)
        setSearching(false)
        return results
      } catch (e) {
        console.error(e)
        setSearching(false)
      }
    }, 500),
    [instance],
  )

  function searchChangeCallback(search: string) {
    setSearch(search)
    if (instance) {
      setSearching(true)
      similaritySearch(search)
        .then((results) => {
          setResults(results)
        })
        .finally(() => {
          setSearching(false)
        })
    }
  }

  useEffect(() => {
    if (!isFetching) {
      similaritySearch(search)
    }
  }, [isFetching, search, similaritySearch])

  const filteredItems = (() => {
    if (searching) {
      return [
        {
          heading: 'Loading',
          id: 'loading',
          items: [
            {
              id: 1 + '',
              children: `searching from ${instance?.index.getCurrentCount()} documents`,
              showType: false,
            },
          ],
        },
      ]
    } else {
      if (results?.length) {
        return [
          {
            heading: 'Results',
            id: 'results',
            items: (results || []).map((r, index) => {
              return {
                id: index + '',
                // width adjusted
                children: (
                  <div className="w-full rounded-lg bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-400 p-4 border-t border-indigo-500 border-b border-indigo-500">
                    <h2 className="text-lg font-semibold leading-tight text-white">
                      <b>{r?.pageContent}</b>
                    </h2>
                    <p className="text-sm text-white/80 font-medium mt-1">
                      <ReactMarkdown>{`
type: ${[r?.metadata?.type1, r?.metadata?.type2].filter((x) => x).join(', ')}

hp: ${r?.metadata?.hp}, attack: ${r?.metadata?.attack}, defense: ${
                        r?.metadata?.defense
                      }, spAtk: ${r?.metadata?.spAtk}, spDef: ${
                        r?.metadata?.spDef
                      }, speed: ${r?.metadata?.speed}

number: ${r?.metadata?.number}, generation: ${
                        r?.metadata?.generation
                      }, legendary: ${r?.metadata?.legendary}, total: ${
                        r?.metadata?.total
                      }
                      `}</ReactMarkdown>
                    </p>
                  </div>
                ),
                showType: false,
                // icon: 'RectangleStackIcon',
                closeOnSelect: false,
              }
            }),
          },
        ]
      } else {
        return []
      }
    }
  })()

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Get started by editing&nbsp;
          <code className="font-mono font-bold">app/page.tsx</code>
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://closevector.getmegaportal.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{' '}
            <Image
              src="/closevector.svg"
              alt="Vercel Logo"
              className="dark:invert"
              width={24}
              height={24}
              priority
            />{' '}
            CloseVector
          </a>
        </div>
      </div>

      <div
        onClick={() => setOpen(true)}
        className="hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold py-2 px-4 border border-gray-400 dark:border-gray-900 rounded shadow flex"
      >
        {isFetching ? <LoadingIcon /> : <PokemonIcon />} &nbsp;
        <span>Start Searching</span>
      </div>

      <CommandPalette
        onChangeSearch={(search) => {
          searchChangeCallback(search)
        }}
        onChangeOpen={(isOpen) => {
          setOpen(isOpen)
        }}
        search={search}
        isOpen={ !isFetching && open}
        page={'root'}
      >
        <CommandPalette.Page id="root">
          {filteredItems.length ? (
            filteredItems.map((list) => (
              <CommandPalette.List key={list.id} heading={list.heading}>
                {list.items.map(({ id, ...rest }) => (
                  <CommandPalette.ListItem
                    key={id}
                    index={getItemIndex(filteredItems, id)}
                    {...rest}
                  />
                ))}
              </CommandPalette.List>
            ))
          ) : (
            <CommandPalette.FreeSearchAction />
          )}
        </CommandPalette.Page>
      </CommandPalette>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        <a
          href="https://closevector-docs.getmegaportal.com/"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Docs{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Find in-depth information about CloseVector features and API.
          </p>
        </a>

        <a
          href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FMegaPortal%2Fclosevector-nextjs-demo"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Deploy{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Instantly deploy your Next.js site to a shareable URL with Vercel.
          </p>
        </a>
      </div>
    </main>
  )
}
