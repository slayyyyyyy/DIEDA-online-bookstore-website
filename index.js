const express = require("express");
const fs=require("fs");
const path=require('path');
const sharp= require('sharp');
const sass=require('sass');
const ejs=require('ejs');
const {Client}=require('pg');

obGlobal={
    obErori:null,
    obImagini:null,
    folderScss:path.join(__dirname,"resurse/scss"),
    folderCss:path.join(__dirname,"resurse/css"),
    folderBackup: path.join(__dirname,"backup")
}


app= express();
console.log("Folder proiect", __dirname);
console.log("Cale fisier",__filename);
console.log("Director de lucru",process.cwd());

vectorFoldere=["temp","temp1","backup"]
for(let folder of vectorFoldere){
    //let caleFolder=__dirname+"/"+folder;
    let caleFolder=path.join(__dirname,folder);
    if(!fs.existsSync(caleFolder))
    {
        fs.mkdirSync(caleFolder);
    }
}

var client= new Client({database:"produse",
        user:"andreea",
        password:"admin",
        host:"localhost",
        port:5432});
client.connect();

function compileazaScss(caleScss, caleCss){
    console.log("cale:",caleCss);
    if(!caleCss){
        let vectorCale=caleScss.split("\\")
        let numeFisExt=vectorCale[vectorCale.length-1];

        let numeFis=numeFisExt.split(".")[0]   /// "a.scss"  -> ["a","scss"]
        caleCss=numeFis+".css";
    }
    
    if (!path.isAbsolute(caleScss))
        caleScss=path.join(obGlobal.folderScss,caleScss )
    if (!path.isAbsolute(caleCss))
        caleCss=path.join(obGlobal.folderCss,caleCss )
    
    
    // la acest punct avem cai absolute in caleScss si  caleCss
    let vectorCale=caleCss.split("\\");
    let numeFisCss=vectorCale[vectorCale.length-1];
    if (fs.existsSync(caleCss)){
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup,numeFisCss ))// +(new Date()).getTime()
    }
    rez=sass.compile(caleScss, {"sourceMap":true});
    fs.writeFileSync(caleCss,rez.css)
    console.log("Compilare SCSS",rez);
}
//compileazaScss("a.scss");
fs.watch(obGlobal.folderScss, function(eveniment, numeFis){
    console.log(eveniment, numeFis);
    if (eveniment=="change" || eveniment=="rename"){
        let caleCompleta=path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)){
            compileazaScss(caleCompleta);
        }
    }
})

app.set("view engine","ejs");

app.use("/resurse",express.static(__dirname+"/resurse"));
app.use("/node_modules", express.static(__dirname+"/node_modules"));

app.use(/^\/resurse(\/[a-zA-Z0-9]*)*$/, function(req,res){
    afisareEroare(res,403);
});

app.get("/favicon.ico",function(req,res){
    res.sendFile(__dirname+"/resurse/imagini/favicon.ico");
})

app.get("/ceva", function(req, res){
    console.log("cale:",req.url)
    res.send("<h1>altceva<h1> ip:"+req.ip);
})

app.get(["/index","/","/home"], function(req, res){
    res.render("pagini/index", {ip: req.ip, a:10, b:20, imagini:obGlobal.obImagini.imagini});
})

// ^\w+\.ejs$ - pt match cu index.ejs

app.get("/despre" , function(req,res){ 
    res.render("pagini/despre");
})

// ----------------------------Produse--------------------------- //

app.get("/produse",function(req, res){
    console.log(req.query)

    //TO DO query pentru a selecta toate produsele
    //TO DO se adauaga filtrarea dupa tipul produsului
    //TO DO se selecteaza si toate valorile din enum-ul categ_produse
    client.query("select * from unnest(enum_range(null::categ_produse))",function(err, rezCategorie){
        //console.log(err);
        //console.log(rez);
        let conditieWhere="";
        if(req.query.tip)
            conditieWhere=` where categorie='${req.query.tip}'`
        client.query("select * from produse" +conditieWhere , function( err, rez){
            console.log(300)
            if(err){
                console.log(err);
                afisareEroare(res, 2);
            }
            else
                res.render("pagini/produse", {produse:rez.rows, optiuni:rezCategorie.rows});
        });
    
    })

});


app.get("/produs/:id",function(req, res){
    console.log(req.params);
   
    client.query(`select * from produse where id=${req.params.id}`, function( err, rezultat){
        if(err){
            console.log(err);
            afisareEroare(res, 2);
        }
        else
            res.render("pagini/produs", {prod:rezultat.rows[0]});
    });
});



app.get("/*.ejs",function(req,res){
    afisareEroare(res,400);
})

app.get("/*", function(req,res){
    try{
    res.render("pagini"+req.url,function(err,rezRandare){
        if(err)
        {
        console.log(err);
        if(err.message.startsWith("Failed to lookup view"))
        afisareEroare(res,404);
        else
        afisareEroare(res);
        }
    else {
        console.log(rezRandare);
        res.send(rezRandare);
    }

});
    }catch(err){
        if(err.message.startsWith("Cannot find module"))
        afisareEroare(res,404);
        else
        afisareEroare(res);
        }
    })

function initErori()
{
    var continut=fs.readFileSync(__dirname+"/resurse/json/erori.json").toString("utf-8");
    console.log(continut);
    obGlobal.obErori=JSON.parse(continut);
    let vErori=obGlobal.obErori.info_erori;
    for(let eroare of vErori){
        eroare.imagine="/"+obGlobal.obErori.cale_baza+"/"+eroare.imagine;
    }
}
initErori();

function initImagini(){
    var continut= fs.readFileSync(__dirname+"/resurse/json/galerie.json").toString("utf-8");

    obGlobal.obImagini=JSON.parse(continut);
    let vImagini=obGlobal.obImagini.imagini;

    let caleAbs=path.join(__dirname,obGlobal.obImagini.cale_galerie);
    let caleAbsMediu=path.join(__dirname,obGlobal.obImagini.cale_galerie, "mediu");
    if (!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);

    //for (let i=0; i< vErori.length; i++ )
    for (let imag of vImagini){
        [numeFis, ext]=imag.cale_relativa.split(".");
        let caleFisAbs=path.join(caleAbs,imag.cale_relativa);
        let caleFisMediuAbs=path.join(caleAbsMediu, numeFis+".webp");
        sharp(caleFisAbs).resize(400).toFile(caleFisMediuAbs);
        imag.cale_relativa_mediu=path.join("/", obGlobal.obImagini.cale_galerie, "mediu",numeFis+".webp" )
        imag.cale_relativa=path.join("/", obGlobal.obImagini.cale_galerie, imag.cale_relativa )
        //eroare.imagine="/"+obGlobal.obErori.cale_baza+"/"+eroare.imagine;
    }
}
initImagini();



function afisareEroare(res,_identificator,_titlu="titlu default",_text,_imagine){
    let vErori=obGlobal.obErori.info_erori;
    let eroare=vErori.find(function(elem){return elem.identificator==_identificator;})
    if(eroare){
        let titlu1= _titlu=="titlu default" ? (eroare.titlu || _titlu) : _titlu;
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
         res.render("pagini/eroare",{titlu:errDef.titlu, text:errDef.text, imagine:obGlobal.obErori.cale_baza+"/"+errDef.imagine});
    }
       

}



app.listen(8080);
console.log("Serverul a pornit");