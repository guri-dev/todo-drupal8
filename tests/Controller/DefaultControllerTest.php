<?php

namespace Drupal\todo\Tests;

use Drupal\simpletest\WebTestBase;

/**
 * Provides automated tests for the todo module.
 */
class DefaultControllerTest extends WebTestBase {


  /**
   * {@inheritdoc}
   */
  public static function getInfo() {
    return [
      'name' => "todo DefaultController's controller functionality",
      'description' => 'Test Unit for module todo and controller DefaultController.',
      'group' => 'Other',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function setUp() {
    parent::setUp();
  }

  /**
   * Tests todo functionality.
   */
  public function testDefaultController() {
    // Check that the basic functions of module todo.
    $this->assertEquals(TRUE, TRUE, 'Test Unit Generated via Drupal Console.');
  }

}
