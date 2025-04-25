<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Excel settings
    |--------------------------------------------------------------------------
    |
    | Here you can set the default settings for the Excel package.
    |
    */

    'exports' => [
        'chunk_size' => 1000,
    ],

    'imports' => [
        'read_only' => false,
    ],

    'value_binder' => [
        'default' => 'Maatwebsite\Excel\DefaultValueBinder',
    ],

    'cache' => [
        'enable' => true,
        'driver' => 'memory',
        'batch' => [
            'memory_limit' => 60000,
        ],
        'ttl' => [
            'minutes' => 60,
        ],
    ],
]; 