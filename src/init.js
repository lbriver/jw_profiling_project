import express from "express"; //express모듈 불러옴
import router from "./routers/routers.js"; //메인페이지 라우터 불러옴
import fileUploadRouter from "./routers/fileUploadRouter.js"; //fileupload라우터 불러옴
import path from "path";
import morgan from "morgan";

const bodyParser = require('body-parser'); // 폼 이전에 입력 내용 남기도록
const cookieParser = require('cookie-parser');

const app = express(); // 객체 app 이 express를 호출
const logger = morgan("dev");
app.use(express.static('public')); // 정적 페이지 및 이미지 저장용 디렉토리 설정
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
console.log(path.join(__dirname, "views")); //경로 확인

app.use(logger);
app.use(express.urlencoded({ extended: true }));

app.use("/", router); // 주소에 /치면 이동 
app.use("/uploadFile", fileUploadRouter); // 경로에 파일 업로드 라우터 지정


const PORT = 8080; // 포트 번호 설정

app.listen(PORT, () => {
  console.log(`Server is running on URL : http://localhost:${PORT}`); // 출력이용
}); // 콜백 함수로 위에 람다식으로 가동
