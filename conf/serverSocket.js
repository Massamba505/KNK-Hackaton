const socketIO = require('socket.io');
const fs=require("fs");
const path=require("path");
var { exec } = require('child_process');
const { rejects } = require('assert');
const util = require('util');
const { error } = require('console');
exec = util.promisify(require('child_process').exec);
const mapper=[];
const tests=[];
const results=[];
let next_id=0;
function map(username,socket_id,test_id){
    this.username=username;
    this.id=socket_id;
    this.test_id=test_id;
}

function test(test_id){
    this.test_id=test_id;
    this.inputs=[];
    this.outputs=[];
}

function result(username,test_id,outputs){
    this.username=username;
    this.test_id=test_id;
    this.outputs=outputs;
}

let te=new test("adding");
te.inputs=["4 5", "115 489", "503 377"];
te.outputs=[9, 604, 880];
tests.push(te);

async function run_single_test(input,expected_output,socket,filePath,io){
    try {
        const { stdout, stderr } = await exec(`echo ${input} | ${filePath}.exe`);
        if (stderr) {
            console.error(`execution error: ${stderr}`);
            io.to(socket.id).emit("compile_error",{message:`execution error: ${stderr}`});
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
        io.to(socket.id).emit("compile_error",{message:`execution error: ${stderr}`});
        return "execution error";
    }
}

async function run_test(test_id,filePath,socket,io,name){
    const index=tests.findIndex(car=>car.test_id==test_id);
    let output=[];
    let score=0;
    if (index==-1){
        console.log("test id does not exist");
        console.log(tests);
        console.log(test_id);
        return;
    }
    for(let i=0;i<tests[index].inputs.length;i++){
        try {
            const outcome = await run_single_test(tests[index].inputs[i],tests[index].outputs[i], socket,filePath,io);
            console.log(`outcome is: ${outcome}`);
            if (outcome === true) {
                output.push("Passed");
                score++;
            } 
            else if (outcome === false) {
                output.push("Failed");
            }
            else{
                throw new Error('Exectuion error');
            }
            if (i==tests[index].inputs.length-1){
                io.to(socket.id).emit("done",{message:"done testing"});
                console.log(output);
                results.push(new result(name,test_id,output));
            }
        } catch (error) {
            console.error(`Error occurred during test execution: ${error}`);
            results.push(new result(name,test_id,output));
        }
    }
}

async function compile(socket,filePath,io,ID,test_id){
    console.log(`testing ${ID} with test ${test_id}`);
    io.to(socket.id).emit("compiled",{message:`starting compilation`});
    try {
        const { stdout, stderr } = await exec(`g++ ${filePath}.cpp -o ${filePath}.exe`);
        if (stderr) {
            console.error(`compile error: ${stderr}`);
            io.to(socket.id).emit("compile_error",{message:`compile error: ${stderr}`});
            return false;
        }
        //io.to(socket.id).emit("compiled",{message:"compiled successfully"});
        console.log("compiled successfully,now running");
        io.to(socket.id).emit("compiled",{message:`done compiling`});
        run_test(test_id,filePath,socket,io,ID);
        return true;
    } catch (error) {
        console.error(`compile error: ${error}`);
        io.to(socket.id).emit("compile_error",{message:`compile error: ${stderr}`});
        return false;
    }
}

function configureSocketIO(server) {
    const io = socketIO(server);
    
    io.on('connection', (socket) => {
        console.log('User connected');
        io.to(socket.id).emit("identity",{status:"connection successful"});

        //#################################################################
        //first connection send a username to map to id
        socket.on("first",(data)=>{
            mapper.push(new map(data.username,socket.id,data.test_id));
            //console.log(mapper);
        });
        //copy
        socket.on("upload",(file)=>{
            //socket id
            const index=mapper.findIndex(car => car.id == socket.id);
            if (index==-1){
                console.log("it is I");
                return;
            }
            //index gives username, testID
            let ID=mapper[index].username;
            console.log(`${ID} uploaded file`);
            let f=path.join(__dirname, `../programs/${ID}.cpp`);
            let filePath=path.join(__dirname, `../programs/${ID}`);
            //console.log(f);
            fs.writeFile(f, file, (err) => {
                if (err) {
                    console.error(`Error writing to file: ${err}`);
                    io.to(socket.id).emit("error", { message: `Error writing to file: ${err}` });
                    return;
                }
                //console.log(`Successfully wrote to ${f}`);
                io.to(socket.id).emit("wrote",{message:"Successfully wrote"});
                //compile here
                compile(socket,filePath,io,ID,mapper[index].test_id);
            });
        });
        
        socket.on("result",(data)=>{
            //username,test id
            const index=results.findIndex(car=>car.test_id==data.test_id&&car.username==data.username);
            if (index==-1){
                io.to(socket.id).emit("not-found");
                return;
            }
            io.to(socket.id).emit("results",{results:results[index].outputs});

        });

        //=======================================================
        //handle disconnection
        socket.on('disconnect', () => {
            console.log(`user disconnected:${socket.id}`);
            const index=mapper.findIndex(car=>car.id==socket.id);
            mapper.splice(index,1);
            //find the socket and remove it
        });
    });

    return io;
}

module.exports = configureSocketIO;