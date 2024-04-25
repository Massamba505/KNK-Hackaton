var express = require('express');
var router = express.Router();
const path=require("path");
const fs=require('fs');
const multer = require('multer');
const form_data = require('form-data');
const upload = multer({ dest: 'uploads/' });
var { exec } = require('child_process');
const { rejects } = require('assert');
const main_tests=[];
const util = require('util');
exec = util.promisify(require('child_process').exec);

function test_case(person_id,test_id,input,expected_out){
    this.input=input;
    this.expected_out=expected_out;
    this.result='not-a-value';
    this.out;
    this.test=function(){
        //console.log("me?");
        exec(`${this.code} < ${input}`, (error, stdout, stderr) => {
            //console.log("starting");
            if (error) {
                this.result="exexution error";
                console.error(`execution error: ${error}`);
        
                return;
        
            }
            //console.log(`stdout: ${stdout}`);
            this.out=stdout;
            if (stdout==expected_out){
                //console.log("test reveals true");
                this.result=true;
                //console.log(this);
            }
            else{
                //console.log("test reveals false");
                this.result=false;
                //console.log(this);
            }
            //console.log("end");
        
        });
    }
}
// async function run_test(id,input,output){
//     exec(`${id}.exe < ${input}`, (error, stdout, stderr) => {
//         //console.log("starting");
//         if (error) {
//             console.error(`execution error: ${error}`);
//             return "execution error";
//         }
//         if (stdout==output){
//             console.log("end of test P");
//             return true;
//         }
//         else{
//             console.log("end of test F");
//             return false;
//         }
        
    
//     });
// }



async function run_test(id, input, expected_output) {
    try {
        const { stdout, stderr } = await exec(`${id}.exe < ${input}`);
        if (stderr) {
            console.error(`execution error: ${stderr}`);
            return "execution error";
        }
        if (stdout.trim() === expected_output.toString().trim()) {
            console.log("end of test P");
            return true;
        } else {
            console.log("end of test F");
            return false;
        }
    } catch (error) {
        console.error(`execution error: ${error}`);
        return "execution error";
    }
}

async function compile(id) {
    console.log(`exe saved to:${__dirname}`);
    try {
        const { stdout, stderr } = await exec(`g++ ${id}.cpp -o ${id}.exe`);
        if (stderr) {
            console.error(`compile error: ${stderr}`);
            return false;
        }
        return true;
    } catch (error) {
        console.error(`compile error: ${error}`);
        return false;
    }
}



function adding_test(person_id, test_id, status) {
    this.test_id = test_id;
    this.person_id = person_id;
    this.input = [__dirname + "/tests/adding/1.txt", __dirname + "/tests/adding/2.txt", __dirname + "/tests/adding/3.txt"];
    this.expected_out = [9, 604, 880];
    this.output = [];
    this.score = 'not-a-value';
    this.status = status;
    
    this.save_this=function(){
        console.log(`JSON saved to:${__dirname}`);
        const jsonData = JSON.stringify(this, null, 2);
        fs.writeFileSync(`${this.person_id}${this.test_id}.json`, jsonData);
    }
    this.test = async function () {
        const compiled = await compile(person_id);
        console.log(`compile outcome is: ${compiled}: end`);
        if (compiled){
            for (let i = 0; i < this.input.length; i++) {
                try {
                    const outcome = await run_test(this.person_id, this.input[i], this.expected_out[i]);
                    console.log(`outcome is: ${outcome}: end`);
                    if (this.score === 'not-a-value') {
                        this.score = 0;
                    }
                    if (outcome === true) {
                        this.output.push("Passed");
                        this.score++;
                    } else if (outcome === false) {
                        this.output.push("Failed");
                    }
                    this.save_this();
                } catch (error) {
                    console.error(`Error occurred during test execution: ${error}`);
                }
            }
        }
    }
    
    this.test();
    
}



function saveMainTestsToFile(mainTestsArray) {
    const jsonData = JSON.stringify(mainTestsArray, null, 2);
    fs.writeFileSync('main_tests.json', jsonData);
}
router.get('/', function(req, res, next) {
  const filePath = path.join(__dirname, "../public/submission.html");
  res.sendFile(filePath);
});
router.get('/problem', function(req, res, next) {
    const filePath = path.join(__dirname, "../public/problem.html");
    res.sendFile(filePath);
  });

