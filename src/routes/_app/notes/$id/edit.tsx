import {
  createFileRoute,
  getRouteApi,
  Link,
  useRouter,
} from '@tanstack/react-router'
import { z } from 'zod'

import { LoginPrompt } from '#/components/LoginPrompt'
import { NoteForm } from '#/components/NoteForm'
import { deleteNote, getNote, updateNote } from '#/server/notes'

const appRoute = getRouteApi('/_app')

export const Route = createFileRoute('/_app/notes/$id/edit')({
  params: {
    parse: (params) => ({
      id: z.coerce.number().int().positive().parse(params.id),
    }),
    stringify: ({ id }) => ({ id: String(id) }),
  },
  loader: async ({ params }) => {
    try {
      return { note: await getNote({ data: { id: params.id } }) }
    } catch {
      return { note: null }
    }
  },
  component: EditNotePage,
})

function EditNotePage() {
  const auth = appRoute.useLoaderData()
  const { note } = Route.useLoaderData()
  const { id } = Route.useParams()
  const router = useRouter()

  if (!auth.user) {
    return <LoginPrompt title="登录后编辑笔记" />
  }

  if (!note) {
    return (
      <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 text-center">
        <h2 className="text-xl font-medium">笔记不存在或已被删除</h2>
        <Link
          to="/notes"
          className="mt-4 inline-flex text-sm text-sky-400 hover:text-sky-300"
        >
          返回笔记列表
        </Link>
      </section>
    )
  }

  async function handleDelete() {
    if (!window.confirm('确定删除这条笔记吗？')) return
    await deleteNote({ data: { id } })
    await router.invalidate()
    await router.navigate({ to: '/notes' })
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold md:text-3xl">编辑笔记</h1>
        <p className="mt-2 text-sm text-slate-400">
          修改后会原地覆盖，不保留历史版本。
        </p>
      </header>

      <NoteForm
        initial={note}
        submitLabel="保存修改"
        onSubmit={async (data) => {
          await updateNote({ data: { id, ...data } })
          await router.invalidate()
          await router.navigate({ to: '/notes' })
        }}
        secondaryActions={
          <>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-5 py-3 text-sm text-rose-100"
            >
              删除
            </button>
            <Link
              to="/notes"
              className="rounded-2xl border border-slate-700 px-5 py-3 text-sm text-slate-200"
            >
              取消
            </Link>
          </>
        }
      />
    </div>
  )
}
