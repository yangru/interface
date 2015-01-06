<?php
/**
 * Job Queue Library
 * implements a reddis based job queue
 * CI Redis Lib is required
 *
 * @author      Lucas Nolte <lnolte@i.biz>
 * @since       0.1
 * @package     Polska Wiadomosc
 * @subpackage  Libraries
 */
class Jobs {
    
    /**
     * holds the CI instance
     */
    private $_ci;
    
    /**
     * name of the job queue
     */
    private $_queue = 'jobs';
    
    /**
     * constructor function
     */
    public function __construct() {
        $this->_ci =& get_instance();
        $this->_ci->load->library('Redis');
    }
    
    /**
     * adds a job to the queue
     * 
     * data should be given like: controller:methods:param1:param2:param3...
     * 
     * @since   0.1
     * @access  public
     * @param   string $queue, string $data
     * @return  bool
     */
    public function enqueue($queue, $data) {        
        $this->_ci->redis->sadd($this->_queue, $queue);
        return $this->_ci->redis->rpush($this->_queue.':'.$queue, $data);
    }
    
    /**
     * clears a queue
     * 
     * @since   0.1
     * @access  public
     * @param   string $queue
     * @return  bool
     */
    public function clear($queue) {
        return $this->_ci->redis->del($this->_queue, $this->_queue.':'.$queue);
    }
    
    /**
     * destroys a queue
     * 
     * @since   0.1
     * @access  public
     * @param   string $queue
     * @return  bool
     */
    public function destroy($queue) {
        $this->clear($queue);
        
        return $this->_ci->redis->srem($this->_queue, $this->_queue.':'.$queue);
    }
    
    /**
     * return the lenght of a given queue
     * 
     * @since   0.1
     * @access  public
     * @param   string $queue
     * @return  int
     */
    public function length($queue) {
        return $this->_ci->redis->llen($this->_queue.':'.$queue);
    }
    
    /**
     * removes a job from the queue
     * 
     * @since   0.1
     * @access  public
     * @param   void
     * @return  bool
     */
    public function removeJob($queue, $data) {
        return $this->_ci->lrem($this->_queue.':'.$queue, 0, $data);
    }
    
    /**
     * return the peek of a queue
     * 
     * @since   0.1
     * @access  public
     * @param   string $queue
     * @return  array
     */
    public function peek($queue) {
        $this->_ci->redis->lrange($this->_queue.':'.$queue, 0, 0);
    }
    
    /**
     * dequeue from a given queue
     * 
     * @since   0.1
     * @access  public
     * @param   string $queue
     * @return  bool
     */
    public function dequeue($queue) {
        return $this->_ci->redis->blpop($this->_queue.':'.$queue, 60);
    }
    
    /**
     * get some work done
     * 
     * @since   0.1
     * @access  public
     * @param   string $queue
     * @return  void
     */
    public function work($queue) {
        while (true) {            
            $job = $this->dequeue($queue);
            
            $exec = str_replace(':', ' ', $job[1]);
            
            echo `php index.php $exec`;
        }
    }
}

?>