/*
- The purpose of this script is to use diff3 (provided by diff package), find out where conflicts are indicated,
  apply the conflict markers (same as how git does) and then return a patch of conflict markers.
  
- Trying this in debug environment in an IDE like VSCode is more insightful.

- "diff": "^4.0.2" was the version this script worked on.
*/

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const diff = require('diff');
const fs = require('fs');

const cors = require('cors');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// routes:
app.get('/',() => {
    console.log("Home");
})

const basefile_loc = __dirname+"/docker-compose.yml"; // This was my local file - It could be any file that can be considered 'base' for further modified files.
const masterfile_loc = __dirname+"/docker-compose-master.yml"; // local file - can be considered to be part of master branch (with more modifications than basefile)
const featurefile_loc = __dirname+"/docker-compose-feature.yml"; // local file - can be considered to be part of feature branch (with more modifications than basefile)
const basefile = fs.readFileSync(basefile_loc, {encoding: "utf-8"});
const masterfile = fs.readFileSync(masterfile_loc, {encoding: "utf-8"});
const featurefile = fs.readFileSync(featurefile_loc, {encoding: "utf-8"});

const diffpatch = diff.structuredPatch('docker-compose-feature.yml','docker-compose-master.yml',
                        masterfile,featurefile);
/*
console.log(diffpatch);

var content;
diff.applyPatches(diffpatch,{
    loadFile: (diffpatch, }),
    patched: (diffpatch, content, (err) => {
        if (content) console.log("applyPatches content: ",content);
        console.log("applyPatches patched err: ",err);
    }), 
    complete: (err) => {
        console.log("applyPatches complete err: ",err);
    }
})*/

/*
(err,) => {
        if (err) console.log("applyPatches loadFile err: ",err);
        console.log("loadfileCB: ",data);
        content = diff.applyPatch(data,diffpatch);
    } */

const hunksarr = diff.merge(masterfile,featurefile,basefile);
//console.log(hunksarr.hunks);
//console.log(hunksarr.hunks[0].lines); 

// Accessing "mine" i.e. destination branch's change 
var file = hunksarr.hunks[0].lines;
file.forEach((val)=>{
    if (typeof val == "object"){}
        //console.log();
    //console.log(val);
})

// Accessing "theirs" i.e. source branch's change 
var file = hunksarr.hunks[0].lines;
file.forEach((val)=>{
    if (typeof val == "object"){}
        //console.log(val.theirs[1]);
    //console.log(val);
})



