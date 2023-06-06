import express from "express"; //express모듈로부터 가져옴
import { upload, show } from "../file2db/file2db.js"; // file2db의 객체 사용
import multer from "multer";

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./src/uploads/"); // 파일 저장 디렉토리 설정
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // 파일 이름 설정
  },
});
let multerUpload = multer({ storage: storage });
const fileUploadRouter = express.Router(); //express 라우터 호출

fileUploadRouter.post("/", multerUpload.single("userfile"), upload);
fileUploadRouter.get("/:keyType/:file", show);
fileUploadRouter.get("/uploadFile", show);



// 주어진 URL에 대해 GET 요청에서  /를 실행

export default fileUploadRouter; 
