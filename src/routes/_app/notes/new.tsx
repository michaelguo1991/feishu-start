import {
  createFileRoute,
  getRouteApi,
  Link,
  useRouter,
} from '@tanstack/react-router'

import { LoginPrompt } from '#/components/LoginPrompt'
import { NoteForm } from '#/components/NoteForm'
import { createNote } from '#/server/notes'

const appRoute = getRouteApi('/_app')

export const Route = createFileRoute('/_app/notes/new')({
  component: NewNotePage,
})

function NewNotePage() {
  const auth = appRoute.useLoaderData()
  const router = useRouter()

  if (!auth.user) {
    return <LoginPrompt title="登录后新建笔记" />
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold md:text-3xl">新建笔记</h1>
        <p className="mt-2 text-sm text-slate-400">写下一条个人笔记。</p>
      </header>

      <NoteForm
        submitLabel="保存"
        onSubmit={async (data) => {
          await createNote({ data })
          await router.invalidate()
          await router.navigate({ to: '/notes' })
        }}
        secondaryActions={
          <Link
            to="/notes"
            className="rounded-2xl border border-slate-700 px-5 py-3 text-sm text-slate-200"
          >
            取消
          </Link>
        }
      />
    </div>
  )
}
