/* eslint-env jest */
import { sandbox } from './helpers'
import { createNextDescribe } from 'e2e-utils'

createNextDescribe(
  'Error overlay for hydration errors',
  {
    files: {},
    dependencies: {
      react: 'latest',
      'react-dom': 'latest',
    },
    skipStart: true,
  },
  ({ next }) => {
    it('should show correct hydration error when client and server render different text', async () => {
      const { cleanup, session } = await sandbox(
        next,
        new Map([
          [
            'index.js',
            `
  const isClient = typeof window !== 'undefined'
  export default function Mismatch() {
      return (
        <div className="parent">
          <main className="child">{isClient ? "client" : "server"}</main>
        </div>
      );
    }
`,
          ],
        ])
      )

      expect(await session.hasRedbox(true)).toBeTrue()

      expect(await session.getRedboxDescription()).toMatchInlineSnapshot(`
        "Error: Text content does not match server-rendered HTML.

        Warning: Text content did not match. Server: \\"server\\" Client: \\"client\\"

        See more info here: https://nextjs.org/docs/messages/react-hydration-error"
      `)

      await cleanup()
    })

    it('should suppress hydration error when client and server render different text due to suppressHydrationWarning', async () => {
      const { cleanup, session } = await sandbox(
        next,
        new Map([
          [
            'index.js',
            `
  const isClient = typeof window !== 'undefined'
  export default function Mismatch() {
      return (
        <div className="parent">
          <main suppressHydrationWarning className="child">{isClient ? "client" : "server"}</main>
        </div>
      );
    }
`,
          ],
        ])
      )
      expect(await session.hasRedbox()).toBeFalse()

      await cleanup()
    })
  }
)
