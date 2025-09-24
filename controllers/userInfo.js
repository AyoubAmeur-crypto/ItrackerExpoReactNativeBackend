

exports.getData = async(req,res)=>{

    try {

        const user = req.user

       if(user){

        return res.status(200).json({

            success:true,
            userInfo:user,
            message:'User details info has been loaded susccessfuly'
        })
       }
        
    } catch (error) {

        console.log("can't get user infos due to this",error);

        res.status(500).json({

            success:false,
            error:"Can't get user infos for the moment please try again"
        })
        
        
    }
}