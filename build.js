#!/usr/bin/env node

var https = require('https'),
    fs = require('fs'),
    Path = require('path'),
    jqtversion = 'v1.2.6',
    dist_path = __dirname + '/content/download/dist/' + jqtversion,
    mode = fs.statSync(__dirname).mode,
    jsp = require("uglify-js").parser,
    pro = require("uglify-js").uglify;

function githubOpts(path) {
    return {
        host: 'api.github.com',
        path: path,
        port: 443
    };
};

function mkdirp(path, mode, callback, position) {

    var parts = Path.normalize(path).split('/');
    position = position || 0;

    if (position >= parts.length) {
        return callback();
    }

    var directory = parts.slice(0, position + 1).join('/') || '/';
    fs.stat(directory, function(err) {
        if (err === null) {
            mkdirp(path, mode, callback, position + 1);
        } else {
            fs.mkdir(directory, mode, function (err) {
                if (err && err.errno != 17) {
                    return callback(err);
                } else {
                    mkdirp(path, mode, callback, position + 1);
                }
            });
        }
    });
}



//1 Get Tag SHA
var tagopts = githubOpts('/repos/jquerytools/jquerytools/git/refs/tags/' + jqtversion);
https.get(tagopts, function(res) {

    if (res.statusCode === 200) {
        res.on('data', function(d) {
            var j = JSON.parse(d);
            processTag(j.object.sha);
        });
    } else {
        console.error("Tag request Failed with status code:" + res.statusCode);
    }

}).on('error', function(e) {
    console.error("Error");
    console.error(e);
});



//2 Get Tree

function processTag(sha) {
    var treeopts = githubOpts('/repos/jquerytools/jquerytools/git/trees/' + sha + '?recursive=true');

    https.get(treeopts, function(res) {
        var result = "";
        if (res.statusCode === 200) {
            res.on('data', function(d) {
                result += d.toString();
            }).on('end', function() {
                processTree(JSON.parse(result).tree);
            });
        } else {
            console.error("Tree request Failed with status code:" + res.statusCode);
        }

    }).on('error', function(e) {
        console.error("Error");
        console.error(e);
    });
}

//3 Get Individual files and copy them to downloads/dist/version

function processTree(tree) {
    var length = tree.length;
    for (var i=0; i < length; i++) {
        var item = tree[i];
        if (item.path.indexOf('src/') == 0) {
            processItem(item);
        }
    }
}


function processItem(item) {
    if (item.path.indexOf(".js") > 0) {
        processFile(item);
    }
}

//4 Run uglify to minize the files to min.js
function processFile(item) {

    var frag = item.path.replace('src/', ''),
        newpath = dist_path + '/' + frag,
        minpath = dist_path + '/' + Path.dirname(frag) + '/' + Path.basename(frag, '.js') + '.min.js';

    mkdirp(Path.dirname(newpath), mode, function() {
        var fileopts = githubOpts(item.url);
        fileopts.headers = {
          Accept: "application/vnd.github-blob.raw"
        };

        https.get(fileopts, function(res) {
            var result = "";
            if (res.statusCode === 200) {
                res.on('data', function(d) {
                    result += d.toString();
                }).on('end', function() {
                    fs.writeFile(newpath, result, function() {
                        console.log("Downloaded:" + newpath);
                        var ast = jsp.parse(result);
                        ast = pro.ast_mangle(ast);
                        ast = pro.ast_squeeze(ast);
                        var compressed = pro.gen_code(ast);
                        fs.writeFile(minpath, compressed, function() {
                            console.log("Compressed:" + minpath);
                        });
                    });
                });
            } else {
                console.error("Blob request Failed with status code:" + res.statusCode);
            }

        }).on('error', function(e) {
            console.error("Error");
            console.error(e);
        });


    });
}