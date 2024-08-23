/*!
 * Client Side Validations JS - v0.4.0 (https://github.com/DavyJonesLocker/client_side_validations)
 * Copyright (c) 2024 Geremia Taglialatela, Brian Cardarella
 * Licensed under MIT (https://opensource.org/licenses/mit-license.php)
 */

function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function _arrayWithHoles(r) {
  if (Array.isArray(r)) return r;
}
function _iterableToArrayLimit(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e,
      n,
      i,
      u,
      a = [],
      f = !0,
      o = !1;
    try {
      if (i = (t = t.call(r)).next, 0 === l) ; else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
    } catch (r) {
      o = !0, n = r;
    } finally {
      try {
        if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a;
  }
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _slicedToArray(r, e) {
  return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
}
function _typeof(o) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, _typeof(o);
}
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
  }
}

var arrayHasValue = function arrayHasValue(value, otherValues) {
  for (var i = 0, l = otherValues.length; i < l; i++) {
    if (value === otherValues[i]) {
      return true;
    }
  }
  return false;
};
var createElementFromHTML = function createElementFromHTML(html) {
  var element = document.createElement('div');
  element.innerHTML = html;
  return element.firstChild;
};
var isValuePresent = function isValuePresent(value) {
  return !/^\s*$/.test(value || '');
};

