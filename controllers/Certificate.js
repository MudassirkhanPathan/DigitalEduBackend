const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateCertificate = async (req, res) => {
  try {
    const { studentName, subject } = req.body;
    if (!studentName || !subject)
      return res.status(400).json({ error: "All fields required" });

    const dir = path.join(__dirname, "../certificates");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const safeName = studentName.replace(/[^a-zA-Z0-9]/g, "_");
    const fileName = `${safeName}_${Date.now()}.pdf`;
    const filePath = path.join(dir, fileName);

    const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 0 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const W = doc.page.width;
    const H = doc.page.height;
    const cx = W / 2;

    // ── Current Date ────────────────────────────────────
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const now = new Date();
    const currentDate = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

    // ── Background ──────────────────────────────────────
    doc.rect(0, 0, W, H).fill("#fffef5");

    // ── Outer thick gold border ─────────────────────────
    doc
      .rect(14, 14, W - 28, H - 28)
      .lineWidth(4)
      .strokeColor("#B8860B")
      .stroke();

    // ── Inner thin borders ──────────────────────────────
    doc
      .rect(24, 24, W - 48, H - 48)
      .lineWidth(1.2)
      .strokeColor("#DAA520")
      .stroke();
    doc
      .rect(32, 32, W - 64, H - 64)
      .lineWidth(0.5)
      .strokeColor("#C9A84C")
      .stroke();

    // ── Corner L-bracket accents ────────────────────────
    const brackets = [
      [14, 14],
      [W - 14, 14],
      [14, H - 14],
      [W - 14, H - 14],
    ];
    brackets.forEach(([bx, by], i) => {
      const sx = i % 2 === 0 ? 1 : -1;
      const sy = i < 2 ? 1 : -1;
      doc
        .moveTo(bx, by)
        .lineTo(bx + sx * 55, by)
        .lineWidth(4)
        .strokeColor("#B8860B")
        .stroke();
      doc
        .moveTo(bx, by)
        .lineTo(bx, by + sy * 55)
        .lineWidth(4)
        .strokeColor("#B8860B")
        .stroke();
      doc
        .polygon(
          [bx + sx * 8, by + sy * 8],
          [bx + sx * 16, by + sy * 8],
          [bx + sx * 8, by + sy * 16],
        )
        .fill("#DAA520");
    });

    // ── Subtle watermark star ───────────────────────────
    doc.save().opacity(0.06);
    const R = 170,
      r = 80,
      sp = 8;
    const pts = [];
    for (let i = 0; i < sp * 2; i++) {
      const a = (i * Math.PI) / sp - Math.PI / 2;
      const rad = i % 2 === 0 ? R : r;
      pts.push([cx + rad * Math.cos(a), H / 2 + rad * Math.sin(a)]);
    }
    doc.moveTo(pts[0][0], pts[0][1]);
    pts.slice(1).forEach(([x, y]) => doc.lineTo(x, y));
    doc.closePath().fill("#DAA520");
    doc.restore();

    // ── Seal circle at top ──────────────────────────────
    const sealY = 96;
    doc.circle(cx, sealY, 42).lineWidth(2).fillAndStroke("#fdf6e0", "#DAA520");
    doc
      .circle(cx, sealY, 34)
      .lineWidth(0.8)
      .fillAndStroke("#fffef5", "#C9A84C");
    // Star inside seal
    const starPts = [];
    for (let i = 0; i < 10; i++) {
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      const rad = i % 2 === 0 ? 24 : 11;
      starPts.push([cx + rad * Math.cos(a), sealY + rad * Math.sin(a)]);
    }
    doc.moveTo(starPts[0][0], starPts[0][1]);
    starPts.slice(1).forEach(([x, y]) => doc.lineTo(x, y));
    doc.closePath().fill("#DAA520");
    doc.circle(cx, sealY, 6).fill("#fffef5");

    // ── CERTIFICATE heading ─────────────────────────────
    doc
      .fillColor("#7B5E19")
      .fontSize(28)
      .font("Helvetica-Bold")
      .text("CERTIFICATE", 0, 158, { align: "center", characterSpacing: 7 });
    doc
      .fillColor("#A07B2A")
      .fontSize(11)
      .font("Helvetica")
      .text("OF  APPRECIATION", 0, 190, {
        align: "center",
        characterSpacing: 6,
      });

    // ── Divider with diamond ────────────────────────────
    const divY = 210;
    doc
      .moveTo(200, divY)
      .lineTo(374, divY)
      .lineWidth(0.8)
      .strokeColor("#C9A84C")
      .stroke();
    doc
      .moveTo(466, divY)
      .lineTo(640, divY)
      .lineWidth(0.8)
      .strokeColor("#C9A84C")
      .stroke();
    doc
      .save()
      .translate(cx, divY)
      .rotate(45)
      .rect(-5.5, -5.5, 11, 11)
      .fill("#DAA520")
      .restore();

    // ── Subtitle ────────────────────────────────────────
    doc
      .fillColor("#888888")
      .fontSize(12)
      .font("Helvetica")
      .text("This certificate is proudly presented to", 0, 228, {
        align: "center",
        characterSpacing: 1,
      });

    // ── Student Name ────────────────────────────────────
    doc
      .fillColor("#B8860B")
      .fontSize(44)
      .font("Helvetica-BoldOblique")
      .text(studentName, 0, 260, { align: "center", characterSpacing: 2 });

    doc
      .moveTo(170, 315)
      .lineTo(670, 315)
      .lineWidth(0.8)
      .strokeColor("#DAA520")
      .stroke();
    doc
      .save()
      .translate(cx, 315)
      .rotate(45)
      .rect(-4, -4, 8, 8)
      .fill("#C9A84C")
      .restore();

    // ── Subject ─────────────────────────────────────────
    doc
      .fillColor("#666666")
      .fontSize(13)
      .font("Helvetica")
      .text("For successfully completing the", 0, 332, { align: "center" });
    doc
      .fillColor("#7B5E19")
      .fontSize(17)
      .font("Helvetica-Bold")
      .text(subject, 0, 352, { align: "center", characterSpacing: 1.5 });
    doc
      .fillColor("#666666")
      .fontSize(13)
      .font("Helvetica")
      .text("test with outstanding excellence.", 0, 374, { align: "center" });

    // ── Quote ───────────────────────────────────────────
    doc
      .fillColor("#bbbbbb")
      .fontSize(11)
      .font("Helvetica-Oblique")
      .text(
        '"Your dedication and passion for learning are truly inspiring!"',
        0,
        405,
        { align: "center" },
      );

    // ── Bottom divider ───────────────────────────────────
    doc
      .moveTo(90, 426)
      .lineTo(W - 90, 426)
      .lineWidth(0.5)
      .strokeColor("#DAA520")
      .stroke();

    // ── LEFT: EDU NOVA Signature ─────────────────────────
    doc
      .fillColor("#B8860B")
      .fontSize(20)
      .font("Helvetica-BoldOblique")
      .text("Edu Nova", 90, 444, { width: 180, align: "center" });
    // Stylized underline swoosh
    doc
      .moveTo(100, 468)
      .bezierCurveTo(140, 462, 200, 470, 270, 465)
      .lineWidth(1.5)
      .strokeColor("#B8860B")
      .stroke();
    doc
      .moveTo(100, 472)
      .lineTo(270, 472)
      .lineWidth(0.6)
      .strokeColor("#C9A84C")
      .stroke();
    doc
      .fillColor("#888888")
      .fontSize(9)
      .font("Helvetica")
      .text("AUTHORIZED SIGNATORY", 90, 476, {
        width: 180,
        align: "center",
        characterSpacing: 0.5,
      });
    doc
      .fillColor("#aaaaaa")
      .fontSize(8.5)
      .font("Helvetica")
      .text("EDU NOVA — Director", 90, 488, { width: 180, align: "center" });

    // ── CENTER: Round Seal ───────────────────────────────
    doc.circle(cx, 458, 26).lineWidth(1.5).fillAndStroke("#fdf6e0", "#DAA520");
    doc.circle(cx, 458, 20).lineWidth(0.5).fillAndStroke("#fffef5", "#C9A84C");
    doc
      .fillColor("#B8860B")
      .fontSize(8)
      .font("Helvetica-Bold")
      .text("EDU", cx - 10, 450, {
        width: 20,
        align: "center",
        characterSpacing: 0.5,
      });
    doc
      .fillColor("#B8860B")
      .fontSize(8)
      .font("Helvetica-Bold")
      .text("NOVA", cx - 12, 460, {
        width: 24,
        align: "center",
        characterSpacing: 0.5,
      });

    // ── RIGHT: Date ──────────────────────────────────────
    doc
      .fillColor("#888888")
      .fontSize(9.5)
      .font("Helvetica")
      .text("DATE OF ISSUE", 410, 440, {
        width: 180,
        align: "center",
        characterSpacing: 1,
      });
    doc
      .fillColor("#7B5E19")
      .fontSize(14)
      .font("Helvetica-Bold")
      .text(currentDate, 410, 455, { width: 180, align: "center" });
    doc
      .moveTo(415, 474)
      .lineTo(590, 474)
      .lineWidth(0.6)
      .strokeColor("#C9A84C")
      .stroke();
    doc
      .fillColor("#aaaaaa")
      .fontSize(8.5)
      .font("Helvetica")
      .text("EDU NOVA — Institute", 410, 478, { width: 180, align: "center" });

    // ── Footer text ──────────────────────────────────────
    doc
      .fillColor("#cccccc")
      .fontSize(8)
      .font("Helvetica")
      .text("EDU NOVA  •  EXCELLENCE IN EDUCATION  •  eduNova.com", 0, H - 22, {
        align: "center",
        characterSpacing: 1.5,
      });

    doc.end();

    stream.on("finish", () =>
      res.json({
        message: "Certificate Generated!",
        file: `/certificates/${fileName}`,
      }),
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error generating certificate" });
  }
};

module.exports = { generateCertificate };
