import { ErrorBoundary } from './components/Common/ErrorBoundary'
import { Layout } from './components/Layout/Layout'
import { Calculator } from './components/Calculator/Calculator'

function App() {
  return (
    <ErrorBoundary>
      <Layout>
        <Calculator />
      </Layout>
    </ErrorBoundary>
  )
}

export default App