import { useState } from 'react'
import BeanScreen from './screens/BeanScreen'
import BrewScreen from './screens/BrewScreen'
import FeedbackScreen from './screens/FeedbackScreen'

function App() {
  const [screen, setScreen] = useState('beans')
  const [selectedBean, setSelectedBean] = useState(null)
  const [brewData, setBrewData] = useState(null)

  const handleBeanSelect = (bean) => {
    setSelectedBean(bean)
    setScreen('brew')
  }

  const handleBrewFinish = (data) => {
    setBrewData(data)
    setScreen('feedback')
  }

  const handleDone = () => {
    setSelectedBean(null)
    setBrewData(null)
    setScreen('beans')
  }

  return (
    <div className="h-full min-h-[100dvh] bg-white overflow-y-auto scrollbar-hide">
      {screen === 'beans' && (
        <BeanScreen onSelect={handleBeanSelect} />
      )}
      {screen === 'brew' && selectedBean && (
        <BrewScreen
          bean={selectedBean}
          onFinish={handleBrewFinish}
          onBack={() => setScreen('beans')}
        />
      )}
      {screen === 'feedback' && brewData && (
        <FeedbackScreen
          brewData={brewData}
          onDone={handleDone}
        />
      )}
    </div>
  )
}

export default App
