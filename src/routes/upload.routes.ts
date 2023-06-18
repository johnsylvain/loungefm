import { Router } from 'express'
import * as upload from '../controller/upload.controller'

const router = Router()

router.post('/upload', upload.getUpload)

export default router
