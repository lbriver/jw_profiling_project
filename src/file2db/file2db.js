//import myModel from "../models/monggo_model"; // 모델 가져옴
//import myModel2 from "../models/mymodel"; // 모델 가져옴
//const db= require("../db/db"); // DB 연결 파일 import
//const monggodb = db.getDB();

import fs from "fs"; // fs node 모듈 불러오기


const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://haramlee:!3690207!@mydbforweb.ibitn9o.mongodb.net/?retryWrites=true&w=majority"
const dbclient = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const dbName = 'nodeweb';   // db name
dbclient.connect();
const db = dbclient.db(dbName); 
const col = db.collection("coretask"); // collection name

function calAverage(arr) {
  if (arr.length === 0) {
    return 0;
  }
  
  const sum = arr.reduce((total, num) => total + num, 0);
  const average = sum / arr.length;
  
  return average;
}

function stddev(arr) {
  const average = calAverage(arr);
  //console.log('평균'+average);
  let sum=0;
  for (const i of arr) {
    sum += (average-i)*(average-i);
  }
  return Math.sqrt(sum/arr.length);
}

export const upload = async (req, res, next) => {
  let fileName = req.file.originalname; // 파일 이름을 fileName에 할당
  console.log(`파일 이름 : ${fileName}}`);
  let copydata, temp; // 배열 정의
  let doc={}; // 문서
  let docs=[];

  try {  

    let bufferall = fs.readFileSync(
      // 파일 동기 처리 방식 활용
      __dirname + `/../uploads/${fileName}`,
      "utf-8"
    );

    let line = bufferall.split(/\n/);   // 파일 버퍼를 줄단위로 나눔
      line.forEach(element => {
        doc={};
        temp = element.split(/\s+/); 
        console.log("입력 데이터1");
        console.table(temp); // 입력 데이터
        copydata = temp.filter(item=>item!=="")
        console.log("입력 데이터 null 제거");        
        if(copydata.length == 6){
          //copydata = temp.filter(item=> !isNaN(item))
          console.table(copydata); // 입력 데이터  
          doc['filename'] = fileName;
          doc['core'] = copydata[0];
          for (let i = 1; i < copydata.length; i++) {
            doc['task' + i] = Number(copydata[i]);
          }                    
          docs.push(doc);  // 멀티문서에 현재 문서 추가
          console.log("db 저장용 객체");              
          console.log(doc);  
        }
      });   
      //console.log(docs) ;
      console.table(docs); 
      let taskdocs=[{}];
      let prevArr=[{}];
      
      let docs2=[];
      console.log(prevArr);
      let combinedArr =[];

      for(let i=0;i<docs.length;i++){
        if(i%5===0){
          const start_i = combinedArr.length - 5; // 최대 속성 개수
          combinedArr.splice(0, start_i); // 해당 항목 삭제
                             
          console.log('정리후 docs')
          console.log(combinedArr);
          if(i!=0) docs2.push(...combinedArr);          

          combinedArr = [];
          prevArr =[{}];;
        }
        if(combinedArr.length>0) {
          prevArr = [...combinedArr];        
        }else{
          for(let j=0;j<5;j++){
            prevArr[j]={'task':`task${j+1}` };  
          }
        }
        for(let j=0;j<5;j++){
          taskdocs[j]={ 'filename':fileName , 
                        'task':`task${j+1}` };          
          taskdocs[j][docs[i].core]=docs[i][`task${j+1}`];         
        }  
           
        // arr1과 arr2의 속성을 합쳐 새로운 객체를 생성하여 combinedArr 배열에 추가
          prevArr.forEach((obj1) => {
            const obj2 = taskdocs.find((obj) => obj.task === obj1.task);
            if (obj2) {
              const combinedObj = { ...obj1, ...obj2 };
              combinedArr.push(combinedObj);
            }
          });
       // console.log("이전 docs")
        //console.table(prevArr);
        //console.log("현재 docs")
        //console.table(taskdocs);
        console.log("결합 docs")
        console.log(combinedArr);
        console.log(combinedArr.length);              
      }
      const start_i = combinedArr.length - 5; // 최대 속성 개수
      combinedArr.splice(0, start_i); // 해당 항목 삭제
                          
      console.log('정리후 docs')
      console.log(combinedArr);
      docs2.push(...combinedArr);    

      console.table(docs2);
      let existdoc = await col.findOne(docs[0]);
      if(existdoc){
        console.log("중복 파일 입력 오류 ");
      }else{
        const result = await col.insertMany(docs); // 콜렉션에 멀티문서 저장
        if (!result.acknowledged) {
          console.log("db에 문서저장 오류");
          return res.status(400).render("main", { alert: true });
        }else{
          console.log("db에 문서저장 성공");
        }
      }
      existdoc = await col.findOne(docs[0]);
      if(existdoc){
        console.log("중복 파일 입력 오류 ");
      }else{
        console.table(docs2);
        const result = await col.insertMany(docs2); // 콜렉션에 멀티문서 저장
        if (!result.acknowledged) {
          console.log("db에 문서저장 오류");
          return res.status(400).render("main", { alert: true });
        }else{
          console.log("db에 task별 문서저장 성공");
        }
      }
      //console.log(result);

   
    // 입력 데이터 갯수 검사
    
    
  } catch (error) {
    console.log(error); // 에러 발생 시 에러 출력
  }

  try {    
    
    return res.render("ViewGraph", {
      pageTitle: fileName,
      screen: false,
    });
  } catch (error) {
    console.log(`DB 오류 있음 : ${error}`);
    return res.redirect("/");
  } finally {
    // Ensures that the client will close when you finish/error
    
  }
};

