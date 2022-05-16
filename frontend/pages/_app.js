import { MantineProvider } from '@mantine/core'

import { LanguageProvider } from '../modules/lang'
import langContext from '../context/langContext.json'

import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return <LanguageProvider context={langContext} lang='en'>
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
}

export default MyApp