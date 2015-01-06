<?php
if (! defined ( 'BASEPATH' ))
	exit ( 'No direct script access allowed' );

$config ['api_debug'] = true;
$config ['sign_string'] = 'cntv';
$config ['mp_server'] = 'http://dzl.clicki.server/';
$config ['ap_server'] = array (
		'host' => '192.168.1.118',
		'port' => 8001 
);
$config ['vms_server'] = 'http://192.168.1.85/index.php';
$config ['python_bin'] = 'python';
$config ['data_import'] = array (
		'system_path' => 'import' 
);
