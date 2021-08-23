//VARIABLES


//VOCAB
var profileVocabulary ={
    depth:[
        'глубинаповертикали,м',
        'верт.|глубина|(м)'
    ],
    north:[
        'лок.смещениексеверу,м',
        '|с/ю|(м)'
    ],
    east:[
        'лок.смещениеквостоку,м',
        '|в/з|(м)'
    ],
    len:2
}

//CELL CLICKED
var target = {
    cell:0,
    row:0
}

//CELLS OF TABLE HEADER
var notFoundNames = {
    cells:{
        depth:-1,
        north:-1,
        east:-1
    },
    row:-1,
    len:0
}

//PARSING FUNCTIONS


//UPLOAD FILE
function Upload() {
    //Reference the FileUpload element.
    var fileUpload = document.getElementById("fileUpload");


        if (typeof (FileReader) != "undefined") {
            var reader = new FileReader();

            //For Browsers other than IE.
            if (reader.readAsBinaryString) {
                reader.onload = function (e) {
                    ProcessExcel(e.target.result);
                };
                reader.readAsBinaryString(fileUpload.files[0]);
            } else {
                //For IE Browser.
                reader.onload = function (e) {
                    var data = "";
                    var bytes = new Uint8Array(e.target.result);
                    for (var i = 0; i < bytes.byteLength; i++) {
                        data += String.fromCharCode(bytes[i]);
                    }
                    ProcessExcel(data);
                };
                reader.readAsArrayBuffer(fileUpload.files[0]);
            }
        } else {
            alert("This browser does not support HTML5.");
        }
};

//EXEL PROCESSING
function ProcessExcel(data) {
    var workbook = XLSX.read(data, {
        type: 'binary'
    });

    var firstSheet = workbook.SheetNames[0];
    var excelRows = XLSX.utils.sheet_to_csv(workbook.Sheets[firstSheet],{FS:';',RS:"|||"});
    var raw_csv = excelRows.split('|||')
    
    var forReadData ={
        rowNumber:0,
        depth:0,
        north:0,
        east:0
    }
    console.log(raw_csv)
    console.log(profileVocabulary)
    var found = false
    for(var parseTypeNumber = 0;parseTypeNumber<profileVocabulary.len;parseTypeNumber++){
        var headerNumberOfRows = profileVocabulary.depth[parseTypeNumber].split('|').length
        for(var i = 0;i<=raw_csv.length-headerNumberOfRows;i++){
            var nowRow = raw_csv[i].split(';')
            if(headerNumberOfRows!=1){
                for(var j=1;j<headerNumberOfRows;j++){
                    var temp = raw_csv[i+j].split(';')
                    temp.forEach(function(e,cnt){
                        nowRow[cnt]+='|'
                        nowRow[cnt]+=e
                    })
                }
            }
            nowRow=nowRow.map(function(e){
                return e.replace(/\s/g,"").toLowerCase()
            })
            if((nowRow.indexOf(profileVocabulary.depth[parseTypeNumber])!=-1)&(nowRow.indexOf(profileVocabulary.north[parseTypeNumber])!=-1)&(nowRow.indexOf(profileVocabulary.east[parseTypeNumber])!=-1)){
                forReadData.depth=nowRow.indexOf(profileVocabulary.depth[parseTypeNumber])
                forReadData.north=nowRow.indexOf(profileVocabulary.north[parseTypeNumber])
                forReadData.east=nowRow.indexOf(profileVocabulary.east[parseTypeNumber])
                //console.log(i)
                forReadData.rowNumber=i+headerNumberOfRows
                //console.log(forReadData)
                found=true
                break
            }
        }
        if(found){
            break
        }
    }
    console.log(found)
    var res = {
        north:[],
        east:[],
        depth:[]
    }
    if(!found){
        showCanNotParse()
        var container = document.getElementById('dvExcel')
        for(var i =0;i<raw_csv.length;i++){
            container.appendChild(createRow(raw_csv[i].split(';')))
        }
    }
    else{
        var state = 'zero';
        for(var i = forReadData.rowNumber;i<raw_csv.length;i++){
            var temp = raw_csv[i].split(';')
            var check = parseFloat(temp[forReadData.north])
            switch (state){
                case 'zero':
                    if(!isNaN(check)){
                        res.north.push(parseFloat(temp[forReadData.north]))
                        res.east.push(parseFloat(temp[forReadData.east]))
                        res.depth.push(parseFloat(temp[forReadData.depth]))
                        state = 'reading'
                    }
                    break;
                case 'reading':
                    if(!isNaN(check)){
                        res.north.push(parseFloat(temp[forReadData.north]))
                        res.east.push(parseFloat(temp[forReadData.east]))
                        res.depth.push(parseFloat(temp[forReadData.depth]))
                    }
                    else{
                        state = 'eof'
                    }
                    break;
            }
            if(state == 'eof'){
                break
            }
            
        }
        showParsed(res)
    }
}

