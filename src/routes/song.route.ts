// router.get('/song/status', song.getStatus)
// router.get('/song/search/:title', verifyToken, song.getSearch)
// router.get('/song/random', verifyToken, song.getRandom)
// router.get('/song/all', verifyToken, song.getAllTracks)
// router.post('/song/like/:id/:userID', verifyToken, song.postLike)
// router.get('/song/like/:id/:userID', verifyToken, song.getLike)
// router.post('/song/stream/:id/:userID', verifyToken, song.postStream)

// always on the end
//router.get('/song/:id', verifyToken, song.getTrackbyID)

import { trpc } from '../util/trpc'

export const route = trpc.router({
    getStatus: trpc.procedure.query(() => {
        return 200
    }),
    searchArtistOrTitle: trpc.procedure.input((text) => {
        if(typeof text ==== "string") return text
        throw new Error('Invalid input: Expected string')
    }),
})
