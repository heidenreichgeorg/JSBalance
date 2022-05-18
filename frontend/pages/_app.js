import '../styles/globals.css'


import { MantineProvider } from '@mantine/core'

import { LanguageProvider } from '../modules/lang'
import langContext from '../context/langContext.json'

import { QueryClient, QueryClientProvider } from 'react-query'
 
const queryClient = new QueryClient()

function MyApp({ Component, pageProps }) {
  return (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider context={langContext} lang='de'>
        <MantineProvider
          withGlobalStyle
          withNormalizeCSS
          theme={{
            'colorScheme': 'dark',
            colors: {
              'primary': '#FEFCFB',
              'secondary': '#38AECC',
              'background': '#2F323A',
              'success': '#3BC14A',
              'error': '#ED254E'
            }
          }}
        >
          <Component {...pageProps} />
        </MantineProvider>
      </LanguageProvider>
    </QueryClientProvider>
  )
}

export default MyApp