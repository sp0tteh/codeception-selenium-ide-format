/**
 * Parse source and update TestCase. Throw an exception if any error occurs.
 *
 * @param testCase TestCase to update
 * @param source The source to parse
 */
function parse(testCase, source) {
	var doc = source;
  var commands = [];
  testCase.header = this.options.header;
  testCase.footer = '';
  while (doc.length > 0) {
    var line = /(.*)(\r\n|[\r\n])?/.exec(doc);
    if (line[1] && line[1].match(/^\|/)) {
      var array = line[1].split(/\|/);
      if (array.length >= 3) {
        var command = new Command();
        command.command = array[1];
        command.target = array[2];
        if (array.length > 3) command.value = array[3];
        commands.push(command);
      }
      testCase.footer = '';
    } else if (commands.length == 0) {
      testCase.header += line[0];
    } else {
      testCase.footer += line[0];
    }
    doc = doc.substr(line[0].length);
  }
  testCase.setCommands(commands);
}

/**
 * Format TestCase and return the source.
 *
 * @param testCase TestCase to format
 * @param name The name of the test case, if any. It may be used to embed title into the source.
 */
function format(testCase, name) {
  

  var className = testCase.getTitle();
  if (!className) {
    className = "perform actions and see result";
  }

  var content = formatCommands(testCase.commands);

 /* var formatLocal = testCase.formatLocal(this.name);
  methodName = testMethodName(className.replace(/Test$/, "").replace(/^Test/, "").
                replace(/^[A-Z]/, function(str) { return str.toLowerCase(); }));*/

    var cept = options.header.
    replace(/\$\{baseURL\}/g, testCase.getBaseURL()).
    replace(/\$\{action\}/g, className).
    replace(/\$\{content\}/g, content).
    replace(/\$\{([a-zA-Z0-9_]+)\}/g, function(str, name) { return options[name]; });

  return cept;

}

/**
 * Format an array of commands to the snippet of source.
 * Used to copy the source into the clipboard.
 *
 * @param The array of commands to sort.
 */
function formatCommands(commands, indent = 0) {
	var result = '';
  var ignoreWebCommands = ['answerOnNextPrompt'];
  for (var i = 0; i < commands.length; i++) {
    var command = commands[i];
    var tmpResult = formatCommand(command, indent);

    if (ignoreWebCommands.indexOf(command.command) == -1) {
      result += indents(indent) + options.variable + tmpResult;
    }
  }

  return result;
}

//Store temp value for prompt
var promptValue = "";

