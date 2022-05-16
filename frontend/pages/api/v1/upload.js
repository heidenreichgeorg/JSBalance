import isProduction from '../../../modules/isProduction'

export default function handler(req, res) {

    if(!isProduction()) res.json({ accepted: true })

    const content = req.body
    // fetch to backend

    // if success
    res.json({
        accepted: true
    })

    // if fail
    res.json({
        accepted: false
    })
}