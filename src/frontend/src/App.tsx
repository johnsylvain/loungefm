import React from 'react'

function App() {
    return (
        <div
            style={{
                backgroundColor: '#000',
                width: '100vw',
                height: '100vh',
            }}
        >
            <div>
                <audio src="http://localhost:8080/stream" controls />
            </div>
        </div>
    )
}

export default App
