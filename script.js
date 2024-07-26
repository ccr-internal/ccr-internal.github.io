//pay table dict (obj)
payArr = {};
//contents of output text file
output = "output:\n";

//event listener for txt
const payTable = document.getElementById("pays");
payTable.addEventListener("change", handleTXT);

function handleTXT(){
    const payFile = this.files[0];
    const txtReader = new FileReader();

    txtReader.onload = function(e){
        const t = e.target.result;
        const empPayLines = t.split('\n');
        empPayLines.forEach((l) => {
            const emp = l.split('/');
            payArr["\"" + emp[1] + "\""] = parseFloat(emp[2]);
        });
    }
    txtReader.readAsText(payFile);
}

//event listener for csv
const input = document.getElementById("inp");
input.addEventListener("change", handleCSV);

function handleCSV(){
    const inpFile = this.files[0];
    const reader = new FileReader();

    reader.onload = function(e){
        const text = e.target.result;
        processCSV(text);
    }
    reader.readAsText(inpFile);
}

//process csv input
function processCSV(t){
    let lines = t.split('\n');
    lines.splice(0, 1);
    let punches = []; //array of punches
    lines.forEach((l) => punches.push(l.split(',')));
    let empArr = [[]]; //array by employees
    let curEmp = 0;
    punches.forEach((p) => {
        if(p.length == 1){
            curEmp++;
            empArr.push([]);
        }
        else{
            empArr[curEmp].push(p);
        }
    });
    empArr.pop();
    //loop through employees, calculate hours
    empArr.forEach((emp) => {
        console.log(emp[0][8]);
        //name: [0] | ID: [2] | in day,time: [4,5] | out day,time: [6,7] | dept: [8]
        if(emp[0][8] === "\"Office\""){
            let h = 0;
            emp.forEach((p) => {
                h+=(clockToDec(p[7])-clockToDec(p[5]));
                if(p[4] !== p[6]){h+=24;}
            });
            let pay = h*payArr[emp[0][2]];
            output += "name: " + emp[0][0] + " | ID: " + emp[0][2] + " | total hours: " + h + " | pay: " + pay + "\n";
        }
        if(emp[0][8] === "\"Tech\""){
            let th = 0;
            let dh = 0;
            let eh = 0;
            let nh = 0;
            let dhe = 0;
            let ehe = 0;
            let nhe = 0;
            emp.forEach((p) => {
                let ti = clockToDec(p[5]);
                let to = clockToDec(p[7]);
                if(p[4]!==p[6]){to+=24;}
                //clocked in night shift of day before
                if(ti < 7){
                    //worked til after 7, add time ti -- 7
                    if(to > 7){
                        if(p[4] === "\"Sun\"" || p[4] === "\"Mon\""){nhe+=7-ti;}
                        else{nh+=7-ti;}
                        //add rest of shift
                        if(to <= 15){
                            if(p[4] === "\"Sat\"" || p[4] === "\"Sun\""){dhe+=to-7;}
                            else{dh+=to-7;}
                        }
                        else{
                            if(p[4] === "\"Sat\"" || p[4] === "\"Sun\""){dhe+=8; ehe+=to-15;}
                            else{dh+=8; eh+=to-15;}
                        }
                    }
                    else{
                        if(p[4] === "\"Sun\"" || p[4] === "\"Mon\""){nhe+=to-ti;}
                        else{nh+=to-ti;}
                    }
                }
                //clocked in day shift
                if(ti >= 7 && ti < 15){
                    //worked til after 15, add time ti -- 15
                    if(to > 15){
                        if(p[4] === "\"Sat\"" || p[4] === "\"Sun\""){dhe+=15-ti;}
                        else{dh+=15-ti;}
                        //add rest of shift
                        if(to <= 23){
                            if(p[4] === "\"Sat\"" || p[4] === "\"Sun\""){ehe+=to-15;}
                            else{eh+=to-15;}
                        }
                        else{
                            if(p[4] === "\"Sat\"" || p[4] === "\"Sun\""){ehe+=8; nhe+=to-23;}
                            else{eh+=8; nh+=to-23;}
                        }
                    }
                    else{
                        if(p[4] === "\"Sat\"" || p[4] === "\"Sun\""){dhe+=to-ti;}
                        else{dh+=to-ti;}
                    }
                }
                //clocked in evening shift
                if(ti >= 15 && ti < 23){
                    //worked til after 23, add time ti -- 23
                    if(to > 23){
                        if(p[4] === "\"Sat\"" || p[4] === "\"Sun\""){ehe+=23-ti;}
                        else{eh+=23-ti;}
                        //add rest of shift
                        if(to <= 31){
                            if(p[4] === "\"Sat\"" || p[4] === "\"Sun\""){nhe+=to-23;}
                            else{nh+=to-23;}
                        }
                        else{
                            if(p[4] === "\"Fri\""){nh+=8; dhe+=to-31;}
                            else if(p[4] === "\"Sat\""){nhe+=8; dhe+=to-31;}
                            else if(p[4] === "\"Sun\""){nhe+=8; dh+=to-31;}
                            else{nh+=8; dh+=to-31;}
                        }
                    }
                    else{
                        if(p[4] === "\"Sat\"" || p[4] === "\"Sun\""){ehe+=to-ti;}
                        else{eh+=to-ti;}
                    }
                }
                //clocked in night shift
                if(ti >= 23){
                    //worked til after 31, add time ti -- 31
                    if(to > 31){
                        if(p[4] === "\"Sat\"" || p[4] === "\"Sun\""){nhe+=31-ti;}
                        else{nh+=31-ti;}
                        //add rest of shift
                        if(to <= 39){
                            if(p[4] === "\"Fri\"" || p[4] === "\"Sat\""){dhe+=to-31;}
                            else{dh+=to-31;}
                        }
                        else{
                            if(p[4] === "\"Fri\"" || p[4] === "\"Sat\""){dhe+=8; ehe+=to-39;}
                            else{dh+=8; eh+=to-39;}
                        }
                    }
                    else{
                        if(p[4] === "\"Sat\"" || p[4] === "\"Sun\""){nhe+=to-ti;}
                        else{nh+=to-ti;}
                    }
                }
            });
            th = dh + eh + nh + dhe + ehe + nhe;
            let pay = dh*(payArr[emp[0][2]]) + eh*(0.25+payArr[emp[0][2]]) + nh*(0.5+payArr[emp[0][2]]) + dhe*(0.25+payArr[emp[0][2]]) + ehe*(0.5+payArr[emp[0][2]]) + nhe*(0.75+payArr[emp[0][2]]);
            //round pay to nearest cent
            pay*=100;
            pay = Math.round(pay);
            pay*=0.01;
            output += "name: " + emp[0][0] + " | ID: " + emp[0][2] + " | total hours: " + th + " | pay: " + pay + "\n";
        }
        if(emp[0][8] === "\"Nurse\""){
            let th = 0;
            let dh = 0;
            let eh = 0;
            let nh = 0;
            let dhe = 0;
            let ehe = 0;
            let nhe = 0;
            emp.forEach((p) => {
                let ti = clockToDec(p[5]);
                let to = clockToDec(p[7]);
                if(p[4]!==p[6]){to+=24;}
                //clocked in night shift of day before
                if(ti < 7){
                    //worked til after 7, add time ti -- 7
                    if(to > 7){
                        if(p[4] === "\"Sat\"" || p[4] === "\"Sun\"" || p[4] === "\"Mon\""){nhe+=7-ti;}
                        else{nh+=7-ti;}
                        //add rest of shift
                        if(to <= 15){
                            if(p[4] === "\"Fri\"" || p[4] === "\"Sat\"" || p[4] === "\"Sun\""){dhe+=to-7;}
                            else{dh+=to-7;}
                        }
                        else{
                            if(p[4] === "\"Fri\"" || p[4] === "\"Sat\"" || p[4] === "\"Sun\""){dhe+=8; ehe+=to-15;}
                            else{dh+=8; eh+=to-15;}
                        }
                    }
                    else{
                        if(p[4] === "\"Sat\"" || p[4] === "\"Sun\"" || p[4] === "\"Mon\""){nhe+=to-ti;}
                        else{nh+=to-ti;}
                    }
                }
                //clocked in day shift
                if(ti >= 7 && ti < 15){
                    //worked til after 15, add time ti -- 15
                    if(to > 15){
                        if(p[4] === "\"Fri\"" || p[4] === "\"Sat\"" || p[4] === "\"Sun\""){dhe+=15-ti;}
                        else{dh+=15-ti;}
                        //add rest of shift
                        if(to <= 23){
                            if(p[4] === "\"Fri\"" || p[4] === "\"Sat\"" || p[4] === "\"Sun\""){ehe+=to-15;}
                            else{eh+=to-15;}
                        }
                        else{
                            if(p[4] === "\"Fri\"" || p[4] === "\"Sat\"" || p[4] === "\"Sun\""){ehe+=8; nhe+=to-23;}
                            else{eh+=8; nh+=to-23;}
                        }
                    }
                    else{
                        if(p[4] === "\"Fri\"" || p[4] === "\"Sat\"" || p[4] === "\"Sun\""){dhe+=to-ti;}
                        else{dh+=to-ti;}
                    }
                }
                //clocked in evening shift
                if(ti >= 15 && ti < 23){
                    //worked til after 23, add time ti -- 23
                    if(to > 23){
                        if(p[4] === "\"Fri\"" || p[4] === "\"Sat\"" || p[4] === "\"Sun\""){ehe+=23-ti;}
                        else{eh+=23-ti;}
                        //add rest of shift
                        if(to <= 31){
                            if(p[4] === "\"Fri\"" || p[4] === "\"Sat\"" || p[4] === "\"Sun\""){nhe+=to-23;}
                            else{nh+=to-23;}
                        }
                        else{
                            if(p[4] === "\"Thu\""){nh+=8; dhe+=to-31;}
                            else if(p[4] === "\"Fri\"" || p[4] === "\"Sat\""){nhe+=8; dhe+=to-31;}
                            else if(p[4] === "\"Sun\""){nhe+=8; dh+=to-31;}
                            else{nh+=8; dh+=to-31;}
                        }
                    }
                    else{
                        if(p[4] === "\"Fri\"" || p[4] === "\"Sat\"" || p[4] === "\"Sun\""){ehe+=to-ti;}
                        else{eh+=to-ti;}
                    }
                }
                //clocked in night shift
                if(ti >= 23){
                    //worked til after 31, add time ti -- 31
                    if(to > 31){
                        if(p[4] === "\"Fri\"" || p[4] === "\"Sat\"" || p[4] === "\"Sun\""){nhe+=31-ti;}
                        else{nh+=31-ti;}
                        //add rest of shift
                        if(to <= 39){
                            if(p[4] === "\"Thu\"" || p[4] === "\"Fri\"" || p[4] === "\"Sat\""){dhe+=to-31;}
                            else{dh+=to-31;}
                        }
                        else{
                            if(p[4] === "\"Thu\"" || p[4] === "\"Fri\"" || p[4] === "\"Sat\""){dhe+=8; ehe+=to-39;}
                            else{dh+=8; eh+=to-39;}
                        }
                    }
                    else{
                        if(p[4] === "\"Fri\"" || p[4] === "\"Sat\"" || p[4] === "\"Sun\""){nhe+=to-ti;}
                        else{nh+=to-ti;}
                    }
                }
            });
            th = dh + eh + nh + dhe + ehe + nhe;
            let pay = dh*(payArr[emp[0][2]]) + eh*(0.75+payArr[emp[0][2]]) + nh*(1+payArr[emp[0][2]]) + dhe*(0.5+payArr[emp[0][2]]) + ehe*(1+payArr[emp[0][2]]) + nhe*(1.5+payArr[emp[0][2]]);
            //round pay to nearest cent
            pay *= 100;
            pay = Math.round(pay);
            pay *= 0.01;
            output += "name: " + emp[0][0] + " | ID: " + emp[0][2] + " | total hours: " + th + " | pay: " + pay + "\n";
        }
    });

    //output txt file
    download("output.txt", output);
}

//time clock hour format to decimal
function clockToDec(s){
    let h = parseFloat(s.slice(1,3));
    if(s[6] === 'p' && h !== 12){h+=12;}
    if(h === 12 && s[6] === 'a'){h-=12;}
    let m = parseFloat(s.slice(4,6));
    let q = 0;
    if(m>7){q+=0.25;}
    if(m>23){q+=0.25;}
    if(m>38){q+=0.25;}
    if(m>53){q+=0.25;}
    return h+q;
}

//download file
function download(filename, text){
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}