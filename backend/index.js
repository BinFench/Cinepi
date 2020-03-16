const fs = require("fs");
const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');
const path = require("path");

const contentPath = "/mnt/c/users/bmanmcawesome/desktop/Work/Web/media/"

let imgPath = [];
let videoPath = [];
let content = [];
let catalogue = [];
let relativePath = [];
let catalogueLength = 0;

const diff = (diffMe, diffBy) => diffMe.split(diffBy).join('');

const movieScan = (searchPath, tag) => {
    const files = fs.readdirSync(searchPath);
    let img = null;
    let video = null;
    let dir = [];
    for (let i = 0; i < files.length; i++) {
        const stats = fs.statSync(searchPath + files[i]);
        if (stats.isDirectory()) {
            dir.push(searchPath + files[i] + "/");
        } else if (stats.isFile()) {
            const type = path.extname(searchPath + files[i]);
            if (type === ".mp4" || type === ".mkv" || type === ".avi") {
                if (video !== null) {
                    videoPath.push(video);
                    imgPath.push(null);
                    content.push(tag);
                    relativePath.push(searchPath);
                }
                video = searchPath + files[i];
            } else if (type === ".jpg" || type === ".png") {
                if (img !== null) {
                    imgPath.push(img);
                    videoPath.push(null);
                    content.push(tag);
                    relativePath.push(searchPath);
                }
                img = searchPath + files[i];
            }
        }
    }
    if (video !== null || img !== null) {
        videoPath.push(video);
        imgPath.push(img);
        content.push(tag);
        relativePath.push(searchPath);
    }
    for (let i = 0; i < dir.length; i++) {
        if (video === null) {
            movieScan(dir[i], diff(dir[i], searchPath).slice(0, -1));
        }
    }
}

const getCatalogue = () => {
    let index = 0;
    let lastContent = "";
    let item = {
        videos: [],
        img: null,
        name: "",
        relativePath: "",
        absPath: ""
    }
    for (let i = 0; i < content.length; i++) {
        if (content[i] !== lastContent) {
            if (lastContent !== "" && item.videos.length !== 0) {
                catalogue.push({...item});
            }
            lastContent = content[i];
            item.videos = [];
            item.img = null;
            item.name = lastContent;
            item.relativePath = relativePath[i];
            item.absPath = contentPath;
        }
        if (imgPath[i] !== null) {
            item.img = imgPath[i];
        }
        if (videoPath[i] !== null) {
            item.videos.push(videoPath[i]);
        }
    }
    if (item.videos.length !== 0) {
        catalogue.push({...item});
    }
    catalogueLength = catalogue.length;
}

movieScan(contentPath, "");
getCatalogue();

const app = express();
app.use(bodyParser.json());
app.use(cors());
console.log(__dirname);
app.use(express.static(contentPath));

app.get("/catalogue/*", (req, res) => {
    let contentNum;
    let episodeNum = 0;
	if (req.originalUrl.substring(11) == "") {
        res.json({
            success: true,
            data: catalogue
        });
        return;
	} else {
        contentNum = parseInt(req.originalUrl.substring(11).split("-")[0]);
        episodeNum = parseInt(req.originalUrl.substring(11).split("-")[1]);
        if (contentNum > catalogueLength - 1
            || contentNum < 0
            || isNaN(contentNum)) {
            contentNum = -1;
        }
        if (contentNum === -1
            || episodeNum > catalogue[contentNum].videos.length - 1
            || episodeNum < 0
            || isNaN(episodeNum)) {
            episodeNum = -1
        }
    }

    if (contentNum === -1 || episodeNum === -1) {
        res.status(404).send("Not found");
        return;
    }

    const path = catalogue[contentNum].videos[episodeNum];
    const stat = fs.statSync(path)
    const fileSize = stat.size
    const range = req.headers.range

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-")
        const start = parseInt(parts[0], 10)
        const end = parts[1]
          ? parseInt(parts[1], 10)
          : fileSize-1

        if(start >= fileSize) {
          res.status(416).send('Requested range not satisfiable\n'+start+' >= '+fileSize);
          return
        }
    
        const chunksize = (end-start)+1
        const file = fs.createReadStream(path, {start, end})
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4',
        }

        res.writeHead(206, head)
        file.pipe(res)
    } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
        }
        res.writeHead(200, head)
        fs.createReadStream(path).pipe(res)
    }
});

app.listen(4000, function () {
    console.log('Listening on port 4000!')
  })