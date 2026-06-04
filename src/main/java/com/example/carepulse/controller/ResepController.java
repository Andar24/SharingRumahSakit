package com.example.carepulse.controller;

import com.example.carepulse.dto.ResepPdfRequest;
import com.example.carepulse.service.PdfResepService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/resep")
public class ResepController {

    @Autowired
    private PdfResepService pdfResepService;

    /**
     * Endpoint untuk generate PDF resep dokter
     * POST /api/resep/generate-pdf
     */
    @PostMapping("/generate-pdf")
    public ResponseEntity<byte[]> generateResepPdf(@RequestBody ResepPdfRequest request) {
        try {
            // Generate PDF
            byte[] pdfBytes = pdfResepService.generateResepPdf(request);
            
            // Set filename dengan format: Resep_NamaPasien_Tanggal.pdf
            String filename = String.format("Resep_%s_%s.pdf", 
                request.getNamaPasien().replace(" ", "_"),
                LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")));
            
            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", filename);
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
            
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
            
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Endpoint untuk preview PDF di browser (tidak download)
     * POST /api/resep/preview-pdf
     */
    @PostMapping("/preview-pdf")
    public ResponseEntity<byte[]> previewResepPdf(@RequestBody ResepPdfRequest request) {
        try {
            byte[] pdfBytes = pdfResepService.generateResepPdf(request);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.add("Content-Disposition", "inline; filename=resep.pdf");
            
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
            
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
