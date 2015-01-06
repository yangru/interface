<?php
defined ( 'BASEPATH' ) or exit ( 'No direct script access allowed' );

require APPPATH . '/libraries/MY_REST_Controller.php';
class WeiboTrend extends MY_REST_Controller {
	private $mp_server;
	function __construct() {
		parent::__construct ();
		$this->load->config ( 'api' );
		$this->mp_server = $this->config->item ( 'mp_server' );
	}
	private function _create_param($data, $fields) {
		$strParam = array ();
		foreach ( $fields as $k => $v ) {
			$strParam [] = $v . '=' . $data [$k];
		}
		return implode ( '&', $strParam );
	}
	private function _query_weibo_trend($strApi) {
		$fields = array (
				'period',
				'uid' 
		);
		$this->_validation ( $this->get (), $fields );
		$strArg = $this->_create_param ( $this->get (), array (
				'period' => 'period',
				'uid' => 'id' 
		) );
		$strResult = file_get_contents ( $this->mp_server . $strApi . $strArg );
		$arrResult = json_decode ( $strResult, true );
		if ($arrResult == false) {
			$this->_response_failure ();
		}
		if (isset ( $arrResult ['error'] ) === true) {
			$this->_response_failure ( $arrResult );
		}
		$this->_response_success ( array (
				'data' => $arrResult 
		) );
	}
	public function content_get() {
		$this->_query_weibo_trend ( 'weibo/queryweibotrendbyid?' );
	}
	public function user_get() {
		$this->_query_weibo_trend ( 'weibo/queryweibousertrendbyid?' );
	}
	public function topic_get() {
		$fields = array (
				'period',
				'topic' 
		);
		$this->_validation ( $this->get (), $fields );
		$strApi = 'weibo/queryweibotopictrend?';
		$strArg = $this->_create_param ( $this->get (), array (
				'period' => 'period',
				'topic' => 'topic' 
		) );
		$strResult = file_get_contents ( $this->mp_server . $strApi . $strArg );
		$arrResult = json_decode ( $strResult, true );
		if ($arrResult == false) {
			$this->_response_failure ();
		}
		if (isset ( $arrResult ['error'] ) === true) {
			$this->_response_failure ( $arrResult );
		}
		$this->_response_success ( array (
				'data' => $arrResult 
		) );
	}
}
