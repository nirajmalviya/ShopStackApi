const PDFDocument = require("pdfkit")

const money = (n) => `Rs. ${Number(n).toFixed(2)}`

// Streams a PDF for the given invoice document into `res`
const streamInvoicePdf = (invoice, res) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 })
    doc.pipe(res)

    doc.fontSize(22).font("Helvetica-Bold").text("INVOICE", { align: "right" })
    doc.moveDown(0.3)
    doc.fontSize(10).font("Helvetica")
        .text(`Invoice No: ${invoice.invoicenumber}`, { align: "right" })
        .text(`Order No: ${invoice.ordernumber}`, { align: "right" })
        .text(`Date: ${new Date(invoice.issuedat || invoice.createdAt || Date.now()).toDateString()}`, { align: "right" })
        .text(`Payment: ${invoice.paymentmethod} (${invoice.paymentstatus})`, { align: "right" })

    doc.moveDown()
    const c = invoice.customer
    doc.font("Helvetica-Bold").fontSize(11).text("Bill To")
    doc.font("Helvetica").fontSize(10)
        .text(c.fullname)
        .text(c.addressline)
        .text(`${c.city}, ${c.state} - ${c.pincode}`)
        .text(`Phone: ${c.phone}`)
        .text(`Email: ${c.email || "-"}`)

    // table
    const cols = { name: 50, brand: 230, rate: 330, qty: 410, total: 460 }
    let y = doc.y + 20
    doc.font("Helvetica-Bold")
    doc.text("Product", cols.name, y)
    doc.text("Brand", cols.brand, y)
    doc.text("Rate", cols.rate, y)
    doc.text("Qty", cols.qty, y)
    doc.text("Total", cols.total, y)
    y += 15
    doc.moveTo(50, y).lineTo(545, y).stroke()
    y += 8

    doc.font("Helvetica")
    for (const it of invoice.items) {
        if (y > 740) { doc.addPage(); y = 50 }
        doc.text(it.productname, cols.name, y, { width: 170 })
        doc.text(it.productbrand, cols.brand, y, { width: 90 })
        doc.text(money(it.productrate), cols.rate, y)
        doc.text(String(it.quantity), cols.qty, y)
        doc.text(money(it.total), cols.total, y)
        y += 22
    }

    doc.moveTo(50, y).lineTo(545, y).stroke()
    y += 12
    const row = (label, value, bold) => {
        doc.font(bold ? "Helvetica-Bold" : "Helvetica")
        doc.text(label, 330, y)
        doc.text(value, 460, y)
        y += 18
    }
    row("Subtotal", money(invoice.subtotal))
    if (invoice.discountpercentage > 0) {
        row(`Discount (${invoice.discountpercentage}%)`, `- ${money(invoice.discountamount)}`)
    }
    row("Grand Total", money(invoice.grandtotal), true)

    doc.font("Helvetica").fontSize(9).text("Thank you for your purchase!", 50, y + 40, { align: "center", width: 495 })
    doc.end()
}

module.exports = streamInvoicePdf
