import { MantineProvider } from '@mantine/core'
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return <MantineProvider
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
    ><Component {...pageProps} /></MantineProvider>
}

export default MyApp