function formatCommand(command, indent) {
  var result = "";

  if (command.type == 'command') {

      var codeceptionCommand = '';

      //Switch command and replace with codeception varient
      switch (command.command) {
        case 'open':
          result += '->amOnPage("'+command.target+'");\n';
          break;
        case 'click':
        case 'clickAndWait':
          var target = getSelector(command.target);
          result += '->click("'+target+'");\n';
          break;
        case 'select':
          var target = getSelector(command.target);
          var value = command.value.split('=')[1];
          result += '->selectOption("'+target+'", "'+value+'");\n';
          break;
        case 'sendKeys':
          var target = getSelector(command.target);
          result += '->appendField("'+target+'", "'+command.value+'");\n';
          break;
        case 'type':
          var target = getSelector(command.target);
          result += '->fillField("'+target+'", "'+command.value+'");\n';
          break;
        case 'dragAndDropToObject':
          var target = getSelector(command.target);
          var value = getSelector(command.value);
          result += '->dragAndDrop("'+target+'", "'+value+'");\n';
          break;
        case 'assertText':
          if (command.target.substring(0, 4) === 'link') {
            result += '->see("'+command.value+'");\n';
          } else {
            var target = getSelector(command.target);
            result += '->see("'+command.value+'", "'+target+'");\n';
          }
          break;
        case 'assertNotText':
            var target = getSelector(command.target);
            result += '->dontSee("'+command.value+'", "'+target+'");\n';
          break;
        case 'waitForElementPresent':
            var target = getSelector(command.target);
            result += '->waitForElement("'+target+'");\n';
          break;
        case 'waitForText':
        case 'waitForTextPresent':
          if (command.target) {
            var target = getSelector(command.target);
            result += '->waitForText("'+ command.value+'",'+10+ ' , "'+target+'");\n';
          } else {
            result += '->waitForText("'+ command.value+'",'+10+ ');\n';
          }
            
          break;
        case 'assertTextNotPresent':
          if (command.target) {
            var target = getSelector(command.target);
            result += '->dontSee("'+ command.value+'", "'+target+'");\n';
          } else {
            result += '->dontSee("'+ command.value+'");\n';
          }
          break;
        case 'addSelection':
            var target = getSelector(command.target);
            var value = command.value.split('=')[1];
            result += '->appendField("'+target+'", "'+ value+'");\n';
          break;
        case 'removeSelection':
            var target = getSelector(command.target);
            var value = command.value.split('=')[1];
            result += '->unselectOption("'+target+'", "'+ value+'");\n';
          break;
        case 'verifyValue':
        case 'assertValue':
            var target = getSelector(command.target);
            var value = command.value.replace('exact:', '');
            result += '->seeInField("'+target+'", "'+ value +'");\n';
          break;
        case 'verifyChecked':
            var target = getSelector(command.target);
            var value = command.value.replace('exact:', '');
            result += '->seeCheckboxIsChecked("'+target+'");\n';
          break;
        case 'verifySelectedValue':
        case 'verifySelectedLabel':
            var target = getSelector(command.target);
            result += '->seeOptionIsSelected("'+target+'", "'+ command.value+'");\n';
          break;
        case 'verifyElementNotPresent':
          //Throws value undefined error if no target is given, selenium ide bug 
            result += '->dontSeeElement("'+ command.value +'");\n';
          break;
        case 'answerOnNextPrompt':
            promptValue = command.target;
            break;
        case 'assertPrompt':
            result += '->typeInPopup("'+promptValue+'");\n';
            promptValue = '';
          break;


          default:
          result += '->' + command.command + '====' + command.target + '|' + command.value + "|\n";
      }

      
    }

    return result;
}

