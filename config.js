// ตั้งค่าหน้าเว็บ — แก้ไฟล์นี้ไฟล์เดียวเมื่อเปลี่ยน URL หรือช่องทางติดต่อ
window.APP_CONFIG = {
  // URL ของ Apps Script web app (ลงท้ายด้วย /exec) — ถ้าเว้นว่างจะเปิดโหมดตัวอย่าง (ไม่เรียก AI จริง)
  API_URL: 'https://script.google.com/macros/s/AKfycbxy-JMXeUEWph16Xl88JAXCHKz4pYvafliKxSGuY15Vld_MsHDz6ro283OAgVBZmPeSsg/exec',

  BOT_NAME: 'น้อง Nora',
  ORG_NAME: 'กองบริหารงานวิชาการ',
  UNIVERSITY: 'มหาวิทยาลัยศิลปากร',

  // ช่องทางติดต่อเมื่อบอทตอบไม่ได้
  CONTACT: {
    facebookUrl: 'https://www.facebook.com/',
    facebookName: 'Facebook กองบริหารงานวิชาการ',
    note: 'ส่งข้อความหาเจ้าหน้าที่ได้ในวันและเวลาราชการ',
  },
};
