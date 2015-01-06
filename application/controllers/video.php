<?php
date_default_timezone_set ( 'PRC' );

defined ( 'BASEPATH' ) or exit ( 'No direct script access allowed' );

require APPPATH . '/libraries/MY_REST_Controller.php';
class Video extends MY_REST_Controller {
	const VIDEO_QUEUE = 'queue_video_collect_req';
	const VIDEO_QUEUE_KEY = 'video_collect_req';
	private function _get_video($arrVids = array(), $by = 'id', $strFrom = '') {
		if (empty ( $arrVids ) === true) {
			return array ();
		}
		$arrMaps = array (
				'id' => false,
				'vid' => false,
				'type' => null,
				'title' => 'videoName',
				'play_url' => false,
				'preview_image_url' => 'videoCoverPic',
				'create_time' => null,
				'channel' => 'playChannel',
				'last' => false,
				'play_count' => false 
		);
		$this->load->library ( 'mongo_db' );
		$arrVideos = is_array ( $arrVids [0] ) === true ? $arrVids : $this->mongo_db->where_in ( $by, $arrVids )->get ( 'video_source' );
		$this->load->config ( 'api' );
		$vms_server = $this->config->item ( 'vms_server' );
		foreach ( $arrVideos as $vk => $arrVideo ) {
			foreach ( $arrMaps as $key => $value ) {
				if (isset ( $arrVideo [$key] ) === false) {
					$strJson = file_get_contents ( $vms_server . '?guid=' . $arrVideo ['vid'] );
					$arrJson = json_decode ( $strJson, true );
					if (empty ( $arrJson ['classname'] ) === false) {
						$strType = $arrJson ['classname'];
					} elseif (empty ( $arrJson ['keywords'] ) === false) {
						$strType = $arrJson ['keywords'];
					} else {
						$strType = '';
					}
					if ($strType !== '') {
						$this->mongo_db->where ( array (
								'type' => $strType 
						) )->update ( 'video_type', array (
								'type' => $strType 
						), array (
								'upsert' => true 
						) );
					}
					$intCreateTime = $arrJson ['playTime'] !== '' ? $arrJson ['playTime'] : $arrJson ['videoTime'];
					$intCreateTime = strtotime ( $intCreateTime );
					$update_field = array ();
					foreach ( $arrMaps as $v => $k ) {
						if ($k === null) {
							continue;
						} elseif ($k === false) {
							if (isset ( $arrVideo [$v] ) === true) {
								$update_field [$v] = $arrVideo [$v];
							}
						} else {
							$update_field [$v] = $arrJson [$k];
						}
					}
					$update_field ['type'] = $strType;
					$update_field ['create_time'] = $intCreateTime;
					$this->mongo_db->where ( array (
							'vid' => $arrVideo ['vid'] 
					) )->update ( 'video_source', $update_field );
					$arrVideos [$vk] = array_merge ( $arrVideo, $update_field );
					break;
				}
			}
		}
		if ($strFrom !== '') {
			foreach ( $arrVideos as $vk => $arrVideo ) {
				if (stristr ( $arrVideos [$vk] ['play_url'], '?' ) === false) {
					$arrVideos [$vk] ['play_url'] .= '?' . $strFrom;
				} else {
					$arrVideos [$vk] ['play_url'] .= '&' . $strFrom;
				}
			}
		}
		return $arrVideos;
	}
	private function _type_video($strType, $count = 50) {
		$this->load->library ( 'mongo_db' );
		$arrVideos = $this->_get_video ( $this->mongo_db->where ( array (
				'type' => $strType 
		) )->order_by ( array (
				'create_time' => - 1 
		) )->limit ( $count )->get ( 'video_source' ) );
		return $arrVideos;
	}
	private function _exists($strFilter, $strTable) {
		$this->load->library ( 'mongo_db' );
		$result = $this->mongo_db->where ( $strFilter )->get ( $strTable );
		return (empty ( $result ) === true ? false : true);
	}
	private function _sort_by_key($keys, $array, $key) {
		$arrTmp = array ();
		foreach ( $array as $v ) {
			$arrTmp [$v [$key]] = $v;
		}
		$arrNew = array ();
		foreach ( $keys as $v ) {
			if (isset ( $arrTmp [$v] ))
				$arrNew [] = $arrTmp [$v];
		}
		return $arrNew;
	}
	public function operate_post() {
		$fields = array (
				'uid',
				'vid',
				'client_type',
				'operate_type' 
		);
		$this->_validation ( $this->post (), $fields );
		$data = $this->_validation_sign ( $this->post (), $fields );
		$this->load->library ( 'Jobs' );
		$data = json_encode ( array (
				self::VIDEO_QUEUE_KEY => $data 
		) );
		$this->jobs->enqueue ( self::VIDEO_QUEUE, $data );
		$this->_response_success ( array (
				'uid' => $this->post ( 'uid' ),
				'vid' => $this->post ( 'vid' ) 
		) );
	}
	public function operate_get() {
		$this->load->library ( 'Jobs' );
		
		$result = $this->jobs->dequeue ( self::VIDEO_QUEUE );
		
		$this->_response_success ( array (
				'result' => $result 
		) );
	}
	public function player_get() {
		$fields = array (
				'uid',
				'vid' 
		);
		$this->_validation ( $this->get (), $fields );
		$this->_validation_sign ( $this->get (), $fields );
		if ($this->_exists ( array (
				'id' => intval ( $this->get ( 'uid' ) ) 
		), 'passport_user' ) === false) {
			$this->_response_failure ( array (
					'error' => 'UID 不存在!' 
			) );
		}
		if ($this->_exists ( array (
				'vid' => $this->get ( 'vid' ) 
		), 'video_source' ) === false) {
			$this->_response_failure ( array (
					'error' => 'VID 不存在!' 
			) );
		}
		$this->load->library ( 'mongo_db' );
		$this->mongo_db->where ( array (
				'date' => strtotime ( date ( 'Y-m-d' ) ),
				'hour' => date ( 'H' ) 
		) )->inc ( 'recommend_count', 1 )->update ( 'interface_stat', array (), array (
				'upsert' => true 
		) );
		$result = array ();
		$this->load->config ( 'api' );
		$ap_server = $this->config->item ( 'ap_server' );
		$fso = fsockopen ( $ap_server ['host'], $ap_server ['port'] );
		$strJson = array (
				'video_recommend_req' => array (
						'user_id' => $this->get ( 'uid' ),
						'video_id' => $this->get ( 'vid' ),
						'play_date' => time () * 1000 
				) 
		);
		fwrite ( $fso, json_encode ( $strJson ) . "\n" );
		$strResult = fread ( $fso, 4096 );
		$arrVids = json_decode ( $strResult, true );
		$arrVids = $arrVids ['video_recommend_res'];
		$result = $this->_get_video ( $arrVids, 'vid', 'from=recommend' );
		$result = $this->_sort_by_key ( $arrVids, $result, 'vid' );
		$relativeList = '<?xml version="1.0" encoding="UTF-8" ?><relativeList>';
		$relative = array ();
		foreach ( $result as $v ) {
			$relative [] = '<relative id="' . $v ['vid'] . '" desc="' . $v ['title'] . '" url="' . html_escape ( $v ['play_url'] ) . '" icon="' . $v ['preview_image_url'] . '" channel="' . $v ['channel'] . '" time="' . date ( 'Y-m-d H:i:s', $v ['create_time'] ) . '"/>';
		}
		$relativeList .= implode ( '', $relative );
		$relativeList .= '</relativeList>';
		header ( 'Content-Type:application/xml' );
		exit ( $relativeList );
	}
	public function recommend_get() {
		$strCacheFile = BASEPATH . '../application/cache/recommend_cache.json';
		if ($this->get ( 'refresh' ) === '1') {
			if (file_exists ( $strCacheFile ) === true) {
				unlink ( $strCacheFile );
			}
		}
		if (file_exists ( $strCacheFile ) === true) {
			$strJson = file_get_contents ( $strCacheFile );
			$arrJson = json_decode ( $strJson, true );
			$intExpired = intval ( $arrJson ['expired'] );
			if (time () < $intExpired) {
				$this->_response_success ( array (
						'result' => $arrJson ['result'] 
				) );
			}
		}
		$this->load->library ( 'mongo_db' );
		$arrTypes = $this->mongo_db->command ( array (
				'aggregate' => 'video_source',
				'pipeline' => array (
						array (
								'$match' => array (
										'type' => array (
												'$type' => 2,
												'$ne' => '' 
										) 
								) 
						),
						array (
								'$group' => array (
										'_id' => '$type',
										'play_count' => array (
												'$sum' => 1 
										) 
								) 
						),
						array (
								'$sort' => array (
										'play_count' => - 1 
								) 
						),
						array (
								'$limit' => 15 
						) 
				) 
		) );
		$arrVideos = array ();
		foreach ( $arrTypes ['result'] as $arrType ) {
			$arrVideos = array_merge ( $arrVideos, $this->_type_video ( $arrType ['_id'], 2 ) );
		}
		$blnAm = intval ( date ( 'H' ) ) < 13 ? true : false;
		$intExpired = intval ( strtotime ( date ( 'Y-m-d' ) ) ) + ($blnAm === true ? 46800 : 90000);
		file_put_contents ( $strCacheFile, json_encode ( array (
				'expired' => $intExpired,
				'result' => $arrVideos 
		) ) );
		$this->_response_success ( array (
				'result' => $arrVideos 
		) );
	}
	public function guess_get() {
		$ids = $this->get ( 'ids' );
		$this->load->config ( 'api' );
		$ap_server = $this->config->item ( 'ap_server' );
		$fso = fsockopen ( $ap_server ['host'], $ap_server ['port'] );
		$strPage = $this->get ( 'page' );
		$intPage = $strPage !== false ? intval ( $strPage ) : 0;
		$strSize = $this->get ( 'size' );
		$intSize = $strSize !== false ? intval ( $strSize ) : 5;
		$this->load->library ( 'session' );
		$session_id = $this->session->userdata ( 'session_id' );
		$sid = $this->session->userdata ( 'sid' );
		if ($ids !== false) {
			$this->session->set_userdata ( array (
					'sid' => $session_id 
			) );
			$strJson = array (
					'videoguess' => array (
							'ids' => $ids,
							'sid' => $session_id,
							'page' => $intPage,
							'size' => $intSize 
					) 
			);
		} else {
			$strJson = array (
					'videoguesspage' => array (
							'ids' => $ids,
							'sid' => $sid,
							'page' => $intPage,
							'size' => $intSize 
					) 
			);
		}
		fwrite ( $fso, json_encode ( $strJson ) . "\n" );
		$strResult = fread ( $fso, 40960 );
		fclose ( $fso );
		$arrResult = json_decode ( $strResult, true );
		$arrVids = $arrResult ['videoguess_res'];
		$arrVideos = $this->_get_video ( $arrVids, 'id' );
		$videoTypeList = $this->get ( 'videoTypeList' );
		if ($videoTypeList !== false && $videoTypeList !== '') {
			$videoTypeList = json_decode ( $videoTypeList, true );
		}
		if (is_array ( $videoTypeList ) === false || empty ( $videoTypeList ) === true) {
			$this->load->config ( 'videoTypeList' );
			$videoTypeList = $this->config->item ( 'videoTypeList' );
		}
		if (is_array ( $videoTypeList ) === false || empty ( $videoTypeList ) === true) {
			$videoTypeList = array (
					'新闻',
					'电视剧',
					'体育' 
			);
		}
		$strShow = $this->get ( 'show' );
		$arrShow = array ();
		if ($strShow !== false && $strShow !== '') {
			$arrShow = json_decode ( $strShow, true );
		}
		$arrTypes = array ();
		for($i = 0; $i < min ( 3, count ( $videoTypeList ) ); $i ++) {
			if (in_array ( $i + 1, $arrShow )) {
				$arrTypes [$videoTypeList [$i] . '专题'] = $this->_type_video ( $videoTypeList [$i] );
			}
		}
		$this->load->library ( 'mongo_db' );
		if (in_array ( 4, $arrShow )) {
			$arrTypes ['最新专题'] = $this->_get_video ( $this->mongo_db->order_by ( array (
					'create_time' => - 1 
			) )->limit ( 50 )->get ( 'video_source' ) );
		}
		if (in_array ( 5, $arrShow )) {
			$arrTypes ['最热专题'] = $this->_get_video ( $this->mongo_db->order_by ( array (
					'play_count' => - 1 
			) )->limit ( 50 )->get ( 'video_source' ) );
		}
		$this->_response_success ( array (
				'result' => array (
						'items' => $arrVideos,
						'types' => $arrTypes 
				) 
		) );
	}
	public function select_post() {
		$fields = array (
				'uid',
				'vids' 
		);
		$this->_validation ( $this->post (), $fields );
		$this->load->library ( 'mongo_db' );
		$this->mongo_db->where ( array (
				'uid' => $this->post ( 'uid' ) 
		) )->update ( 'video_guess_select', array (
				'uid' => $this->post ( 'uid' ),
				'vids' => $this->post ( 'vids' ) 
		), array (
				'upsert' => true 
		) );
		$this->_response_success ();
	}
	public function select_get() {
		$fields = array (
				'uid' 
		);
		$this->_validation ( $this->get (), $fields );
		$this->load->library ( 'mongo_db' );
		$arrVids = $this->mongo_db->where ( array (
				'uid' => $this->get ( 'uid' ) 
		) )->get ( 'video_guess_select' );
		if (empty ( $arrVids ) === false) {
			$arrVids = $arrVids [0] ['vids'];
		}
		$this->_response_success ( array (
				'vids' => $arrVids 
		) );
	}
}
