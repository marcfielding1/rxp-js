/**
 * Sets the current command/session to the desired URL.
 *
 * Require's the desired URL to add a `loaded` class to the
 * body on load complete.
 *
 * @param {leadfoot/Command} command
 * @param {string} url
 */
function loadUrlAndWait(command, url) {
  return command
    // navigate to our test page
    .get(url)
    .setFindTimeout(5000)
    // wait until the HPP request producer finishes
    .findByCssSelector('body.loaded');
}

/**
 * Sets a page's field base on the defined field type.
 *
 * @param {leadfoot/Command} command
 * @param {object} field
 */
function setField(command, field) {
  switch (field.type) {
    case 'text':
    default:
      return command
        .findById(field.name)
          .click()
          .type(field.value)
          .end();
  }
}

/**
 * Focuses a frame and set's the given fields. Will call `callback`
 * with the command/session to complete any assertions.
 *
 * @param {leadfoot/Command} command
 * @param {object[]} fields
 * @param {Function} callback
 */
function setFrameFieldsAndSubmit(command, fields, callback) {
  return function (iframe) {
    // focus to the iframe
    command = command.switchToFrame(iframe);

    // start - enter form data
    for (var i = 0; i < fields.length; i++) {
      command = setField(command, fields[i]);
    }
    // end - enter form data

    command = command
      // submit HPP
      .findById('rxp-primary-btn')
        .click()
        .end()
      // wait for redirect to HPP response consumer
      // TODO: figure out a way to do this without `sleep`
      .sleep(1500)
      // ensure we're targeting the parent and not a non-existing iframe
      .switchToParentFrame();
    return callback(command);
  };
}

/**
 * Completes an HPP lightbox with the given fields. Will call `callback`
 * with the command/session to complete any assertions.
 *
 * @param {string} url
 * @param {object[]} fields
 * @param {Function} callback
 */
function successHelper(url, fields, callback) {
  return function () {
    var command = this.remote;
    return loadUrlAndWait(command, url)
      // start HPP
      .findById('payButtonId')
        .click()
        .end()
      // find the first iframe with an id that starts with our identifier
      .findByCssSelector('[id^="rxp-frame-"]')
        .then(setFrameFieldsAndSubmit(command, fields, callback))
        .end();
  };
}

module.exports = {
  successHelper: successHelper,
};
