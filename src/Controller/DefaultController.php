<?php

namespace Drupal\todo\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;


/**
 * Class DefaultController.
 */
class DefaultController extends ControllerBase {

  /**
   * Hello.
   *
   * @return string
   *   Return Hello string.
   */
  public function hello($name) {
    
    $myText = 'This is not just a default text!1111';
    $myNumber = 1;
    $myArray[] = [1, 2, 3];
    $tasklist = [];

    //$sql = "SELECT * FROM {task} WHERE vid = :vid";
    $sql = "SELECT * FROM {task}";
    //$result = db_query($sql, array(':vid' => $vid));
    $result = db_query($sql);
    if ($result) {
      while ($row = $result->fetchAssoc()) {
        $tasklist[] = $row;
      }
    }

    //print_r($myArray);
    //print_r($tasks); die; 
    return array(
      //Your theme hook name
      '#theme' => 'todo_theme_hook',      
      //Your variables
      '#variable2' => $myNumber,
      '#tasklist' => $tasklist,
    );
  }

  public function tasklist() {
    
    $tasklist = [];
    $sql = "SELECT * FROM {task}";
    $result = db_query($sql);
    if ($result) {
      while ($row = $result->fetchAssoc()) {
        $tasklist[] = $row;
      }
    }    
    return new JsonResponse( $tasklist );
    exit;
  }

  public function taskremove(Request $request) {
    
    $id = $request->request->get('id');
    $sql = "DELETE FROM {task} WHERE id=".$id;
    db_query($sql);    
    return new JsonResponse( array('success' => true,'id' => $id ));
    exit;
  }

  public function taskadd(Request $request) {
    
    $name = trim($request->request->get('name'));
    $sql = "INSERT INTO task (name,status) values ('$name',0)";
    db_query($sql);    
    $tasklist = [];
    $sql = "SELECT * FROM {task}";
    $result = db_query($sql);
    if ($result) {
      while ($row = $result->fetchAssoc()) {
        $tasklist[] = $row;
      }
    }    
    return new JsonResponse( $tasklist );
    exit;
  }
  

}
