<?php
if (! defined ( 'BASEPATH' ))
	exit ( 'No direct script access allowed' );
require APPPATH . '/libraries/REST_Controller.php';
class MY_REST_Controller extends REST_Controller {
	function __construct() {
		parent::__construct ();
	}
	private function _response($status, $data) {
		$array = array (
				'status' => $status 
		);
		if ($data) {
			$array = array_merge ( $array, $data );
		}
		$this->response ( $array, 200 );
	}
	protected function _response_success($data = null) {
		$this->_response ( 1, $data );
	}
	protected function _response_failure($data = null) {
		$this->_response ( 0, $data );
	}
	protected function _validation($param, $fields) {
		$this->load->config ( 'api' );
		if ($this->config->item ( 'api_debug' ) === true) {
			return true;
		}
		$_POST = $param;
		$this->load->library ( 'form_validation' );
		foreach ( $fields as $key ) {
			$this->form_validation->set_rules ( $key, $key, 'required' );
		}
		$status = $this->form_validation->run ();
		$error = $this->form_validation->error_array ();
		if ($status === false) {
			$this->_response_failure ( array (
					'error' => empty ( $error ) ? 'Missing Param: ' . join ( ', ', $fields ) : $error 
			) );
		}
	}
	protected function _validation_sign($param, $fields) {
		if (isset ( $param ['sign'] ) === false) {
			$this->_response_failure ( array (
					'error' => 'Missing Param: sign' 
			) );
		}
		$this->load->config ( 'api' );
		$data = array ();
		foreach ( $fields as $key ) {
			$data [$key] = $param [$key];
		}
		$result = $data;
		if ($this->config->item ( 'api_debug' ) === true) {
			return $result;
		}
		ksort ( $data );
		$query = http_build_query ( $data );
		$query = str_replace ( '&', '', $query );
		$query = $query . $this->config->item ( 'sign_string' ); // . date ( 'Ymd' );
		if ($param ['sign'] !== md5 ( $query )) {
			$this->_response_failure ( array (
					'error' => 'Authentication failed' 
			) );
		}
		return $result;
	}
}
