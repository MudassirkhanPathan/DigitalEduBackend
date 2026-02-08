const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const generateCertificate = async (req, res) => {
  const { studentName, subject } = req.body;

  if (!studentName || !subject) {
    return res
      .status(400)
      .json({ error: "Student name and subject are required" });
  }

  const dir = path.join(__dirname, "../certificates");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  const fileName = `${studentName}_${subject}_${Date.now()}.pdf`;
  const filePath = path.join(dir, fileName);

  // HTML Template
  const htmlContent = `
<html>
  <head>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:wght@700&display=swap');

      body {
        margin: 0;
        padding: 0;
        background: #fff8e7;
        font-family: 'Playfair Display', serif;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
      }

      .certificate {
        width: 850px;
        min-height: 600px;
        padding: 60px 50px;
        position: relative;
        background: #fffdf5;
        border-radius: 25px;
        box-shadow: 0 15px 40px rgba(0,0,0,0.3);
        text-align: center;
        border: 12px solid #FFD700; /* golden border */
        overflow: hidden;
      }

      /* Decorative flower corners */
      .corner {
        position: absolute;
        width: 80px;
        height: 80px;
      }

      /* Flower design using radial gradient + CSS shadow */
      .corner::before {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle at 30% 30%, #FFB6C1 0%, #FF69B4 70%);
        border-radius: 50%;
        box-shadow: 0 0 15px rgba(255,105,180,0.5);
      }

      .tl { top: -10px; left: -10px; transform: rotate(0deg); }
      .tr { top: -10px; right: -10px; transform: rotate(90deg); }
      .bl { bottom: -10px; left: -10px; transform: rotate(270deg); }
      .br { bottom: -10px; right: -10px; transform: rotate(180deg); }

      h1 {
        font-size: 50px;
        color: #222;
        margin: 0;
        letter-spacing: 3px;
      }

      h2 {
        font-size: 22px;
        margin: 15px 0 35px;
        font-weight: normal;
        color: #555;
      }

      .name {
        font-family: 'Great Vibes', cursive;
        font-size: 54px;
        color: #DAA520; /* golden */
        margin: 25px 0;
        text-shadow: 1px 1px 3px rgba(0,0,0,0.2);
      }

      .text {
        font-size: 20px;
        margin: 0 auto;
        width: 78%;
        color: #333;
        line-height: 1.7;
      }

      /* Thoughts section */
      .thoughts {
        margin-top: 60px;
        padding: 20px 30px;
        border: 2px dashed #DAA520;
        border-radius: 15px;
        font-style: italic;
        font-size: 18px;
        color: #555;
        background: linear-gradient(120deg, #fffef8, #fff8e0);
        box-shadow: inset 0 0 10px rgba(218,165,32,0.2);
      }

    </style>
  </head>
  <body>
    <div class="certificate">
 

      <h1>CERTIFICATE OF APPRECIATION</h1>
      <h2>This certificate is proudly awarded to</h2>

      <div class="name">${studentName}</div>

      <div class="text">
        This certificate is given to <b>${studentName}</b> 
        for successfully completing the <b>${subject}</b> test with dedication and excellence. <br/>
        May this achievement inspire you to keep learning and achieving new heights.
      </div>

      <!-- Thoughts section -->
      <div class="thoughts">
        "Your dedication and passion for learning are truly inspiring. Keep pushing boundaries and achieving greatness!"
      </div>
    </div>
  </body>
</html>
`;

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    await page.pdf({ path: filePath, format: "A4", landscape: true });

    await browser.close();

    res.json({
      message: "Certificate Generated!",
      file: `/certificates/${fileName}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error generating certificate" });
  }
};

module.exports = { generateCertificate };
