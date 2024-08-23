import ClientSideValidations from './core'
import { absenceLocalValidator, presenceLocalValidator } from './validators/local/absence_presence'
import { acceptanceLocalValidator } from './validators/local/acceptance'
import { formatLocalValidator } from './validators/local/format'
import { numericalityLocalValidator } from './validators/local/numericality'
import { lengthLocalValidator } from './validators/local/length'
import { exclusionLocalValidator, inclusionLocalValidator } from './validators/local/exclusion_inclusion'
import { confirmationLocalValidator } from './validators/local/confirmation'
import { uniquenessLocalValidator } from './validators/local/uniqueness'

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
}

// Utility to add validation methods to elements
const addClientSideValidationsMethods = (element) => {
  element.disableClientSideValidations = function () {
    ClientSideValidations.disable(this)
    return this
  }

  element.enableClientSideValidations = function () {
    const selectors = { forms: 'form', inputs: 'input' }

    Object.keys(selectors).forEach((selector) => {
      const enablers = selectors[selector]
      this.querySelectorAll(ClientSideValidations.selectors[selector]).forEach((el) => {
        ClientSideValidations.enablers[enablers](el)
      })
    })

    return this
  }

  element.resetClientSideValidations = function () {
    this.querySelectorAll(ClientSideValidations.selectors.forms).forEach((form) => {
      ClientSideValidations.reset(form)
    })

    return this
  }

  element.validate = function () {
    this.querySelectorAll(ClientSideValidations.selectors.forms).forEach((form) => {
      form.enableClientSideValidations()
    })

    return this
  }

  element.isValid = function (validators) {
    if (this.tagName.toLowerCase() === 'form') {
      return validateForm(this, validators)
    } else {
      return validateElement(this, validatorsFor(this.name, validators))
    }
  }
}

const cleanNestedElementName = (elementName, nestedMatches, validators) => {
  Object.keys(validators).forEach((validatorName) => {
    if (new RegExp(`\\[${nestedMatches[1]}\\].*\\[\\]\\[${nestedMatches[2]}\\]$`).test(validatorName)) {
      elementName = elementName.replace(/\[[\da-z_]+\]\[(\w+)\]$/g, '[][$1]')
    }
  })

  return elementName
}

const cleanElementName = (elementName, validators) => {
  elementName = elementName.replace(/\[(\w+_attributes)\]\[[\da-z_]+\](?=\[(?:\w+_attributes)\])/g, '[$1][]')

  const nestedMatches = elementName.match(/\[(\w+_attributes)\].*\[(\w+)\]$/)

  if (nestedMatches) {
    elementName = cleanNestedElementName(elementName, nestedMatches, validators)
  }

  return elementName
}

const validatorsFor = (elementName, validators) => {
  if (Object.prototype.hasOwnProperty.call(validators, elementName)) {
    return validators[elementName]
  }

  return validators[cleanElementName(elementName, validators)] || {}
}

const validateForm = (form, validators) => {
  let valid = true

  form.dispatchEvent(new Event('form:validate:before.ClientSideValidations'))

  form.querySelectorAll(ClientSideValidations.selectors.validate_inputs).forEach((input) => {
    if (!input.isValid(validators)) {
      valid = false
    }
  })

  form.dispatchEvent(new Event(valid ? 'form:validate:pass.ClientSideValidations' : 'form:validate:fail.ClientSideValidations'))
  form.dispatchEvent(new Event('form:validate:after.ClientSideValidations'))

  return valid
}

const passElement = (element) => {
  element.dispatchEvent(new Event('element:validate:pass.ClientSideValidations'))
  element.dataset.valid = null
}

const failElement = (element, message) => {
  element.dispatchEvent(new CustomEvent('element:validate:fail.ClientSideValidations', { detail: message }))
  element.dataset.valid = false
}

const afterValidate = (element) => {
  element.dispatchEvent(new Event('element:validate:after.ClientSideValidations'))
  return element.dataset.valid !== false
}

const executeValidator = (validatorFunctions, validatorFunction, validatorOptions, element) => {
  for (const validatorOption in validatorOptions) {
    if (!validatorOptions[validatorOption]) continue

    const message = validatorFunction.call(validatorFunctions, element, validatorOptions[validatorOption])

    if (message) {
      failElement(element, message)
      return false
    }
  }

  return true
}

const executeValidators = (validatorFunctions, element, validators) => {
  for (const validator in validators) {
    if (!validatorFunctions[validator]) continue

    if (!executeValidator(validatorFunctions, validatorFunctions[validator], validators[validator], element)) {
      return false
    }
  }

  return true
}

const isMarkedForDestroy = (element) => {
  const nameAttr = element.getAttribute('name')
  if (nameAttr && nameAttr.search(/\[([^\]]*?)\]$/) >= 0) {
    const destroyInputName = nameAttr.replace(/\[([^\]]*?)\]$/, '[_destroy]')
    const destroyInput = document.querySelector(`input[name="${destroyInputName}"]`)

    if (destroyInput && destroyInput.value === '1') {
      return true
    }
  }

  return false
}

const executeAllValidators = (element, validators) => {
  if (element.dataset.changed === false || element.disabled) return

  element.dataset.changed = false

  if (executeValidators(ClientSideValidations.validators.all(), element, validators)) {
    passElement(element)
  }
}

const validateElement = (element, validators) => {
  element.dispatchEvent(new Event('element:validate:before.ClientSideValidations'))

  if (isMarkedForDestroy(element)) {
    passElement(element)
  } else {
    executeAllValidators(element, validators)
  }

  return afterValidate(element)
}

if (!window.ClientSideValidations) {
  window.ClientSideValidations = ClientSideValidations

  if (!isAMD() && !isCommonJS()) {
    ClientSideValidations.start()
  }
}

function isAMD () {
  return typeof define === 'function' && define.amd
}

function isCommonJS () {
  return typeof exports === 'object' && typeof module !== 'undefined'
}

export default ClientSideValidations