//TABLE CREATE
function createRow(arrayOfValues){
    var main = document.createElement('tr')
    arrayOfValues.forEach(function(e){
        var col = document.createElement('td')
        col.innerHTML=e
        col.addEventListener('click',function(e){
            target.cell = e.target.cellIndex
            target.row= e.target.parentElement.rowIndex
            
            showModalChoice()
        })
        main.appendChild(col)
    })
    return main
}

//VALIDATING CHOOSEN CELLS
function validateNums(){
    var ok=true;
    if(notFoundNames.len==0){
        ok=false
    }
    if(notFoundNames.row==-1){
        ok=false
    }
    for(var i in notFoundNames.cells){
        if(notFoundNames.cells[i]==-1){
            ok =false
        }
    }
    return ok
}

//SHOW PARSED DATA
function showParsed(data){
    var table = document.getElementById('dvExcel')
    table.innerHTML=''
    table.appendChild(createRowInactive(['Глубина по вертикали<br>(м)','Смещение к северу<br>(м)','Смещение к востоку<br>(м)']))
    for(var i=0;i<data.north.length;i++){
        table.appendChild(createRowInactive([data.depth[i],data.north[i],data.east[i]]))
    }
}

function createRowInactive(arrayOfValues){
    var main=document.createElement('tr')
    arrayOfValues.forEach(function(e){
        var col = document.createElement('td')
        col.innerHTML=e
        main.appendChild(col)
    })
    return main
}
//UI+HELP



function showCanNotParse(){
    document.getElementById('modal-info-text').innerHTML ='В процессе загрузки что-то пошло не так. Пожалуйста, выберите необходимые ячейки вручную.'
    document.getElementById('modal-info').classList.add('active')
    document.getElementById('modal-overlay').classList.add('active')
    document.getElementById('modal-ok').classList.add('active')
    document.getElementById('modal-deny').classList.add('active')
    document.getElementById('modal-help').classList.add('active')

}

function showModalChoice(){
    document.getElementById('modal-choice').classList.add('active')
    document.getElementById('modal-overlay').classList.add('active')    
}

document.getElementById('modal-ok').addEventListener('click',function(e){
    if(!validateNums()){
        alert('Пожалуйста, выберите все колонки со значениями')
    }else{
        //console.log(notFoundNames)
        var toAdd={
            depth:''+document.getElementById('dvExcel').children[notFoundNames.row].children[notFoundNames.cells.depth].innerHTML,
            north:''+document.getElementById('dvExcel').children[notFoundNames.row].children[notFoundNames.cells.north].innerHTML,
            east:''+document.getElementById('dvExcel').children[notFoundNames.row].children[notFoundNames.cells.east].innerHTML
        }
        if(notFoundNames.len>1){
            for(var i = 1;i<notFoundNames.len;i++){
                toAdd.depth+='|'+document.getElementById('dvExcel').children[notFoundNames.row+i].children[notFoundNames.cells.depth].innerHTML
                toAdd.north+='|'+document.getElementById('dvExcel').children[notFoundNames.row+i].children[notFoundNames.cells.north].innerHTML
                toAdd.east+='|'+document.getElementById('dvExcel').children[notFoundNames.row+i].children[notFoundNames.cells.east].innerHTML
            }
        }
        //console.log(toAdd)
        profileVocabulary.depth.push(toAdd.depth.replace(/\s/g,"").toLowerCase())
        profileVocabulary.north.push(toAdd.north.replace(/\s/g,"").toLowerCase())
        profileVocabulary.east.push(toAdd.east.replace(/\s/g,"").toLowerCase())
        profileVocabulary.len++;
        Upload()
    }
})

