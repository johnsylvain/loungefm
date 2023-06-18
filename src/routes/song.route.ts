import { Router } from 'express'
import * as song from '../controller/song.controller'

const router = Router()

router.get('/track/status', song.getStatus)
router.get('/track/search/:title', song.getSearch)
router.get('/track/random', song.getRandom)
//alwayson the end
router.get('/track/:id', song.getTrackbyID)

export default router
