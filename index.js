const express = require("express");
const fs=require("fs");
obGlobal={
    obErori:null,
    obImagini:null,
}
const { dirname } = require("path");

app= express();
console.log("Folder proiect", __dirname);
console.log("Cale fisier",__filename);
console.log("Director de lucru",process.cwd());

vectorFoldere=["temp","temp1"]
for(let folder of vectorFoldere){
    //let caleFolder=__dirname+"/"+folder;
    let caleFolder=path.join(__dirname,folder);
    if(!fs.existsSync(caleFolder))
    {
        fs.mkdirSync(caleFolder);
    }
}

app.set("view engine","ejs");

app.use("/resurse",express.static(__dirname+"/resurse"));

app.use(/^\/resurse(\/[a-zA-Z0-9]*)*$/, function(req, res){
    afisareEroare(res,403);
});

app.get("/favicon.ico",function(req,res){
    res.sendFile(__dirname+"/resurse/imagini/favicon.ico");
})

app.get("/ceva", function(req, res){
    console.log("cale:",req.url)
    res.send("<h1>altceva<h1>");
})

app.get(["/index","/","home"], function(req, res){
    res.render("pagini/index", {Ip: req.ip, a:10, b:20});
})

// ^\w+\.ejs$ - pt match cu index.ejs

app.get("/*.ejs",function(req,res){
    afisareEroare(res,400);
})

app.get("/*", function(req,res){
    try{
    res.render("pagini"+req.url,function(err,rezRandare){
        if(err)
        {
        if(err.message.startsWith("Failed to look up view"))
        afisareEroare(res,404,"ceva")
        else
        afisareEroare(res)
        }
    else {
        console.log(rezRandare)
        res.send(rezRandare)
    }

});
    }catch(err){
        if(err.message.startsWith("Cannot find module"))
        afisareEroare(res,404)
        else
        afisareEroare(res)
        }
    })

function initErori()
{
    var continut=fs.readFileSync(__dirname+"/resurse/json/erori.json").toString("utf-8");
    obGlobal.obErori=JSON.parse(continut);
    let vErori=obGlobal.obErori.info_erori;
    for(let eroare of vErori){
        eroare.imagine="/"+obGlobal.obErori.cale_baza+"/"+eroare.imagine;
    }
}
initErori();
function afisareEroare(res,_identificator,_titlu,_text,_text){
    let vErori=obGlobal.obErori.info_erori;
    let eroare=vErori.find(function(elem){return elem.identificator==_identificator;})
    if(eroare){
        let titlu1= _titlu||eroare.titlu;
        let text1=_text||eroare.text;
        let imagine1=_imagine||eroare.imagine;
        if(eroare.status)
        {
            res.status(eroare.identificator).render("pagini/eroare",{titlu:titlu1, text:text1, imagine:imagine1});

        }
        else
            res.render("pagini/eroare",{titlu:titlu1, text:text1, imagine:imagine1});
    }
    else{let errDef=obGlobal.obErori.eroare_default;
         res.render("pagini/eroare",{titlu:errDef.titlu, text:errDef.text, imagine:errDef.imagine});
    }
       

}
app.listen(8080);
console.log("Serverul a pornit");