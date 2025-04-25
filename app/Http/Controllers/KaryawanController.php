<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Karyawan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class KaryawanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Dashboard/Karyawan/Karyawan', [
            'karyawan' => Karyawan::with('department')->get(),
            'departments' => Department::all()
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nip' => 'required|unique:karyawans,nip',
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:karyawans,email',
            'jenis_kelamin' => 'required|in:L,P',
            'jabatan_id' => 'required|exists:jabatans,id',
            'department_id' => 'required|exists:departments,id',
            'parent_id' => 'nullable|exists:karyawans,id',
            'kedudukan' => 'required|in:UPT Karawang,ULTG Karawang,ULTG Purwakarta',
            'foto_profil' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'is_active' => 'boolean',
        ]);

        $data = $request->all();
        
        // Handle file upload if present
        if ($request->hasFile('foto_profil')) {
            $file = $request->file('foto_profil');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('public/karyawan', $filename);
            $data['foto_profil'] = Storage::url($path);
        }
        
        // Set created_by to current user
        $data['created_by'] = Auth::id();
        
        // Create the karyawan
        $karyawan = Karyawan::create($data);
        
        return redirect()->route('karyawan.index')
            ->with('success', 'Karyawan berhasil ditambahkan!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Karyawan $karyawan)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Karyawan $karyawan)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Karyawan $karyawan)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Karyawan $karyawan)
    {
        //
    }

    /**
     * Import karyawan data from Excel file
     */
    public function importExcel(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls',
        ]);

        try {
            $spreadsheet = IOFactory::load($request->file('file'));
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
            
            if (count($errors) > 0) {
                return redirect()->back()->with('error', 'Beberapa data gagal diimport: ' . implode(', ', $errors));
            }
            
            return redirect()->back()->with('success', 'Data karyawan berhasil diimport! ' . $imported . ' data berhasil diimport.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal mengimport data: ' . $e->getMessage());
        }
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

    /**
     * Download template for karyawan import
     */
    public function downloadTemplate()
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
        
        return response()->download($tempFile, 'template_karyawan.xlsx')->deleteFileAfterSend();
    }
}