function escapeString(value)
{
  return value.replace(/"/g, '\\"');
}

function getSelector(target) {

  //Check for xparth
  if (target.substring(0, 2) === '//') {
    return target;
  } else {


    var parts = target.split(/=(.+)?/);
    parts[1] = escapeString(parts[1]);
    
    switch(parts[0]) {
      case 'id':
          return "#"+parts[1];
        break;
      case 'css':
          return parts[1];
        break;
      case 'name':
        return 'input[name='+parts[1]+']';
        break;
      case 'link':
        return parts[1];
        break;
      case 'xpath':
        return parts[1];
      default:
        alert('unknown selector: '+parts[0]+'  value: '+parts[1]);
    }
  }
}

/**
 * Returns a string representing the suite for this formatter language.
 *
 * @param testSuite  the suite to format
 * @param filename   the file the formatted suite will be saved as
 */
function formatSuite(testSuite, filename) {
  var suiteClass = /^(\w+)/.exec(filename)[1];
  suiteClass = suiteClass[0].toUpperCase() + suiteClass.substring(1);

  var formattedSuite = "";

  for (var i = 0; i < testSuite.tests.length; ++i) {
    var content = "";

    //If the filename is set then use this as the method name
    //Otherwise we use the test case title, which will be
    //Untitled as a default
    var testCase = "";
    if (testSuite.tests[i].filename) {
      testCase = testSuite.tests[i].filename;
    } else {
      testCase = testSuite.tests[i].getTitle();
    }

    testClass = testCase.
    replace(/\s/g, '_').
    replace(/\//g, '_');

    var action = testSuite.tests[i].getTitle();

    if (!testSuite.tests[i].content) {
      //Open the testcase, formats the commands from the stored html
      editor.app.showTestCaseFromSuite(testSuite.tests[i]);
    }
    //Get the actions for this test
    content = formatCommands(testSuite.tests[i].content.commands, 2);

    var testFunction = options.testClassHeader.
    replace(/\$\{testClass\}/g, testClass).
    replace(/\$\{content\}/g, content).
    replace(/\$\{action\}/g, action).
    replace(/\$\{([a-zA-Z0-9_]+)\}/g, function(str, name) { return options[name]; });

    formattedSuite +=  testFunction + "\n\n";
  }

  var cest = options.testHeader.
    replace(/\$\{suiteClass\}/g, suiteClass).
    replace(/\$\{content\}/g, formattedSuite).
    replace(/\$\{([a-zA-Z0-9_]+)\}/g, function(str, name) { return options[name]; });

  return cest;
}



function formatHeader(testCase) {
  var className = testCase.getTitle();
  if (!className) {
    className = "NewTest";
  }
  className = testClassName(className);
  var formatLocal = testCase.formatLocal(this.name);
  methodName = testMethodName(className.replace(/Test$/i, "").replace(/^Test/i, "").replace(/^[A-Z]/, function(str) {
    return str.toLowerCase();
  }));
  var header = (options.getHeader ? options.getHeader() : options.header).
      replace(/\$\{className\}/g, className).
      replace(/\$\{methodName\}/g, methodName).
      replace(/\$\{baseURL\}/g, testCase.getBaseURL()).
      replace(/\$\{([a-zA-Z0-9_]+)\}/g, function(str, name) {
        return options[name];
      });
  this.lastIndent = indents(parseInt(options.initialIndents, 10));
  formatLocal.header = header;
  return formatLocal.header;
}

function formatFooter(testCase) {
  var formatLocal = testCase.formatLocal(this.name);
  formatLocal.footer = options.footer;
  return formatLocal.footer;
}




function indents(num) {
  function repeat(c, n) {
    var str = "";
    for (var i = 0; i < n; i++) {
      str += c;
    }
    return str;
  }

  try {
    var indent = options.indent;
    if ('tab' == indent) {
      return repeat("\t", num);
    } else {
      return repeat(" ", num * parseInt(options.indent, 10));
    }
  } catch (error) {
    return repeat(" ", 0);
  }
}

function capitalize(string) {
  return string.replace(/^[a-z]/, function(str) {
    return str.toUpperCase();
  });
}

function underscore(text) {
  return text.replace(/[A-Z]/g, function(str) {
    return '_' + str.toLowerCase();
  });

}




/*
 * Optional: The customizable option that can be used in format/parse functions.
 */
options = {
  header: '<?php\n'
    + '${variable} = new WebGuy($scenario);\n'
    + '${variable}->wantTo("${action}");\n'
    + '${content}\n',
  testHeader: "<?php\n\n"
    + "class ${suiteClass}"
    + '{\n'
    + indents(2) + "protected ${variable};\n\n"
    + indents(2) + "public function _before() {}\n"
    + indents(2) + "public function _after() {}\n\n"
    + indents(2) + "${content}\n\n"
    + '}',
  testClassHeader: 'public function ${testClass} (\Webguy ${variable})\n'
    + '{\n\n'
    + '${variable}->wantTo("${action}");\n'
    + '${content}\n'
    + '}',
  indent: 4,
  variable: '$I'
}

/*
 * Optional: XUL XML String for the UI of the options dialog
 */
//configForm = '<textbox id="options_nameOfTheOption"/>'

this.configForm =
        '<description>Variable for WebGuy 123</description>' +
        '<textbox id="options_variable" />' +
        '<description>Cept</description>' +
        '<textbox id="options_header" multiline="true" flex="1" rows="4"/>' +
        '<description>Cest</description>' +
        '<textbox id="options_testHeader" multiline="true" flex="1" rows="4"/>' +
        '<description>Cest Function</description>' +
        '<textbox id="options_testClassHeader" multiline="true" flex="1" rows="2"/>' +
        '<description>Indent</description>' +
        '<menulist id="options_indent"><menupopup>' +
        '<menuitem label="Tab" value="tab"/>' +
        '<menuitem label="1 space" value="1"/>' +
        '<menuitem label="2 spaces" value="2"/>' +
        '<menuitem label="3 spaces" value="3"/>' +
        '<menuitem label="4 spaces" value="4"/>' +
        '<menuitem label="5 spaces" value="5"/>' +
        '<menuitem label="6 spaces" value="6"/>' +
        '<menuitem label="7 spaces" value="7"/>' +
        '<menuitem label="8 spaces" value="8"/>' +
        '</menupopup></menulist>';
