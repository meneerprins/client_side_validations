import { createElementFromHTML } from './utils'

const ClientSideValidations = {
  callbacks: {
    element: {
      after: (element, eventData) => {},
      before: (element, eventData) => {},
      fail: (element, message, addError, eventData) => addError(),
      pass: (element, removeError, eventData) => removeError()
    },
    form: {
      after: (form, eventData) => {},
      before: (form, eventData) => {},
      fail: (form, eventData) => {},
      pass: (form, eventData) => {}
    }
  },
  eventsToBind: {
    form: (form) => ({
      submit: (eventData) => {
        if (!isValidForm(form.ClientSideValidations.settings.validators)) {
          eventData.preventDefault()
          eventData.stopImmediatePropagation()
        }
      },
      'ajax:beforeSend': function (eventData) {
        if (eventData.target === form) {
          isValidForm(form.ClientSideValidations.settings.validators)
        }
      },
      'form:validate:after': (eventData) => {
        ClientSideValidations.callbacks.form.after(form, eventData)
      },
      'form:validate:before': (eventData) => {
        ClientSideValidations.callbacks.form.before(form, eventData)
      },
      'form:validate:fail': (eventData) => {
        ClientSideValidations.callbacks.form.fail(form, eventData)
      },
      'form:validate:pass': (eventData) => {
        ClientSideValidations.callbacks.form.pass(form, eventData)
      }
    }),
    input: (form) => ({
      focusout: function () {
        isValidElement(this, form.ClientSideValidations.settings.validators)
      },
      change: function () {
        this.dataset.changed = true
      },
      'element:validate:after': function (eventData) {
        ClientSideValidations.callbacks.element.after(this, eventData)
      },
      'element:validate:before': function (eventData) {
        ClientSideValidations.callbacks.element.before(this, eventData)
      },
      'element:validate:fail': function (eventData, message) {
        ClientSideValidations.callbacks.element.fail(this, message, () => {
          form.ClientSideValidations.addError(this, message)
        }, eventData)
      },
      'element:validate:pass': function (eventData) {
        ClientSideValidations.callbacks.element.pass(this, () => {
          form.ClientSideValidations.removeError(this)
        }, eventData)
      }
    }),
    inputConfirmation: (element, form) => ({
      focusout: () => {
        element.dataset.changed = true
        isValidElement(element, form.ClientSideValidations.settings.validators)
      },
      keyup: () => {
        element.dataset.changed = true
        isValidElement(element, form.ClientSideValidations.settings.validators)
      }
    })
  },
  enablers: {
    form: (form) => {
      form.ClientSideValidations = {
        settings: form.dataset.clientSideValidations,
        addError: (element, message) =>
          ClientSideValidations.formBuilders[form.ClientSideValidations.settings.html_settings.type].add(
            element,
            form.ClientSideValidations.settings.html_settings,
            message
          ),
        removeError: (element) =>
          ClientSideValidations.formBuilders[form.ClientSideValidations.settings.html_settings.type].remove(
            element,
            form.ClientSideValidations.settings.html_settings
          )
      }

      const eventsToBind = ClientSideValidations.eventsToBind.form(form)

      for (const [eventName, eventFunction] of Object.entries(eventsToBind)) {
        form.addEventListener(eventName, eventFunction)
      }

      form.querySelectorAll(ClientSideValidations.selectors.inputs).forEach((input) => {
        ClientSideValidations.enablers.input(input)
      })
    },
    input: (input) => {
      const form = input.form

      const eventsToBind = ClientSideValidations.eventsToBind.input(form)

      for (const [eventName, eventFunction] of Object.entries(eventsToBind)) {
        input.addEventListener(eventName, eventFunction)
      }

      if (input.type === 'checkbox') {
        input.addEventListener('change', () => {
          isValidElement(input, form.ClientSideValidations.settings.validators)
        })
      }

      if (input.id && input.id.endsWith('_confirmation')) {
        const elementToConfirm = form.querySelector(`#${input.id.match(/(.+)_confirmation/)[1]}:input`)
        if (elementToConfirm) {
          const confirmationEvents = ClientSideValidations.eventsToBind.inputConfirmation(elementToConfirm, form)

          for (const [eventName, eventFunction] of Object.entries(confirmationEvents)) {
            elementToConfirm.addEventListener(eventName, eventFunction)
          }
        }
      }
    }
  },
  formBuilders: {
    'ActionView::Helpers::FormBuilder': {
      add: (element, settings, message) => {
        const form = element.form

        const inputErrorTemplate = createElementFromHTML(settings.input_tag)
        let inputErrorElement = element.closest(`.${inputErrorTemplate.classList}`)

        if (!inputErrorElement) {
          inputErrorElement = inputErrorTemplate

          if (element.hasAttribute('autofocus')) {
            element.removeAttribute('autofocus')
          }

          element.insertAdjacentElement('beforebegin', inputErrorElement)
          inputErrorElement.querySelector('span#input_tag').replaceWith(element)

          const inputErrorLabelMessageElement = inputErrorElement.querySelector('label.message')

          if (inputErrorLabelMessageElement) {
            inputErrorLabelMessageElement.setAttribute('for', element.id)
          }
        }

        const labelElement = form.querySelector(`label[for="${element.id}"]:not(.message)`)

        if (labelElement) {
          const labelErrorTemplate = createElementFromHTML(settings.label_tag)
          const labelErrorContainer = labelElement.closest(`.${labelErrorTemplate.classList}`)

          if (!labelErrorContainer) {
            labelElement.insertAdjacentElement('afterend', labelErrorTemplate)
            labelErrorTemplate.querySelector('label#label_tag').replaceWith(labelElement)
          }
        }

        const labelMessageElement = form.querySelector(`label.message[for="${element.id}"]`)

        if (labelMessageElement) {
          labelMessageElement.textContent = message
        }
      },
      remove: (element, settings) => {
        const form = element.form

        const inputErrorClass = createElementFromHTML(settings.input_tag).classList
        const inputErrorElement = element.closest(`.${inputErrorClass}`)

        if (inputErrorElement) {
          inputErrorElement.querySelector(`#${element.id}`).remove()
          inputErrorElement.replaceWith(element)
        }

        const labelElement = form.querySelector(`label[for="${element.id}"]:not(.message)`)

        if (labelElement) {
          const labelErrorClass = createElementFromHTML(settings.label_tag).classList
          const labelErrorElement = labelElement.closest(`.${labelErrorClass}`)

          if (labelErrorElement) {
            labelErrorElement.replaceWith(labelElement)
          }
        }

        const labelMessageElement = form.querySelector(`label.message[for="${element.id}"]`)

        if (labelMessageElement) {
          labelMessageElement.remove()
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
    all: () => Object.assign({}, ClientSideValidations.validators.local, ClientSideValidations.validators.remote),
    local: {},
    remote: {}
  },
  disable: (target) => {
    const elements = target instanceof HTMLElement ? [target] : document.querySelectorAll(target)

    elements.forEach((el) => {
      el.removeEventListener('.ClientSideValidations')

      if (el.tagName.toLowerCase() === 'form') {
        ClientSideValidations.disable(el.querySelectorAll('input'))
      } else {
        delete el.dataset.changed
        delete el.dataset.valid
        if (el.tagName.toLowerCase() === 'input') {
          el.removeAttribute('data-validate')
        }
      }
    })
  },
  reset: (form) => {
    ClientSideValidations.disable(form)

    for (const key in form.ClientSideValidations.settings.validators) {
      form.ClientSideValidations.removeError(form.querySelector(`[name="${key}"]`))
    }

    ClientSideValidations.enablers.form(form)
  },
  initializeOnEvent: () => {
    if (window.Turbo != null) {
      return 'turbo:load'
    } else if (window.Turbolinks != null && window.Turbolinks.supported) {
      return window.Turbolinks.EVENTS != null ? 'page:change' : 'turbolinks:load'
    }
  },
  start: () => {
    const initializeOnEvent = ClientSideValidations.initializeOnEvent()

    if (initializeOnEvent != null) {
      document.addEventListener(initializeOnEvent, () => validateForms())
    } else {
      document.addEventListener('DOMContentLoaded', () => validateForms())
    }
  }
}

const validateForms = () => {
  document.querySelectorAll(ClientSideValidations.selectors.forms).forEach((form) => {
    validateForm(form.ClientSideValidations.settings.validators)
  })
}

function isValidForm (validators) {
  let valid = true

  const forms = document.querySelectorAll(ClientSideValidations.selectors.forms)

  forms.forEach((form) => {
    const validateEvent = new Event('form:validate:before')
    form.dispatchEvent(validateEvent)

    form.querySelectorAll(ClientSideValidations.selectors.validate_inputs).forEach((input) => {
      if (!isValidElement(input, validators)) {
        valid = false
      }
    })

    const passEvent = new Event(valid ? 'form:validate:pass' : 'form:validate:fail')
    form.dispatchEvent(passEvent)

    form.dispatchEvent(new Event('form:validate:after'))
  })

  return valid
}

function isValidElement (element, validators) {
  element.dispatchEvent(new Event('element:validate:before'))

  if (isMarkedForDestroy(element)) {
    passElement(element)
  } else {
    executeAllValidators(element, validators)
  }

  return afterValidate(element)
}

function passElement (element) {
  element.dispatchEvent(new Event('element:validate:pass'))
  element.dataset.valid = null
}

function failElement (element, message) {
  element.dispatchEvent(new CustomEvent('element:validate:fail', { detail: message }))
  element.dataset.valid = false
}

function afterValidate (element) {
  element.dispatchEvent(new Event('element:validate:after'))
  return element.dataset.valid !== false
}

function executeValidator (validatorFunctions, validatorFunction, validatorOptions, element) {
  for (const option in validatorOptions) {
    if (!validatorOptions[option]) continue

    const message = validatorFunction.call(validatorFunctions, element, validatorOptions[option])

    if (message) {
      failElement(element, message)
      return false
    }
  }

  return true
}

function executeValidators (validatorFunctions, element, validators) {
  for (const validator in validators) {
    if (!validatorFunctions[validator]) continue

    if (!executeValidator(validatorFunctions, validatorFunctions[validator], validators[validator], element)) {
      return false
    }
  }

  return true
}

function isMarkedForDestroy (element) {
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

function executeAllValidators (element, validators) {
  if (element.dataset.changed === false || element.disabled) return

  element.dataset.changed = false

  if (executeValidators(ClientSideValidations.validators.all(), element, validators)) {
    passElement(element)
  }
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