for(var i =0;i<document.getElementById('modal-choice').children.length;i++){
    document.getElementById('modal-choice').children[i].addEventListener('click',function(e){
        if(notFoundNames.len!=0){
            for(var i = 0; i<notFoundNames.len;i++){
                for(var j in notFoundNames.cells){
                    if(notFoundNames.cells[j]!=-1){
                        document.getElementById('dvExcel').children[notFoundNames.row+i].children[notFoundNames.cells[j]].style.backgroundColor='rgb(0,0,0)'
                    }         
                }
            }
        }
        switch(e.target.id){
            case 'depth':
                if(notFoundNames.cells.east==target.cell){notFoundNames.cells.east=-1}
                if(notFoundNames.cells.north==target.cell){notFoundNames.cells.north=-1}
                notFoundNames.cells.depth = target.cell
                if(notFoundNames.row==-1){
                    notFoundNames.row=target.row
                    notFoundNames.len=1
                }else{
                    if(target.row<notFoundNames.row){
                        notFoundNames.len=notFoundNames.len+(notFoundNames.row-target.row)
                        notFoundNames.row=target.row
                    }else if(target.row>(notFoundNames.row+notFoundNames.len-1)){
                        notFoundNames.len= target.row-notFoundNames.row+1
                    }
                }
            break;
            case 'east':
                if(notFoundNames.cells.depth==target.cell){notFoundNames.cells.depth=-1}
                if(notFoundNames.cells.north==target.cell){notFoundNames.cells.north=-1}
                notFoundNames.cells.east = target.cell
                if(notFoundNames.row==-1){
                    notFoundNames.row=target.row
                    notFoundNames.len=1
                }else{
                    if(target.row<notFoundNames.row){
                        notFoundNames.len=notFoundNames.len+(notFoundNames.row-target.row)
                        notFoundNames.row=target.row
                    }else if(target.row>(notFoundNames.row+notFoundNames.len-1)){
                        notFoundNames.len= target.row-notFoundNames.row+1
                    }
                }
            break;
            case 'north':
                if(notFoundNames.cells.east==target.cell){notFoundNames.cells.east=-1}
                if(notFoundNames.cells.depth==target.cell){notFoundNames.cells.depth=-1}
                notFoundNames.cells.north = target.cell
                if(notFoundNames.row==-1){
                    notFoundNames.row=target.row
                    notFoundNames.len=1
                }else{
                    if(target.row<notFoundNames.row){
                        notFoundNames.len=notFoundNames.len+(notFoundNames.row-target.row)
                        notFoundNames.row=target.row
                    }else if(target.row>(notFoundNames.row+notFoundNames.len-1)){
                        notFoundNames.len= target.row-notFoundNames.row+1
                    }
                }
            break;
            default:
                for(i in notFoundNames.cells){
                    if(notFoundNames.cells[i]==target.cell){
                        if(notFoundNames.row==target.row){
                            notFoundNames.len--;
                            notFoundNames.row++;
                        }else if ((notFoundNames.row+notFoundNames.len-1)==target.row){
                            notFoundNames.len--;
                        }
                        
                    }
                }
            break;
        }
        for(var i=0;i<notFoundNames.len;i++){
            if(notFoundNames.row!=-1){
                if(notFoundNames.cells.depth!=-1){
                    document.getElementById('dvExcel').children[notFoundNames.row+i].children[notFoundNames.cells.depth].style.backgroundColor='#f00'
                }
                if(notFoundNames.cells.north!=-1){
                    document.getElementById('dvExcel').children[notFoundNames.row+i].children[notFoundNames.cells.north].style.backgroundColor='#00f'
                }
                if(notFoundNames.cells.east!=-1){
                    document.getElementById('dvExcel').children[notFoundNames.row+i].children[notFoundNames.cells.east].style.backgroundColor='#0f0'
                }
            }
            
        }
        

        document.getElementById('modal-choice').classList.remove('active')
        document.getElementById('modal-overlay').classList.remove('active')
    })
}

document.getElementById('info-ok').addEventListener('click',function(e){
    document.getElementById('modal-info').classList.remove('active')
    document.getElementById('modal-overlay').classList.remove('active')
})

document.getElementById('info-how').addEventListener('click',function(e){
    window.open('https://docs.google.com/document/d/1g-Tvg_a_j9yLoZprVJt7eporEs9fek4BP9dypPZvpQI/edit')
})

document.getElementById('modal-help').addEventListener('click',function(e){
    window.open('https://docs.google.com/document/d/1g-Tvg_a_j9yLoZprVJt7eporEs9fek4BP9dypPZvpQI/edit')
})

document.getElementById('upload-input-click').addEventListener('click',function(e){
    document.getElementById("fileUpload").click()
})

//ATVISE SHIT

document.getElementById('upload-but').addEventListener('click',function(e){
    if(!e.target.classList.contains('inactive')){
        Upload();
    }else{

    }   
})
document.getElementById('fileUpload').addEventListener('change',function(e){
    document.getElementById('download-text').innerHTML='Выбранный файл:<br>'+e.target.value.split('\\')[e.target.value.split('\\').length-1]
    document.getElementById('upload-but').classList.remove('inactive')
})

