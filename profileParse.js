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
    len:1
}
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
                console.log(i)
                forReadData.rowNumber=i+headerNumberOfRows
                console.log(forReadData)
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
        console.log(res)
    }
}
var target = {
    cell:0,
    row:0
}
var notFoundNames = {
    cells:{
        depth:-1,
        north:7,
        east:-1
    },
    row:8,
    len:1
}
function createRow(arrayOfValues){
    var main = document.createElement('tr')
    arrayOfValues.forEach(function(e){
        var col = document.createElement('td')
        col.innerHTML=e
        col.addEventListener('click',function(e){
            target.cell = e.target.cellIndex
            target.row= e.target.parentElement.rowIndex
            
            console.log(target)
            showModalChoice()
        })
        main.appendChild(col)
    })
    return main
}
function showModalChoice(){
    document.getElementById('modal-choice').classList.add('active')
    document.getElementById('modal-overlay').classList.add('active')    
}

for(var i =0;i<document.getElementById('modal-choice').children.length;i++){
    document.getElementById('modal-choice').children[i].addEventListener('click',function(e){
        if(notFoundNames.len!=0){
            for(var i = 0; i<notFoundNames.len;i++){
                for(var j in notFoundNames.cells){
                    if(cells[j]!=-1){
                        document.getElementById('dvExel').children[row].children[cells[j]]
                    }
                    //новое определение всей хероты
                            
                }
            }
        }

        /*if(target.now!='none'){
            switch(target.now){
                case 'depth':
                    notFoundNames.depth.cell.splice(notFoundNames.depth.cell.indexOf(target.cell),1)
                    notFoundNames.depth.row.splice(notFoundNames.depth.row.indexOf(target.row),1)
                break;
                case 'north':
                    notFoundNames.north.cell.splice(notFoundNames.north.cell.indexOf(target.cell),1)
                    notFoundNames.north.row.splice(notFoundNames.north.row.indexOf(target.row),1)
                break;
                case 'east':
                    notFoundNames.east.cell.splice(notFoundNames.east.cell.indexOf(target.cell),1)
                    notFoundNames.east.row.splice(notFoundNames.east.row.indexOf(target.row),1)

            }
        }
        switch(e.target.id){
            case 'depth':
                cell.style.backgroundColor='red'
                notFoundNames.depth.cell.push(target.cell)
                notFoundNames.depth.row.push(target.row)
            break;
            case 'north':
                cell.style.backgroundColor='blue'
                notFoundNames.north.cell.push(target.cell)
                notFoundNames.north.row.push(target.row)
            break;
            case 'east':
                cell.style.backgroundColor='green'
                notFoundNames.east.cell.push(target.cell)
                notFoundNames.east.row.push(target.row)
            break;
            case 'abort':
                cell.style.backgroundColor='rgb(31,31,31)'
            break;
            //нужна логика добавления в "временный список"
        }*/
        
        console.log(notFoundNames)
        document.getElementById('modal-choice').classList.remove('active')
        document.getElementById('modal-overlay').classList.remove('active')
    })
}