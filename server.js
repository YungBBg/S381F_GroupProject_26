var express             = require('express'),
    app                 = express(),
    passport            = require('passport'),
    FacebookStrategy    = require('passport-facebook').Strategy,
    session             = require('express-session');

var {MongoClient,ServerApiVersion,ObjectId} = require("mongodb");

const mongourl = 'mongodb+srv://s1366501:s1366501@cluster0.g80nq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const dbName = 'assignment';
const collectionName = 'items';
const client = new MongoClient(mongourl, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const fbAuth ={
    'clientID': '1800080947480212',
    'clientSecret': '9fd7ca362db2eb43b31c8df7d30b6fc0',
    'callbackURL': "http://localhost:8099/auth/facebook/callback"
};


const insertDocument = async (db, doc) => {
    var collection = db.collection(collectionName);
    let results = await collection.insertOne(doc);
	console.log("insert one document:" + JSON.stringify(results));
    return results;
}

const findDocument = async (db, criteria) => {
    var collection = db.collection(collectionName);
    let results = await collection.find(criteria).toArray();
	console.log("find the documents:" + JSON.stringify(results));
    return results;
}

const updateDocument = async (db, criteria, updateData) => {
    var collection = db.collection(collectionName);
    let results = await collection.updateOne(criteria, { $set: updateData });
	console.log("update one document:" + JSON.stringify(results));
    return results;
}

const deleteDocument = async (db, criteria) => {
    var collection = db.collection(collectionName);
    let results = await collection.deleteMany(criteria);
	console.log("delete one document:" + JSON.stringify(results));
    return results;
}


var formidable = require('express-formidable'),
fsPromises = require('fs').promises;

const handle_Find = async (req, res, criteria) => {
    await client.connect();
    console.log("Connected successfully to server");
    const db = client.db(dbName);
    const docs = await findDocument(db);
    res.status(200).render('list', {
        nItems: docs.length, 
        items: docs, 
        user: req.user
    });
}

const handle_Create = async (req, res) => {
    await client.connect();
    console.log("Connected successfully to server");
    const db = client.db(dbName);
    let newDoc = {
        userid: req.user.id,
        item: req.fields.item,
        price: parseFloat(req.fields.price),
        quantity: parseInt(req.fields.quantity),
        description: req.fields.description
    };

    if (req.files.filetoupload && req.files.filetoupload.size > 0) {
        const data = await fsPromises.readFile(req.files.filetoupload.path);
        newDoc.image = Buffer.from(data).toString('base64');
    }

    await insertDocument(db, newDoc);
    res.redirect('/');
}

const handle_Details = async (req, res, criteria) => {
		await client.connect();
		console.log("Connected successfully to server");
        const db = client.db(dbName);
        let DOCID = { _id: ObjectId.createFromHexString(criteria._id) };
        const docs = await findDocument(db, DOCID);
        res.status(200).render('details', { item: docs[0], user: req.user});
}

const handle_Edit = async (req, res, criteria) => {
		await client.connect();
		console.log("Connected successfully to server");
        const db = client.db(dbName);

        let DOCID = { '_id': ObjectId.createFromHexString(criteria._id) };
        let docs = await findDocument(db, DOCID);

        if (docs.length > 0 && docs[0].userid == req.user.id) {
            res.status(200).render('edit', { item: docs[0], user: req.user});
        } else {
            res.status(500).render('info', { message: 'Unable to edit - you are not item owner!', user: req.user});
}
}

const handle_Update = async (req, res, criteria) => {
	await client.connect();
	console.log("Connected successfully to server");
        const db = client.db(dbName);

        const DOCID = {
            _id: ObjectId.createFromHexString(req.fields._id)
        }

        let updateData = {
            item: req.fields.item,
            price: parseFloat(req.fields.price),
            quantity: parseInt(req.fields.quantity),
            description: req.fields.description
        };

        if (req.files.filetoupload && req.files.filetoupload.size > 0) {
            const data = await fsPromises.readFile(req.files.filetoupload.path);
            updateData.photo = Buffer.from(data).toString('base64');
        }

        const results = await updateDocument(db, DOCID, updateData);
        res.status(200).render('info', {message: `Updated ${results.modifiedCount} document(s)`, user: req.user});
}


const handle_Delete = async (req, res) => {
	await client.connect();
	console.log("Connected successfully to server");
        const db = client.db(dbName);
        let DOCID = { '_id': ObjectId.createFromHexString(req.query._id) };
        let docs = await findDocument(db, DOCID);
        if (docs.length > 0 && docs[0].userid == req.user.id) {   
			await deleteDocument(db, DOCID);
            res.status(200).render('info', { message: `Item ${docs[0].item} removed.`, user: req.user});
        } else {
            res.status(500).render('info', { message: 'Unable to delete - you are not item owner!', user: req.user});
        }
}

app.use(formidable());


app.set('view engine', 'ejs');
 
app.use((req,res,next) => {
    let d = new Date();
    console.log(`TRACE: ${req.path} was requested at ${d.toLocaleDateString()}`);  
    next();
});

const isLoggedIn = (req,res,next) => {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
}   

var user = {};
passport.serializeUser(function(user, done) {done(null, user);});
passport.deserializeUser(function(user, done) {done(null, user);});
app.use(session({
    secret: 'tHiSiSasEcRetStr',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());


passport.use(new FacebookStrategy({
    "clientID"        : fbAuth.clientID,
    "clientSecret"    : fbAuth.clientSecret,
    "callbackURL"     : fbAuth.callbackURL
  },
  function (token, refreshToken, profile, done) {
    console.log("Facebook Profile: " + JSON.stringify(profile));
    user = {};
    user['id'] = profile.id;
    user['name'] = profile.displayName;
    user['type'] = profile.provider; // Facebook
    console.log('user object: ' + JSON.stringify(user));
    return done(null,user); // put user object into session => req.user
    }
));


app.get("/login", function (req, res) {
	res.status(200).render('login');
});
app.get("/auth/facebook", passport.authenticate("facebook", { scope : "email" }));
app.get("/auth/facebook/callback",
    passport.authenticate("facebook", {
        successRedirect : "/content",
        failureRedirect : "/"
}));

app.get('/', isLoggedIn, (req,res) => {
    res.redirect('/content');
})

app.get("/content", isLoggedIn, function (req, res) {
    //res.render('list', {user: req.user});
    handle_Find(req,res,req.query.docs);
});

app.get('/create', isLoggedIn, (req,res) => {
    res.status(200).render('create',{user:req.user})
})
app.post('/create', isLoggedIn, (req, res) => {
    handle_Create(req, res);
});

app.get('/details',isLoggedIn, (req,res) => {
    handle_Details(req, res, req.query);
})

app.get('/edit', isLoggedIn, (req,res) => {
    handle_Edit(req, res, req.query);
})

app.post('/update', isLoggedIn, (req,res) => {
    handle_Update(req, res, req.query);
})

app.get('/delete', isLoggedIn, (req,res) => {
    handle_Delete(req, res);
});


app.get("/logout", function(req, res) {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

/* restful */
/*

curl -X POST http://localhost:10000/api/items \
-F "item=apple" \
-F "price=99.99" \
-F "quantity=10" \
-F "description=Test description" \
-F "filetoupload=@/home/yungchunkwok/task2/views/apple.jpg" 

*/

app.post('/api/items', async (req, res) => {
    if (req.fields.item) {
        console.log(req.body)
        await client.connect();
        console.log("Connected successfully to server");
        const db = client.db(dbName);
        let newDoc = {
            //userid: req.user.id,
            item: req.fields.item,
            price: parseFloat(req.fields.price),
            quantity: parseInt(req.fields.quantity),
            description: req.fields.description
        };

        if (req.files.filetoupload && req.files.filetoupload.size > 0) {
            const data = await fsPromises.readFile(req.files.filetoupload.path);
            newDoc.image = Buffer.from(data).toString('base64');
        }

        await insertDocument(db, newDoc);
        res.status(200).json({"Successfully inserted": newDoc}).end();
    } else {
        res.status(500).json({"error": "missing item name"});
    }
});

// curl -X GET http://localhost:10000/api/item/apple
app.get('/api/item/:itemid', async (req,res) => { //async programming way
	if (req.params.itemid) {
		console.log(req.body)
        let criteria = {};
        criteria['item'] = req.params.itemid;
		await client.connect();
	    console.log("Connected successfully to server");
		const db = client.db(dbName);
		const docs = await findDocument(db, criteria);
	    res.status(200).json(docs);
	} else {
        res.status(500).json({"error": "missing itemid"}).end();
    }
});


/*put*/
/*
curl -X PUT -H "Content-Type: application/json" --data '{"item":"apple123","price":"20","quantity":"200","description":"Yummy"}' localhost:10000/api/item/apple

*/
app.put('/api/item/:itemid', async (req,res) => {
	if (req.params.itemid) {
		console.log(req.body)
		let criteria = {};
		//criteria['item'] = req.params.itemid;
		await client.connect();
		console.log("Connected successfully to server");
		const db = client.db(dbName);

	let updateData = {
		//itemid: req.fields.itemid,
		item: req.fields.item,
		price: parseFloat(req.fields.price),
		quantity: parseInt(req.fields.quantity),
		description: req.fields.description,
	};

	if (req.files.filetoupload && req.files.filetoupload.size > 0) {
		const data = await fsPromises.readFile(req.files.filetoupload.path);
		updateData.photo = Buffer.from(data).toString('base64');
	}

	const results = await updateDocument(db, criteria, updateData);
	res.status(200).json(results).end();
	} else {
		res.status(500).json({"error": "You did not have the food item"});
	}
})

/*delete*/ 
/*
curl -X DELETE localhost:10000/api/item/apple123
*/
app.delete('/api/item/:item', async (req, res) => {
    try {
        if (req.params.item) {
            console.log(req.body);
            let criteria = { item: req.params.item }; 
            await client.connect();
            console.log("Connected successfully to server");
            const db = client.db(dbName);
            const results = await deleteDocument(db, criteria);
            console.log(results);
            res.status(200).json(results).end();
        } else {
            res.status(400).json({ error: "Missing item parameter in the request" });
        }
    } catch (error) {
        console.error("Error deleting item:", error);
        res.status(500).json({ error: "An error occurred while deleting the item" });
    }
});


app.get('/*', (req,res) => {
    res.status(404).render('info', {message: `${req.path} - Unknown request!` });
})

const port = process.env.PORT || 10000;
app.listen(port, () => {console.log(`Listening at http://localhost:${port}`);});