var ClientSideValidations = {
  callbacks: {
    element: {
      after: function after(element, eventData) {},
      before: function before(element, eventData) {},
      fail: function fail(element, message, addError, eventData) {
        return addError();
      },
      pass: function pass(element, removeError, eventData) {
        return removeError();
      }
    },
    form: {
      after: function after(form, eventData) {},
      before: function before(form, eventData) {},
      fail: function fail(form, eventData) {},
      pass: function pass(form, eventData) {}
    }
  },
  eventsToBind: {
    form: function form(_form) {
      return {
        submit: function submit(eventData) {
          if (!isValidForm(_form.ClientSideValidations.settings.validators)) {
            eventData.preventDefault();
            eventData.stopImmediatePropagation();
          }
        },
        'ajax:beforeSend': function ajaxBeforeSend(eventData) {
          if (eventData.target === _form) {
            isValidForm(_form.ClientSideValidations.settings.validators);
          }
        },
        'form:validate:after': function formValidateAfter(eventData) {
          ClientSideValidations.callbacks.form.after(_form, eventData);
        },
        'form:validate:before': function formValidateBefore(eventData) {
          ClientSideValidations.callbacks.form.before(_form, eventData);
        },
        'form:validate:fail': function formValidateFail(eventData) {
          ClientSideValidations.callbacks.form.fail(_form, eventData);
        },
        'form:validate:pass': function formValidatePass(eventData) {
          ClientSideValidations.callbacks.form.pass(_form, eventData);
        }
      };
    },
    input: function input(form) {
      return {
        focusout: function focusout() {
          isValidElement(this, form.ClientSideValidations.settings.validators);
        },
        change: function change() {
          this.dataset.changed = true;
        },
        'element:validate:after': function elementValidateAfter(eventData) {
          ClientSideValidations.callbacks.element.after(this, eventData);
        },
        'element:validate:before': function elementValidateBefore(eventData) {
          ClientSideValidations.callbacks.element.before(this, eventData);
        },
        'element:validate:fail': function elementValidateFail(eventData, message) {
          var _this = this;
          ClientSideValidations.callbacks.element.fail(this, message, function () {
            form.ClientSideValidations.addError(_this, message);
          }, eventData);
        },
        'element:validate:pass': function elementValidatePass(eventData) {
          var _this2 = this;
          ClientSideValidations.callbacks.element.pass(this, function () {
            form.ClientSideValidations.removeError(_this2);
          }, eventData);
        }
      };
    },
    inputConfirmation: function inputConfirmation(element, form) {
      return {
        focusout: function focusout() {
          element.dataset.changed = true;
          isValidElement(element, form.ClientSideValidations.settings.validators);
        },
        keyup: function keyup() {
          element.dataset.changed = true;
          isValidElement(element, form.ClientSideValidations.settings.validators);
        }
      };
    }
  },
  enablers: {
    form: function form(_form2) {
      _form2.ClientSideValidations = {
        settings: _form2.dataset.clientSideValidations,
        addError: function addError(element, message) {
          return ClientSideValidations.formBuilders[_form2.ClientSideValidations.settings.html_settings.type].add(element, _form2.ClientSideValidations.settings.html_settings, message);
        },
        removeError: function removeError(element) {
          return ClientSideValidations.formBuilders[_form2.ClientSideValidations.settings.html_settings.type].remove(element, _form2.ClientSideValidations.settings.html_settings);
        }
      };
      var eventsToBind = ClientSideValidations.eventsToBind.form(_form2);
      for (var _i = 0, _Object$entries = Object.entries(eventsToBind); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
          eventName = _Object$entries$_i[0],
          eventFunction = _Object$entries$_i[1];
        _form2.addEventListener(eventName, eventFunction);
      }
      _form2.querySelectorAll(ClientSideValidations.selectors.inputs).forEach(function (input) {
        ClientSideValidations.enablers.input(input);
      });
    },
    input: function input(_input) {
      var form = _input.form;
      var eventsToBind = ClientSideValidations.eventsToBind.input(form);
      for (var _i2 = 0, _Object$entries2 = Object.entries(eventsToBind); _i2 < _Object$entries2.length; _i2++) {
        var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
          eventName = _Object$entries2$_i[0],
          eventFunction = _Object$entries2$_i[1];
        _input.addEventListener(eventName, eventFunction);
      }
      if (_input.type === 'checkbox') {
        _input.addEventListener('change', function () {
          isValidElement(_input, form.ClientSideValidations.settings.validators);
        });
      }
      if (_input.id && _input.id.endsWith('_confirmation')) {
        var elementToConfirm = form.querySelector("#".concat(_input.id.match(/(.+)_confirmation/)[1], ":input"));
        if (elementToConfirm) {
          var confirmationEvents = ClientSideValidations.eventsToBind.inputConfirmation(elementToConfirm, form);
          for (var _i3 = 0, _Object$entries3 = Object.entries(confirmationEvents); _i3 < _Object$entries3.length; _i3++) {
            var _Object$entries3$_i = _slicedToArray(_Object$entries3[_i3], 2),
              _eventName = _Object$entries3$_i[0],
              _eventFunction = _Object$entries3$_i[1];
            elementToConfirm.addEventListener(_eventName, _eventFunction);
          }
        }
      }
    }
  },
  formBuilders: {
    'ActionView::Helpers::FormBuilder': {
      add: function add(element, settings, message) {
        var form = element.form;
        var inputErrorTemplate = createElementFromHTML(settings.input_tag);
        var inputErrorElement = element.closest(".".concat(inputErrorTemplate.classList));
        if (!inputErrorElement) {
          inputErrorElement = inputErrorTemplate;
          if (element.hasAttribute('autofocus')) {
            element.removeAttribute('autofocus');
          }
          element.insertAdjacentElement('beforebegin', inputErrorElement);
          inputErrorElement.querySelector('span#input_tag').replaceWith(element);
          var inputErrorLabelMessageElement = inputErrorElement.querySelector('label.message');
          if (inputErrorLabelMessageElement) {
            inputErrorLabelMessageElement.setAttribute('for', element.id);
          }
        }
        var labelElement = form.querySelector("label[for=\"".concat(element.id, "\"]:not(.message)"));
        if (labelElement) {
          var labelErrorTemplate = createElementFromHTML(settings.label_tag);
          var labelErrorContainer = labelElement.closest(".".concat(labelErrorTemplate.classList));
          if (!labelErrorContainer) {
            labelElement.insertAdjacentElement('afterend', labelErrorTemplate);
            labelErrorTemplate.querySelector('label#label_tag').replaceWith(labelElement);
          }
        }
        var labelMessageElement = form.querySelector("label.message[for=\"".concat(element.id, "\"]"));
        if (labelMessageElement) {
          labelMessageElement.textContent = message;
        }
      },
      remove: function remove(element, settings) {
        var form = element.form;
        var inputErrorClass = createElementFromHTML(settings.input_tag).classList;
        var inputErrorElement = element.closest(".".concat(inputErrorClass));
        if (inputErrorElement) {
          inputErrorElement.querySelector("#".concat(element.id)).remove();
          inputErrorElement.replaceWith(element);
        }
        var labelElement = form.querySelector("label[for=\"".concat(element.id, "\"]:not(.message)"));
        if (labelElement) {
          var labelErrorClass = createElementFromHTML(settings.label_tag).classList;
          var labelErrorElement = labelElement.closest(".".concat(labelErrorClass));
          if (labelErrorElement) {
            labelErrorElement.replaceWith(labelElement);
          }
        }
        var labelMessageElement = form.querySelector("label.message[for=\"".concat(element.id, "\"]"));
        if (labelMessageElement) {
          labelMessageElement.remove();
        }
      }
    }
  },
  patterns: {
    numericality: {
      default: /^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/,
      only_integer: /^[+-]?\d+$/
    }
  },
  selectors: {
    inputs: 'input:not(button):not([type="submit"])[name]:not([disabled]):not([hidden])',
    validate_inputs: 'input:not([disabled]):not([hidden])[data-validate]',
    forms: 'form[data-client-side-validations]'
  },
  validators: {
    all: function all() {
      return Object.assign({}, ClientSideValidations.validators.local, ClientSideValidations.validators.remote);
    },
    local: {},
    remote: {}
  },
  disable: function disable(target) {
    var elements = target instanceof HTMLElement ? [target] : document.querySelectorAll(target);
    elements.forEach(function (el) {
      el.removeEventListener('.ClientSideValidations');
      if (el.tagName.toLowerCase() === 'form') {
        ClientSideValidations.disable(el.querySelectorAll('input'));
      } else {
        delete el.dataset.changed;
        delete el.dataset.valid;
        if (el.tagName.toLowerCase() === 'input') {
          el.removeAttribute('data-validate');
        }
      }
    });
  },
  reset: function reset(form) {
    ClientSideValidations.disable(form);
    for (var key in form.ClientSideValidations.settings.validators) {
      form.ClientSideValidations.removeError(form.querySelector("[name=\"".concat(key, "\"]")));
    }
    ClientSideValidations.enablers.form(form);
  },
  initializeOnEvent: function initializeOnEvent() {
    if (window.Turbo != null) {
      return 'turbo:load';
    } else if (window.Turbolinks != null && window.Turbolinks.supported) {
      return window.Turbolinks.EVENTS != null ? 'page:change' : 'turbolinks:load';
    }
  },
  start: function start() {
    var initializeOnEvent = ClientSideValidations.initializeOnEvent();
    if (initializeOnEvent != null) {
      document.addEventListener(initializeOnEvent, function () {
        return validateForms();
      });
    } else {
      document.addEventListener('DOMContentLoaded', function () {
        return validateForms();
      });
    }
  }
};
var validateForms = function validateForms() {
  document.querySelectorAll(ClientSideValidations.selectors.forms).forEach(function (form) {
    validateForm(form.ClientSideValidations.settings.validators);
  });
};
function isValidForm(validators) {
  var valid = true;
  var forms = document.querySelectorAll(ClientSideValidations.selectors.forms);
  forms.forEach(function (form) {
    var validateEvent = new Event('form:validate:before');
    form.dispatchEvent(validateEvent);
    form.querySelectorAll(ClientSideValidations.selectors.validate_inputs).forEach(function (input) {
      if (!isValidElement(input, validators)) {
        valid = false;
      }
    });
    var passEvent = new Event(valid ? 'form:validate:pass' : 'form:validate:fail');
    form.dispatchEvent(passEvent);
    form.dispatchEvent(new Event('form:validate:after'));
  });
  return valid;
}
function isValidElement(element, validators) {
  element.dispatchEvent(new Event('element:validate:before'));
  if (isMarkedForDestroy(element)) {
    passElement(element);
  } else {
    executeAllValidators(element, validators);
  }
  return afterValidate(element);
}
function passElement(element) {
  element.dispatchEvent(new Event('element:validate:pass'));
  element.dataset.valid = null;
}
function failElement(element, message) {
  element.dispatchEvent(new CustomEvent('element:validate:fail', {
    detail: message
  }));
  element.dataset.valid = false;
}
function afterValidate(element) {
  element.dispatchEvent(new Event('element:validate:after'));
  return element.dataset.valid !== false;
}
function executeValidator(validatorFunctions, validatorFunction, validatorOptions, element) {
  for (var option in validatorOptions) {
    if (!validatorOptions[option]) continue;
    var message = validatorFunction.call(validatorFunctions, element, validatorOptions[option]);
    if (message) {
      failElement(element, message);
      return false;
    }
  }
  return true;
}
function executeValidators(validatorFunctions, element, validators) {
  for (var validator in validators) {
    if (!validatorFunctions[validator]) continue;
    if (!executeValidator(validatorFunctions, validatorFunctions[validator], validators[validator], element)) {
      return false;
    }
  }
  return true;
}
function isMarkedForDestroy(element) {
  var nameAttr = element.getAttribute('name');
  if (nameAttr && nameAttr.search(/\[([^\]]*?)\]$/) >= 0) {
    var destroyInputName = nameAttr.replace(/\[([^\]]*?)\]$/, '[_destroy]');
    var destroyInput = document.querySelector("input[name=\"".concat(destroyInputName, "\"]"));
    if (destroyInput && destroyInput.value === '1') {
      return true;
    }
  }
  return false;
}
function executeAllValidators(element, validators) {
  if (element.dataset.changed === false || element.disabled) return;
  element.dataset.changed = false;
  if (executeValidators(ClientSideValidations.validators.all(), element, validators)) {
    passElement(element);
  }
}
if (!window.ClientSideValidations) {
  window.ClientSideValidations = ClientSideValidations;
  if (!isAMD$1() && !isCommonJS$1()) {
    ClientSideValidations.start();
  }
}
function isAMD$1() {
  return typeof define === 'function' && define.amd;
}
function isCommonJS$1() {
  return (typeof exports === "undefined" ? "undefined" : _typeof(exports)) === 'object' && typeof module !== 'undefined';
}

