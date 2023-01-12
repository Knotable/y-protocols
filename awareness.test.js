
import * as Y from 'yjs'
import * as t from 'lib0/testing'
import * as awareness from './awareness'

/**
 * @param {t.TestCase} tc
 */
export const testAwareness = tc => {
  const clientId0 = '0'
  const clientId1 = '1'
  const doc1 = new Y.Doc()
  doc1.clientID = clientId0
  const doc2 = new Y.Doc()
  doc2.clientID = clientId1
  const aw1 = new awareness.Awareness(doc1)
  const aw2 = new awareness.Awareness(doc2)
  aw1.on('update', /** @param {any} p */ ({ added, updated, removed }) => {
    const enc = awareness.encodeAwarenessUpdate(aw1, added.concat(updated).concat(removed))
    awareness.applyAwarenessUpdate(aw2, enc, 'custom')
  })
  let lastChangeLocal = /** @type {any} */ (null)
  aw1.on('change', /** @param {any} change */ change => {
    lastChangeLocal = change
  })
  let lastChange = /** @type {any} */ (null)
  aw2.on('change', /** @param {any} change */ change => {
    lastChange = change
  })
  aw1.setLocalState({ x: 3 })
  t.compare(aw2.getStates().get(clientId0), { x: 3 })
  t.assert(/** @type {any} */ (aw2.meta.get(clientId0)).clock === 1)
  t.compare(lastChange.added, [clientId0])
  // When creating an Awareness instance, the local client is already marked as available, so it is not updated.
  t.compare(lastChangeLocal, { added: [], updated: [clientId0], removed: [] })

  // update state
  lastChange = null
  lastChangeLocal = null
  aw1.setLocalState({ x: 4 })
  t.compare(aw2.getStates().get(clientId0), { x: 4 })
  t.compare(lastChangeLocal, { added: [], updated: [clientId0], removed: [] })
  t.compare(lastChangeLocal, lastChange)

  lastChange = null
  lastChangeLocal = null
  aw1.setLocalState({ x: 4 })
  t.assert(lastChange === null)
  t.assert(/** @type {any} */ (aw2.meta.get(clientId0)).clock === 3)
  t.compare(lastChangeLocal, lastChange)
  aw1.setLocalState(null)
  t.assert(lastChange.removed.length === 1)
  t.compare(aw1.getStates().get(clientId0), undefined)
  t.compare(lastChangeLocal, lastChange)
}
