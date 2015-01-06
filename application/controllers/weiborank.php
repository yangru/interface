<?php
defined ( 'BASEPATH' ) or exit ( 'No direct script access allowed' );

require APPPATH . '/libraries/MY_REST_Controller.php';
class WeiboRank extends MY_REST_Controller {
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
	private function _hot_weibo_rank($strApi) {
		$fields = array (
				'period',
				'type',
				'page',
				'num' 
		);
		$this->_validation ( $this->get (), $fields );
		$strArg = $this->_create_param ( $this->get (), array (
				'period' => 'period',
				'type' => 'type',
				'page' => 'page',
				'num' => 'offset' 
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
				'data' => $arrResult ['items'] 
		) );
	}
	public function content_get() {
		$this->_hot_weibo_rank ( 'weibo/hotweiborank?' );
	}
	public function user_get() {
		$this->_hot_weibo_rank ( 'weibo/hotweibouserrank?' );
	}
	private function _topic_and_potential($strApi) {
		$fields = array (
				'period',
				'page',
				'num' 
		);
		$this->_validation ( $this->get (), $fields );
		$strArg = $this->_create_param ( $this->get (), array (
				'period' => 'period',
				'page' => 'page',
				'num' => 'offset' 
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
				'data' => $arrResult ['items'] 
		) );
	}
	private function _topic_and_potential_1($strApi) {
		$fields = array (
				'page',
				'num' 
		);
		$this->_validation ( $this->get (), $fields );
		$strArg = $this->_create_param ( $this->get (), array (
				'page' => 'page',
				'num' => 'offset' 
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
				'data' => $arrResult ['items'] 
		) );
	}
	public function topic_get() {
		$this->_topic_and_potential ( 'weibo/queryweibotopicrank?' );
	}
	public function potential_get() {
		$this->_topic_and_potential_1 ( 'weibo/weibopotentialrank?' );
	}
}
