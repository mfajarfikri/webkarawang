<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\NetworkDevice;
use App\Models\NetworkConnection;
use App\Models\GarduInduk;
use Inertia\Inertia;
use Illuminate\Support\Facades\Process;
use Carbon\Carbon;

class NetworkMonitoringController extends Controller
{
    public function index()
    {
        return Inertia::render('Dashboard/Monitoring/Network', [
            'garduInduks' => GarduInduk::all(),
        ]);
    }

    public function getTopology()
    {
        $devices = NetworkDevice::with('gardu_induk')->get();
        $connections = NetworkConnection::all();

        return response()->json([
            'nodes' => $devices,
            'links' => $connections
        ]);
    }

    public function storeDevice(Request $request)
    {
        $validated = $request->validate([
            'id' => 'nullable|exists:network_devices,id',
            'gardu_induk_id' => 'required|exists:gardu_induks,id',
            'name' => 'required|string|max:255',
            'ip_address' => 'required|string|max:255',
            'type' => 'required|string',
            'use_snmp' => 'required|boolean',
            'snmp_version' => 'nullable|required_if:use_snmp,true|in:v1,v2c,v3',
            'snmp_community' => 'nullable|required_if:snmp_version,v1,v2c|string',
            'snmp_port' => 'nullable|required_if:use_snmp,true|integer|between:1,65535',
            'snmp_timeout' => 'nullable|required_if:use_snmp,true|integer|between:1,60',
            // v3 fields
            'snmp_v3_user' => 'nullable|required_if:snmp_version,v3|string',
            'snmp_v3_security_level' => 'nullable|required_if:snmp_version,v3|in:noAuthNoPriv,authNoPriv,authPriv',
            'snmp_v3_auth_protocol' => 'nullable|required_if:snmp_v3_security_level,authNoPriv,authPriv|in:MD5,SHA',
            'snmp_v3_auth_passphrase' => 'nullable|required_if:snmp_v3_security_level,authNoPriv,authPriv|string',
            'snmp_v3_priv_protocol' => 'nullable|required_if:snmp_v3_security_level,authPriv|in:DES,AES',
            'snmp_v3_priv_passphrase' => 'nullable|required_if:snmp_v3_security_level,authPriv|string',
        ]);

        if ($request->id) {
            $device = NetworkDevice::findOrFail($request->id);
            $device->update($validated);
            $message = 'Perangkat berhasil diperbarui';
        } else {
            $device = NetworkDevice::create($validated);
            $message = 'Perangkat berhasil ditambahkan';
        }

        return redirect()->back()->with('success', $message);
    }

    public function storeConnection(Request $request)
    {
        $validated = $request->validate([
            'source_id' => 'required|exists:network_devices,id',
            'target_id' => 'required|exists:network_devices,id',
            'type' => 'required|string',
        ]);

        NetworkConnection::create($validated);

        return redirect()->back()->with('success', 'Koneksi berhasil ditambahkan');
    }

    public function destroyDevice(NetworkDevice $device)
    {
        $device->delete();
        return redirect()->back()->with('success', 'Perangkat berhasil dihapus');
    }

    public function scanStatus(Request $request)
    {
        $devices = NetworkDevice::all([
            'id', 'ip_address', 'snmp_version', 'snmp_community', 
            'snmp_port', 'snmp_timeout', 'snmp_v3_user', 
            'snmp_v3_security_level', 'snmp_v3_auth_protocol', 
            'snmp_v3_auth_passphrase', 'snmp_v3_priv_protocol', 
            'snmp_v3_priv_passphrase'
        ]);
        
        // Execute Python script
        $scriptPath = base_path('app/Scripts/network_scanner.py');
        $devicesJson = json_encode($devices);
        
        // Use 'python' or 'python3' depending on environment
        $command = "python \"$scriptPath\" \"$devicesJson\"";
        
        $process = Process::run($command);
        
        if (!$process->successful()) {
            return response()->json([
                'error' => 'Gagal menjalankan scanner Python',
                'output' => $process->errorOutput()
            ], 500);
        }

        $results = json_decode($process->output(), true);
        
        if (isset($results['error'])) {
            return response()->json($results, 500);
        }

        $updatedDevices = [];
        foreach ($results as $result) {
            $device = NetworkDevice::find($result['id']);
            if ($device) {
                $device->update([
                    'status' => $result['status'],
                    'last_seen' => $result['status'] === 'online' ? Carbon::now() : $device->last_seen,
                    'snmp_data' => $result['snmp_data']
                ]);
                $updatedDevices[] = $device;
            }
        }

        return response()->json($updatedDevices);
    }
}
