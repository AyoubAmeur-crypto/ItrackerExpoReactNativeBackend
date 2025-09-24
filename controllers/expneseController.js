const { default: mongoose } = require("mongoose")
const Expense = require("../models/Expense")


exports.addExpense = async (req,res)=>{

    try {
        const user = req.user

        const {title,description,positive,amount}=req.body

        if(!user || !mongoose.isValidObjectId(user.id) ){

            return res.status(400).json({

                success:false,
                error:"Must Required A Valid Id"

            })
        }


        if(!title || !description  || !amount){

            return res.status(400).json({

                success:false,
                error:'All the inputs Are Required!'
            })
        }

        await Expense.create({

            userId:user.id,
            amount:amount,
            title:title,
            description:description,
            positive:positive
        })


        res.status(201).json({

            success:true,
            message:"Expense Has Been Creatd Succesfully!"
        })

        


        
    } catch (error) {

        console.log("can't creat this expense for this user due to this",error);

        res.status(500).json({
            success:false,
            error:"Can't create expense for the moment please try again later!"
        })
        
        
    }
}

exports.getTotalBalance = async (req, res) => {
    try {
        const user = req.user;
        
        if (!user || !mongoose.isValidObjectId(user.id)) {
            return res.status(400).json({
                success: false,
                error: "Must Required A Valid Id"
            });
        }

        const now = new Date();
        const today = {
            start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
        };

        const thisWeek = {
            start: new Date(now.setDate(now.getDate() - now.getDay())),
            end: new Date(now.setDate(now.getDate() - now.getDay() + 7))
        };

        const thisMonth = {
            start: new Date(now.getFullYear(), now.getMonth(), 1),
            end: new Date(now.getFullYear(), now.getMonth() + 1, 1)
        };

        const last3Months = {
            start: new Date(now.getFullYear(), now.getMonth() - 3, 1),
            end: new Date(now.getFullYear(), now.getMonth() + 1, 1)
        };

        const thisYear = {
            start: new Date(now.getFullYear(), 0, 1),
            end: new Date(now.getFullYear() + 1, 0, 1)
        };

        const calculateBalance = async (startDate, endDate) => {
            const expenses = await Expense.find({
                userId: user.id,
                createdAt: { $gte: startDate, $lt: endDate }
            });

            const income = expenses
                .filter(expense => expense.positive === true)
                .reduce((sum, expense) => sum + expense.amount, 0);

            const outcome = expenses
                .filter(expense => expense.positive === false)
                .reduce((sum, expense) => sum + expense.amount, 0);

            const balance = income - outcome;

            return { income, outcome, balance };
        };

        const [todayBalance, weekBalance, monthBalance, threeMonthBalance, yearBalance] = await Promise.all([
            calculateBalance(today.start, today.end),
            calculateBalance(thisWeek.start, thisWeek.end),
            calculateBalance(thisMonth.start, thisMonth.end),
            calculateBalance(last3Months.start, last3Months.end),
            calculateBalance(thisYear.start, thisYear.end)
        ]);

        res.status(200).json({
            success: true,
            message: `Balance summary for user #${user.id}`,
            data: {
                today: todayBalance,
                thisWeek: weekBalance,
                thisMonth: monthBalance,
                last3Months: threeMonthBalance,
                thisYear: yearBalance
            }
        });

    } catch (error) {
        console.log("Can't get balance summary due to:", error);
        res.status(500).json({
            success: false,
            error: "Can't get balance summary, please try again later!"
        });
    }
};



exports.getAllUserExpnese = async (req,res)=>{

    try {


        const user = req.user

        if(!user || !mongoose.isValidObjectId(user.id) ){

            return res.status(400).json({

                success:false,
                error:"Must Required A Valid Id"

            })
        }

        const checkUserExpense = await Expense.find({userId:user.id})

        if(!checkUserExpense || checkUserExpense.length<0){

            return res.status(404).json({

                success:false,
                error:"Mo expenses found for this user!"
            })
        }

        res.status(200).json({

            success:true,
            expenses:checkUserExpense
        })
        
    } catch (error) {

        console.log("can't get expneses of this user due to this",error);
        res.status(500).json({
            success:false,
            error:"can't get expenses for now please try again"

        })
        
        
    }


}

