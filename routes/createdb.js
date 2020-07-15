exports.create = function(req, res)
{
    nano.db.create(req.body.dbname, function(){
        if(err)
        {
            res.send("error creating the database");
            return;
        }
        res.send("Database created sucessfully.");
    })
}