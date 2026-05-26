<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\NetworkDevice;
use App\Models\NetworkConnection;
use App\Models\GarduInduk;

class NetworkMonitoringSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $gi = GarduInduk::first();
        if (!$gi) return;

        // Create devices
        $router = NetworkDevice::create([
            'gardu_induk_id' => $gi->id,
            'name' => 'Main Router ' . $gi->name,
            'ip_address' => '192.168.1.1',
            'type' => 'Router',
            'icon_key' => 'router',
            'status' => 'online',
            'last_seen' => now(),
            'snmp_data' => ['cpu_usage' => '15%', 'memory_usage' => '40%', 'uptime' => '12 days']
        ]);

        $switch1 = NetworkDevice::create([
            'gardu_induk_id' => $gi->id,
            'name' => 'Distribution Switch 1',
            'ip_address' => '192.168.1.2',
            'type' => 'Switch',
            'icon_key' => 'switch',
            'status' => 'online',
            'last_seen' => now(),
        ]);

        $server = NetworkDevice::create([
            'gardu_induk_id' => $gi->id,
            'name' => 'Monitoring Server',
            'ip_address' => '192.168.1.10',
            'type' => 'Server',
            'icon_key' => 'server',
            'status' => 'online',
            'last_seen' => now(),
        ]);

        // Create connections
        NetworkConnection::create([
            'source_id' => $router->id,
            'target_id' => $switch1->id,
            'type' => 'fiber',
            'status' => 'active'
        ]);

        NetworkConnection::create([
            'source_id' => $switch1->id,
            'target_id' => $server->id,
            'type' => 'ethernet',
            'status' => 'active'
        ]);
    }
}
