const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const  path = require("path");
const {v4: uuidv4}=require('uuid');
const methodOverride = require("method-override");
const db = require("./db");
app.use(express.urlencoded({extended: true}));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname,"public")));
app.use(methodOverride("_method"));



app.get("/posts",async (req,res)=>{
    try {
        const [posts] = await db.query("SELECT * FROM posts ORDER BY created_at DESC");
        res.render("index.ejs", { posts });
    } catch (err) {
        console.error(err);
        res.status(500).send("Database Error");
    }
});

app.get("/posts/new",(req,res)=>{
    res.render("new.ejs");
});

app.post("/posts",async(req,res)=>{
    try{
    let {username,content}= req.body;
    let id = uuidv4();
    await db.query(
            "INSERT INTO posts (id, username, content) VALUES (?, ?, ?)",
            [id, username, content]
        );
    
    res.redirect("/posts");
    }catch(err){
        console.log(err);
        res.status(500).send("error saving post to database");
    }
});

app.patch("/posts/:id",async(req,res)=>{
    try{
        let {id}= req.params;
    let newContent = req.body.content;
   await db.query(
            "UPDATE posts SET content = ? WHERE id = ?",
            [newContent, id]
        );

   
    res.redirect("/posts");
    }catch(err){
        console.log(err);
        res.statux(500).send("error updating post");
    }
   
});
app.get("/posts/:id/edit",async (req,res)=>{
   try{
     let {id} = req.params;
    const [rows] = await db.query("SELECT * FROM posts WHERE id = ?",[id]);
    if(rows.length ===0){
        return res.status(404).send("post not found");
    }
    let post = rows[0];
    res.render("edit.ejs",{post});
}catch (err){
    console.error(err);
        res.status(500).send("Database Error");
}
});

app.get("/posts/:id",async(req,res)=>{
    try{
        let {id}= req.params;
    const [rows] = await db.query("SELECT * FROM posts WHERE id = ?", [id]);
    if (rows.length === 0) {
            return res.status(404).send("Post not found");
        }
    
    let post = rows[0];
        res.render("show.ejs", { post });
    }catch(err){
        res.status(500).send("database error");
    }
    
});
app.delete("/posts/:id",async(req,res)=>{
    try{
        let {id} = req.params;
    await db.query("DELETE FROM posts WHERE id =?",[id]);

    res.redirect("/posts");
    }catch(err){
console.error(err);
res.status(500).send("error deleting post");
    }

    
});




app.listen(port,()=>{
    console.log("listening to the port 8080");
});