var absenceLocalValidator = function absenceLocalValidator($element, options) {
  var element = $element[0];
  if (isValuePresent(element.value)) {
    return options.message;
  }
};
var presenceLocalValidator = function presenceLocalValidator($element, options) {
  var element = $element[0];
  if (!isValuePresent(element.value)) {
    return options.message;
  }
};

var DEFAULT_ACCEPT_OPTION = ['1', true];
var isTextAccepted = function isTextAccepted(value, acceptOption) {
  if (!acceptOption) {
    acceptOption = DEFAULT_ACCEPT_OPTION;
  }
  if (Array.isArray(acceptOption)) {
    return arrayHasValue(value, acceptOption);
  }
  return value === acceptOption;
};
var acceptanceLocalValidator = function acceptanceLocalValidator($element, options) {
  var element = $element[0];
  var valid = true;
  if (element.type === 'checkbox') {
    valid = element.checked;
  }
  if (element.type === 'text') {
    valid = isTextAccepted(element.value, options.accept);
  }
  if (!valid) {
    return options.message;
  }
};

var isMatching = function isMatching(value, regExpOptions) {
  return new RegExp(regExpOptions.source, regExpOptions.options).test(value);
};
var hasValidFormat = function hasValidFormat(value, withOptions, withoutOptions) {
  return withOptions && isMatching(value, withOptions) || withoutOptions && !isMatching(value, withoutOptions);
};
var formatLocalValidator = function formatLocalValidator($element, options) {
  var element = $element[0];
  var value = element.value;
  if (options.allow_blank && !isValuePresent(value)) {
    return;
  }
  if (!hasValidFormat(value, options.with, options.without)) {
    return options.message;
  }
};

