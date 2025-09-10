// event-blocker custom element
// attributes:
//   events: space-separated list of events to prevent bubbling

customElements.define("event-blocker", class extends HTMLElement {
  static observedAttributes = [ "events" ]
  #connected = false

  connectedCallback() {
    updateEventBlockers(this, new Set(), getEventSetFromAttributeValue(this.getAttribute("events")))
    this.#connected = true
  }

  disconnectedCallback() {
    updateEventBlockers(this, getEventSetFromAttributeValue(this.getAttribute("events")), new Set())
    this.#connected = false
  }

  attributeChangedCallback(_, oldValue, newValue) {
    if (!this.#connected) return

    const oldEvents = getEventSetFromAttributeValue(oldValue)
    const newEvents = getEventSetFromAttributeValue(newValue)
    updateEventBlockers(this, oldEvents, newEvents)
  }
})

function updateEventBlockers(node, oldEventSet, newEventSet) {
  oldEventSet.difference(newEventSet).forEach(eventName => {
    node.removeEventListener(eventName, blockEvent)
  })
  newEventSet.difference(oldEventSet).forEach(eventName => {
    node.addEventListener(eventName, blockEvent)
  })
}

function getEventSetFromAttributeValue(value) {
  return new Set(
    (value ?? '').split(' ').filter(e => e !== '')
  )
}

function blockEvent(e) {
  e.stopPropagation()
}
