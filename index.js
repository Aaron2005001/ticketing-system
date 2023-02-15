
const storage = require('node-persist');
const { urlencoded } = require('express');
const { setItem } = require('node-persist');

const express = require('express')
const app = express()


var bodyParser = require('body-parser');  
var urlencodedParser = bodyParser.urlencoded({ extended: false })  
app.use(express.static('public'));  

const port = 3000

app.get('/', (req, res) => {
    res.sendFile( __dirname + "/" + "index.html" );  
})

app.get('/getTickets',async(req,res)=>{
    var tickets = await storage.getItem('tickets')
    console.log(tickets)
   res.status(200).send(tickets)
})

app.post('/ticket',urlencodedParser,async(req,res)=>{
    console.log(req.body)
    let uid = req.body.user_id;
    let issue = req.body.issue;
    console.log(uid);
    console.log(issue);
    var support_staff = await storage.getItem('agents')
    console.log(support_staff)
    var round_robin = await storage.getItem('round_robin')
    var tickets_assigned = {ticket_id:'#123',assigned_to:support_staff[round_robin%5].uid}
    support_staff[round_robin%5].tickets.push({uid:'#123',issueDescription:issue,raisedBy:uid})
    round_robin+=1
    var tickets = await storage.getItem('tickets')
    tickets.push({uid:'#123',issueDescription:issue,raisedBy:uid})

    if(tickets_assigned){
        res.statusMessage = "CREATED";
        await storage.setItem('round_robin',round_robin%5);
        await storage.setItem('agents',support_staff);
        await storage.setItem('tickets',tickets)
        res.status(200).send({message:"Ticket Assigned",success:true,data:tickets_assigned})
    }else{
        res.statusMessage = "BAD REQUEST";
        res.status(400).send(tickets_assigned)
    }
    

})

app.get("/clear",async(req,res)=>{
    await storage.setItem("agents",null)
    await storage.setItem("round_robin",0)
    await storage.setItem("tickets",[])

    res.status(200).send("Cleared Presistant Storage")
})



app.listen(port, async() => {
    

await storage.init()

    var support_staff = await storage.getItem('agents')
    if(!support_staff){
    
    let support_staff = [
        {
            uid:'#1',
            name:'Ram',
            tickets:[]
        },
        {
            uid:'#2',
            name:'Shyam',
            tickets:[]
        },
        {
            uid:'#3',
            name:'Bharath',
            tickets:[]
        },
        {
            uid:'#4',
            name:'Sarath',
            tickets:[]
        },
        {
            uid:'#5',
            name:'Naresh',
            tickets:[]
        },
        ]
        await storage.setItem('agents',support_staff)
}
   var round_robin = await storage.getItem('round_robin')
    if(!round_robin){
        var round_robin = 0
        await storage.setItem('round_robin',0)
    }
    await storage.setItem('tickets',[])
  console.log(`REST API Ticketing System listening on port ${port}`)
})