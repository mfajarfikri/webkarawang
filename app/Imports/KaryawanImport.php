<?php

namespace App\Imports;

use App\Models\Karyawan;
use Illuminate\Support\Facades\Auth;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class KaryawanImport
{
    public function import($file)
    {
        $spreadsheet = IOFactory::load($file);
        $worksheet = $spreadsheet->getActiveSheet();
        $rows = $worksheet->toArray();
        
        // Remove header row
        $headers = array_shift($rows);
        
        $imported = 0;
        $errors = [];
        
        foreach ($rows as $index => $row) {
            $data = array_combine($headers, $row);
            
            try {
                $this->validateRow($data);
                
                Karyawan::create([
                    'nip' => $data['nip'],
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'jenis_kelamin' => $data['jenis_kelamin'],
                    'jabatan_id' => $data['jabatan_id'],
                    'department_id' => $data['department_id'],
                    'parent_id' => $data['parent_id'] ?? null,
                    'kedudukan' => $data['kedudukan'],
                    'is_active' => $data['is_active'] ?? true,
                    'created_by' => Auth::id(),
                ]);
                
                $imported++;
            } catch (\Exception $e) {
                $errors[] = "Row " . ($index + 2) . ": " . $e->getMessage();
            }
        }
        
        return [
            'imported' => $imported,
            'errors' => $errors
        ];
    }
    
    private function validateRow($data)
    {
        $validator = validator($data, [
            'nip' => 'required|unique:karyawans,nip',
            'name' => 'required',
            'email' => 'required|email|unique:karyawans,email',
            'jenis_kelamin' => 'required|in:L,P',
            'jabatan_id' => 'required|exists:jabatans,id',
            'department_id' => 'required|exists:departments,id',
            'kedudukan' => 'required|in:UPT Karawang,ULTG Karawang,ULTG Purwakarta',
        ]);
        
        if ($validator->fails()) {
            throw new \Exception($validator->errors()->first());
        }
    }
} 