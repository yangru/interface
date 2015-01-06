<?php
defined ( 'BASEPATH' ) or exit ( 'No direct script access allowed' );

require APPPATH . '/libraries/MY_REST_Controller.php';
class Weibo extends MY_REST_Controller {
	private $mp_server;
	function __construct() {
		parent::__construct ();
		$this->load->config ( 'api' );
		$this->mp_server = $this->config->item ( 'mp_server' );
	}
	public function user_get() {
		$strResult = file_get_contents ( $this->mp_server . 'weibo/weibofriendsrecommend?id=' . $this->get ( 'id' ) );
		$arrResult = json_decode ( $strResult, true );
		if ($arrResult == false) {
			$this->_response_failure ();
		}
		if (isset ( $arrResult ['error'] ) === true) {
			$this->_response_failure ( $arrResult );
		}
		$arrNewData = array ();
		foreach ( $arrResult ['items'] as $dk => $dv ) {
			$arrNewData [] = array (
					'id' => $dv ['id'],
					'reason' => $dv ['reason'] 
			);
		}
		$this->_response_success ( array (
				'data' => $arrNewData 
		) );
	}
	public function content_get() {
		$strResult = file_get_contents ( $this->mp_server . 'weibo/weibocontentrecommend?id=' . $this->get ( 'id' ) );
		$arrResult = json_decode ( $strResult, true );
		if ($arrResult == false) {
			$this->_response_failure ();
		}
		if (isset ( $arrResult ['error'] ) === true) {
			$this->_response_failure ( $arrResult );
		}
		$arrNewData = array ();
		foreach ( $arrResult ['items'] as $dk => $dv ) {
			$arrNewData [] = array (
					'id' => $dv ['wb_id'] 
			);
		}
		$this->_response_success ( array (
				'data' => $arrNewData 
		) );
	}
	public function sort_get() {
		$strResult = file_get_contents ( $this->mp_server . 'weibo/weibocontentsort?id=' . $this->get ( 'uid' ) . '&ids=' . $this->get ( 'ids' ) );
		$arrResult = json_decode ( $strResult, true );
		if ($arrResult ['items'] == null) {
			$this->_response_failure ();
		}
		if (isset ( $arrResult ['error'] ) === true) {
			$this->_response_failure ( $arrResult );
		}
		$arrNewData = array ();
		foreach ( $arrResult ['items'] as $dk => $dv ) {
			$arrNewData [] = array (
					'id' => $dv ['wb_id'] 
			);
		}
		$this->_response_success ( array (
				'data' => $arrNewData 
		) );
	}
}
