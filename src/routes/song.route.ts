import { Router } from 'express'
import * as song from '../controller/song.controller'

const router = Router()

router.get('/song/status', song.getStatus)
router.get('/song/search/:title', song.getSearch)
router.get('/song/random', song.getRandom)
router.get('/song/all', song.getAllTracks)
router.post('/song/like/:id/:userID', song.postLike)
// always on the end
router.get('/song/:id', song.getTrackbyID)

export default router
