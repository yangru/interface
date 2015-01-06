<?php
defined ( 'BASEPATH' ) or exit ( 'No direct script access allowed' );

require APPPATH . '/libraries/MY_REST_Controller.php';
class Import extends MY_REST_Controller {
	private function _run($strtype) {
		$this->load->config ( 'api' );
		system ( $this->config->item ( 'python_bin' ) . ' ' . $this->config->item ( 'data_import' )['system_path'] . '/main.py ' . $strtype );
	}
	function import_post() {
		$this->load->config ( 'api' );
		$strdata = $this->post ( 'data' );
		$strtype = $this->post ( 'type' );
		$arrdata = json_decode ( $strdata, true );
		$strlist = array ();
		foreach ( $arrdata as $value ) {
			$strlist [] = $value ['url'] . '#' . $value ['md5'];
		}
		$strpath = $this->config->item ( 'data_import' )['system_path'] . '/download.list';
		file_put_contents ( $strpath, join ( "\r\n", $strlist ), FILE_APPEND );
		$this->_run ( $strtype );
		$this->_response_success ();
	}
}
