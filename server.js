const app = require("./app")
const mongoose = require('mongoose')
const port = process.env.PORT
const db_url = process.env.MONGODB_URI
app.listen(port,'0.0.0.0',()=>{

   console.log(`Server listening on port ${port}`)
    console.log(`Server accessible at:`)
    console.log(`- http://localhost:${port}`)
    console.log(`- http://192.168.68.146:${port}`)
    console.log(`- http://0.0.0.0:${port}`)
})

mongoose.connect(db_url).then(()=>{ console.log("DB CONNECTED SUCCESSFULY");
}).catch((err)=>{console.log("CAN'T CONNECT DUE TO THIS",err);
})


