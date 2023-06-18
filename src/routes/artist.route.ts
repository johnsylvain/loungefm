import { Router } from 'express'
import * as artist from '../controller/artist.controller'

const router = Router()

router.get('/artist', artist.getArtist)

export default router
