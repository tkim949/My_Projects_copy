import express from 'express';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';
import path from 'path';

const app = express();

app.use(express.static(path.join(__dirname, '/build')));
app.use(bodyParser.json());

//const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://YOUR SECRET PATH"; //this is the reason I create this public copy version!

const withDB = async (operations, res) => {
    try {
        const client = await MongoClient.connect(uri, {useUnifiedTopology: true});
        const db = client.db('my-proj');

        await operations(db);
        //const articleInfo = await db.collection('articles').findOne( { name: articleName});
        //res.status(200).json(articleInfo);
        
        client.close();
    } catch (error) {
        res.status(500).json( { message: 'Error connecting to db', error});
    }

}

app.get('/api/projects/:name', async (req, res) => {
    withDB (async (db) => {
        const projectName = req.params.name;

        const projectInfo = await db.collection('projects').findOne( { name: projectName});
        res.status(200).json(projectInfo);

    }, res);     

});


app.post('/api/projects/:name/like', (req,res) => {
    withDB (async (db) => {
        const projectName = req.params.name;

        const projectInfo = await db.collection('projects').findOne( { name: projectName});
        await db.collection('projects').updateOne({ name: projectName}, {
            '$set': { like: projectInfo.like + 1, },
        });
        const updateProjectInfo = await db.collection('projects').findOne({ name: projectName});
        res.status(200).json(updateProjectInfo);
    }, res);   
   // articlesInfo[articleName].upvotes += 1;
   // res.status(200).send(`${articleName} now has ${articlesInfo[articleName].upvotes} upvotes!`)
});

app.post('/api/projects/:name/add-comment', (req, res) => {
    const { username, text} = req.body;
    const projectName = req.params.name;

    withDB (async (db) => {
        const projectInfo = await db.collection('projects').findOne( { name: projectName});
        await db.collection('projects').updateOne({ name: projectName}, {
            '$set': { comments: projectInfo.comments.concat({ username, text}), },
        });
        const updateProjectInfo = await db.collection('projects').findOne({ name: projectName});
        res.status(200).json(updateProjectInfo);
    
    }, res);
   
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/build/index.html'));
});

app.listen(8000, () => console.log('Listening on port 8000'))


