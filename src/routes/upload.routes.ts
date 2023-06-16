import { Router } from 'express'
import * as upload from '../controller/upload.controller'

const router = Router()

router.post('/upload', upload.postFile)
router.get('/upload', upload.postFile)
router.post('/upload/audio', upload.postFile)

export default router
