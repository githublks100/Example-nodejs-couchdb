var express = require('express');
var http = require('http');``
var routes = require('./routes');
var path = require('path');
var urlencoded = require('url');
var json = require('json');
var bodyparser = require('body-parser');
var methodoverride = require('method-override');
var app = express();

app.set('port', process.env.port || 3000);
app.set('views', path.join(__dirname, 'views') );
app.set('view engine', 'jade');

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));
app.use(methodoverride());
app.use(express.static(path.join(__dirname, 'public')));

var nano = require('nano')('http://admin:admin123@127.0.0.1:5984');
var db = nano.use('address');

app.get('/', routes.index);

app.post('/createdb', function(req, res){
    nano.db.create(req.body.dbname, function(err){
        if(err)
        {
            res.send("error in creating the database" + req.body.dbname + " err " +  err);
            return;
        }
        res.send("Database " + req.body.dbname  );
    });
});

app.post('/new_contact', function(req, res){
   var name = req.body.name;
   var phone = req.body.phone;
    db.insert({name:name, phone:phone}, phone, function(err, body, header){
        if (err)
        {
            res.send("Error in creating contacts");
        }
        res.send("Contact created successfully.");
    })
});

app.post('/view_contact', function(req, res){
var alldoc = "following are the contacts";
    db.get(req.body.name, {revs_info:true}, function(err, body)
    {
        if(!err)
        {
            console.log(body);
        }
        if(body)
        {
            alldoc += "Name " + body.name + "<br> phone number : " + body.phone;
        }
        else
        {
            alldoc = "No record found.";
        }
        res.send(alldoc);
    })
});

app.post('/delete_contacts', function(req, res){
    db.get(req.body.phone, {revs_info:true}, function(err, body){
        if(!err)
        {
            db.destroy(req.body.phone, body._rev , function(err,body){
                if(err)
                {
                    res.send("error in deleting the contact");
                }
            });
            res.send("contact deleted sucessfully");
        }
    });

});
/*var server = app.listen(app.port, function(){
    console.log("express server is running on port" + app.get('port'));
    console.log("views path is : " + app.get('views'));
});*/

var server = http.createServer(app).listen(app.get('port'), function(){
    console.log("express server is running in port" + app.get('port'));
});
