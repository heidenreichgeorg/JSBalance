import { backendURL } from '../../modules/url';
import logger from '../../modules/logger';

import fetch from 'node-fetch';

logger.title('SESSION API');

export default async function handler(req, res) {
    const apiRes = await fetch(backendURL + '/SHOW')
    logger.info('Fetched data');

    if(apiRes.ok) {
        // if success
        const data = await apiRes.json();
        res.json({
            accepted: true,
            data
        })
    } else {
        // if error
        res.json({
            accepted: false
        })
    }
}