hunksarr.hunks.forEach(hunkelem => {
    // if hunk element shows a conflict, pass its patch i.e. 'lines' array to mCD function:
    if (hunkelem.conflict) {
        var patch = hunkelem.lines;
        // Arrays to pack starting and offset values of old and new changes. Will only pack what it can get (i.e. undefined values won't be added)
        var oldsArr = [], newsArr = []; 
        var oldStart = hunkelem.oldStart;
        oldsArr.push(oldStart);
        if (hunkelem.oldLines != undefined)
            var oldEnd = oldStart + hunkelem.oldLines;
            oldsArr.push(oldEnd);
        
        var newStart = hunkelem.newStart;
        newsArr.push(newStart);
        if (hunkelem.newLines != undefined)
            var newEnd = newStart + hunkelem.newLines;
            newsArr.push(newEnd);
        //console.log((hunkelem.lines.find((element) => { return typeof element == "object"})));
        //var minelen = (hunkelem.lines.find((element) => { return typeof element == "object"})).mine.length; // Unsure whether this works
        //var theirslen = (hunkelem.lines.find((element) => { return typeof element == "object"})).theirs.length; // Unsure of this too.
        mergeConflictMarkers(patch, masterfile_loc, oldsArr, newsArr);
    }
})
function mergeConflictMarkers(patch, mergeDestFileLoc, oldsArr, newsArr){
    const patch_backup = patch; 
    let updated_patch = "";
    const topmarker = "<<<<<<<< HEAD";
    const midmarker1 = "||||||||||||||| BASE_SHORT_HASH_HERE"; // Caused by branch merging 'Case #3'
    const midmarker2 = "===============";
    const bottommarker = ">>>>>>>> IncomingChange | MERGE_SOURCE_BRANCH_NAME_HERE"; // INTEGRATION_TASK: This should be changed to a template string, `<<<<<<< ${mergeDest_branch_name}`
    // Those 7 steps to be performed here and store the updated lines array as complete string (use '.join(" ")' with space or Array.toString()) in updated_patch.
    for(i = 0; i <= patch.length; i++){
        
        if (typeof patch[i] == "object"){
            var minelen = patch[i].mine.length;
            var theirslen = patch[i].theirs.length;
            var minepiece = patch[i].mine.slice(minelen/2);
            var basepiece = patch[i].mine.slice(0,minelen/2);
            console.log(basepiece);
            var baselen = basepiece.length;
            //var minepiece = minepiece.replace(/(\+|-)/g,''); // Removes any "+"" or "-" in the mine string
            var theirpiece = patch[i].theirs.slice(theirslen/2);
            //var theirpiece = theirpiece.replace(/(\+|-)/g,''); // Removes any "+" or "-" in the their string
            patch.splice(i, 0, topmarker); // STEP2 Inserting topmarker in patch.
            // In test case, i was 4 so comments have 4 + ..
            
            // STEP3 Iterate and place each element of minepiece sliced array to preserve their tabs and newlines
            // 4 + j (j = minepiece.length)
            var itr1 = 1;
            for (itr1 = 1, pieceIndex = 0; itr1 <= minepiece.length || itr1 == 1; itr1++, pieceIndex++){ // The OR condition is for when the minepiece is having length 1.
                //console.log((minelen/2)+(itr1-1));
                
                patch.splice(i+itr1, 0, minepiece[pieceIndex].replace(/(\+|-)/g,'')); // Show local change by putting them one by one as patch array elements.
            }
            // STEP4 4 + j
            patch.splice(i+itr1, 0, midmarker1); // Inserting middlemarker1
            // STEP5 4 + j + m (m = basepiece.length)
            for (itr_b = 1, pieceIndex = 0; itr_b <= basepiece.length || itr_b == 1; itr_b++, pieceIndex++){
                patch.splice(i+itr1+itr_b, 0, basepiece[pieceIndex].replace(/(\+|-)/g,''))
            }
            // STEP6 4 + j + m
            patch.splice(i+itr1+itr_b, 0, midmarker2); // Inserting middlemarker2
            
            // STEP7 4 +j + m + k (k = theirpiece.length)
            var itr2 = 1
            for (itr2 = 1, pieceIndex = 0; itr2 <= theirpiece.length || itr2 == 1; itr2++, pieceIndex++) { // The OR condition is for when theirpiece is having length 1.
                //console.log((theirslen/2)+(itr2-1)-1);
                patch.splice(i+itr1+itr_b+itr2, 0, theirpiece[pieceIndex].replace(/(\+|-)/g,'')); // Show Incoming change by putting them one by one as patch array elements.
            } 
            // STEP8 4 + j + m + k
            patch.splice(i+itr1+itr_b+itr2, 0, bottommarker); // Inserting bottommarker in patch
            patch.splice(i+itr1+1+itr_b+itr2,1); // Remove the conflict object which was worked on from the patch 
            i = i+itr1+1+itr_b+itr2-1 // For optimizing i's value, bringing it 'closer' to the next conflict object
        }
    }
    updated_patch = patch;
    console.log("UPDATED: ",updated_patch);


    // ---> 'updated_patch' should be ready BEFORE moving ahead from this point <---

    // Open the file using 'fs.open()' to obtain file descriptor (a pointer)- in write mode. 
    //fs.open(mergeDestFileLoc,'w',(err,fd) =>{
    //  if (err) console.log("fs.open err: ", err);
        // Write the file using 'fs.write() by specifying start and end explicitly *after* passing data that will be written.
        // Shift the pointer to the 'start' line number and start writing.
        //fs.write(fd,updated_patch,0,oldsArr.oldStart,oldsArr.oldLines,) // *** FIND OUT EXACTLY HOW THIS WRITES BUFFER TO FILES. ***
    //})

}








fs.open("MyFile","w",(err,fd)=> {
    //fs.read(fd,mergeDestFile,0,oldsArr.oldLines|patch.length,oldsArr.oldStart)
})



















app.listen(port,()=>{
    console.log("Started NodeJS server on "+port);
})
