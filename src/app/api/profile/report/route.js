import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSellerReportData } from "@/lib/seller-report";
import PDFDocument from "pdfkit";

const INK = "#16130D";
const GOLD_DEEP = "#8B6B21";
const GOLD = "#C69C3F";
const MUTED = "#6B6255";
const LINE = "#E7E0CF";

function formatNaira(value) {
  return `NGN ${Number(value || 0).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPct(ratio) {
  if (ratio === null || ratio === undefined) return "—";
  return `${Math.round(ratio * 100)}%`;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getSellerReportData(session.user.id);
  if (!data) {
    return NextResponse.json({ error: "Seller not found" }, { status: 404 });
  }

  const buffer = await renderPdf(data);

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="EscrowGo-Report-${data.seller.name.replace(/\s+/g, "-")}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}

function renderPdf(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);


    doc
      .fillColor(INK)
      .font("Helvetica-Bold")
      .fontSize(20)
      .text("EscrowGo", 50, 50);
    doc
      .fillColor(GOLD_DEEP)
      .font("Helvetica")
      .fontSize(10)
      .text("Seller Credibility Report", 50, 74);
    doc
      .fillColor(MUTED)
      .fontSize(8)
      .text(`Generated ${formatDate(data.generatedAt)}`, 400, 55, { width: 145, align: "right" });

    doc.moveTo(50, 100).lineTo(545, 100).strokeColor(LINE).stroke();

  
    let y = 118;
    doc.fillColor(INK).font("Helvetica-Bold").fontSize(16).text(data.seller.name, 50, y);
    y += 22;
    doc
      .fillColor(MUTED)
      .font("Helvetica")
      .fontSize(10)
      .text(
        [data.seller.email, data.seller.location].filter(Boolean).join("  ·  "),
        50,
        y,
      );
    y += 16;
    doc.text(`EscrowGo member since ${formatDate(data.seller.memberSince)}`, 50, y);
    y += 30;


    if (data.hasEnoughData) {
      doc
        .roundedRect(400, 112, 145, 60, 8)
        .fillAndStroke("#FBF0DE", LINE);
      doc
        .fillColor(GOLD_DEEP)
        .font("Helvetica-Bold")
        .fontSize(9)
        .text("EscrowGo Trust Score", 412, 122, { width: 121 });
      doc
        .fillColor(INK)
        .font("Helvetica-Bold")
        .fontSize(26)
        .text(`${data.trustScore}`, 412, 136, { width: 60, continued: true })
        .fontSize(12)
        .text("/100", { baseline: "bottom" });
    } else {
      doc
        .roundedRect(400, 112, 145, 60, 8)
        .fillAndStroke("#F1F0EC", LINE);
      doc
        .fillColor(MUTED)
        .font("Helvetica")
        .fontSize(8)
        .text("Trust Score unlocks after 3 completed transactions.", 412, 130, { width: 121 });
    }

    doc.moveTo(50, y).lineTo(545, y).strokeColor(LINE).stroke();
    y += 24;

    
    const stats = [
      ["Completed transactions", `${data.completedCount}`],
      ["Total transactions (paid)", `${data.totalTransactions}`],
      ["Unique customers served", `${data.uniqueCustomers}`],
      ["Total value delivered", formatNaira(data.totalValueTransacted)],
      ["Completion rate", formatPct(data.completionRate)],
      ["On-time delivery rate", formatPct(data.onTimeRate)],
      [
        "Average delivery time",
        data.avgDeliveryDays !== null ? `${data.avgDeliveryDays.toFixed(1)} days` : "—",
      ],
      ["Cancellation / refund rate", formatPct(data.cancellationRate)],
    ];

    const colX = [50, 300];
    const rowH = 46;
    stats.forEach((row, i) => {
      const col = i % 2;
      const rIdx = Math.floor(i / 2);
      const x = colX[col];
      const yy = y + rIdx * rowH;
      doc.fillColor(MUTED).font("Helvetica").fontSize(9).text(row[0], x, yy, { width: 220 });
      doc.fillColor(INK).font("Helvetica-Bold").fontSize(15).text(row[1], x, yy + 13, { width: 220 });
    });

    y += Math.ceil(stats.length / 2) * rowH + 14;
    doc.moveTo(50, y).lineTo(545, y).strokeColor(LINE).stroke();
    y += 20;

    
    doc.fillColor(INK).font("Helvetica-Bold").fontSize(12).text("Recently completed", 50, y);
    y += 20;

    if (data.recentCompleted.length === 0) {
      doc
        .fillColor(MUTED)
        .font("Helvetica")
        .fontSize(9)
        .text("No completed transactions yet.", 50, y);
      y += 20;
    } else {
      data.recentCompleted.forEach((item) => {
        doc
          .fillColor(INK)
          .font("Helvetica")
          .fontSize(9.5)
          .text(item.productName, 50, y, { width: 300, continued: false });
        doc
          .fillColor(MUTED)
          .fontSize(9)
          .text(formatDate(item.completedAt), 350, y, { width: 100 });
        doc
          .fillColor(INK)
          .font("Helvetica-Bold")
          .text(formatNaira(item.price), 450, y, { width: 95, align: "right" });
        y += 18;
      });
      y += 6;
    }

    if (data.flaggedCount > 0) {
      doc
        .fillColor(GOLD_DEEP)
        .font("Helvetica")
        .fontSize(8.5)
        .text(
          `${data.flaggedCount} deal(s) currently under EscrowGo review are excluded from the figures above until resolved.`,
          50,
          y,
          { width: 495 },
        );
      y += 20;
    }

   
    const footerY = 740;
    doc.moveTo(50, footerY).lineTo(545, footerY).strokeColor(LINE).stroke();
    doc
      .fillColor(MUTED)
      .font("Helvetica")
      .fontSize(7.5)
      .text(
        "This report reflects this seller's EscrowGo transaction history at the time it was generated and updates automatically on every download. " +
          "Trust Score = 50% completion rate + 30% on-time delivery rate + 20% (1 - cancellation/refund rate), shown only once a seller has completed at least 3 paid transactions. " +
          "Figures cover transactions on EscrowGo only.",
        50,
        footerY + 10,
        { width: 495 },
      );

    doc.end();
  });
}