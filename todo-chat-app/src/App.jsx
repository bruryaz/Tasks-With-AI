import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ChatBotTodoApp from './components/chat'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <ChatBotTodoApp></ChatBotTodoApp>
    </>
  )
}

export default App
