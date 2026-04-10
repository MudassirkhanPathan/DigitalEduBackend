const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateCertificate = async (req, res) => {
  try {
    const { studentName, subject } = req.body;

    if (!studentName || !subject) {
      return res.status(400).json({ error: "All fields required" });
    }

    const dir = path.join(__dirname, "../certificates");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // safe file name
    const safeName = studentName.replace(/[^a-zA-Z0-9]/g, "_");
    const fileName = `${safeName}_${Date.now()}.pdf`;
    const filePath = path.join(dir, fileName);

    // create PDF
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 50,
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Background
    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#fff8e7");

    // Title
    doc.fillColor("#000").fontSize(40).text("CERTIFICATE OF APPRECIATION", {
      align: "center",
    });

    doc.moveDown();

    doc.fontSize(20).text("This certificate is proudly awarded to", {
      align: "center",
    });

    doc.moveDown();

    // Name
    doc.fillColor("#DAA520").fontSize(45).text(studentName, {
      align: "center",
    });

    doc.moveDown();

    // Content
    doc
      .fillColor("#333")
      .fontSize(18)
      .text(
        `For successfully completing the ${subject} test with excellence.`,
        {
          align: "center",
        },
      );

    doc.moveDown(2);

    doc
      .fontSize(16)
      .text(`"Your dedication and passion for learning are truly inspiring!"`, {
        align: "center",
      });

    doc.end();

    // wait for file save
    stream.on("finish", () => {
      return res.json({
        message: "Certificate Generated!",
        file: `/certificates/${fileName}`,
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error generating certificate" });
  }
};

module.exports = { generateCertificate };
