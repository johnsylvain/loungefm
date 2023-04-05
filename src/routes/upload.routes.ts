import { Router } from 'express';
import * as upload from '../controller/upload.controller';

const router = Router();
router.get("/upload", upload.postFile);

export default router;