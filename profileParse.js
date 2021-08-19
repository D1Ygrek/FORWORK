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
function ProcessExcel(data) {
    var workbook = XLSX.read(data, {
        type: 'binary'
    });

    var firstSheet = workbook.SheetNames[0];
    var excelRows = XLSX.utils.sheet_to_csv(workbook.Sheets[firstSheet],{FS:';',RS:"|||"});
    var raw_csv = excelRows.split('|||')

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
//Место для парсинга отсутствующих херовин
    }
    else{
        for(var i = forReadData.rowNumber;i<raw_csv;i++){
            var temp = raw_csv[i].split(';')
            //console.log(temp)
            res.north.push(temp[forReadData.north])
            res.east.push(temp[forReadData.east])
            res.depth.push(temp[forReadData.depth])
        }
        console.log(res)
    }
    
    

    /*var needToContain=['Описание','Забой','Время']
    needToContainPositions=[0,0,0]
    var needRow=0
    for(var i=0;i<raw_csv.length;i++){
        var ok=true;
        needToContain.forEach(function(e){
            if(raw_csv[i].indexOf(e)==-1){
                ok=false
            }

        })
        if(ok){
            needRow=i;
            var temp = raw_csv[needRow].split(';')
            for(var j=0;j<needToContainPositions.length;j++){
                for(var t=0;t<temp.length;t++){
                    if(needToContain[j]==temp[t]){
                        needToContainPositions[j]=t
                        break;
                    }
                }
            }
            break;
        }
    }
    var timeText='Начало бурения:'
    var timestart=0;
    for(var i=0;i<raw_csv.length;i++){
        var stop = false
        var buf=raw_csv[i].split(';')
        console.log(buf)
        for(var j=0;j<buf.length;j++){
            if(buf[j]==timeText){
                timestart=buf[j+3]
                stop=true;
                break;
            }
        }
        if(stop){break;}
    }
    console.log(timestart)
    while(timestart.indexOf('/')!=-1){
        timestart=timestart.replace('/','.')
    }
    while(timestart.indexOf(' ')!=-1){
        timestart=timestart.replace(' ','.')
    }
    while(timestart.indexOf(':')!=-1){
        timestart=timestart.replace(':','.')
    }
    var timestampNumbers=timestart.split('.')
    var timestartTimestamp = new Date(parseInt(timestampNumbers[2])+2000,parseInt(timestampNumbers[1])-1,parseInt(timestampNumbers[0]),parseInt(timestampNumbers[3]),parseInt(timestampNumbers[4]),0,0)
    console.log(+timestartTimestamp) //дата начала
    console.log(needRow)
    console.log(needToContainPositions)
    console.log(raw_csv[needRow])
    var res=[{time: +timestartTimestamp,vD: 0,opr: "",opt: 0}]
    for(var i = needRow;i<raw_csv.length-2;i++){
        var buf =raw_csv[i].split(';')
        
        
        var opt = parseFloat(buf[needToContainPositions[2]])
        var opr = buf[needToContainPositions[0]]
        var vD = parseInt(buf[needToContainPositions[1]])
        var time = res[res.length-1].time+(opt*3600*1000)
        var obj={}
        obj.time = time
        obj.vD =vD
        obj.opr = opr
        obj.opt = opt
        if(opr == "Итого, сут.:"){
            break;
        }
        if(opt!=0){

                console.log(buf)
                console.log(obj)
                res.push(obj)
        }

        
    }
    console.log(res)*/
}