Codeception Firefox addon for Selenium IDE.
===============================

**Pre Alpha Release** - *Can only be installed by adding to your firefox profile manually*



Adds two new formatting export options:

**File** -> **Export Test Case As** -> **PHP - Codeception**

**File** -> **Export Test Suite As** -> **PHP - Codeception**

Plugin Options
=====

*Found in Options -> Options... -> Formats -> PHP - Codeception*

You can change the markup for the files in the below options. This allows you to add your own include helpers, 
namespaces, comments, groups ect to your automated tests tests.

**Variable for WebGuy**
```
$i
```

Test Case Export
--------
*Cept file*
```
<?php
${variable} = new WebGuy($scenario);
${variable}->wantTo("${action}");
${content}
```

Test Suite Export
-----------------
*Cest file*
```
<?php 

class ${suiteClass} {

protected ${variable};

public function _before() {}
public function _after() {}

${content}
}
```
**Cest Function**
*Each test case is represented as a function within the cest*
```
    public function ${testClass}(\Webguy ${variable})
    {
        ${variable}->wantTo('${action}');
        ${content}
    }
```

**Variables**
- ${content} The selenium ide commands for this test
- ${variable} The variable name you specified
- ${suiteClass} The name of the Test Suite
- ${testClass} The file name of the Test Case
- ${action} The title of the Test Case


Current Support Selenium IDE Commands
=====================================
- [x] Open
- [x] Click
- [x] ClickAndWait
- [x] select
- [x] sendKeys
- [x] type
- [x] dragAndDropObject
- [x] assertText
- [x] waitForElementPresent
- [x] waitForText
- [x] assertTextNotPresent
- [x] addSelection
- [x] removeSelection

*Unsupported commands will currently be added to the test with invalid markup*

