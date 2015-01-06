<?php
date_default_timezone_set ( 'PRC' );

defined ( 'BASEPATH' ) or exit ( 'No direct script access allowed' );

require APPPATH . '/libraries/MY_REST_Controller.php';
class Feedback extends MY_REST_Controller {
	private function _exists($strFilter, $strTable) {
		$this->load->library ( 'mongo_db' );
		$result = $this->mongo_db->where ( $strFilter )->get ( $strTable );
		return (empty ( $result ) === true ? false : true);
	}
	public function video_post() {
		$fields = array (
				'uid',
				'vid' 
		);
		$this->_validation ( $this->post (), $fields );
		$this->_validation_sign ( $this->post (), $fields );
		if ($this->_exists ( array (
				'id' => intval ( $this->post ( 'uid' ) ) 
		), 'passport_user' ) === false) {
			$this->_response_failure ( array (
					'error' => 'UID 不存在!' 
			) );
		}
		if ($this->_exists ( array (
				'vid' => $this->post ( 'vid' ) 
		), 'video_source' ) === false) {
			$this->_response_failure ( array (
					'error' => 'VID 不存在!' 
			) );
		}
		$this->load->library ( 'mongo_db' );
		$this->mongo_db->where ( array (
				'date' => strtotime ( date ( 'Y-m-d' ) ),
				'hour' => date ( 'H' ) 
		) )->inc ( 'feedback_count', 1 )->update ( 'interface_stat', array (), array (
				'upsert' => true 
		) );
		$arrUser = $this->mongo_db->where ( array (
				'id' => intval ( $this->post ( 'uid' ) ) 
		) )->get ( 'passport_user' );
		if (empty ( $arrUser ) === false) {
			$this->_response_success ( array (
					'passportid' => $arrUser [0] ['passuserid'],
					'uid' => $this->post ( 'uid' ) 
			) );
		}
	}
}
