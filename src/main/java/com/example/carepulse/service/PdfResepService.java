package com.example.carepulse.service;

import com.example.carepulse.dto.ResepPdfRequest;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class PdfResepService {

    public byte[] generateResepPdf(ResepPdfRequest request) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        
        try {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);
            
            // Warna branding
            DeviceRgb primaryColor = new DeviceRgb(37, 99, 235); // Blue-600
            DeviceRgb lightGray = new DeviceRgb(243, 244, 246); // Gray-100
            
            // Header Rumah Sakit
            Paragraph header = new Paragraph("CAREPULSE HOSPITAL")
                .setFontSize(20)
                .setBold()
                .setFontColor(primaryColor)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(5);
            document.add(header);
            
            Paragraph subHeader = new Paragraph("Jl. Kesehatan No. 123, Jakarta | Telp: (021) 1234-5678")
                .setFontSize(10)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(15);
            document.add(subHeader);
            
            // Garis pemisah
            document.add(new Paragraph()
                .setBorderBottom(new SolidBorder(primaryColor, 2))
                .setMarginBottom(15));
            
            // Judul Resep
            Paragraph title = new Paragraph("RESEP DOKTER")
                .setFontSize(16)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20);
            document.add(title);
            
            // Informasi Pasien dan Dokter
            Table infoTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                .useAllAvailableWidth()
                .setMarginBottom(15);
            
            // Kolom Kiri - Info Pasien
            Cell leftCell = new Cell()
                .setBorder(Border.NO_BORDER)
                .add(new Paragraph("INFORMASI PASIEN").setBold().setFontSize(11).setMarginBottom(5))
                .add(new Paragraph("Nama: " + request.getNamaPasien()).setFontSize(10))
                .add(new Paragraph("No. Rekam Medis: " + request.getNomorRekamMedis()).setFontSize(10));
            
            // Kolom Kanan - Info Dokter
            Cell rightCell = new Cell()
                .setBorder(Border.NO_BORDER)
                .add(new Paragraph("INFORMASI DOKTER").setBold().setFontSize(11).setMarginBottom(5))
                .add(new Paragraph("Dokter: " + request.getNamaDokter()).setFontSize(10))
                .add(new Paragraph("Spesialisasi: " + request.getSpesialisasi()).setFontSize(10))
                .add(new Paragraph("Tanggal: " + request.getTanggalPemeriksaan()
                    .format(DateTimeFormatter.ofPattern("dd MMMM yyyy"))).setFontSize(10));
            
            infoTable.addCell(leftCell);
            infoTable.addCell(rightCell);
            document.add(infoTable);
            
            // Diagnosis
            document.add(new Paragraph("DIAGNOSIS")
                .setBold()
                .setFontSize(11)
                .setMarginTop(10)
                .setMarginBottom(5));
            document.add(new Paragraph(request.getDiagnosis())
                .setFontSize(10)
                .setBackgroundColor(lightGray)
                .setPadding(8)
                .setMarginBottom(15));
            
            // Tabel Obat
            document.add(new Paragraph("DAFTAR OBAT")
                .setBold()
                .setFontSize(11)
                .setMarginBottom(5));
            
            Table obatTable = new Table(UnitValue.createPercentArray(new float[]{3, 2, 2, 2}))
                .useAllAvailableWidth();
            
            // Header tabel
            String[] headers = {"Nama Obat", "Dosis", "Frekuensi", "Durasi"};
            for (String h : headers) {
                obatTable.addHeaderCell(new Cell()
                    .add(new Paragraph(h).setBold())
                    .setBackgroundColor(primaryColor)
                    .setFontColor(ColorConstants.WHITE)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setPadding(8));
            }
            
            // Isi tabel
            for (ResepPdfRequest.ObatItem obat : request.getDaftarObat()) {
                obatTable.addCell(new Cell().add(new Paragraph(obat.getNamaObat()).setFontSize(9)).setPadding(5));
                obatTable.addCell(new Cell().add(new Paragraph(obat.getDosis()).setFontSize(9)).setPadding(5));
                obatTable.addCell(new Cell().add(new Paragraph(obat.getFrekuensi()).setFontSize(9)).setPadding(5));
                obatTable.addCell(new Cell().add(new Paragraph(obat.getDurasi()).setFontSize(9)).setPadding(5));
            }
            
            document.add(obatTable);
            
            // Catatan Tambahan
            if (request.getCatatanTambahan() != null && !request.getCatatanTambahan().isEmpty()) {
                document.add(new Paragraph("CATATAN")
                    .setBold()
                    .setFontSize(11)
                    .setMarginTop(15)
                    .setMarginBottom(5));
                document.add(new Paragraph(request.getCatatanTambahan())
                    .setFontSize(10)
                    .setItalic()
                    .setBackgroundColor(lightGray)
                    .setPadding(8)
                    .setMarginBottom(20));
            }
            
            // Tanda Tangan
            document.add(new Paragraph("\n\n"));
            Table signatureTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                .useAllAvailableWidth();
            
            signatureTable.addCell(new Cell().setBorder(Border.NO_BORDER)
                .add(new Paragraph(""))); // Kosong
            
            Cell signCell = new Cell().setBorder(Border.NO_BORDER)
                .setTextAlignment(TextAlignment.CENTER)
                .add(new Paragraph("Jakarta, " + request.getTanggalPemeriksaan()
                    .format(DateTimeFormatter.ofPattern("dd MMMM yyyy"))).setFontSize(10))
                .add(new Paragraph("\n\n\n"))
                .add(new Paragraph(request.getNamaDokter()).setBold().setFontSize(10))
                .add(new Paragraph(request.getSpesialisasi()).setFontSize(9).setItalic());
            
            signatureTable.addCell(signCell);
            document.add(signatureTable);
            
            // Footer
            document.add(new Paragraph("\n"));
            document.add(new Paragraph("Dokumen ini dicetak otomatis oleh sistem CarePulse")
                .setFontSize(8)
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(ColorConstants.GRAY)
                .setItalic());
            
            document.close();
            
        } catch (Exception e) {
            throw new RuntimeException("Gagal membuat PDF resep: " + e.getMessage(), e);
        }
        
        return baos.toByteArray();
    }
}
