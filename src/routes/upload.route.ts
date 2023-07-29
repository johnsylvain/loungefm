import { Router } from 'express'
import * as uploads from '../controller/upload.controller'
import multer from 'multer'
import { v4 as uuid } from 'uuid'

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'upload/audio')
    },
    filename: (req, file, cb) => {
        cb(null, `${uuid()}.${file.fieldname}`)
    },
})

const fileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(mp3)$/)) {
        return cb(new Error('Only MP3 files are allowed!'), false)
    }
    cb(null, true)
}

const upload = multer({ storage: storage, fileFilter: fileFilter })

const router = Router()

router.post('/upload/audio', upload.single('mp3'), uploads.postAudio)

export default router
