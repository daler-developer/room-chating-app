import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { Provider } from 'react-redux'
import App from '../components/App'
import store from '../redux/store'

function MyApp({ Component, pageProps }: AppProps) {
  const getLayout = (Component as any).getLayout || ((page: any) => page)

  return (
    <Provider store={store}>
      <App>{getLayout(<Component {...pageProps} />)}</App>
    </Provider>
  )
}

export default MyApp
