import fs from 'fs'

export const startup = () => {
    if (!fs.existsSync('upload')) {
        fs.mkdirSync('upload'), { recursive: true }
    }

    if (!fs.existsSync('upload/audio')) {
        fs.mkdirSync('upload/audio'), { recursive: true }
    }
    
    return null
}
