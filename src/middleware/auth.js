const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ','').trim() 
        const decoded = jwt.verify(token,process.env.JWT_TOKEN)
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
        if(!user){
            throw new Error()
        }
        req.token = token
        req.user = user
        next()
    } catch (e) {
        res.status(401).send({ error: 'please authenticate'})
    }
}


// app.use((req,res,next)=>{
//     res.status(503).send({error: 'Under Construction. Check Back Soon!'})    
// })

// app.use((req, res, next)=>{
//     if(req.method === 'GET') {
//         res.send({error: 'GET request are disabled.'})
//     } else {

//     }
// })


module.exports = auth