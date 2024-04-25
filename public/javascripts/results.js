const username="2";
const curr_test= "adding";
function switch_lead(){
    window.location.href="/submit/results";
}
function switch_problem(){
    window.location.href="/submit/problem";
}
function switch_submit(){
    window.location.href="/submit";
}
function switch_next(){
    window.location.href="/submit/results";
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
        const wher=document.getElementById("result");
        var v = 0;
        if (data.tests.length==0){
            var temp= document.getElementById("submit");
            var t= document.createElement("h1");
            t.textContent="Not Submitted";
            temp.replaceChildren(t);
        }
        else{
            var temp= document.getElementById("submit");
            var t= document.createElement("h1");
            t.textContent="Submitted";
            temp.replaceChildren(t);
        }
        for (let i=0;i<data.tests.length;i++){
            console.log("weird");
            var where= document.createElement("section");
            var some=document.createElement("h1");
            var some2=document.createElement("h1");
            where.style.display="flex";
            where.style.flexDirection="row";
            var testcaseResult1=document.createElement("section");
            testcaseResult1.className="them";
            
            var testcaseResult2=document.createElement("section");
            testcaseResult2.className="they";
            some.textContent=`Test Case ${i+1} :   `;
            testcaseResult1.appendChild(some);
            if (data.tests[i]=="Passed"){
                some2.textContent+="Passed";
                testcaseResult2.appendChild(some2);
                testcaseResult2.style.backgroundColor="Green";
                v+=(100/data.tests.length);
            }
            else{
                some2.textContent+="Failed";
                testcaseResult2.appendChild(some2);
                testcaseResult2.style.backgroundColor="Red";
            }
            where.appendChild(testcaseResult1);
            where.appendChild(testcaseResult2);
            wher.appendChild(where);
            var some= document.getElementById("grade");
            some.textContent=v;
        }
        
        
        
    })
    .catch(error=>console.error('ERROR',error))
}

get_res();