exports.getsEarning = async (req,res)=>{

    try {

        const user = req.user

        if(!user || !mongoose.isValidObjectId(user.id) ){

            return res.status(400).json({

                success:false,
                error:"Must Required A Valid Id"

            })
        }

          const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const getEarning = await Expense.find({
            userId:user.id,
            positive:true,
            createdAt:{
                 $gte: startOfDay,    
                $lt: endOfDay 
            }
        }).sort({createdAt:-1})

        if(!getEarning || getEarning.length<0){

            return res.status(404).json({

                success:false,
                error:"earning of this user not found!"
            })
        }


        res.status(200).json({

            success:true,
            message:`Earning of this user #${user.id}`,
            earnings:getEarning
        })
        
    } catch (error) {

        console.log("can't get earning for this user due to this",error);
        res.status(500).json({

            success:false,
            error:"Can't get earning please try again later!"

        })
        
        
    }
}

exports.getNegativeEarning = async (req,res)=>{

    try {

        const user = req.user
        if(!user || !mongoose.isValidObjectId(user.id) ){

            return res.status(400).json({

                success:false,
                error:"Must Required A Valid Id"

            })
        }
   const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const getEarning = await Expense.find({
            userId: user.id,
            positive: false,
            createdAt: {
                $gte: startOfDay,    
                $lt: endOfDay        
            }
        }).sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            message: `Today's expenses of user #${user.id}`,
            expenses: getEarning || [] 
        })
        
    } catch (error) {

        console.log("can't get expenses for this user due to this",error);
        res.status(500).json({

            success:false,
            error:"Can't get expenses please try again later!"

        })
        
        
    }
}


exports.getLast4MonthsBalance = async (req, res) => {
    try {
        const user = req.user;
        
        if (!user || !mongoose.isValidObjectId(user.id)) {
            return res.status(400).json({
                success: false,
                error: "Must Required A Valid Id"
            });
        }

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const monthlyData = [];
        const monthLabels = [];

        for (let i = 3; i >= 0; i--) {
            let targetMonth = currentMonth - i;
            let targetYear = currentYear;
            
            if (targetMonth < 0) {
                targetMonth += 12;
                targetYear -= 1;
            }
            
            const startOfMonth = new Date(targetYear, targetMonth, 1);
            const endOfMonth = new Date(targetYear, targetMonth + 1, 1);
            
            const monthlyExpenses = await Expense.find({
                userId: user.id,
                createdAt: { $gte: startOfMonth, $lt: endOfMonth }
            });

            const earnings = monthlyExpenses
                .filter(expense => expense.positive === true)
                .reduce((sum, expense) => sum + expense.amount, 0);
                
            const expenses = monthlyExpenses
                .filter(expense => expense.positive === false)
                .reduce((sum, expense) => sum + expense.amount, 0);

            const totalBalance = earnings - expenses; 
            
            const monthLabel = String(targetMonth + 1).padStart(2, '0');
            
            monthlyData.push(totalBalance);
            monthLabels.push(monthLabel);
        }

        res.status(200).json({
            success: true,
            message: `Last 4 months total balance for user #${user.id}`,
            data: {
                monthLabels: monthLabels,     
                balances: monthlyData,        
                totalBalance: monthlyData.reduce((sum, amount) => sum + amount, 0),
                averageMonthly: monthlyData.reduce((sum, amount) => sum + amount, 0) / 4,
                currentMonthBalance: monthlyData[monthlyData.length - 1]}
        });

    } catch (error) {
        console.log("Can't get last 4 months balance due to:", error);
        res.status(500).json({
            success: false,
            error: "Can't get monthly balance data, please try again later!"
        });
    }
};

