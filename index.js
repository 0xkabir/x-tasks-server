const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express()
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

const uri = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@ac-14vdlaf-shard-00-00.ipnjwkc.mongodb.net:27017,ac-14vdlaf-shard-00-01.ipnjwkc.mongodb.net:27017,ac-14vdlaf-shard-00-02.ipnjwkc.mongodb.net:27017/?ssl=true&replicaSet=atlas-cke34e-shard-0&authSource=admin&retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

app.get('/', (request, response) => {
    response.send('xTasks Server Running')
})

async function run(){
    try{
        const tasksCollection = client.db('xtasks').collection('tasks')

        app.get('/my-tasks', async(request, response) => {
            const query = {isComplete: false}
            const tasks =  await tasksCollection.find(query).toArray()
            response.send(tasks)
        })

        app.get('/completed-tasks', async(request, response)=>{
            const query = {isComplete: true}
            const tasks = await tasksCollection.find(query).toArray()
            response.send(tasks)
        })
        
        app.post('/add-task', async(request, response) => {
            const task = request.body
            console.log(task)
            const result = await tasksCollection.insertOne(task)
            response.send(result)
        })

        app.put('/complete/:id', async(request, response)=>{
            const id = request.params.id
            const complete = request.body.complete
            const query = {_id: ObjectId(id)}
            const options = {upsert: true}
            const updateDoc = {$set: {
                isComplete: complete
            }}

            const result = await tasksCollection.updateOne(query, updateDoc, options)
            response.send(result)
        })

        app.put('/update/:id', async(request, response)=>{
            const id = request.params.id
            const updatedTask = request.body
            const query = {_id: ObjectId(id)}
            const options = {upsert: true}
            const updateDoc = {$set: {
                title: updatedTask.title,
                description: updatedTask.description
            }}

            const result = await tasksCollection.updateOne(query, updateDoc, options)
            response.send(result)
        })

        app.put('/add-comment/:id', async(request, response)=>{
            const id = request.params.id
            const comment = request.body.comment
            const query = {_id: ObjectId(id)}
            const options = {upsert: true}
            const updateDoc = {$set: {
                comment: comment
            }}
            const result = await tasksCollection.updateOne(query, updateDoc, options)
            response.send(result)
        })

        app.delete('/delete/:id', async(request, response)=>{
            const taskId = request.params.id
            const query = {_id: ObjectId(taskId)}
            const result = await tasksCollection.deleteOne(query)
            response.send(result)
        })
    }

    finally{

    }
}

run().catch(error => console.log(error))

app.listen(port, ()=> {
    console.log(`xTasks Server Running at port ${port}`)
})