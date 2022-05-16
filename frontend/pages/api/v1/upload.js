import isProduction from '../../../modules/isProduction'
import fetch from 'node-fetch';

export default function handler(req, res) {

    if(!isProduction()) res.json({ accepted: true })

    const content = req.body

    const apiRes = await fetch('http://backend:81/UPLOAD', {
        method: 'POST',
        body: content
    })
    
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