router.get('/results', function(req, res, next) {
    
    const filePath = path.join(__dirname, "../public/results.html");
    res.sendFile(filePath);
});

router.post('/results', function(request, response, next) {
    let ID=request.body.id;
    let name=request.body.name;
    let index=-1;
    //console.log(main_tests);
    for (let i=0;i<main_tests.length;i++){
        if (main_tests[i].test_id==name&&main_tests[i].person_id==ID){
            index=i;
        }
    }
    
        // let n_tests=3;
        // main_tests[index].tests.push(new test_case(`${ID}`,"tests/adding/1.txt",9));
        // main_tests[index].tests.push(new test_case(`${ID}`,"tests/adding/2.txt",604));
        // main_tests[index].tests.push(new test_case(`${ID}`,"tests/adding/3.txt",880));
        // main_tests[index].run_tests();
        // let arr=[];
        // for (let i=0;i<n_tests;i++){
        //     //console.log(main_tests[index].tests[i]);
        //     //console.log(main_tests[index].tests[i]);
        //     if (main_tests[index].tests[i].result=="not-a-value"){}
        //     else if (main_tests[index].tests[i].result){
        //         arr.push("Passed");
        //     }
        //     else{
        //         arr.push("Failed");
        //     }
        // }
        response.status(200).send(main_tests);
        
    
});

router.post("/:id",upload.single('file'),(request,response,next)=>{
    if (!request.file){
        response.status(400).send('No files uploaded');
        return;
    }
    let ID=request.params.id;
    
    let filePath=request.file.path;
    console.log(`JSON saved to:${__dirname}`);
    var f=`${ID}.cpp`;
    var co_res="not done";
    var status=0;
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file: ${err}`);
            response.status(500).send('Error reading file');
            return;
        }

        fs.writeFileSync(f, data, (err) => {
            if (err) {
                console.error(`Error writing to file: ${err}`);
                return;
            }
            status=1;
            //co_res=compile(ID);
            // exec(`g++ ${ID}.cpp -o ${ID}.exe`, (error, stdout, stderr) => {
            //     if (error) {
            //         console.error(`compile error: ${error}`);
            //         response.status(200).send("compile error");
            //     }
            //     status=2;
            //     console.log("done compiling");
            //     //response.status(200).send("done");
            // });
            //console.log(`first write to ${f} successfully`);
        });
        
    });
    
    //now for the messed up part

    //main_tests.push(new test_case(ID,"adding","tests/adding/1.txt",9));
    //main_tests.push(new test_case(ID,"adding","tests/adding/2.txt",604));
    //main_tests.push(new test_case(ID,"adding","tests/adding/3.txt",880));
    main_tests.push(new adding_test(ID,"adding",status));
    // test1.tests.push(new test_case(`${ID}`,"tests/adding/1.txt",9));
    // test1.tests.push(new test_case(`${ID}`,"tests/adding/2.txt",604));
    // test1.tests.push(new test_case(`${ID}`,"tests/adding/3.txt",880));
    
    response.status(200).send(main_tests);
    saveMainTestsToFile(main_tests);
    
});


router.get("/:id/:func", function(req, res) {
    console.log("switch called");
    let ID=req.params.id;
    let name=req.params.func;
    console.log(__dirname);
    try {
        //const data = fs.readFileSync(`${ID}${name}.json`, 'utf8');
        //const data = fs.readFileSync(`${ID}${name}.json`, 'utf8');
        // Parse JSON data
        //const main_test = JSON.parse(data);
        var main_test = require(`../${ID}${name}.json`);
        res.send({status:1,tests:main_test.output});
    } catch (err) {
        console.error('Error reading main_tests.json:', err);
        res.status(200).send({status:0,message:`error reading ${ID}${name}.json:${err.message}`});
    }
});

router.get("/somethi", function(req, res) {
    try {
        // Read main_tests.json file synchronously
        const data = fs.readFileSync('main_tests.json', 'utf8');
        // Parse JSON data
        const main_tests = JSON.parse(data);
        // Send main_tests array as response
        res.send(main_tests);
    } catch (err) {
        console.error('Error reading main_tests.json:', err);
        res.status(200).send('Error reading main_tests.json');
    }
});

router.get('/leaderboard', function(req, res, next) {
    const filePath = path.join(__dirname, "../public/leaderboard.html");
    res.sendFile(filePath);
});


module.exports = router;
