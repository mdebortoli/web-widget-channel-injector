///////////////////////////////////////////////////////////////////////////////
// Web Widget Channel Injector
//
// Script developed to allow Zendesk admins to add new custom items under the
// Zendesk Web Widget once Answer Bot presents the list of available channels.
//
// Documentation at https://github.com/mdebortoli/web-widget-channel-injector
///////////////////////////////////////////////////////////////////////////////
// Developed by Marcelo De Bortoli (EMEA Senior Solution Developer)
///////////////////////////////////////////////////////////////////////////////

// Configuration - Start
///////////////////////////////////////////////////////////////////////////////

// New widget channel details
widgetNewChannels = {
  // You can add as many new channels you want into the items array
  // Expected: icon (optional), text, action()
  items: [
    {
      icon: '☎️',
      text: {
        'pt-br': 'Solicitar ligação',
        de: 'Ruf mich jetzt an',
        default: 'Call me now'
      },
      action: function () {
        alert('"Call me know" action selected!')
      }
    }
  ],
  debug: false // You can set this to true if you want to watch the logs
}

// Configuration - End
///////////////////////////////////////////////////////////////////////////////

document.addEventListener('DOMContentLoaded', function () {
  // Start watching when the Web Widget loads
  const widgetObserver = new MutationObserver(function () {
    const widgetContainer = document.getElementById('webWidget')

    if (widgetContainer) {
      if (widgetNewChannels.debug) {
        console.log('Web Widget initiated. Installing observer in the iframe.')
      }

      // Create the script element to inject into the Web Widget iframe
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.text = `
        let addNewItem = true
        const widgetNewChannels = window.parent.widgetNewChannels

        setInterval(function () {
          const formItem = document.querySelector('span[type^="Icon--channelChoice"]')

          if (formItem && addNewItem) {
            const itemContainer = formItem.parentElement.parentElement
            const parentContainer = itemContainer.closest('div[role="presentation"]')

            if (itemContainer && parentContainer) {
              const optionsContainer = itemContainer.parentElement

              addNewItem = false

              const locale = document.querySelector('html').getAttribute('lang').toLowerCase()

              for (let i = 0; i < widgetNewChannels.items.length; i++) {
                const newItem = itemContainer.cloneNode(true)

                newItem.querySelector(
                  'div[role="button"] span[type^="Icon--channelChoice"]'
                ).innerHTML = widgetNewChannels.items[i].icon || ''
                newItem.querySelector('div[role="button"] div').innerHTML =
                  widgetNewChannels.items[i].text[locale] || widgetNewChannels.items[i].text.default

                newItem.addEventListener('click', function (event) {
                  event.preventDefault()

                  if (widgetNewChannels.debug) {
                    console.log('New channel clicked. Executing custom function.')
                  }

                  window.parent.widgetNewChannels.items[i].action()
                })

                optionsContainer.insertBefore(newItem, optionsContainer.children[1])
              }

              if (widgetNewChannels.debug) {
                console.log('New channel(s) installed.')
              }
            }
          } else if (!formItem) {
            addNewItem = true
          }
        }, 100)
      `

      // Inject the script above in the Web Widget iframe
      document
        .getElementById('webWidget')
        .contentWindow.document.head.appendChild(script)

      // Disconnect parent observer when the custom script has already been injected in the iframe
      widgetObserver.disconnect()
    }
  })

  // Start parent page observer
  widgetObserver.observe(document, {
    attributes: false,
    childList: true,
    characterData: false,
    subtree: true
  })
})