var VALIDATIONS$1 = {
  even: function even(a) {
    return parseInt(a, 10) % 2 === 0;
  },
  greater_than: function greater_than(a, b) {
    return parseFloat(a) > parseFloat(b);
  },
  greater_than_or_equal_to: function greater_than_or_equal_to(a, b) {
    return parseFloat(a) >= parseFloat(b);
  },
  equal_to: function equal_to(a, b) {
    return parseFloat(a) === parseFloat(b);
  },
  less_than: function less_than(a, b) {
    return parseFloat(a) < parseFloat(b);
  },
  less_than_or_equal_to: function less_than_or_equal_to(a, b) {
    return parseFloat(a) <= parseFloat(b);
  },
  odd: function odd(a) {
    return parseInt(a, 10) % 2 === 1;
  },
  other_than: function other_than(a, b) {
    return parseFloat(a) !== parseFloat(b);
  }
};
var formatValue = function formatValue(element) {
  var value = element.value || '';
  var numberFormat = element.form.ClientSideValidations.settings.number_format;
  return value.trim().replace(new RegExp("\\".concat(numberFormat.separator), 'g'), '.');
};
var getOtherValue = function getOtherValue(validationOption, form) {
  if (!isNaN(parseFloat(validationOption))) {
    return validationOption;
  }
  var validationElements = form.querySelectorAll("[name*=\"".concat(validationOption, "\"]"));
  if (validationElements.length === 1) {
    var validationElement = validationElements[0];
    var otherFormattedValue = formatValue(validationElement);
    if (!isNaN(parseFloat(otherFormattedValue))) {
      return otherFormattedValue;
    }
  }
};
var isValid = function isValid(validationFunction, validationOption, formattedValue, form) {
  if (validationFunction.length === 2) {
    var otherValue = getOtherValue(validationOption, form);
    return otherValue == null || otherValue === '' || validationFunction(formattedValue, otherValue);
  } else {
    return validationFunction(formattedValue);
  }
};
var runFunctionValidations = function runFunctionValidations(formattedValue, form, options) {
  for (var validation in VALIDATIONS$1) {
    var validationOption = options[validation];
    var validationFunction = VALIDATIONS$1[validation];

    // Must check for null because this could be 0
    if (validationOption == null) {
      continue;
    }
    if (!isValid(validationFunction, validationOption, formattedValue, form)) {
      return options.messages[validation];
    }
  }
};
var runValidations$1 = function runValidations(formattedValue, form, options) {
  if (options.only_integer && !ClientSideValidations.patterns.numericality.only_integer.test(formattedValue)) {
    return options.messages.only_integer;
  }
  if (!ClientSideValidations.patterns.numericality.default.test(formattedValue)) {
    return options.messages.numericality;
  }
  return runFunctionValidations(formattedValue, form, options);
};
var numericalityLocalValidator = function numericalityLocalValidator($element, options) {
  var element = $element[0];
  var value = element.value;
  if (options.allow_blank && !isValuePresent(value)) {
    return;
  }
  var form = element.form;
  var formattedValue = formatValue(element);
  return runValidations$1(formattedValue, form, options);
};