export const show = async (req, res, next) => {
  let { keyType, file } = req.params;
  const viewType = req.query.viewType;
  const num = req.query.number;
  let ctype;
  let maxArr = [], avgArr = [], minArr = [], devArr =[];
  let dataArr={};

  if( req.query.chart_type)
    ctype =req.query.chart_type;
  else
    ctype ='line';

  if(viewType!=undefined && num != undefined)
    keyType = viewType+num;
 
  console.log('keyType: '+keyType);
  console.log(file);
  console.log(ctype);
  console.log('req: '+req.body)

  let query, cursor;
  if(viewType==='core'||keyType.includes('core')){
    query = {'core':keyType};
    console.log("쿼리 "+query);
    cursor = col.find(query);
    if ((await cursor.countDocuments) === 0) {
      console.log("No documents found!");
    }
    // replace console.dir with your callback to access individual elements
   // await cursor.forEach(console.dir);
    const results = await cursor.toArray();
    if (results.length > 0) {
        results.forEach((result, i) => {       
          console.log(`${i + 1}. task${i}: ${result.task1}`);         
      });
    }  
    for(let i=0;i<5;i++){
      dataArr[i]= results.map(obj=> obj['task'+(i+1)]);
      console.log(dataArr[i]);
    }    
     
  }else if(viewType==='task'||keyType.includes('task')){
    query = {'task':keyType};
    console.log("쿼리 "+query);
    cursor = col.find(query);
    if ((await cursor.countDocuments) === 0) {
      console.log("No documents found!");
    }
    // replace console.dir with your callback to access individual elements
   // await cursor.forEach(console.dir);
    const results = await cursor.toArray();
    if (results.length > 0) {
        results.forEach((result, i) => {       
          console.log(`${i + 1}. core${i}: ${result.task1}`);          
      });
    }    
    
      for(let i=0;i<5;i++){
        dataArr[i]= results.map(obj=> obj['core'+(i+1)]);
        console.log(dataArr[i]);
      }    
  }else{
    console.log('오류');
  }
  
  
  let attr = "";   // 속성명
  if (keyType.includes("task")) attr = "core"; //
  else attr = "task";

  for (let i = 0; i < 5; i++) {
    maxArr.push(Math.max(...dataArr[i]));
    avgArr.push(calAverage(dataArr[i]));
    minArr.push(Math.min(...dataArr[i]));
    devArr.push(stddev(dataArr[i]));
  }
  for (let i = 0; i < 5; i++) {
    dataArr[i].unshift(i+1);
  }

  console.table(dataArr);

  return res.render("ViewGraph", {
    pageTitle: file,
    keyType: keyType,
    viewType: viewType,
    num: num,
    chartType: ctype,
    attr: attr,
    dataArr,
    maxArr,
    minArr,
    avgArr,
    devArr,
    screen: true,
  } 
  
  );
};
