import { createTheme, MantineProvider } from '@mantine/core'
// import './App.css'
import { Notification } from '@mantine/core'

const theme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'Inter, sans-serif'
})

function App() {

  return (
    <MantineProvider theme={theme}>
      <Notification />
      <div className='min-h-screen bg-slate-900 p-8'>
        <h1 className='text-3xl font-bold text-white'>Car Wash MVP</h1>
      </div>
    </MantineProvider>
  )
}

export default App
