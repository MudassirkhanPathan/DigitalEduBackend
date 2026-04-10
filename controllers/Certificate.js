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

    const W = doc.page.width; // 841.89
    const H = doc.page.height; // 595.28
    const cx = W / 2;

    // current date
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
    doc.rect(0, 0, W, H).fill("#fffdf0");

    // ── Outer border ────────────────────────────────────
    doc
      .rect(14, 14, W - 28, H - 28)
      .lineWidth(4)
      .strokeColor("#B8860B")
      .stroke();

    // ── Inner outline ────────────────────────────────────
    doc
      .rect(26, 26, W - 52, H - 52)
      .lineWidth(1)
      .strokeColor("#DAA520")
      .stroke();
    doc
      .rect(32, 32, W - 64, H - 64)
      .lineWidth(0.4)
      .strokeColor("#C9A84C")
      .stroke();

    // ── Corner L-brackets ───────────────────────────────
    [
      [14, 14, 1, 1],
      [W - 14, 14, -1, 1],
      [14, H - 14, 1, -1],
      [W - 14, H - 14, -1, -1],
    ].forEach(([bx, by, sx, sy]) => {
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
    });

    // ── Watermark text ───────────────────────────────────
    doc
      .save()
      .rotate(-15, { origin: [cx, H / 2] })
      .fillColor("#DAA520")
      .opacity(0.045)
      .fontSize(110)
      .font("Helvetica-Bold")
      .text("EDU NOVA", 0, H / 2 - 55, { align: "center" });
    doc.restore();

    // ── Top seal circle ──────────────────────────────────
    const sealY = 80;
    doc
      .circle(cx, sealY, 36)
      .lineWidth(2.5)
      .fillAndStroke("#fdf3c8", "#DAA520");
    doc
      .circle(cx, sealY, 28)
      .lineWidth(0.8)
      .fillAndStroke("#fffdf0", "#C9A84C");

    // star inside seal
    const star = (px, py, R, r, pts) => {
      const p = [];
      for (let i = 0; i < pts * 2; i++) {
        const a = (i * Math.PI) / pts - Math.PI / 2;
        p.push([
          px + (i % 2 === 0 ? R : r) * Math.cos(a),
          py + (i % 2 === 0 ? R : r) * Math.sin(a),
        ]);
      }
      doc.moveTo(p[0][0], p[0][1]);
      p.slice(1).forEach(([x, y]) => doc.lineTo(x, y));
      doc.closePath().fill("#DAA520");
    };
    star(cx, sealY, 22, 10, 5);
    doc.circle(cx, sealY, 5).fill("#fffdf0");

    // ── CERTIFICATE heading ──────────────────────────────
    doc
      .fillColor("#6B4C11")
      .fontSize(30)
      .font("Helvetica-Bold")
      .text("CERTIFICATE", 0, 134, { align: "center", characterSpacing: 8 });

    doc
      .fillColor("#A07B2A")
      .fontSize(11)
      .font("Helvetica")
      .text("OF  APPRECIATION", 0, 168, {
        align: "center",
        characterSpacing: 6,
      });

    // ── Divider with diamond ─────────────────────────────
    const dY = 190;
    doc
      .moveTo(180, dY)
      .lineTo(cx - 16, dY)
      .lineWidth(0.8)
      .strokeColor("#C9A84C")
      .stroke();
    doc
      .moveTo(cx + 16, dY)
      .lineTo(W - 180, dY)
      .lineWidth(0.8)
      .strokeColor("#C9A84C")
      .stroke();
    doc
      .save()
      .translate(cx, dY)
      .rotate(45)
      .rect(-6, -6, 12, 12)
      .fill("#DAA520")
      .restore();

    // ── Presented to ─────────────────────────────────────
    doc
      .fillColor("#999999")
      .fontSize(11)
      .font("Helvetica")
      .text("This certificate is proudly presented to", 0, 208, {
        align: "center",
        characterSpacing: 2,
      });

    // ── Student Name ─────────────────────────────────────
    doc
      .fillColor("#B8860B")
      .fontSize(46)
      .font("Helvetica-BoldOblique")
      .text(studentName, 0, 232, { align: "center", characterSpacing: 2 });

    // name underline with diamonds
    const nUY = 288;
    doc
      .moveTo(160, nUY)
      .lineTo(cx - 12, nUY)
      .lineWidth(1)
      .strokeColor("#DAA520")
      .stroke();
    doc
      .moveTo(cx + 12, nUY)
      .lineTo(W - 160, nUY)
      .lineWidth(1)
      .strokeColor("#DAA520")
      .stroke();
    doc
      .save()
      .translate(cx, nUY)
      .rotate(45)
      .rect(-5, -5, 10, 10)
      .fill("#C9A84C")
      .restore();

    // ── Subject lines ─────────────────────────────────────
    doc
      .fillColor("#666666")
      .fontSize(13)
      .font("Helvetica")
      .text("For successfully completing the", 0, 306, { align: "center" });

    doc
      .fillColor("#6B4C11")
      .fontSize(18)
      .font("Helvetica-Bold")
      .text(subject.toUpperCase(), 0, 326, {
        align: "center",
        characterSpacing: 2,
      });

    doc
      .fillColor("#666666")
      .fontSize(13)
      .font("Helvetica")
      .text("test with outstanding excellence.", 0, 350, { align: "center" });

    // ── Quote ─────────────────────────────────────────────
    doc
      .fillColor("#bbbbbb")
      .fontSize(11)
      .font("Helvetica-Oblique")
      .text(
        '"Your dedication and passion for learning are truly inspiring!"',
        100,
        378,
        { align: "center", width: W - 200 },
      );

    // ── Full-width divider ────────────────────────────────
    doc
      .moveTo(80, 406)
      .lineTo(W - 80, 406)
      .lineWidth(0.6)
      .strokeColor("#C9A84C")
      .stroke();

    // ── Bottom section: 3 columns ─────────────────────────
    // column positions
    const col1cx = W * 0.22; // signature center
    const col3cx = W * 0.78; // date center
    const colW = 190;
    const botY = 422;

    // LEFT — EDU NOVA Signature
    doc
      .fillColor("#B8860B")
      .fontSize(22)
      .font("Helvetica-BoldOblique")
      .text("Edu Nova", col1cx - colW / 2, botY, {
        width: colW,
        align: "center",
      });

    // swoosh underline
    doc
      .moveTo(col1cx - 80, botY + 30)
      .bezierCurveTo(
        col1cx - 40,
        botY + 22,
        col1cx + 40,
        botY + 32,
        col1cx + 80,
        botY + 24,
      )
      .lineWidth(1.5)
      .strokeColor("#B8860B")
      .stroke();

    doc
      .moveTo(col1cx - 80, botY + 36)
      .lineTo(col1cx + 80, botY + 36)
      .lineWidth(0.6)
      .strokeColor("#C9A84C")
      .stroke();

    doc
      .fillColor("#888888")
      .fontSize(8.5)
      .font("Helvetica")
      .text("AUTHORIZED SIGNATORY", col1cx - colW / 2, botY + 42, {
        width: colW,
        align: "center",
        characterSpacing: 1,
      });
    doc
      .fillColor("#aaaaaa")
      .fontSize(8)
      .font("Helvetica")
      .text("EDU NOVA — Director", col1cx - colW / 2, botY + 54, {
        width: colW,
        align: "center",
      });

    // CENTER — Wax Seal
    const wY = botY + 28;
    doc.circle(cx, wY, 28).lineWidth(1.5).fillAndStroke("#fdf3c8", "#DAA520");
    doc.circle(cx, wY, 22).lineWidth(0.5).fillAndStroke("#fffdf0", "#C9A84C");
    star(cx, wY - 6, 12, 5, 5);
    doc
      .fillColor("#B8860B")
      .fontSize(7)
      .font("Helvetica-Bold")
      .text("EDU", cx - 12, wY + 2, {
        width: 24,
        align: "center",
        characterSpacing: 1,
      });
    doc
      .fillColor("#B8860B")
      .fontSize(7)
      .font("Helvetica-Bold")
      .text("NOVA", cx - 14, wY + 12, {
        width: 28,
        align: "center",
        characterSpacing: 1,
      });

    // RIGHT — Date
    doc
      .fillColor("#6B4C11")
      .fontSize(14)
      .font("Helvetica-Bold")
      .text(currentDate, col3cx - colW / 2, botY + 10, {
        width: colW,
        align: "center",
      });

    doc
      .moveTo(col3cx - 80, botY + 36)
      .lineTo(col3cx + 80, botY + 36)
      .lineWidth(0.8)
      .strokeColor("#C9A84C")
      .stroke();

    doc
      .fillColor("#888888")
      .fontSize(8.5)
      .font("Helvetica")
      .text("DATE OF ISSUE", col3cx - colW / 2, botY + 42, {
        width: colW,
        align: "center",
        characterSpacing: 1,
      });
    doc
      .fillColor("#aaaaaa")
      .fontSize(8)
      .font("Helvetica")
      .text("EDU NOVA — Institute", col3cx - colW / 2, botY + 54, {
        width: colW,
        align: "center",
      });

    // ── Footer ────────────────────────────────────────────
    doc
      .fillColor("#cccccc")
      .fontSize(8)
      .font("Helvetica")
      .text("EDU NOVA  •  EXCELLENCE IN EDUCATION  •  eduNova.com", 0, H - 24, {
        align: "center",
        characterSpacing: 2,
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
