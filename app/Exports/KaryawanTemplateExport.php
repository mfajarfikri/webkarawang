<?php

namespace App\Exports;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class KaryawanTemplateExport
{
    public function export()
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        
        // Set title
        $sheet->setTitle('Template Karyawan');
        
        // Set headers
        $headers = [
            'nip',
            'name',
            'email',
            'jenis_kelamin',
            'jabatan_id',
            'department_id',
            'parent_id',
            'kedudukan',
            'is_active',
        ];
        
        // Add headers
        foreach ($headers as $colIndex => $header) {
            $sheet->setCellValue(chr(65 + $colIndex) . '1', $header);
        }
        
        // Add sample data
        $sampleData = [
            '1234567890',
            'Nama Karyawan',
            'email@example.com',
            'L',
            '1',
            '1',
            '',
            'UPT Karawang',
            '1',
        ];
        
        foreach ($sampleData as $colIndex => $value) {
            $sheet->setCellValue(chr(65 + $colIndex) . '2', $value);
        }
        
        // Style the header row
        $headerStyle = [
            'font' => [
                'bold' => true,
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => [
                    'rgb' => 'E0E0E0',
                ],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
            ],
        ];
        
        $sheet->getStyle('A1:I1')->applyFromArray($headerStyle);
        
        // Auto-size columns
        foreach (range('A', 'I') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }
        
        // Create the Excel file
        $writer = new Xlsx($spreadsheet);
        
        // Save to temporary file
        $tempFile = tempnam(sys_get_temp_dir(), 'karyawan_template_');
        $writer->save($tempFile);
        
        return $tempFile;
    }
} 