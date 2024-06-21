const username=localStorage.getItem("knk-username");
const curr_test= "adding"

const socket=io();

socket.emit("first",{username:username,test_id:curr_test});

socket.on("identity",(data)=>{
    console.log(data);
});

socket.on("error",(data)=>{
    console.log("error");
    console.log(data);
});
socket.on("wrote",(data)=>{
    console.log("wrote");
    console.log(data);
});
socket.on("compiled",(data)=>{
    console.log("compiled");
    console.log(data);
});
socket.on("not-found",()=>{
    console.log("Results not found");
});
socket.on("done",(data)=>{
    console.log("done");
    console.log(data);
});
function sendFile(){
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) {
        alert("Please select a file");
        return;
    }
    socket.emit("upload",file)
}
function send_file(){
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) {
        alert("Please select a file");
        return;
    }
    socket.emit("upload",file)
}

function sender_file(){
    var fileInput = document.getElementById("fileInput");
    var resultElement = document.getElementById("result");
    resultElement.innerHTML = "";

    var file = fileInput.files[0];
    if (!file) {
        resultElement.innerHTML = "Please select a file.";
        return;
    }
    //now we post file
    let url="https://knk-submission.azurewebsites.net/submit/1"
    fetch(url,{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body: JSON.stringify({
            choice:what,
            identity:id
        })
    }).then(res=>{
        if (res.ok){
            console.log("worked");
            return res.json();
        }
        else{
            console.log("did not work")
        }
    })
    .then(data=>{
        console.log(data);
        id=data.value;
        //console.log(id);
    })
    .catch(error=>console.error('ERROR',error))
    
}

function getRes(){
    console.log("called");
    let url="https://knk-submission.azurewebsites.net/submit/results"
    fetch(url,{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body: JSON.stringify({
            id:"1",
            name:"adding"
        })
    }).then(res=>{
        if (res.ok){
            console.log("worked");
            return res.json();
        }
        else{
            console.log("did not work")
        }
    })
    .then(data=>{
        console.log(data);
        const where=document.getElementById("result");
        if (data.score==2){
        for (let i=0;i<data.tests.length;i++){
            console.log("weird");
            var testcaseResult=document.createElement("p");
            testcaseResult.textContent=`Test Case ${i+1} :   `;
            if (data.tests[i]=="Passed"){
                testcaseResult.textContent+="Passed";
                testcaseResult.style.color="Green";
            }
            else{
                testcaseResult.textContent+="Failed";
                testcaseResult.style.color="Red";
            }
            where.appendChild(testcaseResult);
        }
        const butt=document.getElementById("submit");
        butt.onclick=sendFile;
        butt.textContent="Re-Submit";
        }
        
    })
    .catch(error=>console.error('ERROR',error))
}

function get_res(){
    console.log("call");
    //let url="https://knk-submission.azurewebsites.net/submit/1/adding"
    fetch(`/submit/${username}/${curr_test}`,{
        method:'GET'
    }).then(res=>{
        if (res.ok){
            console.log("worked");
            return res.json();
        }
        else{
            console.log("did not work")
        }
    })
    .then(data=>{
        console.log(data);
        // const where=document.getElementById("result");
        // if (data.score==2){
        // for (let i=0;i<data.tests.length;i++){
        //     console.log("weird");
        //     var testcaseResult=document.createElement("p");
        //     testcaseResult.textContent=`Test Case ${i+1} :   `;
        //     if (data.tests[i]=="Passed"){
        //         testcaseResult.textContent+="Passed";
        //         testcaseResult.style.color="Green";
        //     }
        //     else{
        //         testcaseResult.textContent+="Failed";
        //         testcaseResult.style.color="Red";
        //     }
        //     where.appendChild(testcaseResult);
        // }
        // const butt=document.getElementById("submit");
        // butt.onclick=sendFile;
        // butt.textContent="Re-Submit";
        // }
        
    })
    .catch(error=>console.error('ERROR',error))
}

function senderFile() {
    var temp=document.getElementById("result");
    temp.replaceChildren();
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) {
        alert("Please select a file");
        return;
    }

    const formData = new FormData();
    formData.append('file', file);
    //let url="https://knk-submission.azurewebsites.net/submit/1"
    fetch(`/submit/${username}`, {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(data => {
        console.log("squeeze:");
        console.log(data);
        console.log(":theorem");
        //switch_res();
        const butt=document.getElementById("sub");
        //butt.onclick=get_res;
        butt.textContent="See Results";
        butt.onclick=switch_res;
        //document.getElementById('response').innerText = data;
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('response').innerText = 'An error occurred';
    });
    
}
function switch_res(){
    window.location.href = "/submit/results";
}
console.log("well what the hell");
 