exports.getCurrentMonthEarnings = async (req, res) => {
    try {
        const user = req.user;
        
        if (!user || !mongoose.isValidObjectId(user.id)) {
            return res.status(400).json({
                success: false,
                error: "Must Required A Valid Id"
            });
        }

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const startOfMonth = new Date(currentYear, currentMonth, 1);
        const endOfMonth = new Date(currentYear, currentMonth + 1, 1);
        
        const currentMonthEarnings = await Expense.find({
            userId: user.id,
            positive: true, 
            createdAt: { $gte: startOfMonth, $lt: endOfMonth }
        }).sort({ createdAt: -1 }).select('title description amount createdAt _id');

        const totalEarnings = currentMonthEarnings.reduce((sum, expense) => sum + expense.amount, 0);
        
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December'];
        const currentMonthName = monthNames[currentMonth];

        res.status(200).json({
            success: true,
            message: `Current month earnings for user #${user.id}`,
            data: {
                month: currentMonthName,
                monthNumber: String(currentMonth + 1).padStart(2, '0'),
                year: currentYear,
                totalEarnings: totalEarnings,
                earningsCount: currentMonthEarnings.length,
                earnings: currentMonthEarnings.map(earning => ({
                    id: earning._id,
                    title: earning.title,
                    description: earning.description,
                    amount: earning.amount,
                    createdAt: earning.createdAt
                }))
            }
        });

    } catch (error) {
        console.log("Can't get current month earnings due to:", error);
        res.status(500).json({
            success: false,
            error: "Can't get current month earnings, please try again later!"
        });
    }
};


exports.removeTransaction = async (req,res)=>{

    try {
        const {transactionId}=req.params

        const user = req.user

        if(!mongoose.isValidObjectId(user.id) || !mongoose.isValidObjectId(transactionId)){

            return res.status(400).json({

                success:false,
                error:"Must required A Valid Id for user & transaction"
            })
        }


        const deleteTransactionCheck = await Expense.findByIdAndDelete(transactionId)

        if(deleteTransactionCheck){

            return res.status(200).json({
                success:true,
                message:"Transaction has been deleted Successfuly!"
            })
        }
        
    } catch (error) {

        console.log("can0t delete this transaction due to this : ",error);

        res.status(500).json({
            success:false,
            error:"Can't delete this transaction please try again!"
        })
        
        
    }
}


exports.getAllUserEarnings = async (req,res)=>{

    try {

        const user = req.user

        if(!user.id){

            return res.status(400).json({

                success:false,
                error:"must required a valid id"
            })
        }


        const allUserEarnings = await Expense.find({userId:user.id,positive:true}).sort({createdAt:-1})

        if(!allUserEarnings || allUserEarnings.length<1){

            return res.status(404).json({

                success:false,
                error:"This user has no earnings"
            })
        }

                const totalEarnings = allUserEarnings.reduce((sum, earning) => sum + earning.amount, 0);


        res.status(200).json({

            success:true,
            message:`earnings of user #${user.id}`,
            earnings:allUserEarnings,
            totalAmount:totalEarnings
        })
        
    } catch (error) {

        console.log("can't get this user earning due to this",error);
        res.status(500).json({

            success:false,
            error:"can't get the earnings of this user please try again"
        })
        
        
    }
}
exports.getAllExpenses = async (req,res)=>{

     try {

        const user = req.user

        if(!user.id){

            return res.status(400).json({

                success:false,
                error:"must required a valid id"
            })
        }


        const allUserExpenses = await Expense.find({userId:user.id,positive:false}).sort({createdAt:-1})

        if(!allUserExpenses || allUserExpenses.length<1){

            return res.status(404).json({

                success:false,
                error:"This user has no expenses"
            })
        }
        const totalExpenses = allUserExpenses.reduce((sum, earning) => sum + earning.amount, 0);



        res.status(200).json({

            success:true,
            message:`expenses of user #${user.id}`,
            expenses:allUserExpenses,
            totalAmount:totalExpenses
        })
        
    } catch (error) {

        console.log("can't get this user expenses due to this",error);
        res.status(500).json({

            success:false,
            error:"can't get the expenses of this user please try again"
        })
        
        
    }
}