<?php
defined ( 'BASEPATH' ) or exit ( 'No direct script access allowed' );

require APPPATH . '/libraries/MY_REST_Controller.php';
class T extends MY_REST_Controller {
	const T_QUEUE = 'queue_weibo_action';
	const T_QUEUE_KEY = 'weibo_action';
	private function _at($content) {
		$content = preg_replace ( '/([a-z0-9\+_\-]+)(\.[a-z0-9\+_\-]+)*@([a-z0-9\-]+\.)+[a-z]{2,6}/i', ' ', $content );
		$ret = preg_match_all ( '/@([0-9a-zA-Z一-龥_-]+)/', $content, $matches );
		if ($ret > 0) {
			return array_unique ( $matches [1] );
		}
		return array ();
	}
	private function _topic($content) {
		preg_match_all ( '/#(.+?)#/', $content, $matches );
		return $matches [1];
	}
	function statuses_post() {
		$strdata = $this->post ( 'data' );
		$intdatalen = mb_strlen ( $strdata );
		$strmsg = mb_substr ( $strdata, 0, $intdatalen - 32 );
		$strmd5 = mb_substr ( $strdata, $intdatalen - 32 );
		
		if (md5 ( $strmsg ) !== strtolower ( $strmd5 )) {
			$this->_response_failure ();
		}
		
		$intmsglen = mb_strlen ( $strmsg );
		$strmsg = mb_substr ( $strmsg, 4, $intmsglen - 7 );
		
		$intmsgpos = strpos ( $strmsg, '#MESSAGE:' );
		$strmessage = mb_substr ( $strmsg, $intmsgpos + 9 );
		$intmessagelen = mb_strlen ( $strmessage );
		$strmsg = mb_substr ( $strmsg, 0, $intmsglen - 7 - $intmessagelen - 9 );
		
		preg_match_all ( '/(.+?):(.+?)(#|$)/', $strmsg, $matches );
		$arrmsg = array_combine ( $matches [1], $matches [2] );
		$arrmsg ['MESSAGE'] = json_decode ( $strmessage, true );
		$arrmsg ['MESSAGE'] ['AT'] = $this->_at ( $arrmsg ['MESSAGE'] ['CONTENT'] );
		$arrmsg ['MESSAGE'] ['TOPIC'] = $this->_topic ( $arrmsg ['MESSAGE'] ['CONTENT'] );
		
		$this->load->library ( 'Jobs' );
		
		$data = json_encode ( array (
				self::T_QUEUE_KEY => $arrmsg 
		) );
		$this->jobs->enqueue ( self::T_QUEUE, $data );
		
		$this->_response_success ();
	}
	function statuses_get() {
		$this->load->library ( 'Jobs' );
		
		$result = $this->jobs->dequeue ( self::T_QUEUE );
		
		$this->_response_success ( array (
				'result' => $result 
		) );
	}
}
