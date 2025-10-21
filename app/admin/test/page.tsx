// app/admin/test/page.tsx
// Simple test page to verify AI assistant is showing up

export default function AdminTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🧪 AI Assistant Test Page
          </h1>

          <div className="space-y-4 text-gray-700">
            <p className="text-lg">
              If the AI assistant is working, you should see a{' '}
              <strong className="text-teal-600">
                teal floating chat button
              </strong>{' '}
              in the bottom-right corner of this page.
            </p>

            <div className="bg-teal-50 border-l-4 border-teal-500 p-4 rounded">
              <p className="font-semibold text-teal-800 mb-2">✅ Checklist:</p>
              <ul className="list-disc list-inside space-y-1 text-teal-700">
                <li>
                  Do you see a teal circle with a message icon in the
                  bottom-right?
                </li>
                <li>Does it have a small red dot notification badge?</li>
                <li>Can you click it to open the chat window?</li>
              </ul>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="font-semibold text-blue-800 mb-2">
                🔍 If you don't see it:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-blue-700">
                <li>Check browser console (F12) for errors</li>
                <li>
                  Verify{' '}
                  <code className="bg-blue-100 px-1 rounded">
                    app/admin/layout.tsx
                  </code>{' '}
                  exists
                </li>
                <li>
                  Verify{' '}
                  <code className="bg-blue-100 px-1 rounded">
                    components/BarManagerAssistant.tsx
                  </code>{' '}
                  exists
                </li>
                <li>Make sure you restarted the dev server</li>
              </ol>
            </div>

            <div className="mt-8 p-4 bg-gray-100 rounded">
              <p className="text-sm text-gray-600 mb-2">
                Try these test questions:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li>"What bottles are we low on?"</li>
                <li>"Who has tables tonight?"</li>
                <li>"What's our revenue this week?"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
