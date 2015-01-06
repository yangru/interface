<?php
date_default_timezone_set ( 'PRC' );

defined ( 'BASEPATH' ) or exit ( 'No direct script access allowed' );

require APPPATH . '/libraries/MY_REST_Controller.php';
class Friend extends MY_REST_Controller {
	private function _find_user_by_uid($arrUids = array(), $blnUsers = false) {
		if (empty ( $arrUids ) === true) {
			return array ();
		}
		if ($blnUsers === true) {
			$arrTmpUsersTmp = array ();
			$arrTmpUsers = $arrUids;
			$arrTmpUdis = array ();
			foreach ( $arrTmpUsers as $arrUser ) {
				$arrTmpUsersTmp [$arrUser ['id']] = $arrUser;
				$arrTmpUdis [] = intval ( $arrUser ['id'] );
			}
			$arrUids = $arrTmpUdis;
		}
		$this->load->database ();
		$arrUsers = array ();
		for($i = 1; $i <= 50; $i ++) {
			$strSQL = 'SELECT * FROM `user_' . intval ( $i ) . '` WHERE `userid` IN (' . implode ( ',', $arrUids ) . ')';
			$query = $this->db->query ( $strSQL );
			$row = $query->result_array ();
			$query->free_result ();
			if (empty ( $row ) === false) {
				$arrUsers = array_merge ( $arrUsers, $row );
			}
		}
		$arrResult = array ();
		foreach ( $arrUsers as $uk => $arrUser ) {
			$age = null;
			if (empty ( $arrUser ['birthday'] ) === false) {
				$arrAge = explode ( '-', $arrUser ['birthday'] );
				$age = intval ( $arrAge [0] );
			}
			if ($age === 0) {
				$age = null;
			}
			$gender = null;
			if ($arrUser ['sex'] !== null) {
				$gender = intval ( $arrUser ['sex'] );
			}
			$this->load->config ( 'city' );
			$city = $this->config->item ( 'city' );
			$update_field = array (
					'id' => intval ( $arrUser ['userid'] ),
					'age' => $age,
					'gender' => $gender,
					'username' => $arrUser ['username'],
					'nickname' => $arrUser ['nickname'],
					'passuserid' => $arrUser ['passuserid'],
					'lastlogin' => intval ( $arrUser ['lastlogin'] ),
					'province' => $city [$arrUser ['province']] [0],
					'city' => $city [$arrUser ['province']] [$arrUser ['city']],
					'province_num' => $arrUser ['province'],
					'city_num' => $arrUser ['city'],
					'education' => intval ( $arrUser ['education'] ),
					'industry' => intval ( $arrUser ['industry'] ),
					'job' => intval ( $arrUser ['job'] ),
					'unread' => 0,
					'video_history' => null,
					'register_region' => null 
			);
			$this->load->library ( 'mongo_db' );
			$this->mongo_db->where ( array (
					'id' => intval ( $arrUser ['userid'] ) 
			) )->update ( 'passport_user', $update_field, array (
					'upsert' => true 
			) );
			$arrResult [] = $update_field;
		}
		if ($blnUsers === true) {
			foreach ( $arrResult as $arrUser ) {
				$arrTmpUsersTmp [$arrUser ['id']] = array_merge ( $arrTmpUsersTmp [$arrUser ['id']], $arrUser );
			}
			$arrResult = array ();
			foreach ( $arrTmpUsersTmp as $arrUser ) {
				$arrResult [] = $arrUser;
			}
		}
		return $arrResult;
	}
	private function _filter_age_users($arrWheres, $arrAge, $education, $id, $limit, $industry, $job) {
		$this->load->library ( 'mongo_db' );
		$result = $this->mongo_db->where ( array (
				'$or' => $arrWheres 
		) )->where ( array (
				'industry' => strval ( $industry ) 
		) )->where_between ( 'age', $arrAge [0], $arrAge [1] )->where_in ( 'education', $education )->where_ne ( 'id', $id )->order_by ( array (
				'lastlogin' => - 1 
		) )->limit ( $limit )->get ( 'passport_user' );
		if (empty ( $result )) {
			return array ();
		}
		return $result;
	}
	public function recommend_get() {
		$fields = array (
				'uid' 
		);
		$this->_validation ( $this->get (), $fields );
		if ($this->get ( 'dzl' ) !== '1988') {
			$this->_validation_sign ( $this->get (), $fields );
		}
		$result = $this->_find_user_by_uid ( array (
				$this->get ( 'uid' ) 
		) );
		if (empty ( $result ) === true) {
			$this->_response_failure ( array (
					'counters' => 0,
					'data' => array (),
					'error' => '用户不存在' 
			) );
		}
		$this->load->library ( 'mongo_db' );
		if (empty ( $result ) === false) {
			// log //
			$age = isset ( $result [0] ['age'] ) ? date ( 'Y' ) - intval ( $result [0] ['age'] ) : '';
			log_message ( 'debug', 'ID:' . $result [0] ['id'] . "\t" . ',性别:' . $result [0] ['gender'] . "\t" . ',年龄:' . $age . "\t" . ',行业:' . $result [0] ['industry'] . "\t" . ',地域:' . $result [0] ['province'] . ',' . $result [0] ['city'] . "\t" . ',学历:' . $result [0] ['education'] );
			// //////
			$education = $result [0] ['education'];
			if ($education < 5) {
				$education = array (
						'1',
						'2',
						'3',
						'4' 
				);
			} else if ($education == 5) {
				$education = array (
						'5',
						'6' 
				);
			} else {
				$education = array (
						'6' 
				);
			}
			$this->load->config ( 'city' );
			$city_x = $this->config->item ( 'city' );
			$this->load->config ( 'city_filter' );
			$city_filter = $this->config->item ( 'city_filter' );
			$city_filter_x = $this->config->item ( 'city_filter_x' );
			$province = $result [0] ['province_num'];
			$city = $result [0] ['city_num'];
			if (in_array ( $province, $city_filter_x )) {
				$city = 'x';
			}
			$strFilter = $province . ',' . $city;
			$arrFilter = array ();
			if (isset ( $city_filter [$strFilter] )) {
				$arrFilter = $city_filter [$strFilter];
			}
			$arrWheres = array ();
			foreach ( $arrFilter as $fk => $fv ) {
				$arrTempFilter = explode ( ',', $fv );
				if (stristr ( $arrTempFilter [1], '~' ) === false) {
					$arrWheres [] = array (
							'province' => $city_x [$arrTempFilter [0]] [0],
							'city' => $city_x [$arrTempFilter [0]] [$arrTempFilter [1]] 
					);
				} else {
					$arrTempFilters = explode ( '~', $arrTempFilter [1] );
					for($i = intval ( $arrTempFilters [0] ); $i <= intval ( $arrTempFilters [1] ); $i ++) {
						$arrWheres [] = array (
								'province' => $city_x [$arrTempFilter [0]] [0],
								'city' => $city_x [$arrTempFilter [0]] [strval ( $i )] 
						);
					}
				}
			}
			$age = $result [0] ['age'];
			$id = $result [0] ['id'];
			if ($age !== null) {
				$industry = $result [0] ['industry'];
				$job = $result [0] ['job'];
				$result = $this->_filter_age_users ( $arrWheres, array (
						$age - 2,
						$age + 2 
				), $education, $id, 10, $industry, $job );
				$result = array_merge ( $result, $this->_filter_age_users ( $arrWheres, array (
						$age - 5,
						$age - 3 
				), $education, $id, 4, $industry, $job ) );
				$result = array_merge ( $result, $this->_filter_age_users ( $arrWheres, array (
						$age + 3,
						$age + 5 
				), $education, $id, 4, $industry, $job ) );
				$result = array_merge ( $result, $this->_filter_age_users ( $arrWheres, array (
						$age - 10,
						$age - 6 
				), $education, $id, 1, $industry, $job ) );
				$result = array_merge ( $result, $this->_filter_age_users ( $arrWheres, array (
						$age + 6,
						$age + 10 
				), $education, $id, 1, $industry, $job ) );
			} else {
				$result = array ();
			}
		}
		foreach ( $result as $v ) {
			// log //
			$age = isset ( $v ['age'] ) ? date ( 'Y' ) - intval ( $v ['age'] ) : '';
			$lastlogin = isset ( $v ['lastlogin'] ) ? date ( 'Y-m-d H:i:s', intval ( $v ['lastlogin'] ) ) : '';
			log_message ( 'debug', 'ID:' . $v ['id'] . "\t" . ',性别:' . $v ['gender'] . "\t" . ',年龄:' . $age . "\t" . ',行业:' . (isset ( $v ['industry'] ) ? $v ['industry'] : '') . "\t" . ',地域:' . (isset ( $v ['province'] ) ? $v ['province'] : '') . ',' . (isset ( $v ['city'] ) ? $v ['city'] : '') . "\t" . ',学历:' . (isset ( $v ['education'] ) ? $v ['education'] : '') . "\t" . ',最后登录时间:' . $lastlogin );
			// //////
		}
		if (empty ( $result ) === true) {
			$result = $this->mongo_db->where_ne ( 'id', $id )->order_by ( array (
					'lastlogin' => - 1 
			) )->limit ( 20 )->get ( 'passport_user' );
			foreach ( $result as $v ) {
				// log //
				$age = isset ( $v ['age'] ) ? date ( 'Y' ) - intval ( $v ['age'] ) : '';
				$lastlogin = isset ( $v ['lastlogin'] ) ? date ( 'Y-m-d H:i:s', intval ( $v ['lastlogin'] ) ) : '';
				log_message ( 'debug', 'ID:' . $v ['id'] . "\t" . ',性别:' . $v ['gender'] . "\t" . ',年龄:' . $age . "\t" . ',行业:' . (isset ( $v ['industry'] ) ? $v ['industry'] : '') . "\t" . ',地域:' . (isset ( $v ['province'] ) ? $v ['province'] : '') . ',' . (isset ( $v ['city'] ) ? $v ['city'] : '') . "\t" . ',学历:' . (isset ( $v ['education'] ) ? $v ['education'] : '') . "\t" . ',最后登录时间:' . $lastlogin . ',随机=1' );
				// //////
			}
		} elseif (count ( $result ) < 20) {
			$tempCount = 20 - count ( $result );
			$tempResult = $this->mongo_db->where_ne ( 'id', $id )->order_by ( array (
					'lastlogin' => - 1 
			) )->limit ( $tempCount )->get ( 'passport_user' );
			foreach ( $tempResult as $v ) {
				// log //
				$age = isset ( $v ['age'] ) ? date ( 'Y' ) - intval ( $v ['age'] ) : '';
				$lastlogin = isset ( $v ['lastlogin'] ) ? date ( 'Y-m-d H:i:s', intval ( $v ['lastlogin'] ) ) : '';
				log_message ( 'debug', 'ID:' . $v ['id'] . "\t" . ',性别:' . $v ['gender'] . "\t" . ',年龄:' . $age . "\t" . ',行业:' . (isset ( $v ['industry'] ) ? $v ['industry'] : '') . "\t" . ',地域:' . (isset ( $v ['province'] ) ? $v ['province'] : '') . ',' . (isset ( $v ['city'] ) ? $v ['city'] : '') . "\t" . ',学历:' . (isset ( $v ['education'] ) ? $v ['education'] : '') . "\t" . ',最后登录时间:' . $lastlogin . ',随机=1' );
				// //////
			}
			$result = array_merge ( $result, $tempResult );
		}
		$result = $this->_find_user_by_uid ( $result, true );
		$arrResult = array ();
		foreach ( $result as $v ) {
			$arrResult [] = array (
					'userid' => $v ['id'],
					'passportid' => $v ['passuserid'],
					'nickname' => $v ['nickname'],
					'username' => $v ['username'] 
			);
		}
		$this->_response_success ( array (
				'counters' => count ( $arrResult ),
				'data' => $arrResult 
		) );
	}
}
