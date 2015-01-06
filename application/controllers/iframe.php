<?php
if (! defined ( 'BASEPATH' ))
	exit ( 'No direct script access allowed' );
class iframe extends CI_Controller {
	function videoguess() {
		$this->load->view ( 'iframe/videoguess.html' );
	}
	function guessresult() {
		$this->load->view ( 'iframe/guessresult.html' );
	}
}
