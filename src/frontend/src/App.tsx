import React from 'react'
import { Helmet } from 'react-helmet'

function App() {
    const [playing, setIsPlaying] = React.useState(false)

    return (
        <div
            style={{
                backgroundColor: '#000',
                width: '100vw',
                height: '100vh',
            }}
        >
            <div>
                <audio src="http://localhost:4000/stream" controls />
            </div>
        </div>
    )
}

export default App