var VALIDATIONS = {
  is: function is(a, b) {
    return a === parseInt(b, 10);
  },
  minimum: function minimum(a, b) {
    return a >= parseInt(b, 10);
  },
  maximum: function maximum(a, b) {
    return a <= parseInt(b, 10);
  }
};
var runValidations = function runValidations(valueLength, options) {
  for (var validation in VALIDATIONS) {
    var validationOption = options[validation];
    var validationFunction = VALIDATIONS[validation];
    if (validationOption && !validationFunction(valueLength, validationOption)) {
      return options.messages[validation];
    }
  }
};
var lengthLocalValidator = function lengthLocalValidator($element, options) {
  var element = $element[0];
  var value = element.value;
  if (options.allow_blank && !isValuePresent(value)) {
    return;
  }
  return runValidations(value.length, options);
};

var isInList = function isInList(value, otherValues) {
  var normalizedOtherValues = [];
  for (var otherValueIndex in otherValues) {
    normalizedOtherValues.push(otherValues[otherValueIndex].toString());
  }
  return arrayHasValue(value, normalizedOtherValues);
};
var isInRange = function isInRange(value, range) {
  return value >= range[0] && value <= range[1];
};
var isIncluded = function isIncluded(value, options, allowBlank) {
  if ((options.allow_blank && !isValuePresent(value)) === allowBlank) {
    return true;
  }
  return options.in && isInList(value, options.in) || options.range && isInRange(value, options.range);
};
var exclusionLocalValidator = function exclusionLocalValidator($element, options) {
  var element = $element[0];
  var value = element.value;
  if (isIncluded(value, options, false) || !options.allow_blank && !isValuePresent(value)) {
    return options.message;
  }
};
var inclusionLocalValidator = function inclusionLocalValidator($element, options) {
  var element = $element[0];
  var value = element.value;
  if (!isIncluded(value, options, true)) {
    return options.message;
  }
};

