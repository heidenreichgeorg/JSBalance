import { backendURL } from '../../modules/url';
import logger from '../../modules/logger';

import fetch from 'node-fetch';

logger.title('UPLOAD API');

export default async function handler(req, res) {

    const content = req.body

    const apiRes = await fetch(backendURL + '/UPLOAD', {
        method: 'POST',
        body: content,
        headers: { 'Content-Type': 'application/json' }
    })
    logger.info('Uploaded file.');

    if(apiRes.ok) {
        // if success
        res.json({
            accepted: true
        })
    } else {
        // if error
        res.json({
            accepted: false
        })
    }
}