var confirmationLocalValidator = function confirmationLocalValidator($element, options) {
  var element = $element[0];
  var value = element.value;
  var confirmationValue = document.getElementById("".concat(element.id, "_confirmation")).value;
  if (!options.case_sensitive) {
    value = value.toLowerCase();
    confirmationValue = confirmationValue.toLowerCase();
  }
  if (value !== confirmationValue) {
    return options.message;
  }
};

var isLocallyUnique = function isLocallyUnique(element, value, otherValue, caseSensitive) {
  if (!caseSensitive) {
    value = value.toLowerCase();
    otherValue = otherValue.toLowerCase();
  }
  if (otherValue === value) {
    element.dataset.notLocallyUnique = true;
    return false;
  }
  if (element.dataset.notLocallyUnique) {
    delete element.dataset.notLocallyUnique;
    element.dataset.changed = true;
  }
  return true;
};
var uniquenessLocalValidator = function uniquenessLocalValidator($element, options) {
  var element = $element[0];
  var elementName = element.name;
  var matches = elementName.match(/^(.+_attributes\])\[\d+\](.+)$/);
  if (!matches) {
    return;
  }
  var form = element.form;
  var value = element.value;
  var valid = true;
  var query = "[name^=\"".concat(matches[1], "\"][name$=\"").concat(matches[2], "\"]:not([name=\"").concat(elementName, "\"])");
  var otherElements = form.querySelectorAll(query);
  Array.prototype.slice.call(otherElements).forEach(function (otherElement) {
    var otherValue = otherElement.value;
    if (!isLocallyUnique(otherElement, value, otherValue, options.case_sensitive)) {
      valid = false;
    }
  });
  if (!valid) {
    return options.message;
  }
};

// Validators will run in the following order
ClientSideValidations.validators.local = {
  absence: absenceLocalValidator,
  presence: presenceLocalValidator,
  acceptance: acceptanceLocalValidator,
  format: formatLocalValidator,
  numericality: numericalityLocalValidator,
  length: lengthLocalValidator,
  inclusion: inclusionLocalValidator,
  exclusion: exclusionLocalValidator,
  confirmation: confirmationLocalValidator,
  uniqueness: uniquenessLocalValidator
};
if (!window.ClientSideValidations) {
  window.ClientSideValidations = ClientSideValidations;
  if (!isAMD() && !isCommonJS()) {
    ClientSideValidations.start();
  }
}
function isAMD() {
  return typeof define === 'function' && define.amd;
}
function isCommonJS() {
  return (typeof exports === "undefined" ? "undefined" : _typeof(exports)) === 'object' && typeof module !== 'undefined';
}

export { ClientSideValidations as default };
